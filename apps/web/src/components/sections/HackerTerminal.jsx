import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import DecryptedText from "@/components/DecryptedText";
import { useApp } from "@/context/AppContext";

const CARD = "glass-card";

const DEFAULT_LINES = [
  "$ ssh {girlName}@heart.local",
  "[INFO] Scanning {girlName}'s heart status...",
  "[WARNING] High levels of anger detected! (CRITICAL: 99.7%)",
  "[RUNNING] sudo clear-anger-cells.sh --force",
  "[SUCCESS] Deleting 404_Anger_Not_Found...",
  "[RUNNING] inject-dopamine-overload.exe",
  "[SUCCESS] Dopamine levels rising dynamically!",
  "[RUNNING] install love-patch-v2.0 --target-heart",
  "[ERROR] Installation blocked: Hardware validation required.",
  "[PROMPT] Please smile at the front camera to bypass security...",
];

function lineColor(line) {
  if (line.startsWith("[ERROR]") || line.startsWith("[WARNING]"))
    return "rgb(239, 68, 68)";
  if (line.startsWith("[SUCCESS]")) return "var(--accent-2)";
  return "var(--text-secondary)";
}

export default function HackerTerminal({ onNext }) {
  const { updateState, t } = useApp();
  const [count, setCount] = useState(0);

  const lines = DEFAULT_LINES.map((line) => t(line));

  useEffect(() => {
    updateState({
      batteryLevel: 15,
      currentSection: "terminal",
      lastAction: "terminal-boot",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = useCallback(() => {
    const t = setTimeout(onNext, 600);
    return () => clearTimeout(t);
  }, [onNext]);

  useEffect(() => {
    if (count >= lines.length) {
      return advance();
    }
    const t = setTimeout(() => setCount((c) => c + 1), 400);
    return () => clearTimeout(t);
  }, [count, advance, lines.length]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div className={`${CARD} w-full max-w-2xl overflow-hidden p-0`}>
        <div className="flex items-center gap-2 border-b border-[#1A1A1A]/10 px-5 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ms-3 text-xs font-medium text-[#5A5955]">
            heart.local — bash
          </span>
        </div>

        <div
          dir="ltr"
          className="min-h-[320px] space-y-1.5 px-6 py-6 font-mono text-xs leading-relaxed sm:text-sm"
        >
          {lines.slice(0, count).map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: lineColor(line) }}
            >
              <DecryptedText text={line} speed={14} playTypingSound={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
