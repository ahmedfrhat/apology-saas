import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Siren, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

// Fixed "panic" button (bottom-left) that opens a useless joke modal.
export default function PanicButton() {
  const [open, setOpen] = useState(false);
  const { appendWrongClick, t } = useApp();

  const handleOpen = useCallback(() => {
    setOpen(true);
    appendWrongClick("panic-button");
  }, [appendWrongClick]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-4 start-4 z-[80] flex items-center gap-1.5 rounded-full border border-[#1A1A1A]/10 bg-[#F4F3EF]/70 px-3 py-2 text-xs font-medium text-[#5A5955] backdrop-blur-xl transition-colors hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
      >
        <Siren size={15} className="text-red-500" />
        {t("زر الطوارئ")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-[2.5rem] border border-[#1A1A1A]/10 bg-[#F4F3EF] dark:bg-gray-800 p-6 text-center shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute end-4 top-4 rounded-full p-1 text-[#5A5955] dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] cursor-pointer"
              >
                <X size={20} />
              </button>
              
              <div className="text-sm font-bold text-red-500 mb-2 uppercase tracking-wider">
                🚨 {t("تنبيه طوارئ")} 🚨
              </div>
              
              <div className="overflow-hidden rounded-2xl border border-red-500/20 mb-4 bg-black/5 dark:bg-black/25">
                <img
                  src="/emergency_meme.png"
                  alt="Reconciliation Emergency Meme"
                  className="w-full h-auto object-cover max-h-[300px] mx-auto"
                />
              </div>

              <p className="text-base font-semibold text-[#1A1A1A] dark:text-white leading-relaxed">
                {t("الزر ده مش شغال.. مفيش مهرب غير إنك تسامحي! 😂")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
