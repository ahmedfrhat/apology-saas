import sql from "@/app/api/utils/sql";
import { enforceRateLimit } from "@/app/api/utils/ratelimit";

const fallbacks = [
  "السيستم هنج من كتر ما أنتِ معاكي حق! المحكمة بتحكم إنك التوب والباقي كنتلوب، وهو غلطان من ساسه لراسه! 💅",
  "القاضي بيشرب شاي دلوقتي، بس سابلنا ورقة مكتوب فيها: البنت دي دايماً صح، والباشمهندس يدفع غرامة خروجة فورية! ☕😂",
  "الذكاء الاصطناعي نفسه مش مصدق أخطاء المشكو في حقه! حكمت المحكمة بإنك قمر وهو ميطولش أصلاً يزعلك! 🤫"
];

export async function POST(request, context, c) {
  try {
    const isAllowed = await enforceRateLimit(request);
    if (!isAllowed) {
      return Response.json({ error: "خلصت محاولاتك السحرية النهاردة، جرب بكرة!" }, { status: 429 });
    }
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
1. Strict Length Limit: Keep it short and punchy, MAX 3-4 short sentences. Do not write long paragraphs.
2. Absolute Hype & Bias: Aggressively side with the girl using her specific pet name, showering her with praise ("تطبيل كامل").
3. Sarcastic Roasting: Inject a sharp, laugh-out-loud sarcastic Egyptian tone that playfully roasts/mocks the boyfriend ("تنمر كوميدي ضاحك على الولد"). Ensure emojis like (😂، 💀، 🤫) are natively generated to enhance the comedic vibe.
4. Tone Example Directive: You MUST mimic this exact comedic flavor: "حكمت المحكمة حضورياً وبأثر فوري إن الباشمهندس ${boyName || "الولد"} مذنب تلت ومتلت، وجريمته نكراء في حق كوكب الفرفشة.. يا بنتي إنتي خط أحمر، وهو أصلاً كتير عليه إنه يشم هوا نفس الصفحة اللي أنتِ فاتحاها، بس عشان عملك سيستم برمجيات مخصوص وواقف زي التلميذ مستني رضاكِ، هنعديها له المرة دي مع غرامة فسحة فخمة!"
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
        let parsed;
        try {
          parsed = JSON.parse(jsonText.replace(/```json/g, "").replace(/```/g, "").trim());
        } catch (e) {
          const match = jsonText.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        }
        if (parsed && parsed.title && parsed.details) {
          return Response.json(parsed);
        }
      }
    }

    return Response.json({
      title: `حكم المحكمة النهائي لصالح ${girlName || "البنت"}`,
      details: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    });

  } catch (error) {
    console.error("[judge-ai] error", error);
    return Response.json({
      title: "حكم المحكمة النهائي",
      details: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    });
  }
}
