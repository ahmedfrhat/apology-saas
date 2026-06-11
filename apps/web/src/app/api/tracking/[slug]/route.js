import sql from "@/app/api/utils/sql";
import DOMPurify from "isomorphic-dompurify";

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
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS sticky_notes JSONB`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS courtroom_followup TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS time_capsule TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false`;
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
      SELECT id, session_id, current_section, battery_level, last_action, broadcast_msg, hesitation_detected, hesitation_seconds, plea_text, star_rating, final_comment, details, sticky_notes, courtroom_followup, time_capsule, is_frozen, created_at, updated_at
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
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS sticky_notes JSONB`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS courtroom_followup TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS time_capsule TEXT`;
      await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false`;
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
    const lastAction = typeof body.last_action === "string" ? DOMPurify.sanitize(body.last_action) : (body.last_action ?? null);
    const hesitationDetected = body.hesitation_detected ?? false;
    const hesitationSeconds = body.hesitation_seconds ?? 0;
    const pleaText = typeof body.plea_text === "string" ? DOMPurify.sanitize(body.plea_text) : (body.plea_text ?? null);
    const starRating = body.star_rating ?? null;
    const finalComment = typeof body.final_comment === "string" ? DOMPurify.sanitize(body.final_comment) : (body.final_comment ?? null);
    const details = body.details ?? null;
    
    let stickyNotes = body.sticky_notes ?? null;
    if (stickyNotes && typeof stickyNotes === "object") {
      const sanitized = {};
      for (const key in stickyNotes) {
        if (typeof stickyNotes[key] === "string") {
          sanitized[key] = DOMPurify.sanitize(stickyNotes[key]);
        } else {
          sanitized[key] = stickyNotes[key];
        }
      }
      stickyNotes = sanitized;
    }
    
    const courtroomFollowup = typeof body.courtroom_followup === "string" ? DOMPurify.sanitize(body.courtroom_followup) : (body.courtroom_followup ?? null);
    const timeCapsule = typeof body.time_capsule === "string" ? DOMPurify.sanitize(body.time_capsule) : (body.time_capsule ?? null);
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
        
        // Retention automation: update reconciled_at and trigger Resend report
        (async () => {
          try {
            const siteData = await sql`SELECT id, creator_email, reconciled_at, config FROM apology_sites WHERE id = ${siteId}`;
            if (siteData.length > 0) {
              const site = siteData[0];
              if (!site.reconciled_at) {
                await sql`UPDATE apology_sites SET reconciled_at = NOW() WHERE id = ${siteId}`;
                
                const resendApiKey = process.env.RESEND_API_KEY;
                const creatorEmail = site.creator_email;
                if (resendApiKey && creatorEmail) {
                  const boyName = site.config?.boyName || "الزوج";
                  const girlName = site.config?.girlName || "الزوجة";
                  const starRatingStr = starRating !== null ? `${starRating} / 5 نجوم` : "5 / 5 نجوم";
                  const hesitationSecondsStr = hesitationSeconds > 0 ? `${hesitationSeconds.toFixed(1)} ثانية` : "0 ثانية";
                  const pleaTextStr = pleaText ? `"${pleaText}"` : "لا يوجد";
                  const finalCommentStr = finalComment ? `"${finalComment}"` : "لا يوجد";

                  const emailHtml = `
                    <div style="font-family: sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e0d8; border-radius: 20px; background-color: #FCFBF7; color: #4A3E3D;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 40px;">💝</span>
                        <h1 style="color: #92400E; margin-top: 10px; font-size: 24px;">تم الصلح بنجاح! 🎉</h1>
                        <p style="font-size: 14px; color: #8A7E7D;">مرحباً يا ${boyName}، شريكتك قد أتمت الخطوات الـ 12 بنجاح.</p>
                      </div>

                      <div style="background-color: #ffffff; padding: 20px; border-radius: 15px; border: 1px solid #1a1a1a10; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                        <h3 style="color: #B45309; margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">📊 تقرير المصالحة والتحليلات لـ ${girlName}:</h3>
                        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                          <tr style="border-bottom: 1px solid #f9f9f9;">
                            <td style="padding: 10px 0; color: #8A7E7D; width: 40%;">⭐ تقييم المحكمة النهائي:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1a1a1a;">${starRatingStr}</td>
                          </tr>
                          <tr style="border-bottom: 1px solid #f9f9f9;">
                            <td style="padding: 10px 0; color: #8A7E7D;">⏳ إجمالي وقت التردد:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1a1a1a;">${hesitationSecondsStr}</td>
                          </tr>
                          <tr style="border-bottom: 1px solid #f9f9f9;">
                            <td style="padding: 10px 0; color: #8A7E7D;">⚖️ مرافعة الدفاع في المحكمة:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1a1a1a;">${pleaTextStr}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; color: #8A7E7D;">💬 التعليق والتقييم النهائي:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1a1a1a;">${finalCommentStr}</td>
                          </tr>
                        </table>
                      </div>

                      <div style="background-color: #E6F4EA; border: 1px solid #34A853; color: #137333; padding: 15px; border-radius: 10px; font-size: 12px; text-align: center; margin-bottom: 25px;">
                        🔐 <b>تم حفظ هذه المناسبة السعيدة بنجاح!</b> سنرسل لك رسالة بريد إلكتروني تذكارية تلقائية في نفس هذا اليوم من العام القادم للاحتفال بالذكرى السنوية لمصالحتكما.
                      </div>

                      <div style="text-align: center; font-size: 11px; color: #8A7E7D; border-top: 1px solid #eee; padding-top: 15px;">
                        <p>© 2026 Safi.io - جميع الحقوق محفوظة. تم إرسال هذه الرسالة لأنك أنشأت صفحة مصالحة على منصتنا.</p>
                      </div>
                    </div>
                  `;

                  await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${resendApiKey}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      from: "Safi.io <onboarding@resend.dev>",
                      to: creatorEmail,
                      subject: `🎉 تم الصلح بنجاح! تقرير المصالحة الكامل لـ ${girlName}`,
                      html: emailHtml
                    })
                  });
                }
              }
            }
          } catch (err) {
            console.error("Reconciliation post-flow failed:", err);
          }
        })();
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
    console.error("[tracking/[slug]/POST] error", error);
    return Response.json({ error: "Failed to update tracking" }, { status: 500 });
  }
}
