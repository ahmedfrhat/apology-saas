import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";

const DEFAULT_LINES = [
  "$ Initializing منورتي Protocol...",
  "[OK] Loading Love Modules",
  "[OK] Bypassing Anger Firewall",
  "[OK] Compiling Apology Engine v3.0",
  "[OK] All Systems Online. Welcome, منار.",
];

// Boot-up hacker loading screen. Lines appear one every 400ms, then fades out.
export default function TerminalLoader({ onDone }) {
  const { config, t } = useApp();
  const [visibleCount, setVisibleCount] = useState(0);
  const [fading, setFading] = useState(false);

  const lines = (config?.loaderTexts || DEFAULT_LINES).map((line) => t(line));

  useEffect(() => {
    if (visibleCount >= lines.length) {
      const t = setTimeout(() => setFading(true), 700);
      const t2 = setTimeout(() => {
        if (onDone) onDone();
      }, 1400);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 400);
    return () => clearTimeout(t);
  }, [visibleCount, onDone, lines.length]);

  return (
    <AnimatePresence>
      {!fading && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          style={{ background: "#0A0A0A" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-lg font-mono text-sm leading-relaxed text-emerald-400 sm:text-base">
            {lines.slice(0, visibleCount).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                dir="ltr"
                className="whitespace-pre-wrap"
              >
                {line}
                {i === visibleCount - 1 && (
                  <span className="ms-1 inline-block h-4 w-2 animate-pulse bg-emerald-400 align-middle" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
