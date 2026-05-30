import mysql from 'mysql2/promise';

async function updateDb() {
  const connection = await mysql.createConnection({
    uri: "mysql://root:@localhost:3306/websitevibe_db"
  });

  try {
    await connection.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';");
    await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';");
    console.log("Columns added successfully");
  } catch(e) {
    console.log("Error or already exists: ", e.message);
  }
  
  process.exit(0);
}

updateDb();
