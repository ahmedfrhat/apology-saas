import sql from "./sql";

export async function enforceRateLimit(req) {
  try {
    // Extract IP from Vercel headers, fallback to a local string
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    
    // We only rate limit actual IPs
    if (ip === "unknown_ip") return true;

    // Create tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS ai_rate_limits (
        ip VARCHAR(45),
        date DATE DEFAULT CURRENT_DATE,
        count INT DEFAULT 1,
        PRIMARY KEY (ip, date)
      )
    `;

    // Upsert and increment
    const rows = await sql`
      INSERT INTO ai_rate_limits (ip, date, count)
      VALUES (${ip}, CURRENT_DATE, 1)
      ON CONFLICT (ip, date) 
      DO UPDATE SET count = ai_rate_limits.count + 1
      RETURNING count
    `;

    const currentCount = rows[0]?.count || 1;

    // Max 5 attempts per day
    if (currentCount > 5) {
      return false;
    }

    return true;
  } catch (err) {
    // If DB fails, allow gracefully to avoid breaking the core flow
    console.error("Rate limit DB error:", err);
    return true;
  }
}
