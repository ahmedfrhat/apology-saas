import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, X, Sparkles, Gift, Flame, Trophy, ThumbsUp, Eye, Compass, 
  Calendar, ArrowRight, User, Lock, BookOpen, Activity, ArrowLeft, Play, CheckCircle2
} from "lucide-react";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAdBlockDetect } from "@/hooks/useAdBlockDetect";

const CARD =
  "bg-[#F4F3EF]/90 dark:bg-gray-900/90 backdrop-blur-3xl border border-[#1A1A1A]/10 dark:border-gray-800 shadow-[0_30px_70px_rgba(0,0,0,0.3)] rounded-[2.5rem]";

const TAB_BTN =
  "px-5 py-3 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer select-none";

const DEMO_STEPS = [
  { id: 1, name: "1. بوابة العبور 🔒", desc: "فتح القفل السري بالرقم السري المشفر وتجنب محاولات التطفل.", mock: "🔒 أدخل الرقم السري لفك التشفير: ••••••" },
  { id: 2, name: "2. فحص البصمة 👣", desc: "تأكيد الهوية البيومترية الحقيقية للمصالحة عبر ماسح البصمات التفاعلي.", mock: "👣 اضغط بإصبعك لتفعيل ماسح البصمة... [تم التطابق!]" },
  { id: 3, name: "3. بروتوكول البدء ⚡", desc: "تحميل ذكريات الحب وملفات المحاكاة وتثبيت الحماية الكاملة.", mock: "$ Initializing Protocol... Memory Blocks Loaded 100%!" },
  { id: 4, name: "4. تيرمينال الذاكرة 🖥️", desc: "استعراض مسار المشاعر واسترجاع السجلات وقاعدة بيانات السعادة.", mock: "> Loading signals... Love levels at 99.9% 💖" },
  { id: 5, name: "5. شريط الذكريات 📅", desc: "رحلة تفاعلية للمحطات واللحظات التي لا يمكن نسيانها.", mock: "📅 14 فبراير: أول يوم تقابلنا فيه تحت المطر 🌧️" },
  { id: 6, name: "6. فخاخ الأسئلة 🧠", desc: "مسابقات فكاهية وذكية بفخاخ ساخرة لكشف الإجابات الملتوية!", mock: "❓ س: مين أكتر حد بيعصبني؟ ج: انتي (Trap Alert! 😂)" },
  { id: 7, name: "7. سؤال المصير ⚠️", desc: "القرار الحاسم والسؤال الأصعب في لحظة الصدق.", mock: "⚠️ هل تقبلين الاعتذار والبدء من جديد بالحب والعهود؟" },
  { id: 8, name: "8. مؤشر الروقان 🎚️", desc: "التحكم في مستويات الزعل وسحب المؤشر حتى الوصول لـ 100% روقان.", mock: "🎚️ سحب المؤشر: [ Zizo's Mood: 100% Happy 🥰 ]" },
  { id: 9, name: "9. كاشف الابتسامة 📷", desc: "تشغيل الكاميرا والتحقق من الابتسامة الحقيقية عبر الذكاء الاصطناعي.", mock: "📷 جاري فحص الابتسامة... تم رصد ضحكة لطيفة! 🌟" },
  { id: 10, name: "10. محكمة الحب ⚖️", desc: "تقديم المرافعة النهائية للقاضي الآلي والحصول على الحكم لصالحها!", mock: "⚖️ القاضي: حكمنا لصالح الملكة وتغريم الزوج خروجة فخمة 🏛️" },
  { id: 11, name: "11. رسالة الاعتذار ✉️", desc: "رسالة من القلب تحمل الاعتذار الصادق والوعد بالبقاء للأبد.", mock: "✉️ إلى ملكتي الغالية: أسف على كل لحظة زعل.. بحبك ❤️" },
  { id: 12, name: "12. كبسولة الزمن وصك الصلح 📜", desc: "كتابة رسالة للمستقبل وتحميل وثيقة صلح رسمية معتمدة بصيغة PDF.", mock: "📜 مبروك! صك الصلح جاهز للتحميل والكبسولة مغلقة 🔐" }
];

const ZODIAC_GIFTS = {
  Aries: ["خروجة مغامرة (كارتينج أو تسلق) 🧗", "عطر فخم ومميز 🌟", "بوكس شيكولاته حار ولذيذ 🍫"],
  Taurus: ["عشاء رومانسي فاخر 🕯️", "بلانر جلدي أنيق 📔", "صندوق هدايا للعناية بالبشرة 🧴"],
  Gemini: ["كتاب تحبه مع فنجان قهوة مميز 📚", "تذكرة لحفلة موسيقية أو مسرحية 🎟️", "إكسسوار فضي مصمم خصيصاً 💍"],
  Cancer: ["بوكس ذكريات صور مطبوعة 📸", "شمع معطر برائحة اللافندر 🕯️", "بلوفر شتوي ناعم ومريح 🧶"],
  Leo: ["سلسلة ذهبية رقيقة ✨", "خروجة فاخرة في مكان جديد تماماً 🏰", "بورتريه مرسوم لها بعناية 🎨"],
  Virgo: ["منظم مكتب ذكي وعملي 📁", "ساعة يد كلاسيكية وأنيقة ⌚", "عزومة سبا ومساج هادئ 🧖‍♀️"],
  Libra: ["باقة ورد جوري طبيعي فخم 💐", "مجموعة مستحضرات تجميل راقية 💄", "سلسلة فضية بتصميم رقيق 💍"],
  Scorpio: ["عطر شرقي فخم وغامض 🖤", "كوب حراري مخصص باسمها ☕", "سوار جلدي أنيق بنقش خاص 📿"],
  Sagittarius: ["تذكرة لرحلة يوم كامل لمدينة أخرى 🗺️", "حقيبة سفر أنيقة وخفيفة 🎒", "كاميرا تصوير فورية 📷"],
  Capricorn: ["حقيبة يد جلدية فاخرة ومميزة 👜", "سماعات لاسلكية عالية الجودة 🎧", "كوبون تسوق من متجرها المفضل 🛍️"],
  Aquarius: ["إضاءة غرفة ذكية بألوان هادئة 💡", "نبتة منزلية خضراء جميلة 🪴", "ألبوم أغاني تفضلها 🎵"],
  Pisces: ["علبة مجوهرات موسيقية كلاسيكية 🎵", "مجموعة رسم أو تلوين متكاملة 🎨", "رسالة ورقية بخط اليد مع ورد ✉️"]
};

const BLOG_POSTS_MOCK = [
  {
    slug: "reconciliation-guide-5-steps",
    title: "دليل المصالحة الشامل: 5 خطوات لإصلاح الخلافات الرومانسية 💖",
    description: "تعرف على القواعد الذهبية لتقديم اعتذار حقيقي وصادق يذيب الخلافات فوراً ويعيد الدفء للعلاقة.",
    date: "2026-06-10",
    readTime: "4 دقائق",
    author: "د. هادي القلوب"
  },
  {
    slug: "psychology-of-apologies",
    title: "سيكولوجية الاعتذار: لماذا يعتبر الاعتذار ذكاءً عاطفياً وليس ضعفاً؟ 🧠",
    description: "الاعتذار الصادق يتطلب كبرياءً ووعياً كبيراً. في هذا المقال نوضح كيف يسهم الاعتذار في تعزيز الروابط.",
    date: "2026-06-08",
    readTime: "6 دقائق",
    author: "أ. منى الوداد"
  },
  {
    slug: "how-safi-io-helps-couples",
    title: "كيف تساعد منصة Safi.io الكابلز في كسر الجليد بطريقة ممتعة ومرحة؟ 📱",
    description: "أحياناً تكون الكلمات الجافة غير كافية. استكشف كيف تساعدك الألعاب والمحاكاة والرسائل الرقمية التفاعلية في الاعتذار بشكل مبهج.",
    date: "2026-06-05",
    readTime: "3 دقائق",
    author: "م. كريم المصالحة"
  }
];

export default function SaaSOnboardingPage() {
  const { locale, t } = useLanguage();
  const adBlockDetected = useAdBlockDetect();
  const [hideAdBanner, setHideAdBanner] = useState(false);
  
  // Clean structured active Tab Switcher (Homepage multi-page elegant layout)
  // Options: "wall" | "stories" | "gifts" | "create" | "blog"
  const [activeTab, setActiveTab] = useState("wall");
  
  // Creation state
  const [boyName, setBoyName] = useState("");
  const [girlName, setGirlName] = useState("");
  const [petName, setPetName] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [showTelegram, setShowTelegram] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [origin, setOrigin] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Login state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginSlug, setLoginSlug] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Counter & Stats
  const [globalCount, setGlobalCount] = useState(1489);

  // Fast-Forward Cinematic Demo state (Revamped 10-Second Simulation)
  const [showDemo, setShowDemo] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [demoAutoplay, setDemoAutoplay] = useState(false);

  // Anonymous Apology Wall state
  const [apologies, setApologies] = useState([]);
  const [newApology, setNewApology] = useState("");
  const [apologyLoading, setApologyLoading] = useState(false);
  const [wallSuccess, setWallSuccess] = useState(false);

  // Gift Generator state
  const [partnerAge, setPartnerAge] = useState("23-28");
  const [partnerZodiac, setPartnerZodiac] = useState("Cancer");
  const [generatedGifts, setGeneratedGifts] = useState(null);

  // Apology Stories Contest/Gallery
  const [stories, setStories] = useState([]);
  const [votingIds, setVotingIds] = useState(new Set());

  // Hydrate global counter, apologies wall, and stories
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setOrigin(window.location.host + "/");
    }

    // 1. Fetch live global stats count
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.count) setGlobalCount(data.count);
      })
      .catch((err) => console.error("Stats fetch error:", err));

    // 2. Fetch anonymous apologies
    fetch("/api/apologies/wall")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.apologies) setApologies(data.apologies);
      })
      .catch((err) => console.error("Apologies fetch error:", err));

    // 3. Fetch stories
    fetch("/api/apologies/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stories) setStories(data.stories);
      })
      .catch((err) => console.error("Stories fetch error:", err));
  }, []);

  // Revamped 10-Second Auto-advancing Demo logic
  useEffect(() => {
    if (!showDemo || !demoAutoplay) return;
    const interval = setInterval(() => {
      setDemoStepIndex((prev) => {
        if (prev < DEMO_STEPS.length - 1) {
          return prev + 1;
        } else {
          setDemoAutoplay(false);
          return prev;
        }
      });
    }, 900); // roughly 10s for 12 steps
    return () => clearInterval(interval);
  }, [showDemo, demoAutoplay]);

  const handleStartDemo = () => {
    setDemoStepIndex(0);
    setShowDemo(true);
    setDemoAutoplay(true);
  };

  // Submit login verify
  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoginError("");
      setLoginLoading(true);

      try {
        const res = await fetch(`/api/sites/${loginSlug}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: loginPassword }),
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
          sessionStorage.setItem(`unlocked_${loginSlug}`, "true");
          sessionStorage.setItem(`auth_pwd_${loginSlug}`, loginPassword);
          
          let sessionId = sessionStorage.getItem("kvow_session_id");
          if (!sessionId) {
            sessionId = `kvow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            sessionStorage.setItem("kvow_session_id", sessionId);
          }
          
          window.location.href = `/${loginSlug}/dashboard`;
        } else {
          setLoginError(data.error || "رابط الصفحة أو الرقم السري غير صحيح");
        }
      } catch (err) {
        console.error("Login verification failed:", err);
        setLoginError("فشل الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
      } finally {
        setLoginLoading(false);
      }
    },
    [loginSlug, loginPassword]
  );

  // Submit new SaaS interactive site
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale, creatorEmail }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const contentType = res.headers.get("content-type");
        let data = {};
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          throw new Error("استجابة غير صالحة من الخادم");
        }

        if (res.ok) {
          if (typeof window !== "undefined") {
            if (window.fbq) window.fbq('track', 'CompleteRegistration');
            if (window.ttq) window.ttq.track('CompleteRegistration');
          }
          setSuccess(true);
          setTimeout(() => {
            window.location.href = `/${slug}/dashboard`;
          }, 1500);
        } else {
          setError(data.error || "حدث خطأ أثناء إنشاء الموقع");
        }
      } catch (err) {
        setError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.");
      } finally {
        setLoading(false);
      }
    },
    [slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale, creatorEmail]
  );

  // Submit new anonymous apology to live database
  const handleApologySubmit = async (e) => {
    e.preventDefault();
    if (!newApology || apologyLoading) return;
    setApologyLoading(true);
    try {
      const res = await fetch("/api/apologies/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newApology }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.apology) {
        setApologies((prev) => [data.apology, ...prev]);
        setNewApology("");
        setWallSuccess(true);
        setTimeout(() => setWallSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Wall post error:", err);
    } finally {
      setApologyLoading(false);
    }
  };

  // Upvote funny story
  const handleUpvoteStory = async (id) => {
    if (votingIds.has(id)) return;
    setVotingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/apologies/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStories((prev) =>
          prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s))
        );
      }
    } catch (err) {
      console.error("Gallery vote error:", err);
    }
  };

  // Romantic gift idea generator logic
  const handleGenerateGift = (e) => {
    e.preventDefault();
    const coreGifts = ZODIAC_GIFTS[partnerZodiac] || ZODIAC_GIFTS.Cancer;
    let ageAddition = "";
    if (partnerAge === "18-22") {
      ageAddition = "💡 نصيحة إضافية للمرح: أضف إليها كارت شحن ألعاب أو اشتراك منصتها الترفيهية المفضلة 🎮";
    } else if (partnerAge === "23-28") {
      ageAddition = "💡 نصيحة إضافية للمرح: عزومة قهوة مميزة في كافيه هادئ لالتقاط الصور التذكارية ☕";
    } else if (partnerAge === "29-35") {
      ageAddition = "💡 نصيحة إضافية للمرح: عشاء دافئ ومحادثة هادئة بدون مقاطعة أو كلام عملي 🍽️";
    } else {
      ageAddition = "💡 نصيحة إضافية للمرح: جلسة استرخاء وراحة كاملة خالية من المسؤوليات والضغوطات 🧖‍♀️";
    }
    setGeneratedGifts({ items: coreGifts, tips: ageAddition });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7] dark:bg-gray-950 font-sans antialiased text-[#4A3E3D] dark:text-gray-200 relative">
      
      {/* Dynamic Banner for AdBlock */}
      <AnimatePresence>
        {adBlockDetected && !hideAdBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-900 p-3 flex items-center justify-center text-center shadow-md relative z-50"
          >
            <div className="flex items-center gap-3 max-w-2xl mx-auto w-full justify-between">
              <span className="text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium">
                نقدم منصة Safi.io مجاناً.. يرجى تعطيل مانع الإعلانات لدعمنا في الاستمرار 🤍
              </span>
              <button 
                onClick={() => setHideAdBanner(true)}
                className="p-1.5 rounded-full hover:bg-amber-200/50 text-amber-700 dark:text-amber-300 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stunning Cinematic Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-40 relative border-b border-gray-200/60 dark:border-gray-800/80 bg-[#FCFBF7]/80 dark:bg-gray-950/80 backdrop-blur-md">
        
        {/* Logo */}
        <button
          onClick={() => setActiveTab("wall")}
          className="flex items-center gap-2 font-black text-xl text-[#1A1A1A] dark:text-white cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B45309] to-amber-500 flex items-center justify-center shadow-md shadow-amber-800/20 text-white">
            <Heart size={22} fill="currentColor" />
          </div>
          <span className="tracking-tight font-mono">Safi.io</span>
        </button>
        
        {/* Revamped Main Navigation Tabs (The requested elegant structure) */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("wall")}
            className={`${TAB_BTN} ${
              activeTab === "wall"
                ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Compass size={16} className={activeTab === "wall" ? "text-indigo-600 animate-pulse" : ""} />
            <span>جدار الاعتذارات 🔒</span>
          </button>

          <button
            onClick={() => setActiveTab("stories")}
            className={`${TAB_BTN} ${
              activeTab === "stories"
                ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Trophy size={16} className={activeTab === "stories" ? "text-amber-500 animate-bounce" : ""} />
            <span>معرض القصص 🏆</span>
          </button>

          <button
            onClick={() => setActiveTab("gifts")}
            className={`${TAB_BTN} ${
              activeTab === "gifts"
                ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Gift size={16} className={activeTab === "gifts" ? "text-rose-600 animate-spin" : ""} />
            <span>مولد الهدايا 🎁</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`${TAB_BTN} ${
              activeTab === "create"
                ? "bg-gradient-to-r from-amber-800 to-[#B45309] text-white shadow-md shadow-amber-800/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Sparkles size={16} className={activeTab === "create" ? "animate-spin text-amber-200" : ""} />
            <span>إنشاء رابط مصالحة 🪄</span>
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`${TAB_BTN} ${
              activeTab === "blog"
                ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BookOpen size={16} className={activeTab === "blog" ? "text-amber-600" : ""} />
            <span>المدونة 📚</span>
          </button>
        </nav>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
          <button
            onClick={handleStartDemo}
            className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all bg-amber-800/10 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-800/20 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm border border-amber-800/20"
          >
            <Play size={14} className="fill-amber-800 dark:fill-amber-300" />
            <span>جرب في 10 ثوانٍ ⚡</span>
          </button>
          
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all bg-[#1A1A1A] text-white dark:bg-white dark:text-gray-900 hover:bg-amber-800 dark:hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Lock size={14} />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </header>

      {/* Global Live counter block */}
      <div className="w-full text-center py-3 bg-gradient-to-r from-amber-800/10 via-amber-700/15 to-amber-800/10 dark:from-amber-950/40 dark:via-amber-900/50 dark:to-amber-950/40 border-b border-amber-800/20 flex flex-wrap items-center justify-center gap-2 select-none relative z-10 shadow-sm">
        <Flame size={18} className="text-amber-700 dark:text-amber-400 animate-pulse" />
        <span className="text-xs sm:text-sm font-bold text-[#8B5A2B] dark:text-amber-200 tracking-wide font-mono">
          عدد علاقات الحب التي تم إنقاذها وصالحها السيستم: 
        </span>
        <motion.span 
          key={globalCount}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-300 font-mono bg-white dark:bg-gray-850 px-3 py-0.5 rounded-lg border border-amber-800/30 shadow-md shadow-amber-800/10"
        >
          {globalCount}
        </motion.span>
        <span className="text-[11px] text-green-700 dark:text-green-400 font-extrabold bg-green-100 dark:bg-green-950/60 px-2 py-1 rounded-full animate-pulse flex items-center gap-1 border border-green-300 dark:border-green-800 me-2 sm:me-0">
          <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-ping" />
          <span>مباشر الآن</span>
        </span>
      </div>

      {/* Revamped Central View Area (Multi-Page highly elegant layout) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. ANONYMOUS WALL VIEW */}
          {activeTab === "wall" && (
            <motion.section 
              key="wall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${CARD} p-6 sm:p-10 flex flex-col h-[700px] max-w-4xl mx-auto relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Compass size={180} />
              </div>

              <div className="text-center mb-6 relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Compass size={28} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  جدار الاعتذارات السري المجهول 🔒
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mt-1">
                  مكان آمن ومحمي بنسبة 100% لنشر رسالة اعتذار مجهولة. الفضفض هنا تريح القلب وتوصل رسالتك للعلن دون الكشف عن هويتك.
                </p>
              </div>

              {/* Scroller list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-6 scrollbar-thin relative z-10">
                {apologies.length === 0 ? (
                  <div className="text-center text-sm font-semibold text-gray-400 dark:text-gray-600 py-20 flex flex-col items-center gap-2">
                    <Lock size={32} className="opacity-40" />
                    <span>كن أول من ينشر اعتذاراً صادقاً على الجدار...</span>
                  </div>
                ) : (
                  apologies.map((apology) => (
                    <motion.div 
                      key={apology.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-white/80 dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm leading-relaxed flex flex-col justify-between"
                    >
                      <p className="text-gray-850 dark:text-gray-100 font-medium whitespace-pre-wrap">
                        {apology.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] sm:text-xs text-gray-400 font-mono">
                        <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                          <Lock size={12} />
                          <span>اعتذار مجهول الهوية</span>
                        </span>
                        <span>{new Date(apology.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Submit Post Form */}
              <form onSubmit={handleApologySubmit} className="flex flex-col sm:flex-row gap-3 relative z-10">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    required
                    maxLength={300}
                    value={newApology}
                    onChange={(e) => setNewApology(e.target.value)}
                    placeholder="اكتب اعتذارك الصادق من القلب هنا (بحد أقصى 300 حرف)..."
                    className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-medium outline-none focus:border-indigo-600 dark:focus:border-indigo-400 dark:text-white shadow-inner transition-colors"
                  />
                  <span className="absolute left-4 top-4 text-[10px] font-mono text-gray-400 select-none sm:inline-block hidden">
                    {300 - newApology.length} حرف
                  </span>
                </div>
                
                <button 
                  type="submit"
                  disabled={apologyLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold px-8 py-4 rounded-2xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {apologyLoading ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>جاري النشر...</span>
                    </>
                  ) : (
                    <>
                      <span>انشر اعتذارك 🔒</span>
                      <ArrowLeft size={16} />
                    </>
                  )}
                </button>
              </form>

              {wallSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2 z-20"
                >
                  <CheckCircle2 size={16} />
                  <span>تم تعليق اعتذارك على الجدار بنجاح! ✨</span>
                </motion.div>
              )}
            </motion.section>
          )}

          {/* 2. FUNNY STORIES VIEW */}
          {activeTab === "stories" && (
            <motion.section 
              key="stories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${CARD} p-6 sm:p-10 max-w-5xl mx-auto relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
                <Trophy size={200} />
              </div>

              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 mb-2">
                  <Trophy size={28} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  معرض قصص اعتذار مضحكة وذكية 🏆
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-1 leading-relaxed">
                  أغرب وأذكى مواقف الخناقات والمصالحة بين الكابلز. استمتع بقراءة القصص وامنح صوتك (بقلب أحمر ❤️) لأكثر قصة تستحق الفوز في مسابقة هذا الأسبوع!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {stories.map((story, index) => {
                  const voted = votingIds.has(story.id);
                  let badge = null;
                  if (index === 0) badge = <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1">🥇 المركز الأول</span>;
                  else if (index === 1) badge = <span className="absolute top-3 left-3 px-3 py-1 bg-slate-400 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1">🥈 المركز الثاني</span>;
                  else if (index === 2) badge = <span className="absolute top-3 left-3 px-3 py-1 bg-amber-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1">🥉 المركز الثالث</span>;

                  return (
                    <motion.div 
                      key={story.id} 
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 bg-white dark:bg-gray-800/80 border border-amber-200/40 dark:border-gray-700 rounded-3xl flex flex-col justify-between gap-4 shadow-md hover:shadow-xl transition-all relative overflow-hidden group"
                    >
                      {badge}
                      
                      <div className="pt-2">
                        <h4 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-400 mb-2 pr-20">
                          {story.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {story.story}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/60 pt-3 mt-2">
                        <span className="text-[11px] text-gray-400 font-mono">
                          بواسطة كابل مجهول • {new Date(story.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
                        </span>
                        
                        <button 
                          onClick={() => handleUpvoteStory(story.id)}
                          disabled={voted}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                            voted 
                              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105" 
                              : "bg-amber-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-rose-50 hover:text-rose-600 border border-amber-200/50 dark:border-gray-600"
                          }`}
                        >
                          <Heart size={16} fill={voted ? "currentColor" : "none"} className={voted ? "animate-bounce" : "text-rose-500"} />
                          <span>{story.votes} {locale === "en" ? "Votes" : "تصويت"}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Submit story prompt banner */}
              <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-amber-800 to-[#B45309] text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div>
                  <h3 className="text-lg font-black tracking-tight">عندك قصة صلح ذكية أو خناقة طريفة؟ 💌</h3>
                  <p className="text-xs sm:text-sm text-amber-100/90 mt-1">
                    أرسل قصتك لصفحتنا الرسمية وسنقوم بنشرها في مسابقة الأسبوع القادم لتربح كود هدية VIP!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-6 py-3 bg-white text-amber-900 rounded-full font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md"
                >
                  صالح شريكتك أولاً 🪄
                </button>
              </div>
            </motion.section>
          )}

          {/* 3. ROMANTIC GIFT GENERATOR VIEW */}
          {activeTab === "gifts" && (
            <motion.section 
              key="gifts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${CARD} p-6 sm:p-12 max-w-4xl mx-auto relative overflow-hidden`}
            >
              <div className="absolute bottom-0 left-0 p-8 opacity-10 pointer-events-none">
                <Gift size={200} />
              </div>

              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 mb-2">
                  <Gift size={28} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  مولد أفكار الهدايا الرومانسية السريعة 🎁
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-1 leading-relaxed">
                  احصل على أفكار هدايا ذكية، غير تقليدية، ومصممة نفسياً وفلكياً حسب البرج الفلكي والفئة العمرية لشريكتك لضمان مصالحتها وإسعادها من أول محاولة!
                </p>
              </div>
              
              <form onSubmit={handleGenerateGift} className="bg-white/80 dark:bg-gray-800/80 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Age */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <User size={16} className="text-rose-600" />
                      <span>حدد الفئة العمرية لشريكتك</span>
                    </label>
                    <select 
                      value={partnerAge} 
                      onChange={(e) => setPartnerAge(e.target.value)}
                      className="w-full bg-[#FCFBF7] dark:bg-gray-900 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-sm font-black outline-none focus:border-rose-600 dark:text-white shadow-inner cursor-pointer"
                    >
                      <option value="18-22">من 18 إلى 22 سنة (مرح وشغف) 🌟</option>
                      <option value="23-28">من 23 إلى 28 سنة (طموح واستكشاف) 🚀</option>
                      <option value="29-35">من 29 إلى 35 سنة (استقرار وهدوء) 🍷</option>
                      <option value="36+">36 سنة أو أكثر (تقدير واسترخاء) 👑</option>
                    </select>
                  </div>

                  {/* Zodiac */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-500" />
                      <span>حدد برجها الفلكي (Zodiac)</span>
                    </label>
                    <select 
                      value={partnerZodiac} 
                      onChange={(e) => setPartnerZodiac(e.target.value)}
                      className="w-full bg-[#FCFBF7] dark:bg-gray-900 p-4 rounded-2xl border border-gray-300 dark:border-gray-600 text-sm font-black outline-none focus:border-rose-600 dark:text-white shadow-inner cursor-pointer"
                    >
                      <option value="Aries">الحمل - Aries (مغامرة وحماس) ♈</option>
                      <option value="Taurus">الثور - Taurus (فخامة وراحة) ♉</option>
                      <option value="Gemini">الجوزاء - Gemini (ذكاء وتجديد) ♊</option>
                      <option value="Cancer">السرطان - Cancer (عاطفة وذكريات) ♋</option>
                      <option value="Leo">الأسد - Leo (تألق وهدايا مبهرة) ♌</option>
                      <option value="Virgo">العذراء - Virgo (عملية وتنظيم) ♍</option>
                      <option value="Libra">الميزان - Libra (جمال ورومانسية) ♎</option>
                      <option value="Scorpio">العقرب - Scorpio (غموض وعمق) ♏</option>
                      <option value="Sagittarius">القوس - Sagittarius (سفر وحرية) ♐</option>
                      <option value="Capricorn">الجدي - Capricorn (جودة وقيمة) ♑</option>
                      <option value="Aquarius">الدلو - Aquarius (ابتكار وتفرد) ♒</option>
                      <option value="Pisces">الحوت - Pisces (خيال وفنون) ♓</option>
                    </select>
                  </div>

                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-sm sm:text-base font-black py-4 rounded-2xl transition-all shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} className="animate-spin" />
                  <span>توليد أفكار الهدايا السحرية الآن ✨</span>
                </button>
              </form>

              <AnimatePresence>
                {generatedGifts && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-rose-500/10 dark:from-rose-950/40 dark:via-gray-800 dark:to-rose-950/40 border-2 border-rose-500/30 dark:border-rose-500/20 shadow-xl text-sm text-gray-900 dark:text-gray-100 space-y-4 relative z-10"
                  >
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-base sm:text-lg border-b border-rose-200 dark:border-rose-900/50 pb-3">
                      <Gift size={24} className="animate-bounce" />
                      <span>💡 التوليفة السحرية الموصى بها لبرج {t(partnerZodiac)}:</span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {generatedGifts.items.map((gift, index) => (
                        <li 
                          key={index} 
                          className="p-4 rounded-2xl bg-white dark:bg-gray-850 font-black border border-rose-100 dark:border-gray-700 text-xs sm:text-sm flex items-center gap-2 shadow-sm"
                        >
                          <CheckCircle2 size={18} className="text-rose-600 flex-shrink-0" />
                          <span>{gift}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center gap-3">
                      <Sparkles size={22} className="text-amber-600 dark:text-amber-400 flex-shrink-0 animate-spin" />
                      <span>{generatedGifts.tips}</span>
                    </div>

                    <div className="text-center pt-4">
                      <button
                        onClick={() => setActiveTab("create")}
                        className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>اصنع لها موقع اعتذار تفاعلي الآن واضمن رضاها 🪄</span>
                        <ArrowLeft size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* 4. CREATE SAAS ONBOARDING FORM VIEW (The core Product) */}
          {activeTab === "create" && (
            <motion.section 
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <div className={`${CARD} p-8 sm:p-12 relative overflow-hidden shadow-2xl`}>
                
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#B45309] to-amber-500 shadow-md shadow-amber-800/20 mb-4 text-white"
                  >
                    <Heart size={32} fill="currentColor" />
                  </motion.div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">
                    منصّة المصالحة والاعتذار 💝
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                    {t("landingSubtitle")}
                  </p>
                </div>

                {success ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{t("magicLinkReady")}</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-mono text-amber-800 dark:text-amber-400 font-bold select-all text-sm sm:text-base border border-gray-200 dark:border-gray-700">
                      {origin}{slug}
                    </div>
                    <p className="text-xs text-gray-500">جاري توجيهك إلى "غرفة العمليات" لمراقبة الجلسة مباشرة...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-2xl text-xs sm:text-sm font-bold border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <X size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                    
                    {/* Names */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">اسمك إنت</label>
                        <input type="text" required value={boyName} onChange={(e) => setBoyName(e.target.value)} placeholder={t("boyName")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">اسم الملكة (شريكتك)</label>
                        <input type="text" required value={girlName} onChange={(e) => setGirlName(e.target.value)} placeholder={t("girlName")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white" />
                      </div>
                    </div>
                    
                    {/* Nickname */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">اسم الدلع اللي بتحبه</label>
                      <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder={t("petName")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white" />
                    </div>
                    
                    {/* Dynamic Custom Link */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">الرابط المخصص الخاص بكم</label>
                      <div className="flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-inner" dir="ltr">
                        <span className="px-3 sm:px-4 bg-gray-100 dark:bg-gray-900 text-gray-500 text-xs sm:text-sm font-mono py-3.5 font-bold">
                          {isMounted ? origin : "loading..."}
                        </span>
                        <input 
                          type="text" 
                          required 
                          value={slug} 
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} 
                          placeholder="ahmed-mariam" 
                          className="flex-1 p-3.5 bg-transparent text-xs sm:text-sm font-bold font-mono outline-none dark:text-white text-amber-900" 
                        />
                      </div>
                    </div>
                    
                    {/* Email for Reports */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">بريدك الإلكتروني (لاستلام تقرير الصلح والإيميل السنوي)</label>
                      <input 
                        type="email" 
                        value={creatorEmail} 
                        onChange={(e) => setCreatorEmail(e.target.value)} 
                        placeholder="example@gmail.com" 
                        className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs sm:text-sm font-bold outline-none focus:border-[#B45309] dark:text-white" 
                      />
                    </div>

                    {/* Security Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">الرقم السري لفتح الرابط</label>
                        <input type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("pwdPlaceholder")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">تلميح الرقم السري (Hint)</label>
                        <input type="text" value={passwordHint} onChange={(e) => setPasswordHint(e.target.value)} placeholder="مثال: تاريخ أول مقابلة" className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white" />
                      </div>
                    </div>

                    {/* Telegram Block */}
                    <div className="border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => setShowTelegram(!showTelegram)}
                        className="w-full flex items-center justify-between p-3.5 text-xs sm:text-sm font-black text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                          <span>{t("telegramOptional") || "🔔 تفعيل إشعارات التليجرام الفورية (اختياري)"}</span>
                        </span>
                        <span className="text-gray-400">{showTelegram ? "▲" : "▼"}</span>
                      </button>
                      <AnimatePresence>
                        {showTelegram && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3"
                          >
                            <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs space-y-1.5 text-blue-900 dark:text-blue-200">
                              <p className="font-bold text-sm mb-1 flex items-center gap-1">
                                <CheckCircle2 size={14} className="text-blue-600" />
                                <span>خطوات ربط التليجرام:</span>
                              </p>
                              <ol className="list-decimal list-inside space-y-1 font-medium">
                                <li>ابحث عن البوت الرسمي: <a href="https://t.me/apology_saas_2026_bot" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline">@apology_saas_2026_bot</a></li>
                                <li>أرسل له الأمر <span className="font-mono bg-white dark:bg-gray-900 px-1 rounded">/start</span></li>
                                <li>انسخ رقم الـ ID الذي سيرسله لك والصقه في هذه الخانة:</li>
                              </ol>
                            </div>
                            <input 
                              type="text" 
                              value={telegramChatId} 
                              onChange={(e) => setTelegramChatId(e.target.value)} 
                              placeholder="Telegram Chat ID (e.g. 123456789)" 
                              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 text-xs sm:text-sm font-mono font-bold outline-none focus:border-blue-600 dark:text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Submit Btn */}
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-800 via-[#B45309] to-amber-800 text-white py-4 rounded-2xl font-black text-base transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-amber-800/25 cursor-pointer flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Sparkles size={20} className="animate-spin" />
                          <span>{t("creating")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("createMagicLink")}</span>
                          <Sparkles size={20} />
                        </>
                      )}
                    </button>
                    
                    <div className="pt-2 text-center space-y-1">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                        <Lock size={12} />
                        <span>{t("trustText")}</span>
                      </p>
                      <p className="text-[11px] font-bold text-green-700 dark:text-green-400">
                        🛡️ نحن لا نطلب أي كلمات مرور لشبكات التواصل الاجتماعي أو تفاصيل بنكية إطلاقاً.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </motion.section>
          )}

          {/* 5. MOCK BLOG VIEW (Fully beautiful fall-back embedded layout) */}
          {activeTab === "blog" && (
            <motion.section 
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${CARD} p-6 sm:p-12 max-w-4xl mx-auto relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BookOpen size={200} />
              </div>

              <div className="text-center mb-10 relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400 mb-2">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  مدونة التصالح والذكاء العاطفي 📚✍️
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-1 leading-relaxed">
                  نصائح ومقالات علمية ممتعة لمساعدتك على الحفاظ على شعلة الحب وتجاوز الخلافات اليومية بأسهل الطرق الممكنة.
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                {BLOG_POSTS_MOCK.map((post) => (
                  <article 
                    key={post.slug}
                    className="p-6 sm:p-8 bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mb-3 font-mono font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span>{post.readTime} قراءة</span>
                        <span>•</span>
                        <span>بواسطة {post.author}</span>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-2 hover:text-[#B45309] transition-colors">
                        <a href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </a>
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-4">
                        {post.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-700/60">
                      <a 
                        href={`/blog/${post.slug}`}
                        className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-400 flex items-center gap-1 hover:underline hover:translate-x-1 transition-transform"
                      >
                        <span>اقرأ المقال كاملاً 📖</span>
                        <ArrowLeft size={14} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          )}

        </AnimatePresence>
      </main>

      {/* REVAMPED 10-SECOND CINEMATIC AUTO-ADVANCING DEMO MODAL */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDemo(false); setDemoAutoplay(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative z-10 text-white"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gray-850 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-400 animate-spin" />
                  <h3 className="font-black text-base sm:text-lg tracking-tight">محاكاة رحلة المصالحة (10 ثوانٍ) ⚡</h3>
                </div>
                <button
                  onClick={() => { setShowDemo(false); setDemoAutoplay(false); }}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800 h-2 relative overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-amber-500 to-[#B45309] h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((demoStepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Step Display Area */}
              <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[320px] text-center relative overflow-hidden">
                
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-9xl font-black font-mono">
                  {DEMO_STEPS[demoStepIndex].id}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={demoStepIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 max-w-md w-full relative z-10"
                  >
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30 inline-block">
                      المحطة {DEMO_STEPS[demoStepIndex].id} من {DEMO_STEPS.length}
                    </span>

                    <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {DEMO_STEPS[demoStepIndex].name}
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {DEMO_STEPS[demoStepIndex].desc}
                    </p>

                    {/* Mock Simulation Terminal Card */}
                    <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 font-mono text-xs text-green-400 font-bold shadow-inner text-end" dir="rtl">
                      {DEMO_STEPS[demoStepIndex].mock}
                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 sm:p-6 bg-gray-850 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-mono text-gray-400 font-bold">
                  ● جاري العرض التلقائي السريع...
                </span>

                <button
                  onClick={() => {
                    setShowDemo(false);
                    setDemoAutoplay(false);
                    setActiveTab("create");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-[#B45309] text-white rounded-full font-black text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <span>ابني صفحة مصالحة باسمها دلوقتي 🪄</span>
                  <ArrowLeft size={16} />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-5 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border border-[#1A1A1A]/10 dark:border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <Lock size={20} className="text-amber-800 dark:text-amber-400" />
                  <h3 className="text-lg font-black text-[#1A1A1A] dark:text-white tracking-tight">
                    {locale === "en" ? "Secret Operations Room 🕵️" : "دخول غرفة العمليات السرية 🕵️"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {locale === "en" 
                  ? "Enter your dynamic link slug and secret password to monitor her session live or tweak the settings."
                  : "أدخل رابط الصفحة والرقم السري لمراقبة تحركاتها في الموقع لايف أو تعديل الأسئلة."}
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold border border-red-200 dark:border-red-800 text-center">
                    {loginError}
                  </div>
                )}
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">رابط الصفحة (Slug)</label>
                  <div className="flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs font-mono font-bold" dir="ltr">
                    <span className="text-gray-400 me-1">{origin}</span>
                    <input
                      type="text"
                      required
                      value={loginSlug}
                      onChange={(e) => setLoginSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="ahmed-mariam"
                      className="flex-1 bg-transparent outline-none dark:text-white text-amber-900 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">الرقم السري للإدارة</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-xs font-bold outline-none focus:border-amber-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-amber-800 to-[#B45309] text-white py-4 rounded-2xl font-black text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-amber-800/20 cursor-pointer mt-2 flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>{locale === "en" ? "Verifying..." : "جاري التحقق..."}</span>
                    </>
                  ) : (
                    <span>{locale === "en" ? "Launch Radar 🚀" : "تشغيل الرادار السري 🚀"}</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
