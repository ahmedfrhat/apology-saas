import sql from "@/app/api/utils/sql";

async function sendTelegramMessage(botToken, chatId, text, replyMarkup) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup: replyMarkup
    }),
  });
  if (!response.ok) {
    throw new Error(`Telegram error: ${response.status} ${response.statusText}`);
  }
}

export async function POST(request) {
  try {
    // 1. Fetch pending notifications
    const pendingJobs = await sql`
      SELECT id, slug, event_type, session_id, payload
      FROM telegram_queue
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 10
    `;

    if (pendingJobs.length === 0) {
      return Response.json({ success: true, message: "No pending jobs." });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    for (const job of pendingJobs) {
      // Mark as processing to avoid duplicate delivery
      await sql`
        UPDATE telegram_queue
        SET status = 'processing'
        WHERE id = ${job.id}
      `;

      try {
        const { slug, event_type, session_id, payload } = job;
        const data = payload || {};

        // Construct notification text
        let text = "";
        if (event_type === "init") {
          text = `🚨 طباختك فتحت اللينك ودخلت المنصة! (الموقع: ${slug})`;
        } else if (event_type === "at_gate") {
          text = `🔒 زائر جديد يحاول فك الباسورد عند البوابة! (الموقع: ${slug})`;
        } else if (event_type === "complete") {
          text = `🎉 تم الصلح بنجاح! طباختك سامحتك ووصلت لللانهاية (الموقع: ${slug})`;
        } else if (event_type === "rating") {
          text = `⭐ طباختك قيمتك في المحكمة بـ ${data.starRating} نجوم! (الموقع: ${slug})`;
        } else if (event_type === "plea") {
          text = `⚖️ طباختك كتبت مرافعة/دفاع في المحكمة: "${data.pleaText}" (الموقع: ${slug})`;
        } else {
          // Unsupported event
          await sql`DELETE FROM telegram_queue WHERE id = ${job.id}`;
          continue;
        }

        // Fetch site configuration for custom chat ID
        const siteConfigResult = await sql`
          SELECT config FROM apology_sites WHERE slug = ${slug}
        `;

        let customChatId = null;
        if (siteConfigResult.length > 0 && siteConfigResult[0].config) {
          customChatId = siteConfigResult[0].config.telegramChatId;
        }

        const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
          const replyMarkup = {
            inline_keyboard: [
              [
                { text: "Freeze Link 🔒", callback_data: `freeze_${slug}_${session_id}` },
                { text: "Unfreeze Link 🔓", callback_data: `unfreeze_${slug}_${session_id}` }
              ]
            ]
          };

          await sendTelegramMessage(botToken, chatId, text, replyMarkup);
        }

        // Delete job on success
        await sql`
          DELETE FROM telegram_queue
          WHERE id = ${job.id}
        `;
      } catch (jobErr) {
        console.error(`Failed to process job ${job.id}:`, jobErr);
        // Mark as failed so it can be reviewed/retried
        await sql`
          UPDATE telegram_queue
          SET status = 'failed'
          WHERE id = ${job.id}
        `;
      }
    }

    return Response.json({ success: true, processedCount: pendingJobs.length });
  } catch (error) {
    console.error("[queue-worker] error", error);
    return Response.json({ error: "Queue processing error" }, { status: 500 });
  }
}
