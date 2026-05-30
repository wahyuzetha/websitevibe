async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/content/all');
    const data = await res.json();
    console.log("API Result Success:", data.success);
    console.log("Gallery length:", data.data?.gallery?.length);
  } catch (e) {
    console.error("API Error:", e);
  }
}
testApi();
