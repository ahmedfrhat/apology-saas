import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X } from "lucide-react";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAdBlockDetect } from "@/hooks/useAdBlockDetect";

const CARD =
  "bg-[#F4F3EF]/70 dark:bg-gray-800/70 backdrop-blur-3xl border border-[#1A1A1A]/10 dark:border-gray-700/50 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem]";

export default function SaaSOnboardingPage() {
  const { locale, t } = useLanguage();
  const adBlockDetected = useAdBlockDetect();
  const [hideAdBanner, setHideAdBanner] = useState(false);
  const [boyName, setBoyName] = useState("");
  const [girlName, setGirlName] = useState("");
  const [petName, setPetName] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [origin, setOrigin] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setOrigin(window.location.host + "/");
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, password, passwordHint, boyName, girlName, petName, locale }),
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
    [slug, password, passwordHint, boyName, girlName, petName, locale]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7] dark:bg-gray-950 font-sans antialiased text-[#4A3E3D] dark:text-gray-200">
      
      <AnimatePresence>
        {adBlockDetected && !hideAdBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-50 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-700/50 p-3 flex items-center justify-center text-center shadow-md"
          >
            <div className="flex items-center gap-3 max-w-lg mx-auto w-full relative">
              <span className="text-amber-800 dark:text-amber-400 text-sm font-medium flex-1">
                نقدم منصة Safi.io مجاناً.. يرجى تعطيل مانع الإعلانات لدعمنا في الاستمرار 🤍
              </span>
              <button 
                onClick={() => setHideAdBanner(true)}
                className="p-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors text-amber-700 dark:text-amber-500"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 items-center justify-center px-5 py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 mb-4"
          >
            <Heart size={32} fill="#B45309" className="text-amber-800 dark:text-amber-500" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-white">منصّة المصالحة والاعتذار 💝</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t("landingSubtitle")}</p>
        </div>

        {success ? (
          <div className="text-center py-8 text-green-700 dark:text-green-400 font-bold text-lg">{t("magicLinkReady")} <br/> {origin}{slug}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800/50">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required value={boyName} onChange={(e) => setBoyName(e.target.value)} placeholder={t("boyName")} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 dark:text-white" />
              <input type="text" required value={girlName} onChange={(e) => setGirlName(e.target.value)} placeholder={t("girlName")} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 dark:text-white" />
            </div>
            <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder={t("petName")} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 dark:text-white" />
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden" dir="ltr">
              <span className="px-3 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs py-3">{isMounted ? origin : "loading..."}</span>
              <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="link" className="flex-1 p-2.5 bg-transparent outline-none dark:text-white" />
            </div>
            <div className="flex gap-4">
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("pwdPlaceholder")} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 dark:text-white" />
              <input type="text" value={passwordHint} onChange={(e) => setPasswordHint(e.target.value)} placeholder="تلميح للباسورد (اختياري)" className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 dark:text-white text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-800 text-white py-3.5 rounded-xl font-bold transition-all hover:bg-amber-900 active:scale-95 shadow-sm">
              {loading ? t("creating") : t("createMagicLink")}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              <span role="img" aria-label="lock" className="opacity-80 ms-1">🔒</span>
              {t("trustText")}
            </p>
            <p className="text-[11px] text-green-700 dark:text-green-400/90 mt-1.5 text-center font-medium">
              {t("locale") === "en" 
                ? "🛡️ We NEVER ask for social media passwords or financial data."
                : "🛡️ نحن لا نطلب أي كلمات مرور (Passwords) أو بيانات مالية إطلاقاً."}
            </p>
          </form>
        )}
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
