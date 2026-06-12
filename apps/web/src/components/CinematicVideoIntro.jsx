import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FastForward, Volume2, VolumeX, Heart, Play, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * CinematicVideoIntro — Enterprise Genuine MP4 Documentary Intro Hook (2026 Engine)
 * Plays an authentic cinematic real video (.mp4 / .webm) depicting the relational crisis
 * and how Safi.io magically rescues the bond.
 * 
 * Features:
 *  - HTML5 fully accelerated `<video>` player with `playsInline`, `autoplay`, and custom audio toggling.
 *  - Persistence Engine: Instantly saves "safi_real_video_watched" in localStorage upon watch or skip.
 *  - Responsive Super-Overlay: Poetic premium headers and effortless persistence routing.
 *  - Gateway Crossfade: Seamlessly fades out to reveal the pristine underlying core application.
 */
export default function CinematicVideoIntro({ videoSrc = "/documentary.mp4", onFinishIntro }) {
  const { locale } = useLanguage();
  const [isMuted, setIsMuted] = useState(false); // start with sound active if browser allows, or unmuted
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const handleExecuteSkip = () => {
    localStorage.setItem("safi_real_video_watched", "true");
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onFinishIntro();
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  // If the video fails to load (e.g. file not uploaded yet), automatically execute skip
  // so the user isn't stuck on a black screen.
  const handleVideoError = () => {
    console.warn("Documentary video file unavailable or not linked yet. Automatically bypassing to main portal.");
    setVideoError(true);
    handleExecuteSkip();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col justify-between p-4 sm:p-8 select-none font-sans overflow-hidden">
      
      {/* 1. TOP CINEMATIC HEADER BRANDING & CONTROLS */}
      <header className="flex items-center justify-between z-30 relative w-full max-w-7xl mx-auto py-2">
        <div className="flex items-center gap-2.5 font-mono font-black text-lg sm:text-xl text-amber-500 bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <Heart size={22} className="animate-pulse fill-amber-500 text-amber-500" />
          <span>Safi.io Masterpiece 🎬</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all border border-white/15 cursor-pointer shadow-lg backdrop-blur-md"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-emerald-400" />}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleExecuteSkip}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-[#B45309] hover:opacity-90 active:scale-95 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 border border-white/20 cursor-pointer shadow-2xl backdrop-blur-md font-mono"
          >
            <span>{locale === "en" ? "Skip Video Intro ⏩" : "⏩ تخطي الفيديو التوثيقي"}</span>
            <FastForward size={16} />
          </button>
        </div>
      </header>

      {/* 2. THE AUTHENTIC HTML5 REAL VIDEO PLAYER */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black overflow-hidden pointer-events-auto">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          playsInline
          muted={isMuted}
          onEnded={handleExecuteSkip}
          onError={handleVideoError}
          className="w-full h-full object-cover sm:object-contain max-w-7xl max-h-screen mx-auto shadow-2xl"
        >
          Your browser does not support authentic HTML5 cinematic video streaming.
        </video>

        {/* Play fallback overlay if video gets paused */}
        {!isVideoPlaying && !videoError && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.play();
                setIsVideoPlaying(true);
              }
            }}
            className="absolute z-20 w-24 h-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border-2 border-white flex items-center justify-center text-white shadow-2xl cursor-pointer transition-transform active:scale-95"
          >
            <Play size={48} className="fill-white ms-1" />
          </button>
        )}
      </div>

      {/* 3. BOTTOM CINEMATIC POETIC CAPTION */}
      <footer className="z-30 relative w-full max-w-7xl mx-auto py-4 text-center pointer-events-none">
        <p className="text-xs sm:text-sm font-medium text-gray-300 bg-black/60 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md inline-block max-w-xl mx-auto leading-relaxed">
          {locale === "en"
            ? "● Cinematic Relational Rescue Pitch: Watch how Safi.io magically transforms disputes into beautiful love."
            : "● فيديو توثيقي حقيقي: شاهد كيف تحول منصة Safi.io الخناقات الصعبة إلى مصالحة ورضا تام بذكاء."}
        </p>
      </footer>

    </div>
  );
}
