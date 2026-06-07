import { neon } from '@neondatabase/serverless';
function sql(strings, ...values) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const connector = neon(url);
  return connector(strings, ...values);
}

async function run() {
  try {
    const res = await sql`SELECT 1 as result`;
    console.log("Success:", res);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
