import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Music, Play, Pause } from "lucide-react";

export default function AudioController() {
  const { 
    audioPlaying, 
    toggleMusic, 
    playMusic,
    t, 
    config, 
    currentTrackUrl, 
    setCurrentTrackUrl 
  } = useApp();
  
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Subtle click haptic
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    triggerHaptic();
    toggleMusic();
  };

  const defaultSoundtracks = [
    { name: t("لحن الرومانسية الهادئ 🎵"), url: "/bq-music.m4a" },
    { name: t("عزف عود شرقي دافئ 🎻"), url: "https://www.youtube.com/watch?v=k8X0_d88v4U" },
    { name: t("صوت مطر هادئ للنوم 🌧️"), url: "https://www.youtube.com/watch?v=mPZkdNFkNps" }
  ];

  const playlist = config?.soundtracks && Array.isArray(config.soundtracks) && config.soundtracks.length > 0
    ? config.soundtracks
    : defaultSoundtracks;

  const activeUrl = currentTrackUrl || config?.audioUrl || config?.audio_url || "/bq-music.m4a";

  const handleSelectTrack = (url) => {
    triggerHaptic();
    setCurrentTrackUrl(url);
    if (!audioPlaying) {
      playMusic();
    }
  };

  return (
    <div className="fixed bottom-4 end-4 z-[80] flex flex-col items-end gap-2">
      {/* Playlist Popover */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-64 rounded-2xl border border-black/10 dark:border-white/10 bg-[#F4F3EF]/90 dark:bg-[#141622]/90 backdrop-blur-xl p-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-start select-none"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7E72] dark:text-[#A89E90] mb-2 px-1">
              {t("قائمة التشغيل 🎵")}
            </p>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              {playlist.map((track, idx) => {
                const isActive = track.url === activeUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTrack(track.url)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer text-start transition-all ${
                      isActive 
                        ? "bg-[#DFBA73]/20 text-[#1A1A1A] dark:text-white border border-[#DFBA73]/30" 
                        : "text-[#5A5955] dark:text-[#A89E90] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate max-w-[180px]">{t(track.name)}</span>
                    {isActive && audioPlaying ? (
                      <span className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 bg-[var(--accent)] animate-[music-wave_0.6s_ease-in-out_infinite_alternate]" />
                        <span className="w-0.5 h-2 bg-[var(--accent)] animate-[music-wave_0.8s_ease-in-out_infinite_alternate]" style={{ animationDelay: "0.2s" }} />
                        <span className="w-0.5 h-1 bg-[var(--accent)] animate-[music-wave_0.5s_ease-in-out_infinite_alternate]" style={{ animationDelay: "0.4s" }} />
                      </span>
                    ) : (
                      <Play size={10} className="opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* Playlist Toggle Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setShowPlaylist(!showPlaylist);
          }}
          aria-label={t("قائمة الموسيقى")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/80 dark:bg-[#141622]/80 backdrop-blur-md shadow-md text-[#5A5955] dark:text-[#EDE8E0] cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <Music size={16} />
        </button>

        {/* Main Play/Pause Vinyl Button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={audioPlaying ? t("إيقاف الموسيقى") : t("تشغيل الموسيقى")}
          className={`flex h-14 w-14 items-center justify-center rounded-full border border-black/25 shadow-[0_10px_25px_rgba(0,0,0,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2 transition-transform active:scale-95 vinyl-record ${audioPlaying ? 'vinyl-play' : 'vinyl-pause'}`}
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
      </div>
    </div>
  );
}
