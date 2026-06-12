import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * InteractiveCandlesOverlay — Tri-Theme 4-Corner Interactive Candlelight Ecosystem (Enterprise 2026)
 * Features:
 *  - 4 elegant, compact Tri-Theme candles placed precisely in the 4 corners of the viewport.
 *  - Proportional Screen Dimming: Every time a candle is extinguished, a seamless overlay
 *    increases its opacity proportional to the remaining lit candles (0% -> 22% -> 45% -> 68% -> 88%).
 *  - Bidirectional Interactivity: Clicking an extinguished candle re-lights it, smoothly restoring the illumination step by step.
 *  - Atmospheric Flame Glow: A magnificent glowing halo surrounds each lit candle.
 *  - Synthesized Web Audio sound for soft breath/blow Whoosh and a warm chime when re-lighting.
 *  - Auto-Dismiss Toast: When the final 4th candle is extinguished, the poetic celebration message
 *    mounts, glimmers for exactly 4.5 seconds, and automatically unmounts.
 */
export default function InteractiveCandlesOverlay() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { locale } = useLanguage();
  
  // 4 Corner Candle states: indices 0, 1, 2, 3
  // false = lit flame | true = blown out
  const [extinguished, setExtinguished] = useState([false, false, false, false]);
  
  // Auto-dismiss poetic toast state
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Soft breath/extinguish Whoosh Web Audio synthesizer
  const playBlowoutSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.33);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch (err) {}
  }, []);

  // Soft magical chime when re-lighting a candle
  const playRelightSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (err) {}
  }, []);

  // Auto-dismiss toast logic when the 4th candle gets blown out
  useEffect(() => {
    const activeCount = extinguished.filter((st) => !st).length;
    if (activeCount === 0) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4500);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [extinguished]);

  const handleToggleCandle = (index) => {
    const isBlown = extinguished[index];
    if (!isBlown) {
      playBlowoutSound();
    } else {
      playRelightSound();
    }
    setExtinguished((prev) => {
      const next = [...prev];
      next[index] = !isBlown;
      return next;
    });
  };

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  if (currentTheme !== "candlelight") return null;

  // Calculate proportional dimming opacity
  const litCandlesCount = extinguished.filter((st) => !st).length;
  let dimOpacity = 0;
  if (litCandlesCount === 3) dimOpacity = 0.24;
  else if (litCandlesCount === 2) dimOpacity = 0.48;
  else if (litCandlesCount === 1) dimOpacity = 0.72;
  else if (litCandlesCount === 0) dimOpacity = 0.88; // incredibly cozy dim

  // 4 precisely calculated corner positions
  const CORNER_POSITIONS = [
    { id: "top-left", class: "top-20 left-4 sm:left-8", label: locale === "en" ? "Top Left Flame" : "الشمعة العلوية اليسرى" },
    { id: "top-right", class: "top-20 right-4 sm:right-8", label: locale === "en" ? "Top Right Flame" : "الشمعة العلوية اليمنى" },
    { id: "bottom-left", class: "bottom-8 left-4 sm:left-8", label: locale === "en" ? "Bottom Left Flame" : "الشمعة السفلية اليسرى" },
    { id: "bottom-right", class: "bottom-8 right-4 sm:right-8", label: locale === "en" ? "Bottom Right Flame" : "الشمعة السفلية اليمنى" }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] select-none font-mono">
      
      {/* 1. MASTER PROPORTIONAL AMBIENT DIMMING OVERLAY */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: dimOpacity }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 bg-black pointer-events-none z-10"
      />

      {/* 2. AUTO-DISMISS CELEBRATION TOAST BANNER */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute top-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto bg-[#2E1E12]/95 backdrop-blur-3xl border-2 border-[#DFBA73] px-8 py-4.5 rounded-full shadow-[0_0_60px_rgba(223,186,115,0.6)] flex items-center gap-3 text-[#F5EBE1] max-w-xl text-center"
          >
            <Sparkles size={22} className="text-[#DFBA73] animate-spin flex-shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-wide font-sans">
              {locale === "en" 
                ? "🕯️ All candles softly extinguished.. Only the radiant light of your love remains 💖" 
                : "🕯️ أطفأت كل الشموع.. وبقي نور حبكم يضيء العتمة 💖"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. THE 4 CORNER COMPACT CANDLES */}
      {CORNER_POSITIONS.map((corner, index) => {
        const isBlown = extinguished[index];
        return (
          <div 
            key={corner.id} 
            onClick={() => handleToggleCandle(index)}
            className={`absolute ${corner.class} flex flex-col items-center group cursor-pointer pointer-events-auto z-30 transition-transform active:scale-95`}
          >
            
            {/* Atmospheric Glowing Flame & Fire Halo / Rising Smoke Wisp */}
            <div className="h-10 flex items-end justify-center relative">
              <AnimatePresence mode="wait">
                {!isBlown ? (
                  <motion.div
                    key="flame"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.15, 0.96, 1.1, 1] }}
                    exit={{ scale: 0, y: -5, opacity: 0 }}
                    transition={{ scale: { repeat: Infinity, duration: 1.5 + index * 0.2 } }}
                    className="origin-bottom text-amber-400 relative flex items-center justify-center"
                  >
                    {/* Fire Halo / Glow behind flame */}
                    <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500/50 via-rose-500/30 to-transparent animate-pulse filter blur-md -z-10" />
                    
                    <Flame size={26} className="fill-amber-500 text-amber-200 drop-shadow-[0_0_12px_#F59E0B]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="smoke"
                    initial={{ y: 0, opacity: 0.8, scale: 0.9 }}
                    animate={{ y: -30, opacity: 0, scale: 1.4, x: (index % 2 === 0 ? 12 : -12) }}
                    transition={{ duration: 1.2 }}
                    className="absolute bottom-0 text-gray-400 font-extrabold text-xs select-none pointer-events-none"
                  >
                    〰
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Compact 3D Realistic Wax Stick */}
            <motion.div 
              whileHover={{ scale: 1.08 }}
              className="w-5 sm:w-6 h-12 sm:h-14 rounded-t-md bg-gradient-to-b from-amber-200 via-amber-500 to-[#3B2718] border border-amber-300/50 shadow-[0_5px_20px_rgba(0,0,0,0.9)] relative flex flex-col items-center overflow-hidden mt-0.5"
            >
              {/* Molten wax pool at top */}
              <div className="w-full h-1.5 bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 rounded-t-md opacity-85" />
              {/* Wax drip */}
              <div className="absolute top-1.5 left-1 w-1 h-4 bg-amber-300/70 rounded-full" />
              
              {/* Central Wick */}
              <div className="absolute -top-1 w-0.5 h-1.5 bg-[#24170D] rounded-full" />
            </motion.div>

            {/* Subtle Tooltip Label */}
            <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#24170D] text-[#DFBA73] text-[9px] px-2 py-0.5 rounded border border-[#DFBA73]/40 whitespace-nowrap shadow-md pointer-events-none">
              {!isBlown ? (locale === "en" ? "Click to Extinguish" : "اضغط لإطفاء الشمعة") : (locale === "en" ? "Click to Re-light" : "اضغط لإشعال الشمعة")}
            </span>

          </div>
        );
      })}

    </div>
  );
}
