import sql, { hasDb } from "@/app/api/utils/sql";

// POST: Set a broadcast message targeting a session.
// Body: { session_id, message }
export async function POST(request, context) {
  if (!hasDb()) return new Response(null, { status: 204 }); // مؤقتًا
  try {
    const { slug } = context.params;
    const body = await request.json();
    const { session_id, message } = body;

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

    // 2. Update the broadcast message verifying it belongs to this site
    const [row] = await sql`
      UPDATE live_tracking
      SET broadcast_msg = ${message ?? null}, updated_at = now()
      WHERE session_id = ${session_id} AND site_id = ${siteId}
      RETURNING *
    `;

    if (!row) {
      return Response.json({ error: "session not found on this site" }, { status: 404 });
    }

    return Response.json({ row });
  } catch (error) {
    console.error("[broadcast/[slug]/POST] error", error);
    return Response.json({ error: "Failed to broadcast message" }, { status: 500 });
  }
}

// GET: Poll for a pending broadcast message for a session, then clear it.
// Query params: ?session_id=...
export async function GET(request, context) {
  if (!hasDb()) return new Response(null, { status: 204 }); // مؤقتًا
  try {
    const { slug } = context.params;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
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

    // 2. Fetch the broadcast message for this session
    const [row] = await sql`
      SELECT broadcast_msg FROM live_tracking
      WHERE session_id = ${sessionId} AND site_id = ${siteId}
    `;

    const message = row?.broadcast_msg ?? null;

    // 3. Clear the message after delivering it so it only fires once.
    if (message) {
      await sql`
        UPDATE live_tracking
        SET broadcast_msg = NULL, updated_at = now()
        WHERE session_id = ${sessionId} AND site_id = ${siteId}
      `;
    }

    return Response.json({ message });
  } catch (error) {
    console.error("[broadcast/[slug]/GET] error", error);
    return Response.json({ error: "Failed to poll broadcast" }, { status: 500 });
  }
}
