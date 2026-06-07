import sql from "@/app/api/utils/sql";

export async function POST(request, context) {
  try {
    const { slug } = context.params;
    const body = await request.json();
    const { edit_password, config } = body || {};

    if (!edit_password || !config) {
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // Retrieve password for validation
    const rows = await sql`
      SELECT edit_password FROM apology_sites WHERE slug = ${slug}
    `;
    if (rows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }

    if (rows[0].edit_password !== edit_password) {
      return Response.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const configStr = JSON.stringify(config);
    await sql`
      UPDATE apology_sites
      SET config = ${configStr}
      WHERE slug = ${slug}
    `;

    return Response.json({ success: true, config });
  } catch (error) {
    console.error("[sites/[slug]/config/POST] error", error);
    return Response.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}
