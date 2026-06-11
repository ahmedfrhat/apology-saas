// Shared Motion (framer-motion) variants used across all sections.

export const sectionContainer = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.25, 1, 0.5, 1],
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -35,
    scale: 0.98,
    transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
  },
};

export const sectionChild = {
  hidden: { opacity: 0, y: 35 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
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
