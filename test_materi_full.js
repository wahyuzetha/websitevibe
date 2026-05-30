import fs from 'fs';

async function testUploadMaterial() {
  try {
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@smkknboyolali.sch.id", password: "admin123" })
    });
    
    // Auth token is handled via cookies automatically by fetch if credentials: 'include'
    const cookie = loginRes.headers.get("set-cookie");
    console.log("Cookie:", cookie);
    
    const formData = new FormData();
    formData.append("title", "Test Materi from test script");
    formData.append("description", "Ini adalah deskripsi test");
    formData.append("document", new Blob(["dummy pdf content"], { type: "application/pdf" }), "test.pdf");

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
testUploadMaterial();
