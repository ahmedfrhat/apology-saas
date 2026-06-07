// app/api/utils/sql.js
import { neon, neonConfig } from '@neondatabase/serverless'

// كاش للاتصال على السيرفرلس
neonConfig.fetchConnectionCache = true

function getDbUrl() {
  // اقرأ بالـ bracket notation لتفادي الاستبدال وقت الـ build
  return (
    process.env['DATABASE_URL'] ||
    process.env['POSTGRES_URL'] ||
    process.env['POSTGRES_PRISMA_URL'] ||
    process.env['NEON_DATABASE_URL'] ||
    null
  )
}

// تقدر تستخدمها في الراوتس لو محتاج تتحقق بسرعة
export function hasDb() {
  return !!getDbUrl()
}

// Wrapper يسمح باستخدام sql`SELECT ...`
export default function sql(strings, ...values) {
  const url = getDbUrl()
  if (!url) {
    console.error('[sql] DB_URL_MISSING')
    throw new Error('DB_URL_MISSING')
  }
  const query = neon(url)
  return query(strings, ...values)
}