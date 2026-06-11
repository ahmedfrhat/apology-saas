import { neon } from "@neondatabase/serverless";

async function main() {
  console.log("Adding index to slug...");
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.error("DB URL not found. Ensure DATABASE_URL is set in .env.");
    return;
  }
  const safeSql = neon(dbUrl);

  try {
    await safeSql`CREATE INDEX IF NOT EXISTS idx_slug ON apology_sites (slug);`;
    console.log("Index added successfully.");
  } catch (e) {
    console.error("Error creating index:", e);
  }
}

main();
