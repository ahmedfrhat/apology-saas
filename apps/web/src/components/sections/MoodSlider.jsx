import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { useApp } from "@/context/AppContext";

const CARD = "glass-card";

const STAGES = [
  {
    max: 25,
    bg: "#FEE2E2",
    emoji: "😡",
    text: "لسه قفشة وزعلانة؟ اسحبي يمين شوية 🥺",
  },
  { max: 50, bg: "#FFEDD5", emoji: "😤", text: "اسحبي كمان شويه بقولك" },
  { max: 75, bg: "#FEF9C3", emoji: "😊", text: "اسحبي يبت اخلصي" },
  {
    max: 100,
    bg: "#DCFCE7",
    emoji: "🥰",
    text: "يا روحي صافي يا لبن.. انزلي كملي بقية المفاجأة يا كل دنيتي! 🥰",
  },
];

function stageFor(value, stages) {
  return stages.find((s) => value <= s.max) || stages[stages.length - 1];
}

export default function MoodSlider({ onNext }) {
  const { updateState, t } = useApp();
  const [value, setValue] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [initialAnger, setInitialAnger] = useState(null);

  const stages = STAGES.map((s) => ({
    ...s,
    text: t(s.text),
  }));

  const stage = stageFor(value, stages);

  const handleChange = useCallback(
    (e) => {
      const v = Number(e.target.value);
      
      // Capture the first distinct movement as their authentic mood/anger level
      if (initialAnger === null && v > 0 && v < 98) {
        setInitialAnger(v);
        updateState({ angerLevel: v });
      }
      
      // Sliding notches feedback (vibrate slightly every 10 units)
      if (Math.floor(v / 10) !== Math.floor(value / 10)) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(8);
        }
      }

      setValue(v);
      if (v >= 98 && !unlocked) {
        setUnlocked(true);
        
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([80, 50, 150]); // success heartbeat buzz
        }

        // If they just slammed it to 100 immediately, capture that too
        if (initialAnger === null) {
            updateState({ angerLevel: 100 });
        }
        updateState({
          batteryLevel: 40,
          lastAction: "mood-cleared",
          currentSection: "timeline",
        });
        setTimeout(onNext, 1400);
      }
    },
    [value, unlocked, onNext, updateState, initialAnger],
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <motion.div
        className={`${CARD} w-full max-w-md p-10 text-center`}
        animate={{ backgroundColor: stage.bg }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          key={stage.emoji}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mb-6 text-8xl"
        >
          {stage.emoji}
        </motion.div>

        <p className="mb-8 min-h-[3.5em] text-lg font-semibold leading-relaxed" style={{ color: "#1A1A1A" }}>
          {stage.text}
        </p>

        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="manar-range w-full"
          aria-label={t("مزاج منار")}
        />
        <div className="mt-2 flex justify-between text-xs font-medium" style={{ color: "#5A5955" }}>
          <span>{t("زعلانة 😡")}</span>
          <span>{t("صافي 🥰")}</span>
        </div>

        <style jsx global>{`
          .manar-range {
            -webkit-appearance: none;
            appearance: none;
            height: 8px;
            border-radius: 9999px;
            background: rgba(26, 26, 26, 0.15);
            outline: none;
          }
          .manar-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 26px;
            height: 26px;
            border-radius: 9999px;
            background: #1a1a1a;
            border: 3px solid #dfba73;
            cursor: pointer;
          }
          .manar-range::-moz-range-thumb {
            width: 26px;
            height: 26px;
            border-radius: 9999px;
            background: #1a1a1a;
            border: 3px solid #dfba73;
            cursor: pointer;
          }
        `}</style>
      </motion.div>
    </div>
  );
}
