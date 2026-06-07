import { neon } from '@neondatabase/serverless';

let sqlClient = null;

export default function sql(strings, ...values) {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
      throw new Error("DB_URL_MISSING");
    }
    sqlClient = neon(url);
  }
  return sqlClient(strings, ...values);
}