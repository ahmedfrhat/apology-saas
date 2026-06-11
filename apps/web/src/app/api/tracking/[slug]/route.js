import sql from "@/app/api/utils/sql";

async function triggerNotification(slug, eventType, sessionId, data = {}) {
  let message = "";
  if (eventType === "init") {
    message = `🚨 طباختك فتحت اللينك ودخلت المنصة! (الموقع: ${slug})`;
  } else if (eventType === "at_gate") {
    message = `🔒 زائر جديد يحاول فك الباسورد عند البوابة! (الموقع: ${slug})`;
  } else if (eventType === "complete") {
    message = `🎉 تم الصلح بنجاح! طباختك سامحتك ووصلت لللانهاية (الموقع: ${slug})`;
  } else if (eventType === "rating") {
    message = `⭐ طباختك قيمتك في المحكمة بـ ${data.starRating} نجوم! (الموقع: ${slug})`;
  } else if (eventType === "plea") {
    message = `⚖️ طباختك كتبت مرافعة/دفاع في المحكمة: "${data.pleaText}" (الموقع: ${slug})`;
  } else {
    return;
  }

  // Print locally to server logs
  console.log(`[TELEGRAM NOTIFICATION MOCK] [Site: ${slug}] [Session: ${sessionId}] ${message}`);

  // Fetch site config to get custom Telegram tokens
  let config = {};
  try {
    const result = await sql`
      SELECT config FROM apology_sites WHERE slug = ${slug}
    `;
    if (result && result.length > 0 && result[0].config) {
      config = result[0].config;
    }
  } catch (dbErr) {
    console.error("Failed to fetch site config for Telegram notification", dbErr);
  }

  // Dispatches to Telegram API if configured in environments or custom site config
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = config.telegramChatId;
  if (botToken && chatId) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });
    } catch (err) {
      console.error("Failed to send Telegram notification", err);
    }
  }
}

// GET: List active tracking rows for a specific tenant site slug
export async function GET(request, context) {
  try {
    const { slug } = context.params;

    // Run migration safely to ensure tracking columns exist
    try {
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_detected BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_seconds FLOAT DEFAULT 0`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS plea_text TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS star_rating INTEGER`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS final_comment TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS details JSONB`;
    } catch (migErr) {
      // Ignore if it fails
    }

    // 1. Look up site id by slug
    const siteRows = await sql`
      SELECT id FROM apology_sites WHERE slug = ${slug}
    `;
    if (siteRows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }
    const siteId = siteRows[0].id;

    // 2. Query tracking rows for this site including hesitation
    const rows = await sql`
      SELECT id, session_id, current_section, battery_level, last_action, broadcast_msg, hesitation_detected, hesitation_seconds, plea_text, star_rating, final_comment, details, created_at, updated_at
      FROM live_tracking
      WHERE site_id = ${siteId}
      ORDER BY updated_at DESC
      LIMIT 100
    `;

    return Response.json({ rows });
  } catch (error) {
    console.error("[tracking/[slug]/GET] error", error);
    return Response.json({ error: "Failed to list tracking sessions" }, { status: 500 });
  }
}

// POST: Upsert a live tracking row for a specific session linked to a tenant site slug
export async function POST(request, context, c) {
  try {
    const { slug } = context.params;
    let body;
    const nodeReq = c?.env?.incoming || {};
    if (nodeReq.body) {
      body = typeof nodeReq.body === "string" ? JSON.parse(nodeReq.body) : nodeReq.body;
    } else {
      body = await Promise.race([
        request.json(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
      ]);
    }
    const { session_id } = body;

    // Run migration safely to ensure tracking columns exist
    try {
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_detected BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_seconds FLOAT DEFAULT 0`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS plea_text TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS star_rating INTEGER`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS final_comment TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS details JSONB`;
    } catch (migErr) {
      // Ignore
    }

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    // 1. Look up site id by slug
    const siteRows = await sql`
      SELECT id FROM apology_sites WHERE slug = ${slug}
    `;
    if (siteRows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }
    const siteId = siteRows[0].id;

    const currentSection = body.current_section ?? null;
    const batteryLevel = typeof body.battery_level === "number" ? body.battery_level : 0;
    const lastAction = body.last_action ?? null;
    const hesitationDetected = body.hesitation_detected ?? false;
    const hesitationSeconds = body.hesitation_seconds ?? 0;
    const pleaText = body.plea_text ?? null;
    const starRating = body.star_rating ?? null;
    const finalComment = body.final_comment ?? null;
    const details = body.details ?? null;

    // 2. Intercept for session initialization and completion alerts
    const existingTracking = await sql`
      SELECT id, current_section, plea_text, star_rating FROM live_tracking WHERE session_id = ${session_id}
    `;
    const isNewSession = existingTracking.length === 0;

    // Upsert the tracking record
    const [row] = await sql`
      INSERT INTO live_tracking (site_id, session_id, current_section, battery_level, last_action, hesitation_detected, hesitation_seconds, plea_text, star_rating, final_comment, details, updated_at)
      VALUES (${siteId}, ${session_id}, ${currentSection}, ${batteryLevel}, ${lastAction}, ${hesitationDetected}, ${hesitationSeconds}, ${pleaText}, ${starRating}, ${finalComment}, ${details}, now())
      ON CONFLICT (session_id) DO UPDATE SET
        site_id = EXCLUDED.site_id,
        current_section = COALESCE(EXCLUDED.current_section, live_tracking.current_section),
        battery_level = GREATEST(EXCLUDED.battery_level, live_tracking.battery_level),
        last_action = COALESCE(EXCLUDED.last_action, live_tracking.last_action),
        hesitation_detected = EXCLUDED.hesitation_detected OR live_tracking.hesitation_detected,
        hesitation_seconds = GREATEST(EXCLUDED.hesitation_seconds, live_tracking.hesitation_seconds),
        plea_text = COALESCE(EXCLUDED.plea_text, live_tracking.plea_text),
        star_rating = COALESCE(EXCLUDED.star_rating, live_tracking.star_rating),
        final_comment = COALESCE(EXCLUDED.final_comment, live_tracking.final_comment),
        details = COALESCE(EXCLUDED.details, live_tracking.details),
        updated_at = now()
      RETURNING *
    `;

    // Trigger notification webhook alerts asynchronously
    if (isNewSession) {
      if (currentSection === "at_gate") {
        triggerNotification(slug, "at_gate", session_id).catch(err => console.error("Gate notification fail", err));
      } else {
        triggerNotification(slug, "init", session_id).catch(err => console.error("Init notification fail", err));
      }
    } else {
      const prevTracking = existingTracking[0];
      const prevSection = prevTracking.current_section;
      const reachedEnd = currentSection === "eternal-void" || lastAction === "forgiven";
      const previouslyEnd = prevSection === "eternal-void" || prevSection === "forgiven";
      
      if (currentSection === "at_gate" && prevSection !== "at_gate") {
        triggerNotification(slug, "at_gate", session_id).catch(err => console.error("Gate notification fail", err));
      } else if (currentSection !== "at_gate" && prevSection === "at_gate") {
        triggerNotification(slug, "init", session_id).catch(err => console.error("Init notification fail", err));
      }

      if (reachedEnd && !previouslyEnd) {
        triggerNotification(slug, "complete", session_id).catch(err => console.error("Complete notification fail", err));
      }
      if (starRating !== null && starRating !== prevTracking.star_rating) {
        triggerNotification(slug, "rating", session_id, { starRating }).catch(err => console.error("Rating notification fail", err));
      }
      if (pleaText && pleaText !== prevTracking.plea_text) {
        triggerNotification(slug, "plea", session_id, { pleaText }).catch(err => console.error("Plea notification fail", err));
      }
    }

    return Response.json({ row });
  } catch (error) {
    console.error("[tracking/[slug]/POST] error", error);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
