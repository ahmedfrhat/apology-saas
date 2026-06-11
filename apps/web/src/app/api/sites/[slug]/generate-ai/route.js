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
    const { incident_reason, coreIntent = "apology", textVibe = "affectionate", vibeIntensity = "medium" } = body || {};

    if (!incident_reason) {
      return Response.json({ error: "الرجاء إدخال سبب الزعل" }, { status: 400 });
    }

    const reason = incident_reason.trim();
    const reasonLower = reason.toLowerCase();

    // Fetch site config to get custom API key
    let config = {};
    try {
      const result = await sql`
        SELECT config FROM apology_sites WHERE slug = ${slug}
      `;
      if (result && result.length > 0 && result[0].config) {
        config = result[0].config;
      }
    } catch (dbErr) {
      console.error("Failed to fetch site config for AI generation", dbErr);
    }

    // 1. Check for API key (Gemini / OpenAI)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const petNameInstruction = config?.petNameOverride ? `\n   - CRITICAL: You MUST use her specific pet name "${config.petNameOverride}" repeatedly when addressing her. Do not invent other pet names.` : `\n   - Use natural, common Egyptian pet names like (يا روحي، يا حبيبتي، يا قلبي).`;
        
        const systemPrompt = `You are an expert in Emotional Intelligence, Psychological Subtext, and Egyptian/Arab Cultural Nuance.
Your task is to generate a custom configuration in JSON format based on the boyfriend's incident reason: "${reason}".

Additional parameters guiding the generation:
- Core Intent: ${coreIntent} (Options: apology, love, joy)
- Text Vibe: ${textVibe} (Options: standard, funny, sarcastic_egyptian)
- Vibe Intensity: ${vibeIntensity} (Options: low, medium, high)

Follow these instructions strictly:
1. Deep Semantic Analyzer & Dynamic Tone:
   - Sarcastic Egyptian Comedy: If Text Vibe is "sarcastic_egyptian", you MUST inject sharp, laugh-out-loud sarcastic Egyptian humor. Playfully roast and mock the boyfriend (تنمر كوميدي ضاحك على الولد) while heavily praising and hyping the girl (تطبيل كامل للبنت).
   - Light Funny Tone: If Text Vibe is "funny", leverage highly relatable, genuinely funny Egyptian pop-culture wit and lighthearted teasing.
   - Intensity Scaling: Dynamically morph sentence structure and emotional weight based on Vibe Intensity. If set to 'high', deliver maximum dramatic impact.
   - If Core Intent is "love" or "joy", frame the text entirely around affection, happiness, and appreciation rather than apology.
   - ABSOLUTE BAN ON STATIC PREFIXES: Strictly forbid using hardcoded templates, quotes, or sentence starters.
   - 100% ORGANIC SYNTHESIS: The input reason must ONLY be treated as "semantic context". Never copy the exact phrase.
2. Strict 2nd Person Feminine & Localized Language:
   - Address the girl strictly in the 2nd person feminine singular (مخاطب مؤنث مفرد) (e.g. "إنتي", "سامحتيني", "زعّلتك").${petNameInstruction}
   - Output must be in fluent, high-end, contemporary Egyptian Arabic (عامية مصرية راقية ومؤثرة). It must sound like a deeply caring human boyfriend. No rigid standard Arabic.
3. Contextual Trivia & Letter Generation:
   - Generate exactly 3 quiz questions matching the incident and the core intent.
   - Reward coupons must compensate for the mistake or match the vibe.
4. Schema Constraint:
   - Exclusively return a raw, clean JSON object matching this schema (do not wrap in markdown \`\`\`json code blocks, do not include trailing commas):
      {
        "landingText": "...",
        "triviaQuestions": [
          {
            "q": "...",
            "options": ["...", "...", "..."],
            "correct": "..." or ["...", "..."],
            "trap": { "option": "...", "msg": "..." } or null
          }
        ],
        "finalLetter": {
          "title": "...",
          "body": ["...", "...", "..."],
          "loveSignature": "...",
          "boySignature": "..."
        },
        "judgeText": {
          "title": "...",
          "details": "..."
        },
        "feedbackTexts": {
          "oneStar": "...",
          "twoStar": "...",
          "threeStar": "...",
          "fourStar": "...",
          "fiveStar": "..."
        }
      }
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
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
            } catch (parseErr) {
              const match = jsonText.match(/\{[\s\S]*\}/);
              if (match) parsed = JSON.parse(match[0]);
            }
            if (parsed && parsed.landingText && parsed.triviaQuestions && parsed.finalLetter && parsed.judgeText && parsed.feedbackTexts) {
              return Response.json(parsed);
            }
          }
        }
      } catch (geminiErr) {
        console.error("Gemini API call failed, falling back to local decoder", geminiErr);
      }
    }

    // 2. High-Fidelity Semantic Fallback Generator (decodes themes and applies Egyptian/Arab Cultural Nuance)
    let theme = "default";
    if (reasonLower.includes("كلم") || reasonLower.includes("بنت") || reasonLower.includes("خيانة") || reasonLower.includes("بنات") || reasonLower.includes("كذب") || reasonLower.includes("كدب") || reasonLower.includes("مخبي")) {
      theme = "severe_trust";
    } else if (reasonLower.includes("اهتمام") || reasonLower.includes("مهتم") || reasonLower.includes("إهمال") || reasonLower.includes("هاملني") || reasonLower.includes("مطنش") || reasonLower.includes("بارد") || reasonLower.includes("تجاهل") || reasonLower.includes("بيها") || reasonLower.includes("فكراني")) {
      theme = "neglect_attention";
    } else if (reasonLower.includes("عيد ميلاد") || reasonLower.includes("ميلاد") || reasonLower.includes("فلانتين") || reasonLower.includes("ذكرى") || reasonLower.includes("valentine") || reasonLower.includes("birthday") || reasonLower.includes("مناسبة")) {
      theme = "neglect_forgotten";
    } else if (reasonLower.includes("مكالمة") || reasonLower.includes("رديت") || reasonLower.includes("تلفون") || reasonLower.includes("تأخرت") || reasonLower.includes("موبايل") || reasonLower.includes("تأخير")) {
      theme = "missed_calls";
    } else if (reasonLower.includes("ببجي") || reasonLower.includes("لعبة") || reasonLower.includes("pubg") || reasonLower.includes("كورة") || reasonLower.includes("بلايستيشن") || reasonLower.includes("ماتش") || reasonLower.includes("لعب")) {
      theme = "gaming_sports";
    } else if (reasonLower.includes("سبب") || reasonLower.includes("بدون سبب") || reasonLower.includes("من غير سبب")) {
      theme = "no_reason";
    }

    // config was declared earlier, we will reassign it or use it
    switch (theme) {
      case "neglect_attention":
        config = {
          landingText: "عارف إنك الفترة دي حاسة إني مش مهتم بيكي ومقصر معاكي، وجيت هنا عشان أقولك إنك كل دنيتي ومقدرش على زعلك... انزلي شوفي كدا 🥺❤️",
          triviaQuestions: [
            {
              q: "تفتكري مين أهم حاجة في حياتي وبفكر فيها طول اليوم حتى لو مشغول؟",
              options: ["إنتي يا حبيبتي طبعاً 🥰", "الشغل والأكواد", "النوم"],
              correct: "إنتي يا حبيبتي طبعاً 🥰",
              trap: { option: "الشغل والأكواد", msg: "الأكواد ملهاش لازمة لو إنتي مش معايا! اختاري صح 😂" }
            },
            {
              q: "عشان أعوضك عن التقصير والقلة في الاهتمام، كوبون الدلع بتاعي هيكون إيه؟",
              options: ["يوم كامل خروجة وفسحة وطلبات مجابة 🎟️", "أعملك شاي بالياسمين", "أكتبلك كود جديد"],
              correct: ["يوم كامل خروجة وفسحة وطلبات مجابة 🎟️", "أعملك شاي بالياسمين"],
              trap: null
            },
            {
              q: "مين البنت الوحيدة اللي ليها الأولوية في يومي وفي حياتي كلها؟",
              options: ["إنتي وبس يا روحي", "بنت الجيران"],
              correct: "إنتي وبس يا روحي",
              trap: { option: "بنت الجيران", msg: "بنت الجيران مين يا بنتي! ركزي واختاري صح 😂" }
            }
          ],
          finalLetter: {
            title: "إلى حبيبة قلبي الملكة.. 🤍",
            body: [
              "أنا أسف بجد لو حسستك الفترة اللي فاتت إني مش مهتم بيكي أو مقصر في حقك. أوقات الشغل والضغوطات بتسرقني، بس والله العظيم غلاوتك ومكانتك في قلبي زي ما هي ومفيش أي حاجة تقدر تاخد مكانك.",
              "الصفحة دي عملتها مخصوص عشان أصالحك وأفكرك إن رضاكي واهتمامي بيكي هما الأهم عندي دايماً، ومستحيل أتحمل أشوفك زعلانة أو حاسة بالتقصير مني.",
              "أوعدك إني ههتم بيكي أكتر وأعوضك عن كل لحظة حسيتي فيها بإهمال. بحبك يا ملكة قلبي."
            ],
            loveSignature: "إنتي الأولوية والكل في حياتي ❤️",
            boySignature: "- حبيبك اللي مهتم بيكي"
          }
        };
        break;

      case "no_reason":
        config = {
          landingText: "أنا بجد حاسس بالذنب إني ضايقتك وزعلتك من غير ما يكون فيه أي سبب واضح.. بس عارف إن قلبك كبير ومستحيل يفضل شايل مني.. انزلي شوفي كدا 🥺❤️",
          triviaQuestions: [
            {
              q: "تفتكري النكد اللي حصل ده كان بجد مستاهل ولا أنا غبي وبزعل نفسي وبزعلك على الفاضي؟",
              options: ["أنا غبي وبزعلنا على الفاضي 🤦‍♂️", "الموضوع كان مستاهل طبعاً", "الطقس هو السبب"],
              correct: "أنا غبي وبزعلنا على الفاضي 🤦‍♂️",
              trap: { option: "الموضوع كان مستاهل طبعاً", msg: "مكانش مستاهل خالص والله! اختاري إني غبي وصالحيني 😂" }
            },
            {
              q: "عشان نعوض النكد اللي من غير سبب ده، تفتكري المفروض نعمل إيه؟",
              options: ["نخرج ناكل أكلة تقيلة ومحترمة 🍔", "نفضل متخاصمين للصبح", "ننسى اللي حصل بكلمة حلوة"],
              correct: ["نخرج ناكل أكلة تقيلة ومحترمة 🍔", "ننسى اللي حصل بكلمة حلوة"],
              trap: { option: "نفضل متخاصمين للصبح", msg: "يا ساتر! الخصام متعب لقلبي، اختاري حل سلمي وسريع 😂" }
            },
            {
              q: "مين أكتر ولد بيحب ضحكتك وميقدرش يشوفك زعلانة لو لثانية؟",
              options: ["أنا طبعاً 🥰", "أي حد تاني"],
              correct: "أنا طبعاً 🥰",
              trap: { option: "أي حد تاني", msg: "مستحيل! مفيش حد بيحبك قدي يا ملكتي! اختاري صح 😂" }
            }
          ],
          finalLetter: {
            title: "إلى ملكة قلبي وأيامي.. 🤍",
            body: [
              "أنا بكتبلك الكلام ده وأنا ندمان بجد إني نكدت عليكي وزعلتك من غير أي سبب يستاهل. أوقات من ضغط الشغل أو السيرفرات بطلع ضيقتي فيكي وتوتر، وإنتي ملّكيش ذنب خالص في أي حاجة.",
              "الصفحة دي معمولة عشان رضاكي يرجع، وعشان أقولك إني مقدرش أستغنى عن ضحكتك، والزعل البايخ ده لازم ينتهي فوراً لأنك أهم حاجة في حياتي.",
              "أسف من كل قلبي على تسرعي وغبائي، ويلا صافي يا لبن؟"
            ],
            loveSignature: "بحبك للأبد يا أحلى نصيب ❤️",
            boySignature: "- حبيبك"
          }
        };
        break;

      case "severe_trust":
        config = {
          landingText: "عارف إني غلطت في حقك وغلطتي كبيرة.. بس أنا هنا عشان أصلح كل اللي انكسر.. انزلي وشوفي كدا 🥺❤️",
          triviaQuestions: [
            {
              q: "مين أكتر إنسانة غالية في حياتي ومستحيل أفرط في وجودها ثانية واحدة؟",
              options: ["إنتي يا حبيبتي", "أي حد تاني", "مفيش حد"],
              correct: "إنتي يا حبيبتي",
              trap: { option: "أي حد تاني", msg: "مفيش حد غيرك في قلبي يا ملكتي، اختاري تاني" }
            },
            {
              q: "عشان أثبتلك إني ندمان بجد على الكتمان أو الزعل ده، المفروض أعمل إيه؟",
              options: ["أديكي الباسوردات بتاعتي كلها 🔑", "أصالحك بخروجة وهدية دبل", "تسامحيني فوراً"],
              correct: ["أديكي الباسوردات بتاعتي كلها 🔑", "أصالحك بخروجة وهدية دبل"],
              trap: null
            },
            {
              q: "تفتكري أنا بكلم غيرك بجد ولا إنتي اللي مالية عيني وقلبي ومفيش مكان لغيرك؟",
              options: ["إنتي وبس يا روحي", "الشك اللي جواكي"],
              correct: "إنتي وبس يا روحي",
              trap: { option: "الشك اللي جواكي", msg: "والله العظيم ما في غيرك في حياتي، بطلي شك واختاري صح 😂" }
            }
          ],
          finalLetter: {
            title: "إلى من تملك قلبي بالكامل.. 🤍",
            body: [
              "أنا بكتبلك الكلام ده من كل قلبي وندمان بجد على أي حاجة خلت الشك يدخل بيننا أو زعلتك مني. عارف إن الثقة بتاخد وقت عشان تتبني، بس والله العظيم إنتي عندي بالدنيا وما فيها وما فيش بنت في الكوكب تملى عيني غيرك.",
              "عملتلك الصفحة دي عشان أثبتلك إني مستعد أتعب وأعمل أي حاجة عشان أراضيكي وأرجع الضحكة لوشك الطيب ده. إنتي أماني وسندي ومقدرش أعيش من غير رضاكي.",
              "أسف على كل لحظة وجع أو تفكير وحش سببتهولك. أوعدك أكون صريح وواضح معاكي دايماً، وتفضلي إنتي الملكة الوحيدة في حياتي."
            ],
            loveSignature: "بحبك يا أغلى من روحي ❤️",
            boySignature: "- حبيبك الندمان"
          }
        };
        break;

      case "neglect_forgotten":
        config = {
          landingText: "أنا عارف إني نسيت أهم يوم في السنة.. يوم ميلاد أحلى ملكة في الكوكب 🎂💔.. بس العقاب مستني ومستحيل أهرب.. انزلي شوفي كدا!",
          triviaQuestions: [
            {
              q: "إيه الجريمة الكبرى اللي ارتكبتها وخلتني أستاهل الإعدام؟",
              options: ["نسيت اليوم المميز ده 🤦‍♂️", "نسيت الباسورد بتاع اللابتوب", "شربت النسكافيه بتاعك"],
              correct: "نسيت اليوم المميز ده 🤦‍♂️",
              trap: { option: "شربت النسكافيه بتاعك", msg: "النسكافيه سهل يتعوض، لكن اليوم ده ملوش حل! اختاري تاني 😂" }
            },
            {
              q: "عشان أكفر عن ذنب نسيان المناسبة دي، إيه أحسن عقوبة ليا؟",
              options: ["هدية تعويضية دبل وخروجة فخمة 🎁", "أطبخلك لمدة أسبوع", "تسامحيني بكلمة حلوة"],
              correct: ["هدية تعويضية دبل وخروجة فخمة 🎁", "أطبخلك لمدة أسبوع"],
              trap: { option: "تسامحيني بكلمة حلوة", msg: "لا سهلة دي! لازم عقاب حقيقي! اختاري تعويض فخم! 😂" }
            },
            {
              q: "تفتكري نسياني ده إهمال ليكي ولا ضغط الكمبيوتر والشغل هو اللي سحلني؟",
              options: ["ضغط السيرفرات والشغل 💻", "إهمال وعدم حب"],
              correct: "ضغط السيرفرات والشغل 💻",
              trap: { option: "إهمال وعدم حب", msg: "مستحيل أهملك يا قلبي، إنتي الأهم دايماً! اختاري صح 😂" }
            }
          ],
          finalLetter: {
            title: "إلى ملكة قلبي وأيامي.. 🤍",
            body: [
              "أنا ندمان جداً إني نسيت اليوم اللي اتولد فيه أحلى نصيب ليا في الدنيا. عارف إن مفيش تبرير يغفر النسيان ده، بس بجد غصب عني من ضغط الشغل وتفاصيل السيرفرات.",
              "الصفحة دي معمولة مخصوص عشان أقولك إن كل ثانية معاكي هي عيد بالنسبة ليا، وإنك تستاهلي كل حاجة حلوة وتستاهلي تعويض يليق بيكي.",
              "أسف من كل قلبي، وأوعدك اليوم ده يتعوض بمفاجأة أحلى بكتير، وتفضلي دايماً منورة حياتي."
            ],
            loveSignature: "عيد ميلادك/حبنا سعيد دايماً معايا ❤️",
            boySignature: "- حبيبك اللي بيحبك"
          }
        };
        break;

      case "missed_calls":
        config = {
          landingText: "أنا أسف إني اتأخرت في الرد عليكي أو نمت وسبت التلفون.. التلفون كان صامت بس الحب دايماً شغال 📞❤️.. انزلي شوفي كدا وصالحيني!",
          triviaQuestions: [
            {
              q: "أنا ليه ما رديتش على المكالمة فوراً يا ترى؟",
              options: ["كنت نايم وميت في العسل 😴", "كنت بلعب كورة", "كنت بكلم رونالدو"],
              correct: "كنت نايم وميت في العسل 😴",
              trap: { option: "كنت بكلم رونالدو", msg: "يا ريت! رونالدو مش هينقذك مني دلوقتي! اختاري الصح 😂" }
            },
            {
              q: "تفتكري إيه أحسن عقوبة لما أتأخر عليكي في الرد تاني؟",
              options: ["تتصلي بيا في نص الليل وتصحيني 😂", "تشتري على حسابي اللي يعجبك", "تخاصميني يوم كامل"],
              correct: ["تتصلي بيا في نص الليل وتصحيني 😂", "تشتري على حسابي اللي يعجبك"],
              trap: { option: "تخاصميني يوم كامل", msg: "يوم كامل؟ كدا كتير أوي على قلبي! اختاري عقاب تاني 😂" }
            },
            {
              q: "من أكتر بنت بحب أسمع صوتها في الكوكب؟",
              options: ["إنتي طبعاً 🥰", "أي حد تاني"],
              correct: "إنتي طبعاً 🥰",
              trap: { option: "أي حد تاني", msg: "بطلي عبط! صوتك هو اللي بيروق يومي! اختاري صح 😂" }
            }
          ],
          finalLetter: {
            title: "يا صاحبة أحلى صوت.. 🤍",
            body: [
              "أسف جداً إني اتأخرت عليكي في الرد ونمت أو سبت التلفون.. عارف إن الانتظار رخم وبيرخم اليوم، بس يشهد ربنا إني كنت تعبان جداً ومش إهمال ليكي أبداً.",
              "عملتلك الكود ده مخصوص عشان أصالحك وأثبتلك إن مكالمتك ورضاكي عندي بالدنيا وما فيها، ومستحيل أكون حابب أزعلك.",
              "يا رب دايماً سامع صوتك وضحكتك مالية حياتي، ومفيش تأخير تاني يا ستي خلاص."
            ],
            loveSignature: "بحبك وبموت في صوتك ❤️",
            boySignature: "- حبيبك"
          }
        };
        break;

      case "gaming_sports":
        config = {
          landingText: "فضلت البلايستيشن أو ببجي للحظات.. بس إنتي الجيم اللي مستحيل أخسره في حياتي 🎮💔.. انزلي شوفي بروتوكول المصالحة!",
          triviaQuestions: [
            {
              q: "من الجيم الأهم اللي مستحيل أستغنى عنه ومستعد أبيع البلايستيشن عشانه؟",
              options: ["منورتي طبعاً 🥰", "ببجي موبايل", "فيفا 26"],
              correct: "منورتي طبعاً 🥰",
              trap: { option: "ببجي موبايل", msg: "يا بني آدم ركز! ببجي مين؟ كدا هتتنفخ! اختاري تاني 😂" }
            },
            {
              q: "عشان أصالحك على وقت اللعب، الكوبون الذهبي بتاعك المفروض يكون إيه؟",
              options: ["كوبون اعتزال الببجي لمدة أسبوع كامل 🎮", "خروجة فخمة من اختيارك", "تسامحيني فوراً"],
              correct: ["كوبون اعتزال الببجي لمدة أسبوع كامل 🎮", "خروجة فخمة من اختيارك"],
              trap: null
            },
            {
              q: "لما بلعب ببجي وأتاخر عليكي، تفتكري ده معناه إيه؟",
              options: ["غباء برمجة كود اللعبة 🤷‍♂️", "إني مش بحبك"],
              correct: "غباء برمجة كود اللعبة 🤷‍♂️",
              trap: { option: "إني مش بحبك", msg: "حبك في قلبي أكتر من الجيمز بمليار مرة! اختاري صح 😂" }
            }
          ],
          finalLetter: {
            title: "يا كل انتصاراتي.. 🤍",
            body: [
              "أنا أسف إني اندمجت في اللعب وسبتك.. اللعب مجرد تضييع وقت، لكن إنتي الوقت الحقيقي اللي بعيشه والضحكة اللي بتسندني في دنيتي.",
              "عملتلك اللعبة دي والموقع ده مخصوص عشان أصالحك وأقولك إنك دايماً المكسب الوحيد والبطولة اللي فزت بيها في حياتي.",
              "أوعدك أظبط وقتي، واللعب مستحيل ياخدني منك تاني. بحبك يا ملكتي."
            ],
            loveSignature: "إنتي الفوز الوحيد في حياتي ❤️",
            boySignature: "- حبيبك"
          }
        };
        break;

      default:
        config = {
          landingText: "أنا عارف إني ضايقتك وزعلتك الفترة الأخيرة.. وقلبي واجعني بجد لما حسيت إنك شايلة مني.. انزلي شوفي كدا وصالحيني 🥺❤️",
          triviaQuestions: [
            {
              q: "مين أكتر حد زعلان مني دلوقتي بسبب العك اللي عملته؟",
              options: ["منورتي طبعاً 🥰", "رونالدو لما يضيع بلنتي", "الكمبيوتر بتاعي"],
              correct: "منورتي طبعاً 🥰",
              trap: { option: "الكمبيوتر بتاعي", msg: "هو الكمبيوتر هيصالحك؟ اختاري تاني 😂" }
            },
            {
              q: "عشان أصالحك بعد ما ضايقتك، تفتكري المفروض أعمل إيه؟",
              options: ["تسامحيني فوراً", "أشتريلك شوكولاتة وغزل بنات", "تطرديني من البيت"],
              correct: ["تسامحيني فوراً", "أشتريلك شوكولاتة وغزل بنات"],
              trap: { option: "تطرديني من البيت", msg: "بلاش قسوة يا فوزية! اختاري حل سلمي 😂" }
            },
            {
              q: "مين أكتر ولد بيحبك في الكوكب ومستعد يعمل أي حاجة عشان ضحكتك؟",
              options: ["أنا طبعاً", "مهند التركي"],
              correct: "أنا طبعاً",
              trap: { option: "مهند التركي", msg: "بلاش عبط! مهند مين؟ اختاري صح عشان يومك يعدي! 😂" }
            }
          ],
          finalLetter: {
            title: "إلى أغلى وأجمل ملكة.. 🤍",
            body: [
              "أنا بكتبلك الكلام ده وأنا ندمان جداً إني زعلتك وضايقتك.. عارف إني أوقات بغبائي بزعلك وبنسى حاجات مهمة، بس والله العظيم غلاوتك عندي مفيش زيها في الدنيا.",
              "عملتلك الصفحة دي مخصوص عشان أثبتلك إني مستعد أعمل أي حاجة، حتى لو هبرمج كود كامل، بس عشان أشوف الضحكة الحلوة دي تاني على وشك.",
              "أنا أسف من كل قلبي على أي لحظة ضيق سببتها لك، وأوعدك إني هبذل كل جهدي عشان أكون السند والراجل اللي تستاهليه دايماً. صافي يا لبن؟"
            ],
            loveSignature: "بحبك للأبد يا ملكتي ❤️",
            boySignature: "- حبيبك"
          },
          judgeText: {
            title: "المحكمة تحكم لصالحك!",
            details: "أنا المعترف بكل أخطائي وقرارات المحكمة نافذة."
          },
          feedbackTexts: {
            oneStar: "تنبيه: نجمة واحدة!",
            twoStar: "نجمتين!",
            threeStar: "3 نجوم",
            fourStar: "4 نجوم",
            fiveStar: "5 نجوم شكرا"
          }
        };
        break;
    }

    return Response.json(config);
  } catch (error) {
    console.error("[generate-ai] error", error);
    return Response.json({ error: "فشل توليد نصوص المصالحة" }, { status: 500 });
  }
}
