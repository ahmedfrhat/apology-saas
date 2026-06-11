import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] mx-auto w-full max-w-2xl px-4 pb-4"
          dir="rtl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/20 bg-black/60 p-4 shadow-2xl backdrop-blur-xl">
            <p className="text-sm font-medium text-white/90">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتقديم إعلانات مخصصة. باستمرارك، أنت توافق على <a href="/privacy" className="underline hover:text-blue-400">سياسة الخصوصية</a> الخاصة بنا.
            </p>
            <button
              onClick={handleAccept}
              className="whitespace-nowrap rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
            >
              موافق
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
