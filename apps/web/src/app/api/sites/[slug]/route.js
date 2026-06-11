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

export async function DELETE(request, { params }) {
  const { slug } = params;
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Missing body" }, { status: 400 });
    }
    const { password } = body;
    
    if (!password) {
      return Response.json({ error: "Password required" }, { status: 400 });
    }

    const rows = await sql`SELECT edit_password FROM apology_sites WHERE slug = ${slug}`;
    if (rows.length === 0) return Response.json({ error: "Not Found" }, { status: 404 });
    
    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(password, rows[0].edit_password);

    if (!isValid) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await sql`DELETE FROM apology_sites WHERE slug = ${slug}`;
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
