import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  const { slug } = params;
  try {
    const sites = await sql`
      SELECT * FROM apology_sites WHERE slug = ${slug}
    `;

    if (sites.length === 0) {
      return Response.json({ error: "الموقع غير موجود" }, { status: 404 });
    }

    return Response.json(sites[0]);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return Response.json({ error: "فشل تحميل البيانات" }, { status: 500 });
  }
}
