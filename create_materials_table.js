import { db } from "./src/db/index.ts";
import { sql } from "drizzle-orm";

async function createTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        image_url VARCHAR(500),
        file_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Materials table created successfully");
  } catch (e) {
    console.error("Error creating table:", e);
  }
}
createTable();
