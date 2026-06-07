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
const sql = cleanUrl ? neon(cleanUrl) : null;

export default sql;