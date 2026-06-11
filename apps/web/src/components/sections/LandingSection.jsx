import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Headphones } from "lucide-react";
import TiltWrapper from "@/components/TiltWrapper";
import { useApp } from "@/context/AppContext";
import useSpatialAudio from "@/hooks/useSpatialAudio";

const CARD = "glass-card-elevated";

const DEFAULT_FULL_TEXT = "في وسط أي زعل.. فيه حاجات تانية مستحيل تضيع.. انزلي شوفي";

export default function LandingSection({ onNext }) {
  const { updateState, config, t } = useApp();
  const [typed, setTyped] = useState("");
  const { clickSound, hoverSound } = useSpatialAudio();

  const landingText = t(config?.landingText || DEFAULT_FULL_TEXT);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(landingText.slice(0, i));
      if (i >= landingText.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [landingText]);

  const handleStart = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
    updateState({
      batteryLevel: 10,
      lastAction: "started",
      currentSection: "terminal",
    });
    onNext();
  }, [onNext, updateState]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <TiltWrapper
        className={`${CARD} w-full max-w-xl p-10 text-center sm:p-14`}
      >
        <motion.p
          className="mb-10 text-2xl font-semibold leading-relaxed text-[#1A1A1A] sm:text-3xl"
          style={{ minHeight: "3em" }}
        >
          {typed}
          <span
            className="ms-1 inline-block h-7 w-[3px] align-middle"
            style={{
              background: "#DFBA73",
              animation: "manarBlink 1s steps(2) infinite",
            }}
          />
        </motion.p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => { clickSound(); handleStart(); }}
            onMouseEnter={hoverSound}
            aria-label="ابدأي"
            className="mood-glow-btn group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1A] text-[#F4F3EF] transition-colors hover:bg-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid #DFBA73",
                animation: "manarPulse 1.8s ease-out infinite",
              }}
            />
            <Headphones size={30} />
          </button>
        </div>
        <p className="mt-4 text-xs font-medium text-[#5A5955]">
          دوسي عشان نبدأ 🎧
        </p>

        <style jsx global>{`
          @keyframes manarBlink {
            0%, 50% { opacity: 1; }
            50.01%, 100% { opacity: 0; }
          }
          @keyframes manarPulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </TiltWrapper>
    </div>
  );
}
