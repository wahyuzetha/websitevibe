import { db } from "./src/db/index.ts";
import { gallery } from "./src/db/schema.ts";

async function checkDb() {
  const allGallery = await db.select().from(gallery);
  console.log("Gallery items in DB:", allGallery);
}
checkDb();
