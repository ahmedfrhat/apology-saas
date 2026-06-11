import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function StealthChatWidget() {
  const { whisperMessages, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (whisperMessages && whisperMessages.length > prevCount) {
      setHasNew(true);
      setPrevCount(whisperMessages.length);
      // Play a subtle sound or flash
      const timer = setTimeout(() => setHasNew(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [whisperMessages, prevCount]);

  if (!whisperMessages || whisperMessages.length === 0) return null;

  return (
    <>
      {/* Floating Action sealed envelope bubble */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <AnimatePresence>
          {(!isOpen || hasNew) && (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true);
                setHasNew(false);
              }}
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
                boxShadow: "0 10px 30px var(--accent-glow)",
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-[#1A1510] cursor-pointer relative ${
                hasNew ? "animate-bounce" : ""
              }`}
            >
              {hasNew && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                    !
                  </span>
                </span>
              )}
              <span className="text-sm">🤫</span>
              <span>همسة من حبيبك</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-out parchment drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
            />

            {/* Parchment content panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                background: "var(--bg-card)",
                borderLeft: "1px solid var(--border-base)",
                boxShadow: "var(--shadow-card)",
              }}
              className="relative w-full max-w-md h-full p-6 sm:p-8 flex flex-col justify-between pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤫</span>
                  <h3
                    style={{ color: "var(--text-primary)", fontFamily: "'Playfair Display', 'Cairo', serif" }}
                    className="text-base font-bold"
                  >
                    همسات خاصة ومباشرة
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ color: "var(--text-muted)" }}
                  className="p-1 rounded-full hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable messages container styled as an old diary or letter stack */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide py-2">
                {whisperMessages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    style={{
                      background: "rgba(223, 186, 115, 0.08)",
                      border: "1px dashed rgba(223, 186, 115, 0.3)",
                    }}
                    className="p-4 rounded-2xl relative overflow-hidden"
                  >
                    {/* Tiny decorative heart */}
                    <div className="absolute top-2 left-2 opacity-20">
                      <Heart size={10} fill="var(--accent-2)" className="text-[var(--accent-2)]" />
                    </div>
                    <p
                      style={{ color: "var(--text-primary)", fontFamily: "'Cairo', sans-serif" }}
                      className="text-sm font-medium leading-relaxed"
                    >
                      {msg}
                    </p>
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}
                      className="block text-left mt-2 font-mono"
                    >
                      {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer decoration */}
              <div className="pt-4 border-t border-[var(--border-base)] text-center">
                <p style={{ color: "var(--text-muted)" }} className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <span>صنع بكل حب</span>
                  <Heart size={8} fill="currentColor" className="text-red-500 animate-pulse" />
                  <span>بواسطته</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
