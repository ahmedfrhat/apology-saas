import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

async function migrate() {
  try {
    console.log("Migrating live_tracking table...");
    await sql`
      CREATE TABLE IF NOT EXISTS apology_sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        edit_password VARCHAR(255) NOT NULL,
        config JSONB NOT NULL
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_apology_sites_slug ON apology_sites(slug)
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS live_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES apology_sites(id) ON DELETE CASCADE,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        current_section VARCHAR(100),
        battery_level INTEGER,
        last_action VARCHAR(255),
        broadcast_msg TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `;
    console.log("Adding new columns if they don't exist...");
    await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_detected BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_seconds FLOAT DEFAULT 0`;
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
