import sql from "@/app/api/utils/sql";
import { sanitize } from "@/lib/sanitize";

export async function GET(request) {
  try {
    const rows = await sql`
      SELECT id, content, likes, created_at 
      FROM anonymous_apologies 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    return Response.json({ success: true, apologies: rows });
  } catch (error) {
    console.error("Failed to fetch anonymous apologies:", error);
    return Response.json({ error: "Failed to fetch apologies" }, { status: 500 });
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

    const { content } = body || {};
    if (!content || typeof content !== "string" || !content.trim()) {
      return Response.json({ error: "محتوى الاعتذار مطلوب" }, { status: 400 });
    }

    // Heavy sanitization to ensure no malicious code gets stored
    const sanitizedContent = sanitize(content.trim()).substring(0, 300);

    const [row] = await sql`
      INSERT INTO anonymous_apologies (content)
      VALUES (${sanitizedContent})
      RETURNING *
    `;

    return Response.json({ success: true, apology: row });
  } catch (error) {
    console.error("Failed to submit anonymous apology:", error);
    return Response.json({ error: "فشل إرسال الاعتذار" }, { status: 500 });
  }
}
