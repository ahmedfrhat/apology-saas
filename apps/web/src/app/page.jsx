import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import Footer from "@/components/Footer";

const CARD =
  "bg-[#F4F3EF]/70 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.4)] rounded-[2.5rem]";

export default function SaaSOnboardingPage() {
  const [boyName, setBoyName] = useState("");
  const [girlName, setGirlName] = useState("");
  const [petName, setPetName] = useState("");
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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, password, boyName, girlName, petName }),
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
    [slug, password, boyName, girlName, petName]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFBF7] font-sans antialiased text-[#4A3E3D]" dir="rtl">
      <div className="flex flex-1 items-center justify-center px-5 py-12 relative">
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
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200/50 mb-4"
          >
            <Heart size={32} fill="#B45309" className="text-amber-800" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">منصّة المصالحة والاعتذار 💝</h1>
        </div>

        {success ? (
          <div className="text-center py-8 text-green-700">تم إنشاء موقعك بنجاح! 🎉</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required value={boyName} onChange={(e) => setBoyName(e.target.value)} placeholder="اسمك" className="w-full rounded-xl border p-2.5" />
              <input type="text" required value={girlName} onChange={(e) => setGirlName(e.target.value)} placeholder="اسمها" className="w-full rounded-xl border p-2.5" />
            </div>
            <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="اسم الدلع (اختياري، مثلاً: كوكيتي)" className="w-full rounded-xl border p-2.5" />
            <div className="flex items-center rounded-xl border bg-white overflow-hidden" dir="ltr">
              <span className="px-3 bg-gray-50 text-gray-500 text-xs py-3">{isMounted ? origin : "loading..."}</span>
              <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="link" className="flex-1 p-2.5 outline-none" />
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full rounded-xl border p-2.5" />
            <button type="submit" disabled={loading} className="w-full bg-amber-800 text-white py-3.5 rounded-xl font-bold transition-all hover:bg-amber-900 active:scale-95 shadow-sm">
              {loading ? "جاري البناء..." : "أنشئ المفاجأة الرومانسية 🚀"}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              <span role="img" aria-label="lock" className="opacity-80 ml-1">🔒</span>
              بياناتكم مشفرة وتُستخدم فقط لإنشاء التجربة، ولا يتم تخزينها أو مشاركتها.
            </p>
          </form>
        )}
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
