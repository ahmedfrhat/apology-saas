import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";

// Final full-screen black screen with rising hearts and gold title.
export default function EternalVoidCanvas() {
  const { config, t } = useApp();
  const [textStage, setTextStage] = useState("initial"); // 'initial' | 'funny' | 'forever'

  const voidText = t(config?.voidText || "منورتي للأبد 💛");
  const enableFunnyText = config?.enableFunnyText ?? true;
  const funnyText = t(config?.funnyText || "احا انتي لسه هنا يلا انطري ابلكاش 😂");

  const hearts = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 22,
        delay: Math.random() * 6,
        duration: 7 + Math.random() * 6,
      })),
    [],
  );

  useEffect(() => {
    // Stage 1: Show initial text for 5 seconds
    const timer1 = setTimeout(() => {
      if (enableFunnyText) {
        setTextStage("funny");
      } else {
        setTextStage("forever");
      }
    }, 5000);

    // Stage 2: Show the funny message for 4 seconds, then go back to forever
    let timer2;
    if (textStage === "funny") {
      timer2 = setTimeout(() => {
        setTextStage("forever");
      }, 4000);
    }

    return () => {
      clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [textStage, enableFunnyText]);

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden"
      style={{ background: "#050505" }}
    >
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-15vh", opacity: [0, 0.9, 0] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${h.left}%`,
            fontSize: h.size,
            willChange: "transform, opacity",
          }}
        >
          💛
        </motion.span>
      ))}

      <AnimatePresence mode="wait">
        {textStage === "initial" && (
          <motion.h1
            key="initial"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 px-6 text-center text-4xl font-semibold tracking-tight sm:text-6xl"
            style={{
              color: "#DFBA73",
              textShadow: "0 0 30px rgba(223,186,115,0.5)",
            }}
          >
            {voidText}
          </motion.h1>
        )}

        {textStage === "funny" && (
          <motion.h1
            key="funny"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 px-6 text-center text-3xl font-semibold tracking-tight sm:text-5xl"
            style={{
              color: "#EF4444",
              textShadow: "0 0 30px rgba(239,68,68,0.5)",
            }}
          >
            {funnyText}
          </motion.h1>
        )}

        {textStage === "forever" && (
          <motion.h1
            key="forever"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative z-10 px-6 text-center text-4xl font-semibold tracking-tight sm:text-6xl"
            style={{
              color: "#DFBA73",
              textShadow: "0 0 30px rgba(223,186,115,0.5)",
            }}
          >
            {voidText}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
