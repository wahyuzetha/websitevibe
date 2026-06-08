import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { jwt } from "@elysiajs/jwt";
import { db } from "./db";
import { users, settings, advantages, gallery, careers, testimonials, faqs, materials, hero_slides } from "./db/schema";
import { eq } from "drizzle-orm";

// Variabel untuk in-memory cache
let contentCache: any = null;
const invalidateCache = () => {
  contentCache = null;
};

const app = new Elysia()
  .onRequest(({ set, request }) => {
    // Biarkan static assets di-cache browser, hindari cache hanya untuk API route
    if (request.url.includes("/api/")) {
      set.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
    }
  })
  .use(staticPlugin({ assets: "public", prefix: "/" }))
  .use(
    jwt({
      name: 'jwt',
      secret: 'super-secret-key-for-jwt-websitevibe'
    })
  )
  .get("/", () => Bun.file("public/index.html"))
  .post("/api/auth/setup", async () => {
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@smkknboyolali.sch.id"));
    if (existingAdmin.length > 0) {
      return { success: false, message: "Admin account already exists!" };
    }

    const hashedPassword = await Bun.password.hash("admin123");
    
    await db.insert(users).values({
      name: "Administrator",
      email: "admin@smkknboyolali.sch.id",
      password: hashedPassword,
      role: "admin"
    });

    return { success: true, message: "Default admin account created successfully." };
  })
  .post("/api/auth/login", async ({ body, jwt, cookie: { auth } }: any) => {
    const { email, password } = body;
    
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    const userRecord = await db.select().from(users).where(eq(users.email, email));
    
    if (userRecord.length === 0) {
      return { success: false, message: "Invalid credentials" };
    }

    const user = userRecord[0];
    const isMatch = await Bun.password.verify(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    const token = await jwt.sign({ id: user.id, role: user.role });
    auth.set({
      value: token,
      httpOnly: true,
      maxAge: 7 * 86400,
      path: '/',
    });

    return { success: true, message: "Login successful", user: { name: user.name, role: user.role } };
  })
  .post("/api/auth/logout", ({ cookie: { auth } }: any) => {
    auth.remove();
    return { success: true, message: "Logged out successfully" };
  })
  .get("/api/auth/me", async ({ jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) {
      return { success: false, authenticated: false };
    }
    const profile = await jwt.verify(token);
    if (!profile) {
      return { success: false, authenticated: false };
    }
    
    const userRecord = await db.select().from(users).where(eq(users.id, profile.id as number));
    if (userRecord.length === 0) {
       return { success: false, authenticated: false };
    }

    return { success: true, authenticated: true, user: { name: userRecord[0].name, role: userRecord[0].role } };
  })
  .get("/api/content/all", async () => {
    // Jika cache tersedia di RAM, langsung return (0.1ms)
    if (contentCache) {
      return { success: true, data: contentCache };
    }

    const settingsData = await db.select().from(settings);
    const settingsObj = settingsData.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    // Simpan ke memori cache
    contentCache = {
      settings: settingsObj,
      advantages: await db.select().from(advantages),
      gallery: await db.select().from(gallery),
      careers: await db.select().from(careers),
      testimonials: (await db.select().from(testimonials)).map((t: any) => {
        try {
          const parsed = JSON.parse(t.text || '{}');
          return { id: t.id, name: t.name, rating: t.rating, role: parsed.role || '', content: parsed.content || t.text };
        } catch(e) {
          return { id: t.id, name: t.name, rating: t.rating, role: '', content: t.text };
        }
      }),
      faqs: await db.select().from(faqs),
      materials: await db.select().from(materials),
      hero_slides: await db.select().from(hero_slides)
    };

    return {
      success: true,
      data: contentCache
    };
  })
  .post("/api/content/settings", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const newSettings = body as Record<string, string>;
    for (const [key, value] of Object.entries(newSettings)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key));
      if (existing.length > 0) {
         await db.update(settings).set({ value }).where(eq(settings.key, key));
      } else {
         await db.insert(settings).values({ key, value });
      }
    }
    invalidateCache();
    return { success: true };
  })
  .post("/api/content/tentang_logo", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const file = body.image as File;
    if (!file || !file.name) {
      return { success: false, message: "Pilih file gambar logo terlebih dahulu" };
    }

    const extension = file.name.split('.').pop();
    const filename = `tentang_logo_${Date.now()}.${extension}`;
    const filepath = `public/uploads/tentang/${filename}`;
    
    await Bun.write(filepath, file);
    const imageUrl = `/uploads/tentang/${filename}`;
    
    const existing = await db.select().from(settings).where(eq(settings.key, 'tentang_logo'));
    if (existing.length > 0) {
      await db.update(settings).set({ value: imageUrl }).where(eq(settings.key, 'tentang_logo'));
    } else {
      await db.insert(settings).values({ key: 'tentang_logo', value: imageUrl });
    }
    
    invalidateCache();
    return { success: true, message: "Logo berhasil diunggah", imageUrl };
  })
  .post("/api/content/gallery", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const file = body.image as File;
    const title = body.title || 'Foto Galeri';
    
    if (!file || !file.name) {
      return { success: false, message: "Pilih file gambar terlebih dahulu" };
    }

    // Ekstrak ekstensi
    const extension = file.name.split('.').pop();
    const filename = `gallery_${Date.now()}.${extension}`;
    const filepath = `public/uploads/gallery/${filename}`;
    
    // Simpan ke harddisk
    await Bun.write(filepath, file);
    
    const imageUrl = `/uploads/gallery/${filename}`;
    
    // Simpan ke database
    await db.insert(gallery).values({ imageUrl, title });
    
    invalidateCache();
    return { success: true, message: "Gambar berhasil diunggah" };
  })
  .delete("/api/content/gallery/:id", async ({ params, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const record = await db.select().from(gallery).where(eq(gallery.id, parseInt(params.id)));
    if (record.length > 0) {
      const fs = require('fs');
      const filepath = `public${record[0].imageUrl}`;
      try {
        if(fs.existsSync(filepath)) {
           fs.unlinkSync(filepath);
        }
      } catch(e) {}
      await db.delete(gallery).where(eq(gallery.id, parseInt(params.id)));
      invalidateCache();
    }
    return { success: true };
  })
  .post("/testupload", async ({ body }: any) => {
    try {
      const file = body.image as File;
      const extension = file.name.split('.').pop();
      const filename = `gallery_${Date.now()}.${extension}`;
      const filepath = `public/uploads/gallery/${filename}`;
      await Bun.write(filepath, file);
      return { success: true };
    } catch(e) {
      return { success: false, error: e.message };
    }
  })
  .get("/api/content/material/:id", async ({ params }: any) => {
    const record = await db.select().from(materials).where(eq(materials.id, parseInt(params.id)));
    if (record.length > 0) {
      return { success: true, data: record[0] };
    }
    return { success: false, message: "Materi tidak ditemukan" };
  })
  .post("/api/content/material", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const title = body.title || 'Materi Baru';
    const description = body.description || '';
    const imageFile = body.image as File;
    const docFile = body.document as File;
    
    if (!docFile || !docFile.name) {
      return { success: false, message: "File dokumen (PDF/Excel) wajib diupload" };
    }

    let imageUrl = '';
    if (imageFile && imageFile.name) {
      const extImg = imageFile.name.split('.').pop();
      const imgName = `mat_cover_${Date.now()}.${extImg}`;
      const imgPath = `public/uploads/materials/${imgName}`;
      await Bun.write(imgPath, imageFile);
      imageUrl = `/uploads/materials/${imgName}`;
    }

    const extDoc = docFile.name.split('.').pop();
    const docName = `mat_doc_${Date.now()}.${extDoc}`;
    const docPath = `public/uploads/materials/${docName}`;
    await Bun.write(docPath, docFile);
    const fileUrl = `/uploads/materials/${docName}`;
    
    await db.insert(materials).values({ title, description, imageUrl, fileUrl });
    invalidateCache();
    return { success: true, message: "Materi berhasil diunggah" };
  })
  .delete("/api/content/material/:id", async ({ params, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const record = await db.select().from(materials).where(eq(materials.id, parseInt(params.id)));
    if (record.length > 0) {
      const fs = require('fs');
      try {
        if(record[0].imageUrl) fs.unlinkSync(`public${record[0].imageUrl}`);
      } catch(e) {}
      try {
        if(record[0].fileUrl) fs.unlinkSync(`public${record[0].fileUrl}`);
      } catch(e) {}
      await db.delete(materials).where(eq(materials.id, parseInt(params.id)));
      invalidateCache();
    }
    return { success: true };
  })
  
  .post("/api/content/hero_slides", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const imageFile = body.image as File;
    const title = body.title || 'Slide Title';
    const description = body.description || '';
    const buttonText = body.buttonText || '';
    const buttonLink = body.buttonLink || '#';
    
    if (!imageFile || !imageFile.name) {
      return { success: false, message: "File gambar wajib diupload" };
    }

    const extImg = imageFile.name.split('.').pop();
    const imgName = `hero_${Date.now()}.${extImg}`;
    const imgPath = `public/uploads/hero/${imgName}`;
    await Bun.write(imgPath, imageFile);
    const imageUrl = `/uploads/hero/${imgName}`;
    
    await db.insert(hero_slides).values({ imageUrl, title, description, buttonText, buttonLink });
    invalidateCache();
    return { success: true, message: "Slide berhasil diunggah" };
  })
  .delete("/api/content/hero_slides/:id", async ({ params, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const record = await db.select().from(hero_slides).where(eq(hero_slides.id, parseInt(params.id)));
    if (record.length > 0) {
      const fs = require('fs');
      try {
        if(record[0].imageUrl) fs.unlinkSync(`public${record[0].imageUrl}`);
      } catch(e) {}
      await db.delete(hero_slides).where(eq(hero_slides.id, parseInt(params.id)));
      invalidateCache();
    }
    return { success: true };
  })
  .post("/api/content/careers", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const { title, description } = body as { title: string, description: string };
    if (!title || !description) return { success: false, message: "Title and description required" };
    
    await db.insert(careers).values({ title, description });
    invalidateCache();
    return { success: true };
  })
  .delete("/api/content/careers/:id", async ({ params, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    await db.delete(careers).where(eq(careers.id, parseInt(params.id)));
    invalidateCache();
    return { success: true };
  })
  .post("/api/content/testimonials", async ({ body, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    const { name, role, content, rating } = body as { name: string, role: string, content: string, rating: number };
    if (!name || !content) return { success: false, message: "Name and content required" };
    
    const textData = JSON.stringify({ role, content });
    await db.insert(testimonials).values({ name, rating: rating || 5, text: textData });
    invalidateCache();
    return { success: true };
  })
  .delete("/api/content/testimonials/:id", async ({ params, jwt, cookie: { auth } }: any) => {
    const token = auth.value;
    if (!token) return { success: false, message: "Unauthorized" };
    try { await jwt.verify(token); } catch(e) { return { success: false, message: "Unauthorized" }; }
    
    await db.delete(testimonials).where(eq(testimonials.id, parseInt(params.id)));
    invalidateCache();
    return { success: true };
  })
  .get("/ping", () => ({ status: "ok", message: "pong" }))
  .listen({ port: 3000, maxRequestBodySize: 1024 * 1024 * 50 });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
