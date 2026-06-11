import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Fingerprint } from "lucide-react";
import TiltWrapper from "@/components/TiltWrapper";
import { useApp } from "@/context/AppContext";

const CARD = "glass-card";

const RADIUS = 56;
const CIRC = 2 * Math.PI * RADIUS;

export default function FingerprintScanner({ onNext }) {
  const { updateState, t } = useApp();
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    updateState({ currentSection: "fingerprint", lastAction: "fingerprint" });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerClickHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const startScanning = useCallback(() => {
    if (scanning || done) return;
    setScanning(true);
    triggerClickHaptic();

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          setDone(true);
          setScanning(false);
          
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([150, 100, 250]); // double heartbeat buzz on success
          }
          
          updateState({ batteryLevel: 85, lastAction: "identity-confirmed" });
          setTimeout(onNext, 1800);
          return 100;
        }

        // Biometric tactile hum - short ticks during progress
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(10);
        }

        return p + 2.5; // smooth increment
      });
    }, 45);
  }, [scanning, done, onNext, updateState]);

  const stopScanning = useCallback(() => {
    if (done) return;
    setScanning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Fade progress back to 0 for strict hold confirmation
    setProgress(0);
  }, [done]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <TiltWrapper className={`${CARD} w-full max-w-md p-10 text-center`}>
        <h3 className="mb-8 text-2xl font-semibold text-[#1A1A1A] dark:text-[#EDE8E0]">
          {t("بصمة التحقق النهائية")}
        </h3>

        <div className="relative mx-auto mb-8 h-40 w-40 flex items-center justify-center">
          {/* Concentric Ripples that scale & intensify as progress increases */}
          <AnimatePresence>
            {scanning && (
              <>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.4, 1.8], 
                    opacity: [0.6, 0.3, 0] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.4, 
                    ease: "easeOut" 
                  }}
                  className="absolute inset-0 rounded-full bg-[var(--accent)]/15"
                  style={{
                    boxShadow: `0 0 ${20 + (progress / 100) * 40}px var(--accent)`,
                  }}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.25, 1.5], 
                    opacity: [0.8, 0.4, 0] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.1, 
                    ease: "easeOut",
                    delay: 0.4 
                  }}
                  className="absolute inset-0 rounded-full bg-[var(--accent-2)]/20"
                />
              </>
            )}
          </AnimatePresence>

          <button
            type="button"
            onMouseDown={startScanning}
            onMouseUp={stopScanning}
            onMouseLeave={stopScanning}
            onTouchStart={(e) => {
              e.preventDefault();
              startScanning();
            }}
            onTouchEnd={stopScanning}
            onTouchCancel={stopScanning}
            disabled={done}
            aria-label={t("ضع البصمة")}
            className="relative h-32 w-32 flex items-center justify-center rounded-full bg-[#FAF8F3] dark:bg-[#1C1F30] border border-[#1A1A1A]/10 dark:border-white/10 shadow-lg cursor-pointer focus-visible:outline-none transition-transform active:scale-95 z-10"
            style={{
              boxShadow: scanning ? `0 0 ${(progress / 100) * 35 + 15}px var(--accent)` : "0 4px 15px rgba(0,0,0,0.1)",
              transition: "box-shadow 0.1s ease, transform 0.1s ease"
            }}
          >
            <svg className="absolute inset-0 -rotate-90" width="128" height="128">
              <circle
                cx="64"
                cy="64"
                r={48}
                stroke="rgba(26,26,26,0.05)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r={48}
                stroke="var(--accent)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 - (progress / 100) * (2 * Math.PI * 48)}
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
            </svg>
            <motion.div
              animate={scanning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <Fingerprint
                size={52}
                className={done ? "text-green-600" : "text-[#1A1A1A] dark:text-[#EDE8E0]"}
              />
            </motion.div>
          </button>
        </div>

        {done ? (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-semibold text-green-600"
          >
            {t("✅ تم التحقق! هوية {girlName} مؤكدة.")}
          </motion.p>
        ) : (
          <p className="text-base font-medium text-[#5A5955] dark:text-[#A89E90]">
            {scanning ? t("استمري في الضغط... ⚡") : t("اضغطي مع الاستمرار على البصمة للتحقق 🔒")}
          </p>
        )}
      </TiltWrapper>
    </div>
  );
}
