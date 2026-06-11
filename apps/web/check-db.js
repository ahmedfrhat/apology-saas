import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Load .env from root or apps/web
let envText = '';
try {
  envText = fs.readFileSync('../../.env', 'utf-8');
} catch (e) {
  try {
    envText = fs.readFileSync('.env', 'utf-8');
  } catch (err) {
    console.log("Could not find .env file");
  }
}

for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) {
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = val;
  }
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL missing from environment");
  process.exit(1);
}

const connector = neon(url);

async function run() {
  try {
    const tables = await connector`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `;
    console.log("Found Tables:", tables);
    for (const t of tables) {
      const columns = await connector`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = ${t.table_name}
      `;
      console.log(`\nTable [${t.table_name}] Columns:`);
      columns.forEach(c => {
        console.log(`  - ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
      });
    }
  } catch (err) {
    console.error("Database query failed:", err);
  }
}
run();
