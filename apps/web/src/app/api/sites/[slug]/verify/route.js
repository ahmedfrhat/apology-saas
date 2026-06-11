import sql from "@/app/api/utils/sql";
import bcrypt from "bcryptjs";

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

    const { password } = body || {};

    if (!password) {
      return Response.json({ error: "Password is required" }, { status: 400 });
    }

    const result = await sql`SELECT edit_password, config FROM apology_sites WHERE slug = ${slug}`;
    
    if (!result || result.length === 0) {
      return Response.json({ error: "Site not found" }, { status: 404 });
    }

    const hashedPwd = result[0].edit_password;
    const config = result[0].config || {};
    
    const isValid = await bcrypt.compare(password, hashedPwd);

    if (isValid) {
      return Response.json({ success: true });
    } else {
      return Response.json({ 
        error: "كلمة المرور غير صحيحة", 
        hint: config.passwordHint 
      }, { status: 401 });
    }

  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
