import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { celebrate } from "@/utils/confetti";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

export default function DeadlyTrapQuestion({ onNext }) {
  const { updateState, appendWrongClick, t } = useApp();
  const cardRef = useRef(null);
  const runBtnRef = useRef(null);
  const [runPos, setRunPos] = useState({ x: 0, y: 0 });
  const [success, setSuccess] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const firstNoHoverTime = useRef(null);

  useEffect(() => {
    updateState({
      batteryLevel: 90,
      currentSection: "trap",
      lastAction: "deadly-trap",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jump the runaway button to a random spot that stays fully inside the card.
  const jump = useCallback(() => {
    if (!firstNoHoverTime.current) {
      firstNoHoverTime.current = Date.now();
    }
    const card = cardRef.current;
    const btn = runBtnRef.current;
    if (!card || !btn) return;
    const cardRect = card.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const pad = 12;
    const maxX = Math.max(0, cardRect.width - btnRect.width - pad * 2);
    const maxY = Math.max(0, cardRect.height - btnRect.height - pad * 2);
    const x = pad + Math.random() * maxX;
    const y = pad + Math.random() * maxY;
    // translate relative to the button's natural (centered) position
    setRunPos({
      x: x - (btnRect.left - cardRect.left),
      y: y - (btnRect.top - cardRect.top),
    });
  }, []);

  const handleYes = useCallback(() => {
    setSuccess(true);
    celebrate();

    // Check for hesitation
    if (firstNoHoverTime.current) {
      const seconds = (Date.now() - firstNoHoverTime.current) / 1000;
      if (seconds >= 2) {
        updateState({
          hesitationDetected: true,
          hesitationSeconds: Math.round(seconds),
        });
      }
    }

    updateState({ lastAction: "forgiven" });
    setTimeout(onNext, 2400);
  }, [onNext, updateState]);

  const openComplaint = useCallback(() => {
    setShowComplaint(true);
    appendWrongClick("complaint-to-mama");
  }, [appendWrongClick]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div
        ref={cardRef}
        className={`relative w-full max-w-lg overflow-hidden ${CARD} p-10 text-center`}
      >
        {/* siren lights in corners */}
        {[
          "top-3 start-3",
          "top-3 end-3",
          "bottom-3 start-3",
          "bottom-3 end-3",
        ].map((pos) => (
          <motion.span
            key={pos}
            className={`absolute ${pos} h-3 w-3 rounded-full bg-red-500`}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        ))}

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-3 text-6xl">🥰</div>
            <p className="text-2xl font-semibold text-[#1A1A1A]">
              {t("أحلى صافي يا لبن في الدنيا!")}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center"
            >
              <AlertTriangle size={56} className="text-red-500" />
            </motion.div>

            <h3 className="mb-3 text-xl font-semibold text-[#1A1A1A]">
              {t("🚨 سؤال الموت والفرصة الأخيرة:")}
            </h3>
            <p className="mb-9 text-lg font-semibold text-red-500">
              {t("سامحتيني خلاص وصافي يا لبن؟")}
            </p>

            <div className="relative flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleYes}
                className="z-10 rounded-full bg-[#1A1A1A] px-8 py-3.5 text-base font-medium text-[#F4F3EF] transition-colors hover:bg-[#DFBA73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
              >
                {t("أه يا قلبي طبعاً 🥺❤️")}
              </button>

              <motion.button
                ref={runBtnRef}
                type="button"
                onMouseEnter={jump}
                onClick={jump}
                onTouchStart={(e) => {
                  e.preventDefault();
                  jump();
                }}
                animate={{ x: runPos.x, y: runPos.y }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-full border border-red-300 bg-white px-6 py-3 text-sm font-medium text-red-500"
                style={{ willChange: "transform" }}
              >
                {t("لأ لسه زعلانة 😡")}
              </motion.button>
            </div>

            <button
              type="button"
              onClick={openComplaint}
              className="mt-8 text-xs font-medium text-[#5A5955] underline underline-offset-4 hover:text-[#1A1A1A]"
            >
              {t("تقديم شكوى لماما")}
            </button>
          </>
        )}

        <AnimatePresence>
          {showComplaint && (
            <motion.div
              className="absolute inset-0 z-[60] flex items-center justify-center rounded-[2.5rem] p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setShowComplaint(false)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xs rounded-3xl border border-[#1A1A1A]/10 bg-[#F4F3EF] p-7 text-center"
              >
                <button
                  type="button"
                  onClick={() => setShowComplaint(false)}
                  className="absolute end-3 top-3 text-[#5A5955] hover:text-[#1A1A1A]"
                >
                  <X size={18} />
                </button>
                <div className="mb-3 text-5xl">😂</div>
                <p className="mb-2 text-base font-semibold text-[#1A1A1A]">
                  {t("ماما مشغولة حالياً بتحضر الأكل..")}
                </p>
                <p className="text-sm font-medium text-[#5A5955]">
                  {t("الشكوى مرفوضة برمجياً يا {girlNickname}! مفيش مهرب من الصلح.")}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
