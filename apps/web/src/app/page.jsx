import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, X, Sparkles, Gift, Flame, Trophy, Compass, 
  Calendar, ArrowRight, User, Lock, BookOpen, Activity, ArrowLeft, Play, CheckCircle2, RotateCcw
} from "lucide-react";
import Footer from "@/components/Footer";
import CinematicStoryDemoModal from "@/components/CinematicStoryDemoModal";
import InteractiveCinematicStoryReel from "@/components/InteractiveCinematicStoryReel";
import { useLanguage } from "@/context/LanguageContext";
import { useAdBlockDetect } from "@/hooks/useAdBlockDetect";

const CARD =
  "bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-[2.5rem] transition-colors";

const TAB_BTN =
  "px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer select-none font-mono";

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
    titleKey: "دليل المصالحة الشامل: 5 خطوات لإصلاح الخلافات الرومانسية 💖",
    descriptionKey: "تعرف على القواعد الذهبية لتقديم اعتذار حقيقي وصادق يذيب الخلافات فوراً ويعيد الدفء للعلاقة.",
    date: "2026-06-10",
    readTime: "4 minutes",
    author: "Dr. Heart Planner"
  },
  {
    slug: "psychology-of-apologies",
    titleKey: "سيكولوجية الاعتذار: لماذا يعتبر الاعتذار ذكاءً عاطفياً وليس ضعفاً؟ 🧠",
    descriptionKey: "الاعتذار الصادق يتطلب كبرياءً ووعياً كبيراً. في هذا المقال نوضح كيف يسهم الاعتذار في تعزيز الروابط.",
    date: "2026-06-08",
    readTime: "6 minutes",
    author: "Prof. Mona Widad"
  },
  {
    slug: "how-safi-io-helps-couples",
    titleKey: "كيف تساعد منصة Safi.io الكابلز في كسر الجليد بطريقة ممتعة ومرحة؟ 📱",
    descriptionKey: "أحياناً تكون الكلمات الجافة غير كافية. استكشف كيف تساعدك الألعاب والمحاكاة والرسائل الرقمية التفاعلية في الاعتذار بشكل مبهج.",
    date: "2026-06-05",
    readTime: "3 minutes",
    author: "Eng. Kareem Safi"
  }
];

export default function SaaSOnboardingPage() {
  const { locale, t } = useLanguage();
  const adBlockDetected = useAdBlockDetect();
  const [hideAdBanner, setHideAdBanner] = useState(false);
  
  // Enterprise Interactive 60 FPS Visual Graphic Narrative Reel Hook state
  const [showInteractiveReel, setShowInteractiveReel] = useState(false);

  // Premium Tri-Theme Active View Switcher
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

  // Overhauled Cinematic Relatable Story Hook Demo Modal
  const [showRelatableDemo, setShowRelatableDemo] = useState(false);

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

  // Hydrate global stats, real visual reel check, and content
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setOrigin(window.location.host + "/");
    }

    // Check if authentic interactive graphic reel was already watched or skipped
    if (localStorage.getItem("safi_interactive_reel_watched") !== "true") {
      setShowInteractiveReel(true);
    }

    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.count) setGlobalCount(data.count);
      })
      .catch(() => {});

    fetch("/api/apologies/wall")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.apologies) setApologies(data.apologies);
      })
      .catch(() => {});

    fetch("/api/apologies/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stories) setStories(data.stories);
      })
      .catch(() => {});
  }, []);

  const handleStartRelatableDemo = () => {
    setShowRelatableDemo(true);
  };

  const handleReplayInteractiveReel = () => {
    localStorage.removeItem("safi_interactive_reel_watched");
    setShowInteractiveReel(true);
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
          setLoginError(data.error || t("loginErrorInvalid"));
        }
      } catch (err) {
        setLoginError(t("loginErrorNetwork"));
      } finally {
        setLoginLoading(false);
      }
    },
    [loginSlug, loginPassword, t]
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
          setError(data.error || t("createLinkError"));
        }
      } catch (err) {
        setError(t("loginErrorNetwork"));
      } finally {
        setLoading(false);
      }
    },
    [slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale, creatorEmail, t]
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
    } catch (err) {} finally {
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
    } catch (err) {}
  };

  // Romantic gift idea generator logic
  const handleGenerateGift = (e) => {
    e.preventDefault();
    const coreGifts = ZODIAC_GIFTS[partnerZodiac] || ZODIAC_GIFTS.Cancer;
    let ageAddition = "";
    if (partnerAge === "18-22") {
      ageAddition = locale === "en" ? "💡 Pro Tip: Add a gaming gift card or favorite streaming subscription 🎮" : "💡 نصيحة إضافية للمرح: أضف إليها كارت شحن ألعاب أو اشتراك منصتها الترفيهية المفضلة 🎮";
    } else if (partnerAge === "23-28") {
      ageAddition = locale === "en" ? "💡 Pro Tip: Invite her to a highly distinctive cozy cafe for memorable photos ☕" : "💡 نصيحة إضافية للمرح: عزومة قهوة مميزة في كافيه هادئ لالتقاط الصور التذكارية ☕";
    } else if (partnerAge === "29-35") {
      ageAddition = locale === "en" ? "💡 Pro Tip: Plan a warm, deep uninterrupted romantic dinner 🍽️" : "💡 نصيحة إضافية للمرح: عشاء دافئ ومحادثة هادئة بدون مقاطعة أو كلام عملي 🍽️";
    } else {
      ageAddition = locale === "en" ? "💡 Pro Tip: Book a fully restorative Spa & Massage getaway 🧖‍♀️" : "💡 نصيحة إضافية للمرح: جلسة استرخاء وراحة كاملة خالية من المسؤوليات والضغوطات 🧖‍♀️";
    }
    setGeneratedGifts({ items: coreGifts, tips: ageAddition });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7] dark:bg-gray-950 font-sans antialiased text-gray-900 dark:text-gray-100 relative transition-colors">
      
      {/* Dynamic Graphic Live Interactive Reel Narrative Hook Overlay */}
      <AnimatePresence>
        {showInteractiveReel && (
          <InteractiveCinematicStoryReel 
            onFinishReel={() => setShowInteractiveReel(false)} 
          />
        )}
      </AnimatePresence>

      {/* Main Beautiful Gate Transition Triggered after Graphic Reel finishes */}
      {!showInteractiveReel && (
        <motion.div
          key="master-portal"
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col w-full relative"
        >
          {/* Dynamic Banner for AdBlock */}
          <AnimatePresence>
            {adBlockDetected && !hideAdBanner && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-900 p-3 flex items-center justify-center text-center shadow-md relative z-50 transition-colors font-sans"
              >
                <div className="flex items-center gap-3 max-w-2xl mx-auto w-full justify-between">
                  <span className="text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-black font-sans">
                    {t("adblockText")}
                  </span>
                  <button 
                    onClick={() => setHideAdBanner(true)}
                    className="p-1.5 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Elegant Tri-Theme Top Header */}
          <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 z-40 relative border-b border-gray-200 dark:border-gray-800 shadow-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl transition-colors font-sans">
            
            {/* Logo & Quick Replay Graphic Relatable Reel Intro */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("wall")}
                className="flex items-center gap-2 font-black text-xl text-gray-900 dark:text-white cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-800/20 text-white">
                  <Heart size={22} fill="currentColor" />
                </div>
                <span className="tracking-tight font-mono text-lg sm:text-xl">Safi.io</span>
              </button>

              <button
                onClick={handleReplayInteractiveReel}
                className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-extrabold text-xs active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900 shadow-sm font-mono"
                title={locale === "en" ? "Replay Interactive Highly Gamified Visual Graphic Reel" : "إعادة المحاكاة التفاعلية الحية 🎬"}
              >
                <RotateCcw size={13} className="animate-spin" />
                <span>{locale === "en" ? "Graphic Reel" : "محاكاة القصة"}</span>
              </button>
            </div>
            
            {/* Revamped Main Navigation Switcher Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-inner overflow-x-auto max-w-full font-mono transition-colors">
              <button
                onClick={() => setActiveTab("wall")}
                className={`${TAB_BTN} ${
                  activeTab === "wall"
                    ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-md font-sans"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-sans"
                }`}
              >
                <Compass size={16} className={activeTab === "wall" ? "text-indigo-600 animate-pulse" : ""} />
                <span>{t("navWall")}</span>
              </button>

              <button
                onClick={() => setActiveTab("stories")}
                className={`${TAB_BTN} ${
                  activeTab === "stories"
                    ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-md font-sans"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-sans"
                }`}
              >
                <Trophy size={16} className={activeTab === "stories" ? "text-amber-500 animate-bounce" : ""} />
                <span>{t("navStories")}</span>
              </button>

              <button
                onClick={() => setActiveTab("gifts")}
                className={`${TAB_BTN} ${
                  activeTab === "gifts"
                    ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-md font-sans"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-sans"
                }`}
              >
                <Gift size={16} className={activeTab === "gifts" ? "text-rose-600 animate-spin" : ""} />
                <span>{t("navGifts")}</span>
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className={`${TAB_BTN} ${
                  activeTab === "create"
                    ? "bg-gradient-to-r from-amber-800 to-[#B45309] text-white shadow-xl shadow-amber-800/25 font-sans"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-sans"
                }`}
              >
                <Sparkles size={16} className={activeTab === "create" ? "animate-spin text-amber-200" : ""} />
                <span>{t("navCreate")}</span>
              </button>

              <button
                onClick={() => setActiveTab("blog")}
                className={`${TAB_BTN} ${
                  activeTab === "blog"
                    ? "bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-400 shadow-md font-sans"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-sans"
                }`}
              >
                <BookOpen size={16} className={activeTab === "blog" ? "text-amber-600" : ""} />
                <span>{t("navBlog")}</span>
              </button>
            </nav>

            {/* Action Header Controls */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0 font-sans">
              <button
                onClick={handleStartRelatableDemo}
                className="px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all bg-amber-800/10 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm border border-amber-800/20 font-sans"
              >
                <Play size={14} className="fill-amber-800 dark:fill-amber-300" />
                <span>{t("demoBtn")}</span>
              </button>
              
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-amber-800 dark:hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-lg cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Lock size={14} />
                <span>{t("loginBtn")}</span>
              </button>
            </div>
          </header>

          {/* Live Global Stats Block */}
          <div className="w-full text-center py-3.5 bg-gradient-to-r from-amber-800/10 via-amber-700/15 to-amber-800/10 dark:from-amber-950/40 dark:via-amber-900/60 dark:to-amber-950/40 border-b border-amber-800/20 flex flex-wrap items-center justify-center gap-2 select-none relative z-10 shadow-sm transition-colors">
            <Flame size={18} className="text-amber-700 dark:text-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-[#8B5A2B] dark:text-amber-200 tracking-wide font-mono">
              {t("statsTitle")}
            </span>
            <motion.span 
              key={globalCount}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-300 font-mono bg-white dark:bg-gray-850 px-3 py-0.5 rounded-lg border border-amber-800/30 shadow-md"
            >
              {globalCount}
            </motion.span>
            <span className="text-[11px] text-green-700 dark:text-green-400 font-black bg-green-100 dark:bg-green-950/70 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 border border-green-300 dark:border-green-800 me-2 sm:me-0 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-green-400 animate-ping" />
              <span>{t("liveBadge")}</span>
            </span>
          </div>

          {/* Master Central View Area (Multi-Page highly elegant layout) */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10 font-sans">
            <AnimatePresence mode="wait">
              
              {/* 1. ANONYMOUS WALL VIEW */}
              {activeTab === "wall" && (
                <motion.section 
                  key="wall"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`${CARD} p-8 sm:p-12 flex flex-col h-[700px] max-w-4xl mx-auto relative overflow-hidden font-sans`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Compass size={180} />
                  </div>

                  <div className="text-center mb-8 relative z-10 font-sans">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mb-3 shadow-sm">
                      <Compass size={32} />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                      {t("wallTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto mt-2 leading-relaxed font-medium font-sans">
                      {t("wallSubtitle")}
                    </p>
                  </div>

                  {/* Scroller list */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-8 scrollbar-thin relative z-10 font-sans">
                    {apologies.length === 0 ? (
                      <div className="text-center text-sm font-semibold text-gray-400 dark:text-gray-600 py-20 flex flex-col items-center gap-2">
                        <Lock size={36} className="opacity-40" />
                        <span>{t("wallEmpty")}</span>
                      </div>
                    ) : (
                      apologies.map((apology) => (
                        <motion.div 
                          key={apology.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm leading-relaxed flex flex-col justify-between space-y-2 font-medium"
                        >
                          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-sans font-semibold">
                            {apology.content}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-[10px] sm:text-xs text-gray-400 font-mono">
                            <span className="flex items-center gap-1.5 font-black text-indigo-600 dark:text-indigo-400 font-sans">
                              <Lock size={12} />
                              <span>Anonymous Entity Sanctuary</span>
                            </span>
                            <span>{new Date(apology.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Submit Post Form */}
                  <form onSubmit={handleApologySubmit} className="flex flex-col sm:flex-row gap-3 relative z-10 font-sans">
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        required
                        maxLength={300}
                        value={newApology}
                        onChange={(e) => setNewApology(e.target.value)}
                        placeholder={t("wallInputPlaceholder")}
                        className="w-full bg-white dark:bg-gray-800 p-4.5 rounded-2xl border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-bold outline-none focus:border-indigo-600 dark:focus:border-indigo-400 dark:text-white shadow-inner transition-colors font-sans"
                      />
                      <span className="absolute left-4 top-4.5 text-[10px] font-mono text-gray-400 select-none sm:inline-block hidden font-bold">
                        {300 - newApology.length} Chars
                      </span>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={apologyLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-black px-10 py-4.5 rounded-2xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 font-sans"
                    >
                      {apologyLoading ? (
                        <>
                          <Sparkles size={18} className="animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span>{t("wallSubmitBtn")}</span>
                          <ArrowLeft size={16} />
                        </>
                      )}
                    </button>
                  </form>

                  {wallSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-20 font-sans"
                    >
                      <CheckCircle2 size={18} />
                      <span>{t("wallSuccessMsg")}</span>
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
                  className={`${CARD} p-8 sm:p-12 max-w-5xl mx-auto relative overflow-hidden font-sans`}
                >
                  <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
                    <Trophy size={200} />
                  </div>

                  <div className="text-center mb-10 relative z-10 font-sans">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 mb-3 shadow-sm">
                      <Trophy size={32} />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                      {t("storiesTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto mt-2 leading-relaxed font-medium font-sans">
                      {t("storiesSubtitle")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 font-sans">
                    {stories.map((story, index) => {
                      const voted = votingIds.has(story.id);
                      let badge = null;
                      if (index === 0) badge = <span className="absolute top-4 left-4 px-3.5 py-1 bg-amber-500 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1 font-mono">🥇 1st Place</span>;
                      else if (index === 1) badge = <span className="absolute top-4 left-4 px-3.5 py-1 bg-slate-400 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1 font-mono">🥈 2nd Place</span>;
                      else if (index === 2) badge = <span className="absolute top-4 left-4 px-3.5 py-1 bg-amber-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1 font-mono">🥉 3rd Place</span>;

                      return (
                        <motion.div 
                          key={story.id} 
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="p-8 bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 rounded-3xl flex flex-col justify-between gap-5 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group font-medium"
                        >
                          {badge}
                          
                          <div className="pt-3">
                            <h4 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-300 mb-3 pr-24 font-sans">
                              {story.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans font-medium">
                              {story.story}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-3">
                            <span className="text-[11px] text-gray-400 font-mono font-bold">
                              Anonymous Entity • {new Date(story.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
                            </span>
                            
                            <button 
                              onClick={() => handleUpvoteStory(story.id)}
                              disabled={voted}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer font-sans ${
                                voted 
                                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105" 
                                  : "bg-amber-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-rose-50 hover:text-rose-600 border border-amber-200/60 dark:border-gray-600"
                              }`}
                            >
                              <Heart size={16} fill={voted ? "currentColor" : "none"} className={voted ? "animate-bounce" : "text-rose-500"} />
                              <span>{story.votes} {voted ? t("votedBtn") : t("voteBtn")}</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Royal Gamified Relatable Hook Starter prompt banner */}
                  <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-amber-800 to-[#B45309] text-white flex flex-wrap items-center justify-between gap-6 shadow-2xl font-sans">
                    <div className="max-w-xl">
                      <h3 className="text-xl font-black tracking-tight font-sans">{t("storiesPromptTitle")}</h3>
                      <p className="text-xs sm:text-sm text-amber-100 mt-1.5 font-medium leading-relaxed font-sans">
                        {t("storiesPromptSubtitle")}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-8 py-4 bg-white text-amber-900 rounded-full font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-xl flex items-center gap-2 font-sans"
                    >
                      <span>Instigate Royal Apology Portal 🪄</span>
                      <ArrowRight size={16} />
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
                  className={`${CARD} p-8 sm:p-12 max-w-4xl mx-auto relative overflow-hidden font-sans`}
                >
                  <div className="absolute bottom-0 left-0 p-8 opacity-10 pointer-events-none">
                    <Gift size={200} />
                  </div>

                  <div className="text-center mb-10 relative z-10 font-sans">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 mb-3 shadow-sm">
                      <Gift size={32} />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                      {t("giftsTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto mt-2 leading-relaxed font-medium font-sans">
                      {t("giftsSubtitle")}
                    </p>
                  </div>
                  
                  <form onSubmit={handleGenerateGift} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg space-y-6 relative z-10 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                      
                      {/* Age */}
                      <div className="space-y-2 font-sans">
                        <label className="block text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5 font-sans font-extrabold">
                          <User size={16} className="text-rose-600" />
                          <span>{t("giftsAgeLabel")}</span>
                        </label>
                        <select 
                          value={partnerAge} 
                          onChange={(e) => setPartnerAge(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 p-4.5 rounded-2xl border border-gray-300 dark:border-gray-600 text-sm font-black outline-none focus:border-rose-600 dark:text-white shadow-inner cursor-pointer font-sans"
                        >
                          <option value="18-22">{locale === "en" ? "18 - 22 Years (Fun & Passion) 🌟" : "من 18 إلى 22 سنة (مرح وشغف) 🌟"}</option>
                          <option value="23-28">{locale === "en" ? "23 - 28 Years (Ambition & Exploration) 🚀" : "من 23 إلى 28 سنة (طموح واستكشاف) 🚀"}</option>
                          <option value="29-35">{locale === "en" ? "29 - 35 Years (Stability & Deep Bond) 🍷" : "من 29 إلى 35 سنة (استقرار وهدوء) 🍷"}</option>
                          <option value="36+">{locale === "en" ? "36+ Years (Appreciation & Luxury) 👑" : "36 سنة أو أكثر (تقدير واسترخاء) 👑"}</option>
                        </select>
                      </div>

                      {/* Zodiac */}
                      <div className="space-y-2 font-sans font-extrabold">
                        <label className="block text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5 font-sans">
                          <Sparkles size={16} className="text-amber-500" />
                          <span>{t("giftsZodiacLabel")}</span>
                        </label>
                        <select 
                          value={partnerZodiac} 
                          onChange={(e) => setPartnerZodiac(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 p-4.5 rounded-2xl border border-gray-300 dark:border-gray-600 text-sm font-black outline-none focus:border-rose-600 dark:text-white shadow-inner cursor-pointer font-sans"
                        >
                          <option value="Aries">{locale === "en" ? "Aries ♈" : "الحمل - Aries (مغامرة وحماس) ♈"}</option>
                          <option value="Taurus">{locale === "en" ? "Taurus ♉" : "الثور - Taurus (فخامة وراحة) ♉"}</option>
                          <option value="Gemini">{locale === "en" ? "Gemini ♊" : "الجوزاء - Gemini (ذكاء وتجديد) ♊"}</option>
                          <option value="Cancer">{locale === "en" ? "Cancer ♋" : "السرطان - Cancer (عاطفة وذكريات) ♋"}</option>
                          <option value="Leo">{locale === "en" ? "Leo ♌" : "الأسد - Leo (تألق وهدايا مبهرة) ♌"}</option>
                          <option value="Virgo">{locale === "en" ? "Virgo ♍" : "العذراء - Virgo (عملية وتنظيم) ♍"}</option>
                          <option value="Libra">{locale === "en" ? "Libra ♎" : "الميزان - Libra (جمال ورومانسية) ♎"}</option>
                          <option value="Scorpio">{locale === "en" ? "Scorpio ♏" : "العقرب - Scorpio (غموض وعمق) ♏"}</option>
                          <option value="Sagittarius">{locale === "en" ? "Sagittarius ♐" : "القوس - Sagittarius (سفر وحرية) ♐"}</option>
                          <option value="Capricorn">{locale === "en" ? "Capricorn ♑" : "الجدي - Capricorn (جودة وقيمة) ♑"}</option>
                          <option value="Aquarius">{locale === "en" ? "Aquarius ♒" : "الدلو - Aquarius (ابتكار وتفرد) ♒"}</option>
                          <option value="Pisces">{locale === "en" ? "Pisces ♓" : "الحوت - Pisces (خيال وفنون) ♓"}</option>
                        </select>
                      </div>

                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-base font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-rose-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-sans"
                    >
                      <Sparkles size={20} className="animate-spin" />
                      <span>{t("giftsGenerateBtn")}</span>
                    </button>
                  </form>

                  <AnimatePresence>
                    {generatedGifts && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="mt-8 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-rose-500/10 dark:from-rose-950/40 dark:via-gray-800 dark:to-rose-950/40 border-2 border-rose-500/30 dark:border-rose-500/20 shadow-2xl text-sm space-y-5 relative z-10 font-sans"
                      >
                        <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-black text-lg sm:text-xl border-b border-rose-200 dark:border-gray-800 pb-4 font-mono">
                          <Gift size={26} className="animate-bounce" />
                          <span>{t("giftsSuggestedTitle")} {partnerZodiac}:</span>
                        </div>

                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-sans">
                          {generatedGifts.items.map((gift, index) => (
                            <li 
                              key={index} 
                              className="p-5 rounded-2xl bg-white font-black border border-rose-100 dark:border-gray-700 text-xs sm:text-sm flex items-center gap-3 shadow-md font-sans"
                            >
                              <CheckCircle2 size={20} className="text-rose-600 flex-shrink-0" />
                              <span>{gift}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 font-bold text-xs sm:text-sm flex items-center gap-3 shadow-sm font-mono">
                          <Sparkles size={24} className="text-amber-600 dark:text-amber-400 flex-shrink-0 animate-spin" />
                          <span>{generatedGifts.tips}</span>
                        </div>

                        <div className="text-center pt-6 font-sans">
                          <button
                            onClick={() => setActiveTab("create")}
                            className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs sm:text-sm transition-all shadow-xl active:scale-95 cursor-pointer inline-flex items-center gap-2 font-sans"
                          >
                            <span>{t("giftsCallToAction")}</span>
                            <ArrowLeft size={18} />
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
                  className="w-full max-w-xl mx-auto font-sans"
                >
                  <div className={`${CARD} p-8 sm:p-12 relative overflow-hidden shadow-2xl font-sans`}>
                    
                    <div className="text-center mb-8 font-sans">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#B45309] to-amber-500 shadow-lg shadow-amber-800/20 mb-4 text-white"
                      >
                        <Heart size={32} fill="currentColor" />
                      </motion.div>
                      <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                        {locale === "en" ? "Apology SaaS Portal 💝" : "منصّة المصالحة والاعتذار 💝"}
                      </h1>
                      <p className="text-xs sm:text-sm mt-2 font-medium font-sans">
                        {t("landingSubtitle")}
                      </p>
                    </div>

                    {success ? (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-12 space-y-5 font-sans"
                      >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-xl font-sans">
                          <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black font-sans">{t("magicLinkReady")}</h3>
                        <div className="p-4.5 bg-gray-100 dark:bg-gray-800 rounded-2xl font-mono text-amber-800 dark:text-amber-400 font-extrabold select-all text-sm sm:text-base border border-gray-200 dark:border-gray-700 shadow-inner">
                          {origin}{slug}
                        </div>
                        <p className="text-xs font-medium font-sans">Connecting to active radar operations room...</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
                        {error && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl text-xs sm:text-sm font-black border border-red-200 dark:border-red-800 flex items-center gap-2 shadow-md">
                            <X size={20} className="flex-shrink-0" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                        
                        {/* Names */}
                        <div className="grid grid-cols-2 gap-4 font-sans font-semibold">
                          <div>
                            <label className="block text-xs font-black mb-1.5 font-sans">{t("boyNameLabel")}</label>
                            <input type="text" required value={boyName} onChange={(e) => setBoyName(e.target.value)} placeholder={t("boyNamePlaceholder")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white shadow-inner font-sans" />
                          </div>
                          <div>
                            <label className="block text-xs font-black mb-1.5 font-sans">{t("girlNameLabel")}</label>
                            <input type="text" required value={girlName} onChange={(e) => setGirlName(e.target.value)} placeholder={t("girlNamePlaceholder")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white shadow-inner font-sans" />
                          </div>
                        </div>
                        
                        {/* Nickname */}
                        <div className="font-sans font-semibold">
                          <label className="block text-xs font-black mb-1.5 font-sans">{t("petNameLabel")}</label>
                          <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder={t("petNamePlaceholder")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white shadow-inner font-sans" />
                        </div>
                        
                        {/* Dynamic Custom Link */}
                        <div className="font-mono">
                          <label className="block text-xs font-black mb-1.5 font-sans">{t("customSlugLabel")}</label>
                          <div className="flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-inner font-mono" dir="ltr">
                            <span className="px-4 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs sm:text-sm py-4 font-extrabold border-r border-gray-200 dark:border-gray-700">
                              {isMounted ? origin : "loading..."}
                            </span>
                            <input 
                              type="text" 
                              required 
                              value={slug} 
                              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} 
                              placeholder={t("customSlugPlaceholder")} 
                              className="flex-1 p-4 bg-transparent text-xs sm:text-sm font-bold outline-none text-amber-900 dark:text-amber-400 font-mono" 
                            />
                          </div>
                        </div>
                        
                        {/* Email for Reports */}
                        <div className="font-sans">
                          <label className="block text-xs font-black mb-1.5 font-sans">{t("creatorEmailLabel")}</label>
                          <input 
                            type="email" 
                            value={creatorEmail} 
                            onChange={(e) => setCreatorEmail(e.target.value)} 
                            placeholder={t("creatorEmailPlaceholder")} 
                            className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-bold outline-none focus:border-[#B45309] dark:text-white shadow-inner font-mono" 
                          />
                        </div>

                        {/* Security Control Passcodes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans font-semibold">
                          <div>
                            <label className="block text-xs font-black mb-1.5 font-sans">{t("pwdLabel")}</label>
                            <input type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("pwdPlaceholder")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white shadow-inner font-sans" />
                          </div>
                          <div>
                            <label className="block text-xs font-black mb-1.5 font-sans">{t("pwdHintLabel")}</label>
                            <input type="text" value={passwordHint} onChange={(e) => setPasswordHint(e.target.value)} placeholder={t("pwdHintPlaceholder")} className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-bold outline-none focus:border-amber-800 dark:text-white shadow-inner font-sans" />
                          </div>
                        </div>

                        {/* Telegram Control Radar Block */}
                        <div className="border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm font-sans">
                          <button 
                            type="button" 
                            onClick={() => setShowTelegram(!showTelegram)}
                            className="w-full flex items-center justify-between p-4 text-xs sm:text-sm font-black bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 transition-colors cursor-pointer font-sans"
                          >
                            <span className="flex items-center gap-2">
                              <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                              <span>{t("telegramOptional")}</span>
                            </span>
                            <span className="text-gray-400 font-extrabold">{showTelegram ? "▲" : "▼"}</span>
                          </button>
                          <AnimatePresence>
                            {showTelegram && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-4 font-sans"
                              >
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs sm:text-sm space-y-2 text-blue-950 dark:text-blue-200 font-medium">
                                  <p className="font-black text-sm sm:text-base mb-1 flex items-center gap-1.5 font-sans">
                                    <CheckCircle2 size={16} className="text-blue-600" />
                                    <span>{t("telegramSetup")}</span>
                                  </p>
                                  <ol className="list-decimal list-inside space-y-1.5 font-sans font-semibold">
                                    <li>{t("telegramStep1")}: <a href="https://t.me/apology_saas_2026_bot" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-black hover:underline font-mono font-bold">@apology_saas_2026_bot</a></li>
                                    <li>{t("telegramStep2")}</li>
                                    <li>{t("telegramStep3")}</li>
                                  </ol>
                                </div>
                                <input 
                                  type="text" 
                                  value={telegramChatId} 
                                  onChange={(e) => setTelegramChatId(e.target.value)} 
                                  placeholder={t("telegramChatIdPlaceholder")} 
                                  className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 text-xs sm:text-sm font-mono font-bold outline-none focus:border-blue-600 dark:text-white shadow-inner"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {/* Launch Onboarding Submit Btn */}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-800 via-[#B45309] to-amber-800 text-white py-4.5 rounded-2xl font-black text-base sm:text-lg transition-all hover:opacity-90 active:scale-95 shadow-2xl shadow-amber-800/30 cursor-pointer flex items-center justify-center gap-2 mt-2 font-sans">
                          {loading ? (
                            <>
                              <Sparkles size={22} className="animate-spin" />
                              <span>{t("creating")}</span>
                            </>
                          ) : (
                            <>
                              <span>{t("createMagicLink")}</span>
                              <Sparkles size={22} />
                            </>
                          )}
                        </button>
                        
                        <div className="pt-3 text-center space-y-1.5 select-none font-sans">
                          <p className="text-xs font-black flex items-center justify-center gap-1.5 font-sans">
                            <Lock size={13} className="text-amber-800" />
                            <span>{t("trustText")}</span>
                          </p>
                          <p className="text-[11px] font-black text-green-700 dark:text-green-400 font-sans">
                            {t("privacyNote")}
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.section>
              )}

              {/* 5. MOCK BLOG VIEW (Fully premium fall-back embedded layout) */}
              {activeTab === "blog" && (
                <motion.section 
                  key="blog"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`${CARD} p-8 sm:p-12 max-w-4xl mx-auto relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <BookOpen size={200} />
                  </div>

                  <div className="text-center mb-10 relative z-10 font-sans">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400 mb-3 shadow-sm">
                      <BookOpen size={32} />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                      {t("blogTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm mt-2 leading-relaxed font-medium font-sans">
                      {t("blogSubtitle")}
                    </p>
                  </div>

                  <div className="space-y-6 relative z-10 font-sans font-medium">
                    {BLOG_POSTS_MOCK.map((post) => (
                      <article 
                        key={post.slug}
                        className="p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5 text-xs mb-3 font-mono font-black text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1 bg-amber-50 dark:bg-gray-900 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-lg">
                              <Calendar size={14} />
                              {post.date}
                            </span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                            <span>•</span>
                            <span>{post.author}</span>
                          </div>
                          
                          <h3 className="text-lg sm:text-2xl font-black mb-3 hover:text-[#B45309] transition-colors font-sans">
                            <a href={`/blog/${post.slug}`} className="hover:underline">
                              {t(post.titleKey)}
                            </a>
                          </h3>
                          
                          <p className="text-xs sm:text-sm leading-relaxed font-medium font-sans">
                            {t(post.descriptionKey)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                          <a 
                            href={`/blog/${post.slug}`}
                            className="text-xs sm:text-sm font-black text-white bg-amber-800 hover:bg-amber-900 active:scale-95 px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md cursor-pointer font-sans"
                          >
                            <span>{t("blogReadMore")}</span>
                            <ArrowLeft size={16} />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </motion.section>
              )}

            </AnimatePresence>
          </main>
        </motion.div>
      )}

      {/* Royal Relatable WhatsApp Pitch Demo Modal */}
      <CinematicStoryDemoModal
        isOpen={showRelatableDemo}
        onClose={() => setShowRelatableDemo(false)}
        onStartCreate={() => setActiveTab("create")}
      />

      {/* Tri-Theme Tri-Mode Login Radar Control Room Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-5 select-none font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative z-10 space-y-6 text-gray-900 dark:text-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 font-mono font-extrabold">
                <div className="flex items-center gap-2.5 font-black font-sans text-black dark:text-white">
                  <Lock size={22} className="text-amber-800 dark:text-amber-500" />
                  <h3 className="text-lg sm:text-xl font-black tracking-tight font-sans">
                    {t("loginModalTitle")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-xs sm:text-sm font-medium leading-relaxed font-sans text-gray-600 dark:text-gray-400">
                {t("loginModalSubtitle")}
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans font-semibold">
                {loginError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-2xl text-xs font-black border border-red-200 dark:border-red-800 text-center shadow-sm font-sans">
                    {loginError}
                  </div>
                )}
                
                <div className="font-mono">
                  <label className="block text-xs font-black mb-1.5 font-sans">{t("loginSlugLabel")}</label>
                  <div className="flex items-center rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs sm:text-sm font-mono font-bold shadow-inner" dir="ltr">
                    <span className="text-gray-400 me-1">{origin}</span>
                    <input
                      type="text"
                      required
                      value={loginSlug}
                      onChange={(e) => setLoginSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="ahmed-mariam"
                      className="flex-1 bg-transparent outline-none text-amber-900 dark:text-amber-400 font-black font-mono"
                    />
                  </div>
                </div>

                <div className="font-sans">
                  <label className="block text-xs font-black mb-1.5 font-sans">{t("loginPwdLabel")}</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs sm:text-sm font-black outline-none focus:border-amber-800 dark:text-white shadow-inner font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-amber-800 via-[#B45309] to-amber-800 text-white py-4.5 rounded-2xl font-black text-base sm:text-lg transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-amber-800/25 cursor-pointer mt-4 flex items-center justify-center gap-2 font-sans"
                >
                  {loginLoading ? (
                    <>
                      <Sparkles size={18} className="animate-spin" />
                      <span>{t("saving")}</span>
                    </>
                  ) : (
                    <span>{t("loginSubmitBtn")}</span>
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
