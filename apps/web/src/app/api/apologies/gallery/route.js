import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const rows = await sql`
      SELECT id, title, story, votes, created_at 
      FROM apology_gallery_stories 
      ORDER BY votes DESC, created_at DESC
    `;
    return Response.json({ success: true, stories: rows });
  } catch (error) {
    console.error("Failed to fetch gallery stories:", error);
    return Response.json({ error: "Failed to fetch stories" }, { status: 500 });
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

    const { id } = body || {};
    if (!id) {
      return Response.json({ error: "معرف القصة مطلوب" }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE apology_gallery_stories 
      SET votes = votes + 1 
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return Response.json({ error: "القصة غير موجودة" }, { status: 404 });
    }

    return Response.json({ success: true, story: updated });
  } catch (error) {
    console.error("Failed to vote for story:", error);
    return Response.json({ error: "فشل تسجيل التصويت" }, { status: 500 });
  }
}
