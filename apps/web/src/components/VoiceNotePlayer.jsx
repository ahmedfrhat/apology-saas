import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Play, Pause, Volume2 } from "lucide-react";

export default function VoiceNotePlayer({ url }) {
  const { playMusic, pauseMusic, t } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  // Fallback voice note URL
  const audioUrl = url || "/default_voicenote.mp3";

  // Create a static premium waveform height map (25 bars)
  const waveHeights = [
    30, 45, 60, 40, 25, 50, 75, 90, 80, 55, 
    30, 45, 60, 75, 40, 25, 50, 70, 85, 90, 
    60, 45, 30, 20, 15
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
      // Resume background music when voice note ends
      playMusic();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      cancelAnimationFrame(animationRef.current);
    };
  }, [playMusic]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      // Resume background music when voice note is paused
      playMusic();
    } else {
      // Pause background music before playing voice note
      pauseMusic();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Failed to play voice note:", e);
      });
    }
  };

  const handleWaveformClick = (e, index) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    const newPercent = index / waveHeights.length;
    audio.currentTime = newPercent * duration;
    setCurrentTime(audio.currentTime);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="mt-8 flex flex-col items-center w-full max-w-md mx-auto p-5 rounded-3xl border border-rose-200/20 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-md shadow-inner">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <div className="w-full flex items-center justify-between gap-4">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md transition-all active:scale-95"
          aria-label={isPlaying ? t("إيقاف مؤقت") : t("تشغيل التسجيل الصوتي")}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
        </button>

        {/* Dynamic Waveform representation */}
        <div className="flex-1 flex items-center justify-between gap-1 h-16 select-none">
          {waveHeights.map((h, i) => {
            const barProgress = i / waveHeights.length;
            const currentProgress = duration > 0 ? currentTime / duration : 0;
            const isPlayed = barProgress <= currentProgress;

            return (
              <button
                key={i}
                type="button"
                onClick={(e) => handleWaveformClick(e, i)}
                className="flex-1 h-full flex items-center justify-center cursor-pointer outline-none focus:scale-y-110 transition-transform"
                style={{ height: `${h}%` }}
              >
                <div 
                  className={`w-full h-full rounded-full transition-colors duration-150 ${
                    isPlayed 
                      ? "bg-rose-600 dark:bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.4)]" 
                      : "bg-rose-200 dark:bg-rose-900/60"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Speaker Indicator */}
        <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full border border-rose-200/30 text-rose-600 dark:text-rose-400">
          <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
        </div>
      </div>

      {/* Time Display */}
      <div className="w-full mt-2 flex justify-between text-[10px] font-mono font-bold text-rose-500 dark:text-rose-400/80 px-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
