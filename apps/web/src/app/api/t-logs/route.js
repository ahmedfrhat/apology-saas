import sql from "@/app/api/utils/sql";
import { sanitize } from "@/lib/sanitize";

async function triggerNotification(slug, eventType, sessionId, data = {}, request) {
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

  // 1. Insert notification queue payload to DB
  try {
    const payloadStr = JSON.stringify(data);
    await sql`
      INSERT INTO telegram_queue (slug, event_type, session_id, payload, status)
      VALUES (${slug}, ${eventType}, ${sessionId}, ${payloadStr}::jsonb, 'pending')
    `;
  } catch (dbErr) {
    console.error("Failed to queue Telegram notification", dbErr);
  }

  // 2. Fire offload background queue worker fetch without awaiting
  try {
    if (request && request.url) {
      const origin = new URL(request.url).origin;
      const workerUrl = `${origin}/api/telegram/queue-worker`;
      fetch(workerUrl, { method: "POST" }).catch(err => {
        console.error("Offloaded background queue trigger fetch failed", err);
      });
    }
  } catch (workerErr) {
    console.error("Failed to construct worker URL or fetch background", workerErr);
  }
}

export async function POST(request, context, c) {
  try {
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
    
    const { slug, session_id } = body || {};

    if (!slug) {
      return Response.json({ error: "slug is required" }, { status: 400 });
    }

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    // Run migration safely to ensure tracking columns exist
    try {
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_detected BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_seconds FLOAT DEFAULT 0`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS plea_text TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS star_rating INTEGER`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS final_comment TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS details JSONB`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS sticky_notes JSONB`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS courtroom_followup TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS time_capsule TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false`;
    } catch (migErr) {
      // Ignore
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
    const lastAction = typeof body.last_action === "string" ? sanitize(body.last_action) : (body.last_action ?? null);
    const hesitationDetected = body.hesitation_detected ?? false;
    const hesitationSeconds = body.hesitation_seconds ?? 0;
    const pleaText = typeof body.plea_text === "string" ? sanitize(body.plea_text) : (body.plea_text ?? null);
    const starRating = body.star_rating ?? null;
    const finalComment = typeof body.final_comment === "string" ? sanitize(body.final_comment) : (body.final_comment ?? null);
    const details = body.details ?? null;

    let stickyNotes = body.sticky_notes ?? null;
    if (stickyNotes && typeof stickyNotes === "object") {
      const sanitized = {};
      for (const key in stickyNotes) {
        if (typeof stickyNotes[key] === "string") {
          sanitized[key] = sanitize(stickyNotes[key]);
        } else {
          sanitized[key] = stickyNotes[key];
        }
      }
      stickyNotes = sanitized;
    }

    const courtroomFollowup = typeof body.courtroom_followup === "string" ? sanitize(body.courtroom_followup) : (body.courtroom_followup ?? null);
    const timeCapsule = typeof body.time_capsule === "string" ? sanitize(body.time_capsule) : (body.time_capsule ?? null);
    const isFrozen = body.is_frozen ?? false;

    // 2. Intercept for session initialization and completion alerts
    const existingTracking = await sql`
      SELECT id, current_section, plea_text, star_rating FROM live_tracking WHERE session_id = ${session_id}
    `;
    const isNewSession = existingTracking.length === 0;

    // Upsert the tracking record
    const [row] = await sql`
      INSERT INTO live_tracking (site_id, session_id, current_section, battery_level, last_action, hesitation_detected, hesitation_seconds, plea_text, star_rating, final_comment, details, sticky_notes, courtroom_followup, time_capsule, is_frozen, updated_at)
      VALUES (${siteId}, ${session_id}, ${currentSection}, ${batteryLevel}, ${lastAction}, ${hesitationDetected}, ${hesitationSeconds}, ${pleaText}, ${starRating}, ${finalComment}, ${details}, ${stickyNotes}, ${courtroomFollowup}, ${timeCapsule}, ${isFrozen}, now())
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
        sticky_notes = COALESCE(EXCLUDED.sticky_notes, live_tracking.sticky_notes),
        courtroom_followup = COALESCE(EXCLUDED.courtroom_followup, live_tracking.courtroom_followup),
        time_capsule = COALESCE(EXCLUDED.time_capsule, live_tracking.time_capsule),
        is_frozen = EXCLUDED.is_frozen,
        updated_at = now()
      RETURNING *
    `;

    // Trigger notification webhook alerts asynchronously
    if (isNewSession) {
      if (currentSection === "at_gate") {
        triggerNotification(slug, "at_gate", session_id, {}, request).catch(err => console.error("Gate notification fail", err));
      } else {
        triggerNotification(slug, "init", session_id, {}, request).catch(err => console.error("Init notification fail", err));
      }
    } else {
      const prevTracking = existingTracking[0];
      const prevSection = prevTracking.current_section;
      const reachedEnd = currentSection === "eternal-void" || lastAction === "forgiven";
      const previouslyEnd = prevSection === "eternal-void" || prevSection === "forgiven";

      if (currentSection === "at_gate" && prevSection !== "at_gate") {
        triggerNotification(slug, "at_gate", session_id, {}, request).catch(err => console.error("Gate notification fail", err));
      } else if (currentSection !== "at_gate" && prevSection === "at_gate") {
        triggerNotification(slug, "init", session_id, {}, request).catch(err => console.error("Init notification fail", err));
      }

      if (reachedEnd && !previouslyEnd) {
        triggerNotification(slug, "complete", session_id, {}, request).catch(err => console.error("Complete notification fail", err));
      }
      if (starRating !== null && starRating !== prevTracking.star_rating) {
        triggerNotification(slug, "rating", session_id, { starRating }, request).catch(err => console.error("Rating notification fail", err));
      }
      if (pleaText && pleaText !== prevTracking.plea_text) {
        triggerNotification(slug, "plea", session_id, { pleaText }, request).catch(err => console.error("Plea notification fail", err));
      }
    }

    // Broadcast real-time tracking update to Pusher
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherAppId = process.env.PUSHER_APP_ID;
      const pusherSecret = process.env.PUSHER_SECRET;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";
      if (pusherAppId && pusherKey && pusherSecret) {
        const PusherServer = (await import("pusher")).default;
        const pusherInstance = new PusherServer({
          appId: pusherAppId,
          key: pusherKey,
          secret: pusherSecret,
          cluster: pusherCluster,
          useTLS: true
        });
        await pusherInstance.trigger(`apology-${slug}`, "tracking-update", {
          session_id,
          row
        });
      } else {
        console.log(`[MOCK REALTIME BROADCAST] [Channel: apology-${slug}] [Event: tracking-update]`, {
          session_id,
          row
        });
      }
    } catch (realtimeErr) {
      console.error("Failed to broadcast tracking-update event", realtimeErr);
    }

    return Response.json({ row });
  } catch (error) {
    console.error("[t-logs/POST] error", error);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
