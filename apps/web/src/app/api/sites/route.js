import sql from "@/app/api/utils/sql";
import { neon } from "@neondatabase/serverless";

const DEFAULT_CONFIG_TEMPLATE = {
  boyName: "",
  girlName: "",
  girlNickname: "",
  landingText: "في وسط أي زعل.. فيه حاجات تانية مستحيل تضيع.. انزلي شوفي",
  loaderTexts: [
    "$ Initializing {girlNickname} Protocol...",
    "$ Loading Memories...",
    "$ Fetching Love Signals...",
    "[OK] All Systems Online. Welcome, {girlName}."
  ],
  triviaQuestions: [
    {
      q: "مين أكتر حد بحبه وبيدعمني؟",
      options: ["زيزو صاحبي", "احمد النسوانجي اللي معايا ف السكن", "انتي"],
      correct: ["زيزو صاحبي", "احمد النسوانجي اللي معايا ف السكن"],
      trap: { option: "انتي", msg: "بطلي عبط صحابي اهم اختاري تاني" }
    },
    {
      q: "إيه أكتر حاجة ببقى مبسوط وأنا بعملها؟",
      options: ["البرمجة", "العب كورة", "النوم"],
      correct: "العب كورة",
      trap: null
    },
    {
      q: "مين أكتر حد بحبه؟",
      options: ["إنتي", "رونالدو"],
      correct: "رونالدو",
      trap: { option: "إنتي", msg: "اختاري صح خلي يومك يعدي يا {girlNickname}! 😂" }
    }
  ],
  judgeText: {
    title: "بعد دراسة الأدلة والمرافعات... المحكمة تحكم لصالح {girlName}! ⚖️❤️",
    details: "القاضي: كل اللي عملته {girlName} صح والباقي كلامه فارغ 😂"
  },
  feedbackTexts: {
    oneStar: "🚨 تنبيه أمني خطير! تم رصد تقييم عدائي (1 نجمة). السيستم يعتبر هذا تهديداً لسلامة روقان {boyName}، وجاري تفجير الشاشة بقلوب ناعمة للدفاع عن النفس خلال {count} ثوانٍ...",
    twoStar: "ممم.. نجمتين؟ تحسن طفيف ولكن لا يليق بالملكة {girlName}. جاري تفعيل بروتوكول الرشوة التلقائية...",
    threeStar: "3 نجوم؟ يعني صافي يا لبن بس كبرياء {boyName} مجروح شوية. جاري فحص ملفات السيرفر...",
    fourStar: "يا سلاام! 4 نجوم! وصلنا لـ 80% من الروقان الكامل. بس {boyName} محتاج النجمة الأخيرة دي عشان يعدي ترم هندسة الكمبيوتر بسلام 😂",
    fiveStar: "كفاءة 100%! تم توثيق الصلح الشامل، وإعلان {girlName} كأعظم ملكة في المجرة! 🥰❤️"
  },
  giftCoupons: [
    "خروجة وفسحة كاملة في المكان اللي تختاريه على حساب {boyName} 🎟️",
    "عزومة أكل تقيلة ومحترمة (بدون أي خناقات على مكان الأكل) 🍔",
    "كوبون إعفاء كامل من أي زعل لمدة 24 ساعة (يُستخدم مرة واحدة) 📜"
  ],
  finalLetter: {
    title: "إلى أغلى ما أملك.. 🤍",
    body: [
      "{girlNickname} الجميلة اللي ماليش غيرها،",
      "عارف إني ممكن أكون بزعلك أحياناً، وعارف إن الموقف الأخير ضايقك.. بس يعلم ربنا إنك عندي بالدنيا وما فيها. إنتي مش بس حبيبتي، إنتي الروح اللي بتنور أيامي والضحكة اللي بتمسح كل تعبي.",
      "عملتلك الموقع ده مخصوص عشان أثبتلك إن مفيش خناقة تقدر تبعدني عنك، وإنك تستاهلي كل حاجة حلوة في الدنيا وتستاهلي إني أتعب وأبرمج مخصوص عشان أشوف ضحكتك دي.",
      "أسف على كل لحظة زعل، وأوعدك إني دايماً هفضل جنبك وسندك. يا رب دايماً مع بعض، ويا رب دايماً مالية حياتي فرحة."
    ],
    loveSignature: "بحبك يا {girlName} ❤️",
    boySignature: "- {boyName}"
  },
  voidText: "{girlNickname} للأبد 💛"
};

let dbInitialized = false;

async function ensureTable() {
  if (dbInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS apology_sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        edit_password VARCHAR(255) NOT NULL,
        config JSONB NOT NULL
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_apology_sites_slug ON apology_sites(slug)
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS live_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES apology_sites(id) ON DELETE CASCADE,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        current_section VARCHAR(100),
        battery_level INTEGER,
        last_action VARCHAR(255),
        broadcast_msg TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `;
    await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_detected BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_seconds FLOAT DEFAULT 0`;
    dbInitialized = true;
  } catch (err) {
    console.error("Failed to create tables", err);
  }
}

function getGirlNickname(name) {
  if (name.endsWith("ة")) {
    return name.slice(0, -1) + "تي"; // e.g. فاطمة -> فاطمتي
  }
  return name + "تي"; // e.g. منار -> منارتي
}

export async function POST(request, context, c) {
  try {
    console.log("[sites/POST] 1. Starting request processing...");

    // 1. Wrap Body Parsing Safely with a fallback timeout
    let body;
    console.log("[sites/POST] 2. Before parsing body...");
    try {
      const nodeReq = c?.env?.incoming || {};
      if (nodeReq.body) {
        console.log("[sites/POST] Found pre-parsed body from Vercel Node runtime!");
        body = typeof nodeReq.body === "string" ? JSON.parse(nodeReq.body) : nodeReq.body;
      } else {
        body = await Promise.race([
          request.json(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Body parsing timeout")), 5000))
        ]);
      }
      console.log("[sites/POST] 3. Body parsed successfully. Keys:", Object.keys(body || {}));
    } catch (parseError) {
      console.error("[sites/POST] ERROR: Failed to parse body or timeout:", parseError);
      return Response.json({ error: "فشل قراءة البيانات. قد يكون الاتصال بطيئاً." }, { status: 400 });
    }

    const { slug, password, boyName, girlName } = body || {};

    if (!slug || !password || !boyName || !girlName) {
      console.log("[sites/POST] 4. Missing fields validation failed.");
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    console.log("[sites/POST] 5. Validating slug format...");
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return Response.json({ error: "يجب أن يكون الرابط باللغة الإنجليزية ويحتوي على أحرف وأرقام وشرطة فقط" }, { status: 400 });
    }

    // Enforce Neon HTTP Client explicitly for this route to avoid any pool hangs
    console.log("[sites/POST] 6. Initializing explicit Neon HTTP client...");
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) throw new Error("DB URL missing in route");
    const safeSql = neon(dbUrl);

    console.log(`[sites/POST] 7. Before duplicate slug check query for: ${slug}`);
    const existing = await safeSql`SELECT id FROM apology_sites WHERE slug = ${slug}`;
    console.log(`[sites/POST] 8. After duplicate slug check query. Found: ${existing.length}`);
    
    if (existing.length > 0) {
      return Response.json({ error: "الرابط ده محجوز يا هندسة ❌" }, { status: 409 });
    }

    const girlNickname = getGirlNickname(girlName);

    const configBase = {
      ...DEFAULT_CONFIG_TEMPLATE,
      boyName,
      girlName,
      girlNickname
    };

    // Deep replace template strings so dashboard shows actual names
    const deepReplace = (obj) => {
      if (typeof obj === 'string') {
        return obj
          .replace(/{boyName}/g, boyName)
          .replace(/{girlName}/g, girlName)
          .replace(/{girlNickname}/g, girlNickname);
      }
      if (Array.isArray(obj)) {
        return obj.map(deepReplace);
      }
      if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = deepReplace(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    const config = deepReplace(configBase);

    const configStr = JSON.stringify(config);

    console.log(`[sites/POST] 9. Before INSERT query for: ${slug}`);
    await safeSql`
      INSERT INTO apology_sites (slug, edit_password, config)
      VALUES (${slug}, ${password}, ${configStr}::jsonb)
    `;
    console.log(`[sites/POST] 10. After INSERT query. Success!`);

    return Response.json({ success: true, slug });
  } catch (error) {
    console.error("[sites/POST] FATAL ERROR during POST:", error);
    return Response.json({ error: "فشل إنشاء الموقع بسبب خطأ داخلي" }, { status: 500 });
  }
}
