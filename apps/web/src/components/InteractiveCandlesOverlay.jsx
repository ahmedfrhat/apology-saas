import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, RotateCcw, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * InteractiveCandlesOverlay — Futuristic Interactive Candlelight Ecosystem (2026 Enterprise)
 * Features:
 *  - 6 magnificent realistic 3D wax candles (3 on the left side, 3 on the right side).
 *  - Tri-Theme detection: only active when Candlelight mode is selected.
 *  - Interactive Extinguish: Clicking a candle plays a synthesized Web Audio breath sound,
 *    extinguishes the dancing flame, and launches an elegant rising smoke trail.
 *  - Ambient Dimming Engine: Extinguishing all 6 candles smoothly transitions the global screen
 *    illumination into an incredibly intimate, ultra-cozy romantic dim glow.
 */
export default function InteractiveCandlesOverlay() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { locale, t } = useLanguage();
  
  // 6 Interactive candle slots: 0 to 5
  // false = active flame | true = blown out
  const [extinguished, setExtinguished] = useState([false, false, false, false, false, false]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synthesized pure Web Audio API soft blowout/breath sound (Zero MP3 files!)
  const playBlowoutSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // White noise buffer for gentle breath
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Filter to shape white noise into soft Whoosh
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);
      filter.Q.setValueAtTime(2, ctx.currentTime);

      // Gain envelope for smooth decay
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch (err) {}
  }, []);

  const handleExtinguishCandle = (index) => {
    if (extinguished[index]) return; // already blown out
    playBlowoutSound();
    setExtinguished((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const handleRelightAll = () => {
    setExtinguished([false, false, false, false, false, false]);
  };

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  if (currentTheme !== "candlelight") return null;

  const activeCandlesCount = extinguished.filter((st) => !st).length;
  const isCompletelyDim = activeCandlesCount === 0;

  // Left side indices: 0, 1, 2 | Right side indices: 3, 4, 5
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] select-none font-mono">
      
      {/* 1. MASTER AMBIENT DIMMING OVERLAY (Ultra-cozy intimate dimming when all extinguished) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isCompletelyDim ? 0.78 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0 bg-black pointer-events-none z-10"
      />

      {/* 2. COMPLETely DIMMED POETIC TOAST BANNER */}
      <AnimatePresence>
        {isCompletelyDim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute top-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto bg-[#2E1E12]/90 backdrop-blur-2xl border-2 border-[#DFBA73]/50 px-8 py-4 rounded-full shadow-[0_0_50px_rgba(223,186,115,0.4)] flex items-center gap-3 text-[#F5EBE1]"
          >
            <Sparkles size={20} className="text-[#DFBA73] animate-spin" />
            <span className="text-xs sm:text-sm font-black tracking-wide font-sans">
              {locale === "en" 
                ? "🕯️ You extinguished every candle.. Yet the warmth of your love illuminates the dark 💖" 
                : "🕯️ أطفأت كل الشموع.. وبقي نور حبكم يضيء العتمة 💖"}
            </span>
            <button
              onClick={handleRelightAll}
              className="ml-3 px-4 py-1.5 rounded-full bg-[#DFBA73] text-[#24170D] font-black text-xs hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 cursor-pointer font-mono"
            >
              <RotateCcw size={13} />
              <span>{locale === "en" ? "Relight" : "إشعال"}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. LEFT CANDLES COLUMN (Slots 0, 1, 2) */}
      <div className="absolute left-3 sm:left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-10 sm:gap-14 z-30 pointer-events-auto">
        {[0, 1, 2].map((slotIndex) => {
          const isBlown = extinguished[slotIndex];
          return (
            <div key={slotIndex} className="relative flex flex-col items-center group cursor-pointer" onClick={() => handleExtinguishCandle(slotIndex)}>
              
              {/* Flame Display / Smoke Wisp */}
              <div className="h-10 flex items-end justify-center relative">
                <AnimatePresence mode="wait">
                  {!isBlown ? (
                    <motion.div
                      key="flame"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.15, 0.95, 1.08, 1] }}
                      exit={{ scale: 0, y: -10, opacity: 0 }}
                      transition={{ scale: { repeat: Infinity, duration: 1.8 + slotIndex * 0.3 } }}
                      className="origin-bottom text-amber-400 drop-shadow-[0_0_12px_#F59E0B]"
                    >
                      <Flame size={32} className="fill-amber-500 text-amber-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="smoke"
                      initial={{ y: 0, opacity: 0.8, scale: 0.8 }}
                      animate={{ y: -35, opacity: 0, scale: 1.5, x: (slotIndex % 2 === 0 ? 15 : -15) }}
                      transition={{ duration: 1.6 }}
                      className="absolute bottom-0 text-gray-400 font-black text-sm select-none pointer-events-none"
                    >
                      〰
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Realistic 3D Wax Stick */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-6 sm:w-8 h-20 sm:h-28 rounded-t-lg bg-gradient-to-b from-amber-200 via-amber-500 to-[#3B2718] border border-amber-300/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative flex flex-col items-center overflow-hidden"
              >
                {/* Molten wax pool at top */}
                <div className="w-full h-2 bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 rounded-t-lg opacity-80" />
                {/* Wax drip */}
                <div className="absolute top-2 left-1.5 w-1 h-6 bg-amber-300/60 rounded-full" />
                
                {/* Interactive Wick */}
                <div className="absolute -top-1.5 w-1 h-2 bg-[#24170D] rounded-full" />
              </motion.div>

              {/* Click to Blow Out Tooltip Badge */}
              <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#24170D] text-[#DFBA73] text-[10px] px-2 py-0.5 rounded border border-[#DFBA73]/40 whitespace-nowrap shadow-md">
                {locale === "en" ? "Click to Blow Out" : "اضغط لإطفاء الشمعة"}
              </span>

            </div>
          );
        })}
      </div>

      {/* 4. RIGHT CANDLES COLUMN (Slots 3, 4, 5) */}
      <div className="absolute right-3 sm:right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-10 sm:gap-14 z-30 pointer-events-auto">
        {[3, 4, 5].map((slotIndex) => {
          const isBlown = extinguished[slotIndex];
          return (
            <div key={slotIndex} className="relative flex flex-col items-center group cursor-pointer" onClick={() => handleExtinguishCandle(slotIndex)}>
              
              {/* Flame Display / Smoke Wisp */}
              <div className="h-10 flex items-end justify-center relative">
                <AnimatePresence mode="wait">
                  {!isBlown ? (
                    <motion.div
                      key="flame"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.1, 0.98, 1.12, 1] }}
                      exit={{ scale: 0, y: -10, opacity: 0 }}
                      transition={{ scale: { repeat: Infinity, duration: 1.6 + slotIndex * 0.25 } }}
                      className="origin-bottom text-amber-400 drop-shadow-[0_0_12px_#F59E0B]"
                    >
                      <Flame size={32} className="fill-amber-500 text-amber-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="smoke"
                      initial={{ y: 0, opacity: 0.8, scale: 0.8 }}
                      animate={{ y: -35, opacity: 0, scale: 1.5, x: (slotIndex % 2 === 0 ? -15 : 15) }}
                      transition={{ duration: 1.6 }}
                      className="absolute bottom-0 text-gray-400 font-black text-sm select-none pointer-events-none"
                    >
                      〰
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Realistic 3D Wax Stick */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-6 sm:w-8 h-20 sm:h-28 rounded-t-lg bg-gradient-to-b from-amber-200 via-amber-500 to-[#3B2718] border border-amber-300/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative flex flex-col items-center overflow-hidden"
              >
                {/* Molten wax pool at top */}
                <div className="w-full h-2 bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 rounded-t-lg opacity-80" />
                {/* Wax drip */}
                <div className="absolute top-2 right-1.5 w-1 h-5 bg-amber-300/60 rounded-full" />
                
                {/* Interactive Wick */}
                <div className="absolute -top-1.5 w-1 h-2 bg-[#24170D] rounded-full" />
              </motion.div>

              {/* Click to Blow Out Tooltip Badge */}
              <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#24170D] text-[#DFBA73] text-[10px] px-2 py-0.5 rounded border border-[#DFBA73]/40 whitespace-nowrap shadow-md">
                {locale === "en" ? "Click to Blow Out" : "اضغط لإطفاء الشمعة"}
              </span>

            </div>
          );
        })}
      </div>

    </div>
  );
}
