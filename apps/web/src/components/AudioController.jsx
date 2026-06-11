import { useApp } from "@/context/AppContext";

export default function AudioController() {
  const { audioPlaying, toggleMusic, t } = useApp();

  // Subtle click haptic
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleToggle = () => {
    triggerHaptic();
    toggleMusic();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={audioPlaying ? t("إيقاف الموسيقى") : t("تشغيل الموسيقى")}
      className={`fixed bottom-4 end-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full border border-black/25 shadow-[0_10px_25px_rgba(0,0,0,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2 transition-transform active:scale-95 vinyl-record ${audioPlaying ? 'vinyl-play' : 'vinyl-pause'}`}
      style={{
        background: "repeating-radial-gradient(circle, #252525, #111111 2px, #252525 4px)",
      }}
    >
      {/* Vinyl Center Label (Rose Gold/Gold gradient) */}
      <div 
        className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-2)] text-[#1A1A1A] select-none"
        style={{
          boxShadow: "0 0 5px rgba(0,0,0,0.6), inset 0 0 3px rgba(255,255,255,0.4)",
        }}
      >
        <span className="text-[10px] leading-none">❤️</span>
        {/* Spindle Hole */}
        <div className="absolute h-1.5 w-1.5 rounded-full bg-[#FAF8F3] dark:bg-[#2E1E12] shadow-inner" />
      </div>

      {/* Stylized Tonearm Arm (overlay indicators) */}
      <div 
        className="absolute top-1 right-2 w-1.5 h-6 bg-white/20 rounded-full origin-top pointer-events-none transition-transform duration-500"
        style={{
          transform: audioPlaying ? "rotate(15deg)" : "rotate(-10deg)",
        }}
      />
    </button>
  );
}
