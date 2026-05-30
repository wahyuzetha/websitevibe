async function testUpload() {
  const formData = new FormData();
  formData.append('image', new File(["dummy content"], "test.jpg", { type: "image/jpeg" }));
  
  const res = await fetch('http://localhost:3000/testupload', {
    method: 'POST',
    body: formData
  });
  console.log(await res.json());
}
testUpload();
