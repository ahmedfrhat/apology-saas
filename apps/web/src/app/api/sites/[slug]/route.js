import sql from "@/app/api/utils/sql";

export async function GET(request, context) {
  try {
    const { slug } = context.params;
    const rows = await sql`
      SELECT config FROM apology_sites WHERE slug = ${slug}
    `;
    if (rows.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }
    const config = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : rows[0].config;
    return Response.json(config);
  } catch (error) {
    console.error("[sites/[slug]/GET] error", error);
    return Response.json({ error: "Failed to load configuration" }, { status: 500 });
  }
}
