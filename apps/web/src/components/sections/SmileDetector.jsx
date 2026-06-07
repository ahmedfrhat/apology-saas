import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Camera, Check } from "lucide-react";
import TiltWrapper from "@/components/TiltWrapper";
import { useApp } from "@/context/AppContext";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

export default function SmileDetector({ onNext }) {
  const { updateState, t } = useApp();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    updateState({ currentSection: "smile", lastAction: "smile-detector" });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScan = useCallback(() => {
    if (scanning || done) return;
    setScanning(true);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          setDone(true);
          setScanning(false);
          updateState({ batteryLevel: 25, lastAction: "smile-verified" });
          setTimeout(onNext, 1800);
          return 100;
        }
        return p + 4;
      });
    }, 60);
  }, [scanning, done, onNext, updateState]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <TiltWrapper className={`${CARD} w-full max-w-md p-10 text-center`}>
        <motion.div
          animate={scanning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#1A1A1A]/10 bg-white"
        >
          <Camera size={44} className="text-[#1A1A1A]" />
        </motion.div>

        <p className="mb-6 text-lg font-semibold text-[#1A1A1A]">
          {t("ابتسمي للكاميرا عشان تفكي البلوك الأمني 📸")}
        </p>

        {(scanning || done) && (
          <div className="mb-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]/10">
              <motion.div
                className="h-full rounded-full bg-[#DFBA73]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.06 }}
              />
            </div>
            <p className="mt-3 text-sm font-medium text-[#5A5955]">
              {t("نسبة النكد المكتشفة:")}{" "}
              <span className="font-semibold text-red-500">87.3%</span>
            </p>
          </div>
        )}

        {done ? (
          <p className="flex items-center justify-center gap-2 text-base font-semibold text-green-600">
            <Check size={20} /> {t("تم التحقق بنجاح ✅")}
          </p>
        ) : (
          <button
            type="button"
            onClick={startScan}
            disabled={scanning}
            className="rounded-full bg-[#1A1A1A] px-8 py-3 text-sm font-medium text-[#F4F3EF] transition-colors hover:bg-[#DFBA73] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
          >
            {scanning ? t("جاري الفحص...") : t("ابدأي الفحص 📸")}
          </button>
        )}
      </TiltWrapper>
    </div>
  );
}
