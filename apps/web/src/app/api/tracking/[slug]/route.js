import sql from "@/app/api/utils/sql";

async function triggerNotification(slug, eventType, sessionId) {
  let message = "";
  if (eventType === "init") {
    message = `🚨 طباختك فتحت اللينك حالاً وهي في سكشن الـ Terminal! (الموقع: ${slug})`;
  } else if (eventType === "complete") {
    message = `🎉 تم الصلح بنجاح! طباختك سامحتك ووصلت لللانهاية (الموقع: ${slug})`;
  } else {
    return;
  }

  // Print locally to server logs
  console.log(`[TELEGRAM NOTIFICATION MOCK] [Site: ${slug}] [Session: ${sessionId}] ${message}`);

  // Dispatches to Telegram API if configured in environments
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
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
      SELECT id, session_id, current_section, battery_level, last_action, broadcast_msg, hesitation_detected, hesitation_seconds, created_at, updated_at
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
export async function POST(request, context) {
  try {
    const { slug } = context.params;
    const body = await request.json();
    const { session_id } = body;

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

    // 2. Intercept for session initialization and completion alerts
    const existingTracking = await sql`
      SELECT id, current_section FROM live_tracking WHERE session_id = ${session_id}
    `;
    const isNewSession = existingTracking.length === 0;

    // Upsert the tracking record
    const [row] = await sql`
      INSERT INTO live_tracking (site_id, session_id, current_section, battery_level, last_action, hesitation_detected, hesitation_seconds, updated_at)
      VALUES (${siteId}, ${session_id}, ${currentSection}, ${batteryLevel}, ${lastAction}, ${hesitationDetected}, ${hesitationSeconds}, now())
      ON CONFLICT (session_id) DO UPDATE SET
        site_id = EXCLUDED.site_id,
        current_section = COALESCE(EXCLUDED.current_section, live_tracking.current_section),
        battery_level = GREATEST(EXCLUDED.battery_level, live_tracking.battery_level),
        last_action = COALESCE(EXCLUDED.last_action, live_tracking.last_action),
        hesitation_detected = EXCLUDED.hesitation_detected OR live_tracking.hesitation_detected,
        hesitation_seconds = GREATEST(EXCLUDED.hesitation_seconds, live_tracking.hesitation_seconds),
        updated_at = now()
      RETURNING *
    `;

    // Trigger notification webhook alerts asynchronously
    if (isNewSession) {
      triggerNotification(slug, "init", session_id).catch(err => console.error("Init notification fail", err));
    } else {
      const prevSection = existingTracking[0].current_section;
      const reachedEnd = currentSection === "eternal-void" || lastAction === "forgiven";
      const previouslyEnd = prevSection === "eternal-void" || prevSection === "forgiven";
      if (reachedEnd && !previouslyEnd) {
        triggerNotification(slug, "complete", session_id).catch(err => console.error("Complete notification fail", err));
      }
    }

    return Response.json({ row });
  } catch (error) {
    console.error("[tracking/[slug]/POST] error", error);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
