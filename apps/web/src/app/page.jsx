import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, Sparkles, Gift, Flame, Trophy, ThumbsUp, Eye, Compass, Calendar, ArrowRight, User } from "lucide-react";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAdBlockDetect } from "@/hooks/useAdBlockDetect";

const CARD =
  "bg-[#F4F3EF]/70 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem]";

const DEMO_STEPS = [
  { id: 1, name: "1. بوابة العبور 🔒", desc: "فتح القفل السري بالرقم السري المشفر وتجنب محاولات التطفل.", mock: "🔒 أدخل الرقم السري لفك التشفير..." },
  { id: 2, name: "2. فحص البصمة 👣", desc: "تأكيد الهوية البيومترية الحقيقية للمصالحة عبر ماسح البصمات التفاعلي.", mock: "👣 اضغط بإصبعك لتفعيل ماسح البصمة..." },
  { id: 3, name: "3. بروتوكول البدء ⚡", desc: "تحميل ذكريات الحب وملفات المحاكاة وتثبيت الحماية الكاملة.", mock: "$ Initializing Protocol... Memory Blocks Loaded!" },
  { id: 4, name: "4. تيرمينال الذاكرة 🖥️", desc: "استعراض مسار المشاعر واسترجاع السجلات وقاعدة بيانات السعادة.", mock: "> Loading signals... Love levels at 99.9%" },
  { id: 5, name: "5. شريط الذكريات 📅", desc: "رحلة تفاعلية للمحطات واللحظات التي لا يمكن نسيانها.", mock: "📅 14 فبراير 2025: أول يوم تقابلنا فيه في المطر 🌧️" },
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

export default function SaaSOnboardingPage() {
  const { locale, t } = useLanguage();
  const adBlockDetected = useAdBlockDetect();
  const [hideAdBanner, setHideAdBanner] = useState(false);
  
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
  const [globalCount, setGlobalCount] = useState(1482);

  // Fast-Forward Demo state
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const demoIntervalRef = useRef(null);

  // Anonymous Apology Wall state
  const [apologies, setApologies] = useState([]);
  const [newApology, setNewApology] = useState("");
  const [apologyLoading, setApologyLoading] = useState(false);

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
          setLoginError(data.error || (locale === "en" ? "Invalid slug or password" : "رابط الصفحة أو الرقم السري غير صحيح"));
        }
      } catch (err) {
        console.error("Login verification failed:", err);
        setLoginError(locale === "en" ? "Connection error. Please try again." : "فشل الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
      } finally {
        setLoginLoading(false);
      }
    },
    [loginSlug, loginPassword, locale]
  );

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
          const text = await res.text();
          console.error("Non-JSON response received:", text);
          throw new Error("استجابة غير صالحة من الخادم");
        }

        if (res.ok) {
          // Trigger analytical tracking pixels if set up
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
        clearTimeout(timeoutId);
        console.error("Form submission error:", err);
        if (err.name === 'AbortError') {
          setError("مهلة الاتصال انتهت، بس ممكن يكون الموقع اتعمل.. جرب تفتح الرابط اللي اخترته، ولو منفعش اتأكد من DATABASE_URL");
        } else {
          setError(err.message || "فشل الاتصال بالخادم");
        }
      } finally {
        setLoading(false);
      }
    },
    [slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale, creatorEmail]
  );

  // Autoplay fast-forward demo logic
  const handleStartDemo = () => {
    setShowDemo(true);
    setDemoStep(0);
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    demoIntervalRef.current = setInterval(() => {
      setDemoStep((prev) => {
        if (prev >= DEMO_STEPS.length - 1) {
          clearInterval(demoIntervalRef.current);
          setTimeout(() => setShowDemo(false), 1200);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const handleCloseDemo = () => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    setShowDemo(false);
  };

  // Submit anonymous apology
  const handleApologySubmit = async (e) => {
    e.preventDefault();
    if (!newApology.trim()) return;
    setApologyLoading(true);

    try {
      const res = await fetch("/api/apologies/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newApology }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApologies((prev) => [data.apology, ...prev]);
        setNewApology("");
      } else {
        alert(data.error || "فشل إرسال الاعتذار");
      }
    } catch (err) {
      console.error("Wall post error:", err);
      alert("فشل الاتصال بالخادم");
    } finally {
      setApologyLoading(false);
    }
  };

  // Upvote apology story
  const handleUpvoteStory = async (id) => {
    if (votingIds.has(id)) return;
    setVotingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      const res = await fetch("/api/apologies/gallery", {
        method: "POST",
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

  // Local romantic gift idea generator
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
      
      {/* Top Navigation / Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2 font-bold text-lg text-[#1A1A1A] dark:text-white">
          <Heart size={20} fill="#B45309" className="text-amber-800 dark:text-amber-500" />
          <span>Safi.io</span>
        </div>
        
        <div className="flex items-center gap-3 me-32 sm:me-0">
          <button
            onClick={handleStartDemo}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all bg-amber-800/10 text-amber-800 dark:text-amber-400 hover:bg-amber-800/20 active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={14} className="animate-spin" />
            <span>{locale === "en" ? "10s Demo ⚡" : "جرب المنصة في 10 ثوانٍ ⚡"}</span>
          </button>
          
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-white/80 dark:bg-gray-800/80 border border-[#1A1A1A]/10 dark:border-gray-700/50 hover:bg-amber-800 hover:text-white dark:hover:bg-amber-800 dark:hover:text-white hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          >
            {locale === "en" ? "Sign In" : "تسجيل الدخول"}
          </button>
        </div>
      </header>

      {/* Global Live counter block */}
      <div className="w-full text-center py-4 bg-amber-800/5 dark:bg-amber-900/10 border-y border-amber-800/10 flex items-center justify-center gap-2 select-none relative z-10">
        <Flame size={16} className="text-amber-600 animate-pulse" />
        <span className="text-xs font-bold text-[#8B5A2B] dark:text-amber-300">
          {locale === "en" ? "Relationships Saved: " : "عدد علاقات الحب التي تم إنقاذها وصالحها السيستم: "}
        </span>
        <motion.span 
          key={globalCount}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-extrabold text-amber-800 dark:text-amber-400 font-mono bg-white dark:bg-gray-850 px-2 py-0.5 rounded-md border border-amber-800/20 shadow-sm"
        >
          {globalCount}
        </motion.span>
        <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded animate-pulse">
          ● {locale === "en" ? "Live" : "مباشر الآن"}
        </span>
      </div>

      <AnimatePresence>
        {adBlockDetected && !hideAdBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-center text-center shadow-md"
          >
            <div className="flex items-center gap-3 max-w-lg mx-auto w-full relative">
              <span className="text-amber-800 text-sm font-medium flex-1">
                نقدم منصة Safi.io مجاناً.. يرجى تعطيل مانع الإعلانات لدعمنا في الاستمرار 🤍
              </span>
              <button 
                onClick={() => setHideAdBanner(true)}
                className="p-1 rounded-full hover:bg-amber-200/50 transition-colors text-amber-700 "
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main onboarding form section */}
      <div className="flex flex-1 items-center justify-center px-5 py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] ">
          <div className="absolute top-[10%] left-[10%] text-9xl select-none">❤️</div>
          <div className="absolute bottom-[10%] right-[10%] text-9xl select-none">❤️</div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`${CARD} w-full max-w-lg p-8 sm:p-12 relative overflow-hidden`}
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200/50 mb-4"
            >
              <Heart size={32} fill="#B45309" className="text-amber-800 " />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] ">منصّة المصالحة والاعتذار 💝</h1>
            <p className="text-sm text-gray-600 mt-2">{t("landingSubtitle")}</p>
          </div>

          {success ? (
            <div className="text-center py-8 text-green-700 font-bold text-lg">{t("magicLinkReady")} <br/> {origin}{slug}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 ">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required value={boyName} onChange={(e) => setBoyName(e.target.value)} placeholder={t("boyName")} className="w-full rounded-xl border border-gray-200 bg-white p-2.5 " />
                <input type="text" required value={girlName} onChange={(e) => setGirlName(e.target.value)} placeholder={t("girlName")} className="w-full rounded-xl border border-gray-200 bg-white p-2.5 " />
              </div>
              
              <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder={t("petName")} className="w-full rounded-xl border border-gray-200 bg-white p-2.5 " />
              
              <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden" dir="ltr">
                <span className="px-3 bg-gray-50 text-gray-500 text-xs py-3">{isMounted ? origin : "loading..."}</span>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="link" className="flex-1 p-2.5 bg-transparent outline-none " />
              </div>
              
              <input 
                type="email" 
                value={creatorEmail} 
                onChange={(e) => setCreatorEmail(e.target.value)} 
                placeholder="البريد الإلكتروني للخطيب/الزوج (اختياري، لاستلام تقرير الصلح)" 
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs outline-none focus:border-[#C9956C]" 
              />

              <div className="flex gap-4">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("pwdPlaceholder")} className="flex-1 rounded-xl border border-gray-200 bg-white p-2.5 " />
                <input type="text" value={passwordHint} onChange={(e) => setPasswordHint(e.target.value)} placeholder="تلميح للباسورد (اختياري)" className="flex-1 rounded-xl border border-gray-200 bg-white p-2.5 text-xs" />
              </div>

              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <button 
                  type="button" 
                  onClick={() => setShowTelegram(!showTelegram)}
                  className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="flex items-center gap-2 text-[#4A3E3D]">
                    {t("telegramOptional") || "🔔 تفعيل إشارات تليجرام (اختياري)"}
                  </span>
                  <span className="text-gray-400">{showTelegram ? "▲" : "▼"}</span>
                </button>
                <AnimatePresence>
                  {showTelegram && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-4 bg-white border-t border-gray-100"
                    >
                      <div className="bg-[#FCFBF7] p-3 rounded-lg border border-[#E5E0D8] text-xs space-y-1 mb-3 text-[#5A5955]">
                        <p className="font-bold text-[#4A3E3D] mb-1">{t("telegramSetup") || "خطوات تفعيل التليجرام"}:</p>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>{t("telegramStep1") || "ابحث عن البوت"}: <a href="https://t.me/apology_saas_2026_bot" target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline">@apology_saas_2026_bot</a></li>
                          <li>{t("telegramStep2") || "أرسل له /start"}</li>
                          <li>{t("telegramStep3") || "انسخ الـ ID الخاص بك وضعه هنا"}</li>
                        </ol>
                      </div>
                      <input 
                        type="text" 
                        value={telegramChatId} 
                        onChange={(e) => setTelegramChatId(e.target.value)} 
                        placeholder={t("telegramChatIdPlaceholder") || "Telegram Chat ID (e.g. 123456789)"} 
                        className="w-full rounded-xl border border-gray-200 bg-[#FCFBF7] p-2.5 outline-none focus:border-[#C9956C] transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-amber-800 text-white py-3.5 rounded-xl font-bold transition-all hover:bg-amber-900 active:scale-95 shadow-sm">
                {loading ? t("creating") : t("createMagicLink")}
              </button>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                <span role="img" aria-label="lock" className="opacity-80 ms-1">🔒</span>
                {t("trustText")}
              </p>
              <p className="text-[11px] text-green-700 mt-1.5 text-center font-medium">
                {t("locale") === "en" 
                  ? "🛡️ We NEVER ask for social media passwords or financial data."
                  : "🛡️ نحن لا نطلب أي كلمات مرور (Passwords) أو بيانات مالية إطلاقاً."}
              </p>
            </form>
          )}
        </motion.div>
      </div>

      {/* Dynamic Content stack - SEO Widgets & Viral Assets */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Column: Gift generator widget & Wall */}
        <div className="space-y-8">
          
          {/* Gift Idea Generator */}
          <div className="bg-white/80 dark:bg-gray-900/60 p-6 rounded-[2rem] border border-[#1A1A1A]/10 dark:border-gray-800/80 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Gift size={20} className="text-rose-600" />
              <span>مولد أفكار الهدايا الرومانسية السريعة 🎁</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              احصل على أفكار هدايا مصممة خصيصاً ومدروسة على أساس البرج الفلكي وعمر شريكتك لمصالحتها بذكاء!
            </p>
            
            <form onSubmit={handleGenerateGift} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">الفئة العمرية</label>
                  <select 
                    value={partnerAge} 
                    onChange={(e) => setPartnerAge(e.target.value)}
                    className="w-full bg-[#FCFBF7] dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none focus:border-amber-800 dark:text-white"
                  >
                    <option value="18-22">18 - 22 سنة</option>
                    <option value="23-28">23 - 28 سنة</option>
                    <option value="29-35">29 - 35 سنة</option>
                    <option value="36+">36 سنة أو أكثر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">برجها الفلكي</label>
                  <select 
                    value={partnerZodiac} 
                    onChange={(e) => setPartnerZodiac(e.target.value)}
                    className="w-full bg-[#FCFBF7] dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none focus:border-amber-800 dark:text-white"
                  >
                    <option value="Aries">الحمل (Aries)</option>
                    <option value="Taurus">الثور (Taurus)</option>
                    <option value="Gemini">الجوزاء (Gemini)</option>
                    <option value="Cancer">السرطان (Cancer)</option>
                    <option value="Leo">الأسد (Leo)</option>
                    <option value="Virgo">العذراء (Virgo)</option>
                    <option value="Libra">الميزان (Libra)</option>
                    <option value="Scorpio">العقرب (Scorpio)</option>
                    <option value="Sagittarius">القوس (Sagittarius)</option>
                    <option value="Capricorn">الجدي (Capricorn)</option>
                    <option value="Aquarius">الدلو (Aquarius)</option>
                    <option value="Pisces">الحوت (Pisces)</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-[#B45309] hover:bg-amber-900 text-white text-xs font-bold py-2.5 rounded-xl transition-colors active:scale-95 cursor-pointer"
              >
                توليد الأفكار الآن ✨
              </button>
            </form>

            <AnimatePresence>
              {generatedGifts && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 text-xs text-gray-850 dark:text-gray-300 space-y-2"
                >
                  <p className="font-bold text-amber-800 dark:text-amber-400">💡 الهدايا المقترحة لبرج {t(partnerZodiac)}:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedGifts.items.map((gift, index) => (
                      <li key={index} className="font-medium">{gift}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-[#8B5A2B] dark:text-amber-300 font-medium border-t border-amber-200/40 pt-2">
                    {generatedGifts.tips}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Anonymous Apology Wall */}
          <div className="bg-white/80 dark:bg-gray-900/60 p-6 rounded-[2rem] border border-[#1A1A1A]/10 dark:border-gray-800/80 shadow-md flex flex-col h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Compass size={20} className="text-indigo-600" />
              <span>جدار الاعتذارات السري المجهول 🔒</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              مكان آمن ومحمي لنشر رسالة اعتذار مجهولة. اكتب اعتذارك الآن وانشره للعلن دون الكشف عن هويتك.
            </p>
            
            {/* Scroller list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3 scrollbar-thin">
              {apologies.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-10">كن أول من ينشر اعتذاراً هنا...</div>
              ) : (
                apologies.map((apology) => (
                  <div key={apology.id} className="p-3 bg-[#FCFBF7]/50 dark:bg-gray-800/30 rounded-xl border border-gray-150 dark:border-gray-800 text-xs leading-relaxed">
                    <p className="text-gray-800 dark:text-gray-200">{apology.content}</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block text-end mt-1">
                      {new Date(apology.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleApologySubmit} className="flex gap-2">
              <input 
                type="text"
                required
                maxLength={300}
                value={newApology}
                onChange={(e) => setNewApology(e.target.value)}
                placeholder="اكتب اعتذارك الصادق هنا (بحد أقصى 300 حرف)..."
                className="flex-1 bg-[#FCFBF7] dark:bg-gray-800 p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 text-xs outline-none focus:border-amber-800 dark:text-white"
              />
              <button 
                type="submit"
                disabled={apologyLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {apologyLoading ? "إرسال..." : "اعتذر 🔒"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Funny apology stories voting board */}
        <div className="space-y-8">
          
          <div className="bg-white/80 dark:bg-gray-900/60 p-6 rounded-[2rem] border border-[#1A1A1A]/10 dark:border-gray-800/80 shadow-md flex flex-col h-[650px]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Trophy size={20} className="text-amber-500" />
              <span>معرض قصص اعتذار مضحكة وذكية 🏆</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              قصص طريفة وعجيبة لمواقف زعل بين الكابلز.. اقرأ وصوّت لأكثر قصة مضحكة أو ذكية نالت إعجابك!
            </p>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {stories.map((story) => {
                const voted = votingIds.has(story.id);
                return (
                  <div 
                    key={story.id} 
                    className="p-4 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-200/20 rounded-2xl flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">{story.title}</h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {story.story}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50 pt-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(story.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
                      </span>
                      
                      <button 
                        onClick={() => handleUpvoteStory(story.id)}
                        disabled={voted}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          voted 
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" 
                            : "bg-[#FCFBF7] dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                        }`}
                      >
                        <Heart size={12} fill={voted ? "currentColor" : "none"} className={voted ? "" : "text-rose-500"} />
                        <span>{story.votes} {locale === "en" ? "Votes" : "تصويت"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quick link to blog engine */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">نصائح العلاقات الزوجية والصلح</span>
              <a 
                href="/blog" 
                className="text-xs font-bold text-[#B45309] hover:underline flex items-center gap-1"
              >
                <span>زيارة المدونة الرسمية 📚</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-base)",
                boxShadow: "var(--shadow-card)",
              }}
              className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden z-10 text-center"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50">
                <Heart size={28} fill="#B45309" className="text-amber-800 dark:text-amber-500" />
              </div>

              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">
                {locale === "en" ? "Access Dashboard 🔒" : "دخول لوحة التحكم 🔒"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {locale === "en"
                  ? "Enter your unique link identifier and password to manage your apology page."
                  : "أدخل معرف الرابط الفريد والرقم السري لإدارة صفحة الاعتذار الخاصة بك."}
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-start">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    ⚠️ {loginError}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {locale === "en" ? "Link Slug" : "رابط الصفحة (Slug)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={loginSlug}
                    onChange={(e) => setLoginSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="e.g. mar-iem"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 p-3 text-sm outline-none transition-all focus:bg-white dark:focus:bg-gray-900 focus:border-[#C9956C] dark:focus:border-amber-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {locale === "en" ? "Password" : "الرقم السري"}
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 p-3 text-sm outline-none transition-all focus:bg-white dark:focus:bg-gray-900 focus:border-[#C9956C] dark:focus:border-amber-500 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-amber-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-amber-900 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loginLoading ? (locale === "en" ? "Verifying..." : "جاري التحقق...") : (locale === "en" ? "Sign In" : "تسجيل الدخول")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Autoplay Fast-Forward Demo Overlay Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDemo}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            {/* Demo Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="bg-gray-900 border border-amber-500/30 w-full max-w-2xl p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden z-10 text-center text-white"
            >
              <button
                onClick={handleCloseDemo}
                className="absolute top-5 right-5 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[10px] font-extrabold uppercase text-amber-400 tracking-wider mb-3">
                <Sparkles size={12} className="animate-spin" />
                <span>Simulated Autoplay Overview</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-1 leading-snug">
                رحلة الـ 12 خطوة السحرية للملكة في 10 ثوانٍ ⚡
              </h2>
              <p className="text-xs text-gray-400 max-w-lg mx-auto mb-6">
                شاهد محاكاة سريعة لما ستراه شريكتك أثناء تصفحها لصفحة المصالحة الخاصة بها.
              </p>

              {/* Autoplay Simulator view screen */}
              <div className="w-full h-56 rounded-3xl bg-black/50 border border-white/10 flex flex-col justify-between p-6 relative overflow-hidden text-center shadow-inner">
                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-gray-500 font-mono">
                  <span>📱 Experience Simulator</span>
                  <span>Battery: {Math.max(10, 100 - demoStep * 8)}% 🔋</span>
                </div>

                {/* Simulated content slide */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demoStep}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex-1 flex flex-col justify-center items-center py-4"
                  >
                    <h4 className="text-sm sm:text-base font-extrabold text-amber-300 mb-1 font-sans">
                      {DEMO_STEPS[demoStep].name}
                    </h4>
                    <p className="text-xs text-gray-300 max-w-md mb-3">
                      {DEMO_STEPS[demoStep].desc}
                    </p>
                    
                    {/* Mock interactive visuals */}
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-green-400 select-none max-w-xs truncate">
                      {DEMO_STEPS[demoStep].mock}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress dot dots */}
                <div className="flex items-center justify-center gap-1 border-t border-white/5 pt-3">
                  {DEMO_STEPS.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === demoStep 
                          ? "w-4 bg-amber-500" 
                          : idx < demoStep 
                            ? "w-1.5 bg-amber-500/40" 
                            : "w-1.5 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 text-[10px] text-gray-500 leading-normal flex items-center justify-center gap-2">
                <span>⚡ Autoplaying 12 steps rapidly...</span>
                {demoStep === DEMO_STEPS.length - 1 && (
                  <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded">Completed!</span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
