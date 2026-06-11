import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { Lock, AlertCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";

export default function AuthGate({ children }) {
  const { slug } = useParams();
  const { t: trans, locale } = useLanguage();
  const { isFrozen, logLedgerEvent, t = (s) => trans(s) } = useApp() || {};
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState(null);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  // Check session storage first
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem(`unlocked_${slug}`);
    if (isUnlocked === "true") {
      setUnlocked(true);
    }
  }, [slug]);

  // Check brute-force lockout on load/slug change
  useEffect(() => {
    const lockoutKey = `lockout_${slug}`;
    const storedLockout = localStorage.getItem(lockoutKey);
    if (storedLockout) {
      const remainingTime = Math.ceil((parseInt(storedLockout) + 300000 - Date.now()) / 1000);
      if (remainingTime > 0) {
        setLockoutTime(remainingTime);
      } else {
        localStorage.removeItem(lockoutKey);
      }
    }
  }, [slug]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(`lockout_${slug}`);
          localStorage.removeItem(`attempts_${slug}`);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime, slug]);

  // Broadcast "at_gate" status
  useEffect(() => {
    if (unlocked) return;
    const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
    if (isDashboard) return;

    let sessionId = sessionStorage.getItem("kvow_session_id");
    if (!sessionId) {
      sessionId = `kvow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("kvow_session_id", sessionId);
    }

    const broadcastGateStatus = async () => {
      try {
        await fetch(`/api/t-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            session_id: sessionId,
            current_section: "at_gate",
            battery_level: 0,
            last_action: "تحاول فك كلمة المرور"
          })
        });
      } catch (err) {
        // silently ignore tracking errors
      }
    };

    broadcastGateStatus();
    const interval = setInterval(broadcastGateStatus, 5000);
    return () => clearInterval(interval);
  }, [slug, unlocked]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password) return;
    if (lockoutTime > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${slug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem(`unlocked_${slug}`, "true");
        sessionStorage.setItem(`auth_pwd_${slug}`, password);
        localStorage.removeItem(`attempts_${slug}`);
        localStorage.removeItem(`lockout_${slug}`);
        setUnlocked(true);
        if (logLedgerEvent) {
          logLedgerEvent("قامت بفك كلمة مرور البوابة بنجاح 🔓");
        }
      } else {
        const attemptsKey = `attempts_${slug}`;
        const attempts = parseInt(localStorage.getItem(attemptsKey) || "0") + 1;
        localStorage.setItem(attemptsKey, attempts.toString());
        
        if (attempts >= 5) {
          localStorage.setItem(`lockout_${slug}`, Date.now().toString());
          setLockoutTime(300);
          setError("تم قفل البوابة مؤقتاً بسبب 5 محاولات خاطئة متتالية. جرب ثانية بعد 5 دقائق.");
          if (logLedgerEvent) {
            logLedgerEvent("تم حظر الجلسة مؤقتاً بسبب محاولات دخول خاطئة متكررة 🚨");
          }
        } else {
          setError((data.error || "كلمة المرور غير صحيحة") + ` (المحاولات المتبقية: ${5 - attempts})`);
          if (data.hint) setHint(data.hint);
          if (logLedgerEvent) {
            logLedgerEvent(`أدخلت كلمة مرور خاطئة عند البوابة: "${password}" ❌`);
          }
        }
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  if (isFrozen) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-2xl"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="w-full max-w-sm rounded-[2.5rem] border border-[#DFBA73]/30 bg-black/40 backdrop-blur-xl p-8 text-center shadow-[0_30px_70px_rgba(223,186,115,0.2)]">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 select-none">
            {t("تم تجميد الصفحة مؤقتاً 🔒")}
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed select-none">
            {t("قام المسؤول بتجميد هذا الرابط مؤقتاً لأسباب تتعلق بالأمان أو الصيانة. يرجى الانتظار لحين فك التجميد...")}
          </p>
        </div>
      </div>
    );
  }

  if (unlocked) {
    return children;
  }

  return (
    <div 
      className="min-h-screen bg-[#FCFBF7] dark:bg-gray-950 flex items-center justify-center px-5 font-sans antialiased text-[#4A3E3D] dark:text-gray-200"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-[10%] left-[10%] text-9xl select-none">🔒</div>
        <div className="absolute bottom-[10%] right-[10%] text-9xl select-none">✨</div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#F4F3EF]/70 dark:bg-gray-800/70 backdrop-blur-3xl border border-[#1A1A1A]/10 dark:border-gray-700/50 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-8 sm:p-10 text-center relative overflow-hidden z-10"
      >
        <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 relative">
          <Lock size={36} className="text-amber-800 dark:text-amber-500 animate-pulse" />
          <Sparkles size={16} className="absolute top-2 right-2 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">
          {locale === "en" ? "Secure Gate 🔒" : "بوابة الأمان 🔒"}
        </h2>
        <p className="text-xs text-[#8A7E72] dark:text-gray-400 mb-6 leading-relaxed">
          {locale === "en" 
            ? "Enter the secret password to unlock the surprise." 
            : "أدخل الرقم السري لفتح المفاجأة."}
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col gap-2 text-start">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
              {hint && (
                <div className="text-[10px] bg-white/50 px-2 py-1 rounded text-red-600 border border-red-100">
                  💡 تلميح: {hint}
                </div>
              )}
            </div>
          )}
          <input
            type="password"
            autoFocus
            required
            disabled={lockoutTime > 0}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={lockoutTime > 0 ? (locale === "en" ? `Locked out for ${lockoutTime}s` : `مغلق مؤقتاً لـ ${lockoutTime} ثانية`) : (locale === "en" ? "Password..." : "كلمة المرور...")}
            className="w-full text-center tracking-widest font-mono text-lg rounded-xl border border-[#1A1A1A]/20 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 p-3.5 outline-none transition-all focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A1A1A] dark:focus:border-amber-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !password || lockoutTime > 0}
            className="w-full bg-[#1A1A1A] dark:bg-amber-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-black dark:hover:bg-amber-900 active:scale-95 disabled:opacity-50"
          >
            {lockoutTime > 0 
              ? (locale === "en" ? `Try again in ${lockoutTime}s` : `المحاولة بعد ${lockoutTime} ثانية 🔒`)
              : loading 
                ? (locale === "en" ? "Verifying..." : "جاري التحقق...") 
                : (locale === "en" ? "Unlock" : "دخول")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
