const formData = new FormData();
formData.append("title", "Test Materi");
formData.append("description", "Ini adalah deskripsi test");
formData.append("document", new File(["dummy pdf content"], "test.pdf", { type: "application/pdf" }));

async function testUpload() {
  try {
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@smk.id", password: "admin" })
    });
    
    const loginData = await loginRes.json();
    
    // Auth token is handled via cookies automatically by fetch if credentials: 'include'
    // Actually we can just run it using Bun fetch but we need the cookie
    const cookie = loginRes.headers.get("set-cookie");
    
    const res = await fetch("http://localhost:3000/api/content/material", {
      method: "POST",
      headers: {
        "cookie": cookie
      },
      body: formData
    });
    
    const data = await res.json();
    console.log("Upload Result:", data);
  } catch (e) {
    console.error("Error:", e);
  }
}
testUpload();
