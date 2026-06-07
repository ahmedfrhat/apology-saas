import { neon } from '@neondatabase/serverless';

function getCleanDbUrl() {
  let url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    if (url.includes('?')) {
      const base = url.split('?')[0];
      return `${base}?sslmode=require`;
    }
    return url;
  } catch (e) {
    return url;
  }
}

const cleanUrl = getCleanDbUrl();
const neonSql = cleanUrl ? neon(cleanUrl) : null;

export default async function sql(strings, ...values) {
  if (!neonSql) {
    console.error("DATABASE_URL is missing or invalid!");
    throw new Error("Database connection not initialized");
  }
  return await neonSql(strings, ...values);
}