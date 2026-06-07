import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  const { slug } = params;
  try {
    const rows = await sql`SELECT * FROM apology_sites WHERE slug = ${slug}`;
    if (rows.length === 0) return Response.json({ error: "Not Found" }, { status: 404 });
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
