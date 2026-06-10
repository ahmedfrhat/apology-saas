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
    const { pleaText, girlName, boyName } = body || {};

    if (!pleaText) {
      return Response.json({ error: "الرجاء إدخال نص الدفاع" }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return Response.json({ error: "Gemini API Key is not configured." }, { status: 400 });
    }

    let config = {};
    try {
      const result = await sql`SELECT config FROM apology_sites WHERE slug = ${slug}`;
      if (result && result.length > 0 && result[0].config) {
        config = result[0].config;
      }
    } catch (dbErr) {
      console.error("Failed to fetch site config", dbErr);
    }

    const petNameInstruction = config.petNameOverride 
      ? `You MUST use her specific pet name "${config.petNameOverride}" repeatedly when addressing her.` 
      : `Use natural, common Egyptian pet names like (يا بنتي، يا حبيبتي).`;

    const systemPrompt = `You are an expert, witty Egyptian AI Judge in a romantic "Court of Apology".
The plaintiff standing before you is the girlfriend (${girlName || "البنت"}). You must address her DIRECTLY in the 2nd person feminine singular (مخاطب مؤنث مفرد - "إنتي", "حقك", "زعلانة").
The defendant is her boyfriend (${boyName || "الولد"}).

She has submitted the following plea/complaint to your court:
"${pleaText}"

Your absolute mandate:
1. Tone Profile: A majestic, booming, yet hilariously biased Egyptian judge. Use theatrical phrases like ("حكمت المحكمة حضورياً بقصف جبهة المدعى عليه...").
2. Absolute Bias Logic: You MUST 100% side with the girl. Treat the boy's mistakes as absolute global emergencies in a comedic, over-exaggerated way ("جريمة نكراء في حق كوكب الضحك"). Validate the girl's text 100% using dramatic second-person feminine Arabic pronouns ("يا ابنتي، أنتِ خط أحمر...").
3. The Epic Twist: Mandate that her only "punishment" for him is to forgive him because "the defendant built an entire custom SaaS software infrastructure just to please your mood, proving total surrender." Speak directly to her.
${petNameInstruction}

Strict Output Requirements:
1. Output MUST be ONLY valid JSON matching this schema exactly (no markdown, no backticks, no trailing commas):
{
  "title": "...", 
  "details": "..."
}
2. "title" should be a short, dramatic headline like "حكم المحكمة النهائي لصالح [اسم البنت]".
3. "details" should be your full speech DIRECTED AT HER. Highly fluent Egyptian Arabic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText.replace(/```json/g, "").replace(/```/g, "").trim());
        if (parsed.title && parsed.details) {
          return Response.json(parsed);
        }
      }
    }

    return Response.json({ error: "Failed to generate AI verdict" }, { status: 500 });

  } catch (error) {
    console.error("[judge-ai] error", error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
