import sql from "@/app/api/utils/sql";

export async function GET(request, context) {
  try {
    const { slug, session_id } = context.params;

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    const siteRows = await sql`SELECT id FROM apology_sites WHERE slug = ${slug}`;
    if (siteRows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }
    const siteId = siteRows[0].id;

    const rows = await sql`
      SELECT id, session_id, current_section, battery_level, last_action, broadcast_msg, hesitation_detected, hesitation_seconds, plea_text, star_rating, final_comment, details, sticky_notes, courtroom_followup, time_capsule, is_frozen, created_at, updated_at
      FROM live_tracking
      WHERE site_id = ${siteId} AND session_id = ${session_id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json({ row: null });
    }

    return Response.json({ row: rows[0] });
  } catch (error) {
    console.error("[tracking/[slug]/[session_id]/GET] error", error);
    return Response.json({ error: "Failed to get tracking session" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { slug, session_id } = context.params;

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    const siteRows = await sql`SELECT id FROM apology_sites WHERE slug = ${slug}`;
    if (siteRows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }
    const siteId = siteRows[0].id;

    await sql`
      DELETE FROM live_tracking
      WHERE site_id = ${siteId} AND session_id = ${session_id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("[tracking/[slug]/[session_id]/DELETE] error", error);
    return Response.json({ error: "Failed to delete tracking session" }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const { slug, session_id } = context.params;
    const { is_frozen } = await request.json();

    if (!session_id) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    const siteRows = await sql`SELECT id FROM apology_sites WHERE slug = ${slug}`;
    if (siteRows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }
    const siteId = siteRows[0].id;

    // Update DB
    const [row] = await sql`
      UPDATE live_tracking
      SET is_frozen = ${!!is_frozen}, updated_at = now()
      WHERE site_id = ${siteId} AND session_id = ${session_id}
      RETURNING *
    `;

    // Trigger real-time Pusher event
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherAppId = process.env.PUSHER_APP_ID;
      const pusherSecret = process.env.PUSHER_SECRET;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";
      const eventName = is_frozen ? "freeze" : "unfreeze";
      if (pusherAppId && pusherKey && pusherSecret) {
        const PusherServer = (await import("pusher")).default;
        const pusherInstance = new PusherServer({
          appId: pusherAppId,
          key: pusherKey,
          secret: pusherSecret,
          cluster: pusherCluster,
          useTLS: true
        });
        await pusherInstance.trigger(`apology-${slug}`, eventName, {
          session_id
        });
      } else {
        console.log(`[MOCK REALTIME CONTROL] [Channel: apology-${slug}] [Event: ${eventName}] [Session: ${session_id}]`);
      }
    } catch (realtimeErr) {
      console.error("Failed to trigger freeze/unfreeze real-time event", realtimeErr);
    }

    return Response.json({ success: true, row });
  } catch (error) {
    console.error("[tracking/[slug]/[session_id]/PATCH] error", error);
    return Response.json({ error: "Failed to update freeze status" }, { status: 500 });
  }
}
