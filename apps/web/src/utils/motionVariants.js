// Shared Motion (framer-motion) variants used across all sections.
// Sprint 6: Cinematic-quality transitions with 3D perspective and spring physics.

export const sectionContainer = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
      delayChildren: 0.08,
      filter: { duration: 0.5 },
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.95,
    filter: "blur(6px)",
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
      filter: { duration: 0.3 },
    },
  },
};

export const sectionChild = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(6px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      filter: { duration: 0.35 },
    },
  },
};

export const motionVariantsLetter = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.25, delayChildren: 0.2 },
    },
  },
  child: {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

// Sprint 6: New cinematic variants

export const holographicReveal = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    rotateX: 15,
    filter: "blur(12px) brightness(1.5)",
  },
  show: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px) brightness(1)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      rotateX: { type: "spring", stiffness: 80, damping: 12 },
    },
  },
};

export const magneticPull = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      mass: 0.6,
    },
  },
};

export const auroraFade = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px) saturate(0)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px) saturate(1)",
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    filter: "blur(8px) saturate(0)",
    transition: { duration: 0.4 },
  },
};

export const glowPulse = {
  initial: { boxShadow: "0 0 0px rgba(var(--mood-accent-rgb, 255,107,157), 0)" },
  animate: {
    boxShadow: [
      "0 0 20px var(--mood-glow, rgba(255,107,157,0.3))",
      "0 0 40px var(--mood-glow-strong, rgba(255,107,157,0.5))",
      "0 0 20px var(--mood-glow, rgba(255,107,157,0.3))",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
