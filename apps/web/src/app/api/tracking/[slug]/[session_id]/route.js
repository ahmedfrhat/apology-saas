import sql from "@/app/api/utils/sql";

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
