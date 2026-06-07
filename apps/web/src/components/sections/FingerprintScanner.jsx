import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Fingerprint } from "lucide-react";
import TiltWrapper from "@/components/TiltWrapper";
import { useApp } from "@/context/AppContext";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

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

  const start = useCallback(() => {
    if (scanning || done) return;
    setScanning(true);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          setDone(true);
          setScanning(false);
          updateState({ batteryLevel: 85, lastAction: "identity-confirmed" });
          setTimeout(onNext, 1900);
          return 100;
        }
        return p + 3;
      });
    }, 45);
  }, [scanning, done, onNext, updateState]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <TiltWrapper className={`${CARD} w-full max-w-md p-10 text-center`}>
        <h3 className="mb-8 text-2xl font-semibold text-[#1A1A1A]">
          {t("بصمة التحقق النهائية")}
        </h3>

        <button
          type="button"
          onClick={start}
          disabled={scanning || done}
          aria-label={t("ضع البصمة")}
          className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center focus-visible:outline-none"
        >
          <svg className="absolute inset-0 -rotate-90" width="160" height="160">
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              stroke="rgba(26,26,26,0.1)"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              stroke="#DFBA73"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - (progress / 100) * CIRC}
              style={{ transition: "stroke-dashoffset 0.05s linear" }}
            />
          </svg>
          <motion.div
            animate={scanning ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.9 }}
          >
            <Fingerprint
              size={70}
              className={done ? "text-green-600" : "text-[#1A1A1A]"}
            />
          </motion.div>
        </button>

        {done ? (
          <p className="text-base font-semibold text-green-600">
            {t("✅ تم التحقق! هوية {girlName} مؤكدة.")}
          </p>
        ) : (
          <p className="text-base font-medium text-[#5A5955]">
            {t("حطي صباعك على الشاشة عشان نتأكد إنك إنتي")}
          </p>
        )}
      </TiltWrapper>
    </div>
  );
}
