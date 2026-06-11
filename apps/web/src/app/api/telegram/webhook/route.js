import sql from "@/app/api/utils/sql";
import Pusher from "pusher";

let pusher = null;
const initPusher = () => {
  if (pusher) return pusher;
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER;

  if (appId && key && secret && cluster) {
    try {
      pusher = new Pusher({ appId, key, secret, cluster, useTLS: true });
      return pusher;
    } catch (e) {
      console.error("Failed to initialize Pusher in Telegram Webhook", e);
    }
  }
  return null;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data; // e.g. "freeze_slug_session" or "unfreeze_slug_session"
      const callbackQueryId = callbackQuery.id;
      const message = callbackQuery.message;

      if (callbackData && (callbackData.startsWith("freeze_") || callbackData.startsWith("unfreeze_"))) {
        const parts = callbackData.split("_");
        const action = parts[0]; // "freeze" or "unfreeze"
        const slug = parts[1];
        const sessionId = parts.slice(2).join("_"); // handle session ids with underscores

        const isFrozen = action === "freeze";

        // 1. Look up site
        const siteRows = await sql`SELECT id FROM apology_sites WHERE slug = ${slug}`;
        if (siteRows.length > 0) {
          const siteId = siteRows[0].id;

          // 2. Update DB is_frozen status
          await sql`
            UPDATE live_tracking
            SET is_frozen = ${isFrozen}, updated_at = now()
            WHERE site_id = ${siteId} AND session_id = ${sessionId}
          `;

          // 3. Broadcast real-time event via Pusher
          const activePusher = initPusher();
          const channelName = `apology-${slug}`;
          const eventName = isFrozen ? "freeze" : "unfreeze";

          if (activePusher) {
            await activePusher.trigger(channelName, eventName, {
              session_id: sessionId
            });
          } else {
            console.log(`[MOCK REALTIME TELEGRAM CONTROL] [Channel: ${channelName}] [Event: ${eventName}] [Session: ${sessionId}]`);
          }

          // 4. Answer Telegram Callback Query
          if (botToken) {
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: isFrozen ? "🔒 تم تجميد الموقع بنجاح" : "🔓 تم إلغاء تجميد الموقع"
              })
            }).catch(e => console.error("Telegram answerCallbackQuery fail", e));

            // 5. Edit Telegram Message text to confirm update
            const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
            const confirmedText = message.text + `\n\n${
              isFrozen 
                ? "🔒 [تم التجميد بنجاح بواسطة تليجرام]" 
                : "🔓 [تم إلغاء التجميد بنجاح بواسطة تليجرام]"
            }`;

            // Re-render buttons with opposite state
            const replyMarkup = {
              inline_keyboard: [
                [
                  { 
                    text: isFrozen ? "Unlock Link 🔓" : "Freeze Link 🔒", 
                    callback_data: isFrozen ? `unfreeze_${slug}_${sessionId}` : `freeze_${slug}_${sessionId}` 
                  }
                ]
              ]
            };

            await fetch(editUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: message.chat.id,
                message_id: message.message_id,
                text: confirmedText,
                reply_markup: replyMarkup
              })
            }).catch(e => console.error("Telegram editMessageText fail", e));
          }
        }
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[telegram/webhook/POST] error", error);
    return Response.json({ error: "Webhook error" }, { status: 500 });
  }
}
