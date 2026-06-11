import sql from "@/app/api/utils/sql";
import { neon } from "@neondatabase/serverless";

const DEFAULT_CONFIG_TEMPLATE = {
  locale: "ar",
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

const EN_CONFIG_TEMPLATE = {
  locale: "en",
  boyName: "",
  girlName: "",
  girlNickname: "",
  landingText: "In the middle of any argument.. there are things that can never be lost.. scroll down and see",
  loaderTexts: [
    "$ Initializing {girlNickname} Protocol...",
    "$ Loading Memories...",
    "$ Fetching Love Signals...",
    "[OK] All Systems Online. Welcome, {girlName}."
  ],
  triviaQuestions: [
    {
      q: "Who is my absolute favorite person?",
      options: ["My Best Friend", "My PS5", "You"],
      correct: ["My Best Friend", "My PS5"],
      trap: { option: "You", msg: "Stop playing! My friends are more important, choose again!" }
    },
    {
      q: "What makes me the happiest?",
      options: ["Coding", "Playing Football", "Sleeping"],
      correct: "Playing Football",
      trap: null
    },
    {
      q: "Who do I love more?",
      options: ["You", "Ronaldo"],
      correct: "Ronaldo",
      trap: { option: "You", msg: "Choose correctly so we can move on, {girlNickname}! 😂" }
    }
  ],
  judgeText: {
    title: "After reviewing all evidence... The Court rules in favor of {girlName}! ⚖️❤️",
    details: "Judge: Everything {girlName} said is correct, the rest is nonsense 😂"
  },
  feedbackTexts: {
    oneStar: "🚨 CRITICAL ALERT! Hostile 1-star rating detected. The system views this as a direct threat to {boyName}'s peace. Self-defense protocol initiated: flooding the screen with soft hearts in {count} seconds...",
    twoStar: "Hmm.. Two stars? A slight improvement, but not worthy of Queen {girlName}. Auto-bribe protocol activated...",
    threeStar: "3 stars? That means we're fine, but {boyName}'s ego is a bit bruised. Scanning server files...",
    fourStar: "Oh wow! 4 stars! We reached 80% total peace. But {boyName} needs that last star just to pass his engineering term in peace 😂",
    fiveStar: "100% EFFICIENCY! Total reconciliation documented, and {girlName} is officially declared the greatest Queen in the galaxy! 🥰❤️"
  },
  giftCoupons: [
    "A full date at any place you choose, entirely paid by {boyName} 🎟️",
    "A heavy, fancy dinner (with absolutely no arguing over where to eat) 🍔",
    "A Full Immunity Coupon: No getting mad at you for 24 hours (Single Use) 📜"
  ],
  finalLetter: {
    title: "To my most precious.. 🤍",
    body: [
      "My beautiful {girlNickname},",
      "I know I might upset you sometimes, and I know our last argument was tough.. but God knows you mean the world to me. You're not just my girl, you're the soul that lights up my days and the smile that erases all my tiredness.",
      "I built this entire site just to prove that no argument can pull me away from you. You deserve all the good things in the world, and you deserve me coding all night just to see that smile.",
      "I'm sorry for every moment of sadness, and I promise I'll always be by your side. I pray we stay together forever, and you always fill my life with joy."
    ],
    loveSignature: "I love you, {girlName} ❤️",
    boySignature: "- {boyName}"
  },
  voidText: "{girlNickname} forever 💛"
};

let dbInitialized = false;

async function ensureTable() {
  if (dbInitialized) return;
  try {
    // 1. Create apology_sites table
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
    await sql`ALTER TABLE apology_sites ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()`;
    
    // Auto TTL cleanup: Delete sites older than 7 days
    try {
      await sql`DELETE FROM apology_sites WHERE created_at < NOW() - INTERVAL '7 days'`;
    } catch(err) {
      console.error("TTL cleanup failed", err);
    }

    // 2. Create live_tracking table
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
    // Explicit database Index on session_id column in live_tracking
    await sql`
      CREATE INDEX IF NOT EXISTS idx_live_tracking_session_id ON live_tracking(session_id)
    `;
    await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_detected BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE live_tracking ADD COLUMN IF NOT EXISTS hesitation_seconds FLOAT DEFAULT 0`;

    // 3. Create apology_projects shadow table & index on slug
    await sql`
      CREATE TABLE IF NOT EXISTS apology_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        config JSONB,
        created_at TIMESTAMP DEFAULT now()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_apology_projects_slug ON apology_projects(slug)
    `;

    // 4. Create recipient_interactions shadow table & index on kvow_session_id
    await sql`
      CREATE TABLE IF NOT EXISTS recipient_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kvow_session_id VARCHAR(100) UNIQUE NOT NULL,
        site_id UUID,
        created_at TIMESTAMP DEFAULT now()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_recipient_interactions_kvow_session_id ON recipient_interactions(kvow_session_id)
    `;

    // 5. Create users shadow table & index on username
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `;

    // 6. Create telegram_queue table
    await sql`
      CREATE TABLE IF NOT EXISTS telegram_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        session_id VARCHAR(100) NOT NULL,
        payload JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT now()
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

export async function POST(request, context, c) {
  try {
    console.log("[sites/POST] 1. Starting request processing...");
    await ensureTable();

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

    const stripHtml = (str) => typeof str === "string" ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;") : str;

    let { slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale } = body || {};

    slug = stripHtml(slug);
    password = stripHtml(password);
    passwordHint = stripHtml(passwordHint || "");
    telegramChatId = stripHtml(telegramChatId || "");
    boyName = stripHtml(boyName);
    girlName = stripHtml(girlName);
    petName = stripHtml(petName);

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

    const girlNickname = petName && petName.trim() ? petName.trim() : getGirlNickname(girlName);

    const configBase = {
      ...(locale === "en" ? EN_CONFIG_TEMPLATE : DEFAULT_CONFIG_TEMPLATE),
      boyName,
      girlName,
      girlNickname,
      petNameOverride: petName && petName.trim() ? petName.trim() : null,
      passwordHint: passwordHint || null,
      telegramChatId: telegramChatId || null,
      locale: locale === "en" ? "en" : "ar"
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

    console.log(`[sites/POST] 9. Before hashing password for: ${slug}`);
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`[sites/POST] 10. Before INSERT query for: ${slug}`);
    await safeSql`
      INSERT INTO apology_sites (slug, edit_password, config)
      VALUES (${slug}, ${hashedPassword}, ${configStr}::jsonb)
    `;
    console.log(`[sites/POST] 11. After INSERT query. Success!`);

    return Response.json({ success: true, slug });
  } catch (error) {
    console.error("[sites/POST] FATAL ERROR during POST:", error);
    return Response.json({ error: "فشل إنشاء الموقع بسبب خطأ داخلي" }, { status: 500 });
  }
}
