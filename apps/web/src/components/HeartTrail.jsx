import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

// Spawns a floating heart at each click point that rises and fades.
export default function HeartTrail() {
  const [hearts, setHearts] = useState([]);

  const handleClick = useCallback((e) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = e.clientX;
    const y = e.clientY;
    setHearts((prev) => [...prev.slice(-14), { id, x, y }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1100);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 70 }}
    >
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            initial={{ opacity: 0.9, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: h.x - 10,
              top: h.y - 10,
              fontSize: 20,
              willChange: "transform, opacity",
            }}
          >
            ❤️
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
