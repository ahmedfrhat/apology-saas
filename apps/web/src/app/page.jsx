import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X } from "lucide-react";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAdBlockDetect } from "@/hooks/useAdBlockDetect";

const CARD =
 "bg-[#F4F3EF]/70 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem]";

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
 const [telegramChatId, setTelegramChatId] = useState("");
 const [showTelegram, setShowTelegram] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);
 const [origin, setOrigin] = useState("");
 const [isMounted, setIsMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginSlug, setLoginSlug] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

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
          // Store auth state
          sessionStorage.setItem(`unlocked_${loginSlug}`, "true");
          sessionStorage.setItem(`auth_pwd_${loginSlug}`, loginPassword);
          
          // Ensure kvow_session_id is initialized
          let sessionId = sessionStorage.getItem("kvow_session_id");
          if (!sessionId) {
            sessionId = `kvow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            sessionStorage.setItem("kvow_session_id", sessionId);
          }
          
          // Redirect to dashboard
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
 body: JSON.stringify({ slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale }),
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
 [slug, password, passwordHint, telegramChatId, boyName, girlName, petName, locale]
 );

  return (
  <div className="flex min-h-screen flex-col bg-[#FCFBF7] dark:bg-gray-950 font-sans antialiased text-[#4A3E3D] dark:text-gray-200 relative">
    
    {/* Top Navigation / Header */}
    <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-2 font-bold text-lg text-[#1A1A1A] dark:text-white">
        <Heart size={20} fill="#B45309" className="text-amber-800 dark:text-amber-500" />
        <span>Safi.io</span>
      </div>
      {/* me-32 shifts the button on mobile to prevent overlapping with the absolute floating theme/lang pill */}
      <div className="me-32 sm:me-0">
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-5 py-2.5 rounded-full text-xs font-bold transition-all bg-white/80 dark:bg-gray-800/80 border border-[#1A1A1A]/10 dark:border-gray-700/50 hover:bg-amber-800 hover:text-white dark:hover:bg-amber-800 dark:hover:text-white hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
        >
          {locale === "en" ? "Sign In" : "تسجيل الدخول"}
        </button>
      </div>
    </header>
 
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
        {t("telegramOptional") || "🔔 تفعيل إشعارات تليجرام (اختياري)"}
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

  <Footer />
  </div>
 );
}
