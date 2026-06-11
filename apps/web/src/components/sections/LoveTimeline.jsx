import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ScratchToReveal from "@/components/ScratchToReveal";

const MOMENTS = [
  "أول يوم اتكلمنا فيه كان بداية أحلى حاجة في حياتي",
  "ضحكتك بتخليني أنسى أي حاجة وحشة في الدنيا",
  "مهما حصل بينا، بتفضلي أقرب حد لقلبي",
  "دعمك ليا في أصعب أوقاتي مش هنساه أبداً",
  "إنتي مش بس حبيبتي، إنتي صاحبتي وسندي",
  "كل تفصيلة فيكي بتخليني أحبك أكتر",
  "مفيش حاجة في الدنيا تعوضني عنك لحظة",
];

export default function LoveTimeline({ onNext }) {
  const { updateState, config, t } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  // Resolve timeline data
  let timelineData = config?.timeline;
  if (!timelineData || !Array.isArray(timelineData) || timelineData.length === 0) {
    timelineData = MOMENTS.map((m) => ({ text: m, image: "" }));
  }

  // Trigger battery/section registration on mount
  useEffect(() => {
    updateState({
      batteryLevel: 45,
      currentSection: "timeline",
      lastAction: "love-timeline",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parallax 3D Tilt calculations
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    tiltX.set(mouseX / width);
    tiltY.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // Navigations with Haptic clicks
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20); // short tactile click
    }
  };

  const nextPage = useCallback(() => {
    if (currentPage < timelineData.length - 1) {
      triggerHaptic();
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, timelineData.length]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      triggerHaptic();
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const currentItem = timelineData[currentPage];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 flex flex-col items-center select-none">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1A1A] dark:text-[#EDE8E0] font-sans"
      >
        {t("حاجات مستحيل تضيع 💛")}
      </motion.h2>

      {/* 3D Flipbook Book Case */}
      <div 
        className="relative w-full aspect-[4/3] max-w-2xl min-h-[380px] sm:min-h-[440px] flex items-center justify-center"
        style={{ perspective: "1500px" }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (dir) => ({
                rotateY: dir > 0 ? 45 : -45,
                opacity: 0,
                scale: 0.95
              }),
              center: {
                rotateY: 0,
                opacity: 1,
                scale: 1,
                transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] }
              },
              exit: (dir) => ({
                rotateY: dir > 0 ? -45 : 45,
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] }
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              rotateX, 
              rotateY, 
              transformStyle: "preserve-3d",
              transformOrigin: "center center"
            }}
            className="w-full h-full flex flex-col md:flex-row bg-[#F4F3EF]/75 dark:bg-[#141622]/85 backdrop-blur-3xl border border-[#1A1A1A]/10 dark:border-[#C9956C]/15 shadow-[0_30px_70px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.7)] rounded-[2.5rem] overflow-hidden"
          >
            {/* Left Page/Panel (The Photo with Scratch/Glow) */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 flex items-center justify-center relative bg-black/5 dark:bg-black/20">
              {currentItem.image ? (
                <ScratchToReveal 
                  src={currentItem.image} 
                  alt={`Memory ${currentPage + 1}`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full rounded-[1.5rem] bg-[#FAF8F3] dark:bg-[#1C1F30] border border-[#1A1A1A]/5 dark:border-white/5 flex flex-col items-center justify-center text-[#9C8E7E] p-8 text-center shadow-inner">
                  <Heart size={36} className="text-[var(--accent)] animate-pulse mb-3" />
                  <p className="text-xs font-semibold uppercase tracking-wider">{t("لحظة عاطفية غالية")}</p>
                </div>
              )}
            </div>

            {/* Center Spine Divider Line (For Realistic Book Feel) */}
            <div className="hidden md:block absolute top-0 bottom-0 start-1/2 w-[1px] bg-gradient-to-b from-[#1A1A1A]/10 via-[#1A1A1A]/20 to-[#1A1A1A]/10 dark:from-white/5 dark:via-white/10 dark:to-white/5 z-20 shadow-[inset_-1px_0_4px_rgba(0,0,0,0.15)]" />

            {/* Right Page/Panel (Text & Love Icon) */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 flex flex-col justify-between relative bg-white/40 dark:bg-[#1C1F30]/40">
              {/* Header inside page */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tracking-widest text-[var(--accent)]">
                  {t("ذكرى رقم")} {currentPage + 1}
                </span>
                <Heart size={16} fill="var(--accent)" className="text-[var(--accent)]" />
              </div>

              {/* Memory Paragraph */}
              <div className="my-auto py-4">
                <p className="text-base sm:text-lg font-medium leading-relaxed text-[#1A1A1A] dark:text-[#EDE8E0] text-center md:text-start">
                  {t(currentItem.text)}
                </p>
              </div>

              {/* Page Number / Progress */}
              <div className="text-center md:text-end text-[10px] sm:text-xs font-bold text-[#8A7E72] dark:text-[#A89E90]">
                {currentPage + 1} / {timelineData.length}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating 3D Page Turn Indicators (Side buttons) */}
        {currentPage > 0 && (
          <button
            onClick={prevPage}
            type="button"
            className="absolute top-1/2 -start-12 -translate-y-1/2 z-30 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#141622]/90 border border-[#1A1A1A]/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#EDE8E0] shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all focus-visible:outline-none"
            aria-label="Previous Page"
          >
            <ChevronLeft size={20} className="rtl:rotate-180" />
          </button>
        )}
        {currentPage < timelineData.length - 1 && (
          <button
            onClick={nextPage}
            type="button"
            className="absolute top-1/2 -end-12 -translate-y-1/2 z-30 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#141622]/90 border border-[#1A1A1A]/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#EDE8E0] shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all focus-visible:outline-none"
            aria-label="Next Page"
          >
            <ChevronRight size={20} className="rtl:rotate-180" />
          </button>
        )}
      </div>

      {/* Progress Dots Bar */}
      <div className="mt-8 flex gap-2">
        {timelineData.map((_, idx) => (
          <div 
            key={idx}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: idx === currentPage ? "24px" : "6px",
              backgroundColor: idx === currentPage ? "var(--accent)" : "rgba(180, 165, 140, 0.3)"
            }}
          />
        ))}
      </div>

      {/* Next Stage Confirmation Button */}
      {currentPage === timelineData.length - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onNext();
            }}
            className="rounded-full bg-[#1A1A1A] dark:bg-[#EDE8E0] px-8 py-3.5 text-sm font-bold text-[#F4F3EF] dark:text-[#1A1510] shadow-md hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] hover:text-white dark:hover:text-white transition-all cursor-pointer transform hover:scale-105 active:scale-95 focus-visible:outline-none"
          >
            {t("دخلنا على الجد؟ 🫣")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
