import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Heart, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

const CARD =
  "bg-[#F4F3EF]/70 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem]";

export default function SaaSOnboardingPage() {
  const [boyName, setBoyName] = useState("");
  const [girlName, setGirlName] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, password, boyName, girlName }),
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
          setError("انتهت مهلة الاتصال بالخادم. يرجى التحقق من اتصال قاعدة البيانات.");
        } else {
          setError(err.message || "فشل الاتصال بالخادم أو حدث خطأ في قاعدة البيانات");
        }
      } finally {
        setLoading(false);
      }
    },
    [slug, password, boyName, girlName]
  );

  return (
    <div
      className="min-h-screen bg-[#FCFBF7] flex items-center justify-center px-5 py-12 font-sans antialiased text-[#4A3E3D]"
      dir="rtl"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute top-[10%] left-[10%] text-9xl select-none">❤️</div>
        <div className="absolute bottom-[10%] right-[10%] text-9xl select-none">❤️</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${CARD} w-full max-w-lg p-8 sm:p-12 relative overflow-hidden`}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-100/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200/50 mb-4"
          >
            <Heart size={32} fill="#B45309" className="text-amber-800" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            منصّة المصالحة والاعتذار 💝
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#8A7E72] leading-relaxed max-w-md mx-auto">
            اصنع صفحة اعتذار تفاعلية مخصصة لشريكة حياتك وصالحها بطريقة برمجية مبتكرة ومؤثرة!
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-4">
              <CheckCircle size={44} />
            </div>
            <h2 className="text-xl font-bold text-green-700">تم إنشاء موقعك بنجاح! 🎉</h2>
            <p className="mt-2 text-sm text-[#8A7E72]">
              جاري تحويلك الآن إلى لوحة التحكم الخاصة بك...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-red-700"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">اسمك (الولد)</label>
                <input
                  type="text"
                  required
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  placeholder="مثال: محمد"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-800 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">اسمها (البنت)</label>
                <input
                  type="text"
                  required
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  placeholder="مثال: منار"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">الرابط المخصص للموقع</label>
              <div
                className="relative flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-800 transition-all"
                dir="ltr"
              >
                <span className="px-3.5 py-2.5 text-xs text-gray-500 bg-gray-50 border-r border-gray-200 select-none font-mono">
                  {isMounted ? origin : "loading..."}
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="apology-to-my-love"
                  className="flex-1 border-0 bg-transparent px-3.5 py-2.5 text-sm outline-none font-mono"
                  dir="ltr"
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400 text-right" dir="rtl">
                * استخدم الحروف الإنجليزية الصغيرة والأرقام والشرطة (-) فقط.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">كلمة مرور لوحة التحكم</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور لتأمين لوحة التحكم والداشبورد"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-800 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 py-3.5 text-sm font-semibold text-white transition-all hover:bg-amber-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  جاري بناء المفاجأة...
                </>
              ) : (
                <>أنشئ المفاجأة الرومانسية 🚀</>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
