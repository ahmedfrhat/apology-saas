import sql from "@/app/api/utils/sql";

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

export async function POST(request) {
  try {
    // تشغيل إنشاء الجداول في الخلفية عشان ما يعطلش الـ Request
    // تم التعطيل بناءً على طلبك لأن الجداول موجودة مسبقاً في Neon لتفادي الـ Timeout
    // ensureTable().catch(err => console.error("Background ensureTable error", err));
    console.log("[sites/POST] Starting request processing...");
    const body = await request.json();
    console.log("[sites/POST] Body parsed successfully:", Object.keys(body));
    const { slug, password, boyName, girlName } = body || {};

    if (!slug || !password || !boyName || !girlName) {
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return Response.json({ error: "يجب أن يكون الرابط باللغة الإنجليزية ويحتوي على أحرف وأرقام وشرطة فقط" }, { status: 400 });
    }

    // Check if slug is already taken
    console.log(`[sites/POST] Checking if slug exists: ${slug}`);
    const existing = await sql`
      SELECT id FROM apology_sites WHERE slug = ${slug}
    `;
    console.log(`[sites/POST] Check complete. Found: ${existing.length}`);
    if (existing.length > 0) {
      return Response.json({ error: "الرابط ده محجوز يا هندسة ❌" }, { status: 409 });
    }

    const girlNickname = getGirlNickname(girlName);

    // Build default customized config
    const config = {
      ...DEFAULT_CONFIG_TEMPLATE,
      boyName,
      girlName,
      girlNickname
    };

    const configStr = JSON.stringify(config);

    console.log(`[sites/POST] Executing INSERT for slug: ${slug}`);
    await sql`
      INSERT INTO apology_sites (slug, edit_password, config)
      VALUES (${slug}, ${password}, ${configStr}::jsonb)
    `;
    console.log(`[sites/POST] INSERT completed successfully.`);

    return Response.json({ success: true, slug });
  } catch (error) {
    console.error("[sites/POST] error", error);
    return Response.json({ error: "فشل إنشاء الموقع" }, { status: 500 });
  }
}
