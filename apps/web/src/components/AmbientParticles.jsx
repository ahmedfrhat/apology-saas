import { useMemo } from "react";
import { motion } from "motion/react";

// Lightweight floating gold particles (max 18). GPU-friendly transforms only.
export default function AmbientParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 9,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: "110vh", x: 0, opacity: 0 }}
          animate={{
            y: "-10vh",
            x: [0, p.drift, 0],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: "9999px",
            background: "#DFBA73",
            boxShadow: "0 0 8px rgba(223,186,115,0.7)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
