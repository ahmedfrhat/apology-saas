import sql from "@/app/api/utils/sql";

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
    const { edit_password, password, config } = body || {};
    const finalPassword = edit_password || password;

    if (!finalPassword || !config) {
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // Retrieve password for validation
    const rows = await sql`
      SELECT edit_password FROM apology_sites WHERE slug = ${slug}
    `;
    if (rows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }

    if (rows[0].edit_password !== finalPassword) {
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
