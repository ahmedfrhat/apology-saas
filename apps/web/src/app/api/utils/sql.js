import { neon } from '@neondatabase/serverless';

function getCleanDbUrl() {
  let url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    // التنظيف لضمان عمل الرابط مع Neon Serverless
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

// لو مفيش URL، بنستخدم الـ mockSql بس للأغراض التجريبية
// لكن في Production لازم نستخدم الـ neon driver
const sql = cleanUrl ? neon(cleanUrl) : (strings, ...values) => {
  console.error("No DATABASE_URL found!");
  return Promise.resolve([]); 
};

export default sql;