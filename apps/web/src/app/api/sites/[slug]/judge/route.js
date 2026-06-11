import sql from "@/app/api/utils/sql";
import { enforceRateLimit } from "@/app/api/utils/ratelimit";
import { sanitize } from "@/lib/sanitize";

export const runtime = "nodejs";

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
    let { 
      pleaText, 
      girlName, 
      boyName, 
      angerLevel = 100, 
      trapCount = 0, 
      step = 2, 
      followupQuestion = "", 
      followupResponse = "", 
      memoConditions = "" 
    } = body || {};

    pleaText = sanitize(pleaText || "");
    followupQuestion = sanitize(followupQuestion || "");
    followupResponse = sanitize(followupResponse || "");
    memoConditions = sanitize(memoConditions || "");

    if (!pleaText) {
      return Response.json({ error: "الرجاء إدخال نص الدفاع" }, { status: 400 });
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

    const geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return Response.json({ error: "Gemini API Key is not configured." }, { status: 400 });
    }

    // --- STEP 1: Ask follow-up question ---
    if (Number(step) === 1) {
      const promptAr = `You are an expert, witty Egyptian AI Judge in a romantic "Court of Apology".
The user is the girlfriend (the plaintiff: ${girlName || "البنت"}). She has just submitted her specific grievance/complaint about the boyfriend (${boyName || "الولد"}).
Her Grievance: "${pleaText}"

You must address her DIRECTLY in the 2nd person feminine singular (مخاطب مؤنث مفرد - "إنتي", "حقك").
Ask her a funny, sarcastic Egyptian follow-up question related to this grievance, prompting her for more details or asking her to prove his crime, or mock-asking how she tolerated this. Keep it short, wittiest possible, MAX 1-2 sentences. Emojis like (👀, 😂) are welcome.

Strict Output Requirements:
Output MUST be ONLY valid JSON matching this schema exactly (no markdown, no backticks, no trailing commas):
{
  "question": "..."
}`;

      const promptEn = `You are an expert, witty AI Judge in a romantic "Court of Apology".
The user is the girlfriend (the plaintiff: ${girlName || "the girl"}). She has just submitted her specific grievance/complaint about the boyfriend (${boyName || "the boy"}).
Her Grievance: "${pleaText}"

Ask her a funny, sarcastic follow-up question related to this grievance. Keep it short and witty, MAX 1-2 sentences.
Output MUST be ONLY valid JSON matching this schema exactly:
{
  "question": "..."
}`;

      const finalPrompt = config.locale === "en" ? promptEn : promptAr;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
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
          try {
            const parsed = JSON.parse(jsonText.replace(/```json/g, "").replace(/```/g, "").trim());
            if (parsed && parsed.question) {
              return Response.json(parsed);
            }
          } catch (e) {
            console.error("Failed to parse Gemini Step 1 JSON", e);
          }
        }
      }

      return Response.json({
        question: config.locale === "en" 
          ? "Is it true he does this every single time, or is he just acting absent-minded? 👀" 
          : "هل ده بيحصل معاكي كل مرة فعلاً ولا هو بيستهبل بس؟ 👀"
      });
    }

    // --- STEP 2: Issue final verdict ---
    const petNameInstructionAr = config.petNameOverride 
      ? `You MUST use her specific pet name "${config.petNameOverride}" repeatedly when addressing her.` 
      : `Use natural, common Egyptian pet names like (يا بنتي، يا حبيبتي).`;

    let moodConditionAr = "";
    if (angerLevel < 30) {
      moodConditionAr = "CRITICAL: The girlfriend's anger level is EXTREMELY HIGH. You must validate her extreme anger completely and be utterly ruthless against the boy. Show absolutely zero mercy to him.";
    } else if (angerLevel > 80) {
      moodConditionAr = "CRITICAL: The girlfriend's anger level is very low (she is happy/calm). The judge should be a romantic mediator, playfully teasing the boy but telling her 'He really loves you, just forgive him'.";
    }

    let trapConditionAr = "";
    if (trapCount > 0) {
      trapConditionAr = `CRITICAL: If trapCount > 0, playfully expose her in the verdict. Example: 'المحكمة تلاحظ إنك وقعتي في الفخ ${trapCount} مرات في الكويز.. ركزي معاه شوية!'`;
    }

    const systemPromptAr = `You are an expert, witty Egyptian AI Judge in a romantic "Court of Apology".
The user is the girlfriend (the plaintiff: ${girlName || "البنت"}). She has just submitted her specific grievance/complaint about the boyfriend (${boyName || "الولد"}).
Her Grievance: "${pleaText}"
The Court's follow-up question: "${followupQuestion}"
Her Response to the follow-up question: "${followupResponse}"
The proposed sentencing conditions for the boyfriend (Defense Memo): "${memoConditions}"

You must address her DIRECTLY in the 2nd person feminine singular (مخاطب مؤنث مفرد - "إنتي", "حقك", "زعلانة").

Your job is to:
1) Validate her feelings 100%.
2) Roast the boyfriend mercilessly for committing this specific 'crime'.
3) Issue a hilarious, strict verdict punishing the boyfriend based on the sentencing conditions she chose.

Your absolute mandate:
1. Strict Length Limit: Keep it short and punchy, MAX 3-4 short sentences. Do not write long paragraphs.
2. Sarcastic Roasting: Inject a sharp, laugh-out-loud sarcastic Egyptian tone that playfully roasts/mocks the boyfriend. Ensure emojis like (😂، 💀، 🤫) are natively generated.
${petNameInstructionAr}
${moodConditionAr}
${trapConditionAr}

Strict Output Requirements:
1. Output MUST be ONLY valid JSON matching this schema exactly (no markdown, no backticks, no trailing commas):
{
  "title": "...", 
  "details": "...",
  "sentiment": 75
}
2. "title" should be a short, dramatic headline like "حكم المحكمة النهائي لصالح [اسم البنت]".
3. "details" should be your full speech DIRECTED AT HER. Highly fluent Egyptian Arabic.
4. "sentiment" should be an integer from 0 to 100 evaluating her overall mood/satisfaction based on her complaint and responses (0 = furious/angry, 100 = happy/amused/reconciled).`;

    const petNameInstructionEn = config.petNameOverride 
      ? `You MUST use her specific pet name "${config.petNameOverride}" repeatedly when addressing her.` 
      : `Use natural, common pet names.`;

    let moodConditionEn = "";
    if (angerLevel < 30) {
      moodConditionEn = "CRITICAL: The girlfriend's anger level is EXTREMELY HIGH. You must validate her extreme anger completely and be utterly ruthless against the boy. Show absolutely zero mercy to him.";
    } else if (angerLevel > 80) {
      moodConditionEn = "CRITICAL: The girlfriend's anger level is very low (she is happy/calm). The judge should be a romantic mediator, playfully teasing the boy but telling her 'He really loves you, just forgive him'.";
    }

    let trapConditionEn = "";
    if (trapCount > 0) {
      trapConditionEn = `CRITICAL: If trapCount > 0, playfully expose her in the verdict. Example: 'The court also notes you fell for the trap options ${trapCount} times during the quiz... focus with him!'`;
    }

    const systemPromptEn = `You are an expert, witty AI Judge in a romantic "Court of Apology".
The user is the girlfriend (the plaintiff: ${girlName || "the girl"}). She has just submitted her specific grievance/complaint about the boyfriend (${boyName || "the boy"}).
Her Grievance: "${pleaText}"
The Court's follow-up question: "${followupQuestion}"
Her Response to the follow-up question: "${followupResponse}"
The proposed sentencing conditions for the boyfriend (Defense Memo): "${memoConditions}"

You must address her DIRECTLY in the 2nd person (e.g. "You", "Your").

Your job is to:
1) Validate her feelings 100%.
2) Roast the boyfriend mercilessly for committing this specific 'crime'.
3) Issue a hilarious, strict verdict punishing the boyfriend based on the sentencing conditions she chose.

Your absolute mandate:
1. Strict Length Limit: Keep it short and punchy, MAX 3-4 short sentences. Do not write long paragraphs.
2. Sarcastic Roasting: Inject a sharp, laugh-out-loud sarcastic tone that playfully roasts and mocks the boyfriend. Ensure emojis like (😂, 💀, 🤫) are natively generated.
${petNameInstructionEn}
${moodConditionEn}
${trapConditionEn}

Strict Output Requirements:
1. Output MUST be ONLY valid JSON matching this schema exactly (no markdown, no backticks, no trailing commas):
{
  "title": "...", 
  "details": "...",
  "sentiment": 75
}
2. "title" should be a short, dramatic headline like "Final Court Ruling in favor of [Girl's Name]".
3. "details" should be your full speech DIRECTED AT HER. Highly fluent English.
4. "sentiment" should be an integer from 0 to 100 evaluating her overall mood/satisfaction based on her complaint and responses (0 = furious/angry, 100 = happy/amused/reconciled).`;

    const finalSystemPrompt = config.locale === "en" ? systemPromptEn : systemPromptAr;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalSystemPrompt }] }],
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
          return Response.json({
            title: parsed.title,
            details: parsed.details,
            sentiment: typeof parsed.sentiment === "number" ? parsed.sentiment : 50
          });
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
