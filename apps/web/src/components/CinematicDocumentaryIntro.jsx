import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, FastForward, AlertCircle, ArrowRight, ShieldAlert, CheckCircle2, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * CinematicDocumentaryIntro — Breathtaking Short Documentary Reel Hook (Enterprise 2026)
 * Features:
 *  - High-drama 4-scene HTML5/Motion cinematic reel that plays on initial landing.
 *  - Scene 1: The Tense Brink of Loss (A heart-stopping relationship dispute where they are about to lose each other).
 *  - Scene 2: The Fast Race Against Time (Accessing Safi.io quickly to craft a personalized miracle link).
 *  - Scene 3: The Royal Breakdown & Ultimate Re-connection.
 *  - Synthesized Web Audio sub-bass heartbeat thumps and sweeping success chords (Zero buffering, 60 FPS).
 *  - Persistence: Saves "safi_documentary_watched" in localStorage to instantly bypass returning visitors.
 *  - Seamless Gateway: Smoothly crossfades into the core Enterprise SaaS website.
 */
export default function CinematicDocumentaryIntro({ onFinishIntro }) {
  const { locale, t } = useLanguage();
  const [sceneIndex, setSceneIndex] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play synthesized Web Audio dramatic heartbeat thump
  const playHeartbeatThump = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playThump = (timeOffset, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + timeOffset + duration);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + duration);
      };

      // Double thump simulating adrenaline heartbeat
      playThump(0, 110, 0.2);
      playThump(0.25, 140, 0.25);
    } catch (err) {}
  }, [soundEnabled]);

  // Synthesized dramatic success orchestral swell
  const playSuccessSwell = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playChord = (freq, delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 1.5);
      };

      // Majestic royal success chord
      playChord(261.63, 0);   // C4
      playChord(329.63, 0.05);// E4
      playChord(392.00, 0.1); // G4
      playChord(523.25, 0.15);// C5
    } catch (err) {}
  }, [soundEnabled]);

  // Auto advance documentary scenes
  useEffect(() => {
    if (sceneIndex === 1) {
      playHeartbeatThump();
      const timer = setTimeout(() => setSceneIndex(2), 3800);
      return () => clearTimeout(timer);
    } else if (sceneIndex === 2) {
      playHeartbeatThump();
      const timer = setTimeout(() => setSceneIndex(3), 3800);
      return () => clearTimeout(timer);
    } else if (sceneIndex === 3) {
      playSuccessSwell();
      const timer = setTimeout(() => setSceneIndex(4), 4000);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex, playHeartbeatThump, playSuccessSwell]);

  const handleExecuteSkip = () => {
    localStorage.setItem("safi_documentary_watched", "true");
    onFinishIntro();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      
      {/* 1. TOP HEADER BRANDING & INTERACTIVE SKIP BTN */}
      <div className="flex items-center justify-between z-30 relative w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-mono font-black text-lg sm:text-xl tracking-tight text-amber-500">
          <Heart size={24} className="animate-pulse fill-amber-500" />
          <span>Safi.io Reel 🎬</span>
        </div>

        <button
          onClick={handleExecuteSkip}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 border border-white/15 cursor-pointer shadow-lg backdrop-blur-md"
        >
          <span>{locale === "en" ? "Skip Cinematic Reel ⏩" : "تخطي العرض السينمائي ⏩"}</span>
          <FastForward size={14} />
        </button>
      </div>

      {/* 2. MASTER DOCUMENTARY CINEMATIC STAGES */}
      <div className="flex-1 flex items-center justify-center relative z-20 w-full max-w-4xl mx-auto my-auto p-4 sm:p-8">
        <AnimatePresence mode="wait">

          {/* SCENE 1: THE BRINK OF LOSS */}
          {sceneIndex === 1 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center space-y-8 max-w-2xl"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_80px_rgba(239,68,68,0.3)] animate-pulse">
                <ShieldAlert size={48} />
              </div>
              
              <div className="space-y-4">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">
                  {locale === "en" ? "Documentary Chapter I : Tense Brink" : "المشهد التوثيقي 1 : اللحظة الصعبة"}
                </span>
                <h2 className="text-2xl sm:text-4xl sm:leading-relaxed font-black tracking-tight leading-snug">
                  {locale === "en" 
                    ? "Sometimes, minor misunderstandings escalate to the moment we all dread.."
                    : "أحياناً.. تقودنا خلافات صغيرة إلى اللحظة التي نخشاها جميعاً.. 💔"}
                </h2>
              </div>

              {/* High-drama WhatsApp visual Zoom */}
              <div className="p-6 rounded-3xl bg-[#111827] border border-red-500/30 shadow-2xl max-w-lg w-full text-end space-y-2" dir="rtl">
                <span className="text-[10px] font-mono text-red-400 font-black block">رسالة حاسمة من شريكتك (11:15 PM):</span>
                <p className="text-xs sm:text-sm font-extrabold text-gray-100 leading-relaxed font-sans">
                  "خلاص يا أحمد.. أنا تعبت ومبقاش عندي طاقة نكمل.. كل واحد يروح لحاله."
                </p>
              </div>
            </motion.div>
          )}

          {/* SCENE 2: THE FAST RACE AGAINST TIME */}
          {sceneIndex === 2 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center space-y-8 max-w-2xl"
            >
              <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.3)] animate-spin">
                <Sparkles size={48} />
              </div>
              
              <div className="space-y-4">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-amber-400 font-black">
                  {locale === "en" ? "Documentary Chapter II : The Instigation" : "المشهد التوثيقي 2 : سباق الأنفاس الأخيرة"}
                </span>
                <h2 className="text-2xl sm:text-4xl sm:leading-relaxed font-black tracking-tight leading-snug">
                  {locale === "en" 
                    ? "Standard dry texts won't save the bond.. You need a spectacular miracle you craft yourself.."
                    : "الكلمات العادية لن تنقذ الموقف.. أنت تحتاج لمعجزة رومانسية تصنعها بنفسك وبسرعة! ⏱️"}
                </h2>
              </div>

              <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-black shadow-2xl space-y-2">
                <p className="leading-relaxed">⚡ البطل يفتح منصة Safi.io بسرعة الصاروخ، يرفع أجمل صورة تجمعهم، يكتب وعوداً صادقة من القلب، ويحضر قاضي الذكاء الاصطناعي والمحكمة التفاعلية!</p>
              </div>
            </motion.div>
          )}

          {/* SCENE 3: THE ROYAL BREAKTHROUGH */}
          {sceneIndex === 3 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center space-y-8 max-w-2xl"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center text-green-400 shadow-[0_0_90px_rgba(74,222,128,0.5)]">
                <CheckCircle2 size={52} />
              </div>
              
              <div className="space-y-4">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-green-400 font-black">
                  {locale === "en" ? "Documentary Chapter III : The Miracle" : "المشهد التوثيقي 3 : المعجزة الملكية"}
                </span>
                <h2 className="text-2xl sm:text-4xl sm:leading-relaxed font-black tracking-tight leading-snug">
                  {locale === "en" 
                    ? "She unlocks your royal envelope. Cold ice instantly melts into an authentic, beautiful smile 🥰"
                    : "الملكة تفتح الرابط الملكي.. الجليد يذوب فوراً، تتحول الدموع إلى ضحكة لطيفة ومصالحة شاملة 100%! 🥰👑"}
                </h2>
              </div>

              <div className="p-5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-black text-gray-200 px-8 shadow-inner">
                {locale === "en" ? "✨ Re-connection fully established by Safi.io Emotional Engine" : "✨ تم إنقاذ العلاقة وتصفية القلوب بنجاح عبر محرك Safi.io العاطفي"}
              </div>
            </motion.div>
          )}

          {/* SCENE 4: THE REUNION & GATEWAY */}
          {sceneIndex === 4 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center space-y-8 max-w-2xl"
            >
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-[#B45309] flex items-center justify-center text-white shadow-[0_0_100px_rgba(245,158,11,0.7)] animate-bounce">
                <Heart size={56} fill="currentColor" />
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {locale === "en" ? "Never lose your beloved entity.. ❤️" : "لا تخسر من تحب.. اصنع معجزتك الآن! 🪄"}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed font-medium">
                {locale === "en" 
                  ? "Launch into our spectacular premium platform instantly and craft her dedicated dynamic apology link complete with secret passcodes and real-time operations."
                  : "ادخل الآن إلى منصة Safi.io الملكية وابني لها موقع مصالحة مخصص يحمل اسمها ورحلة حبكم في ثوانٍ مجاناً!"}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExecuteSkip}
                className="w-full sm:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-[#B45309] text-white font-black text-base sm:text-lg transition-all shadow-2xl shadow-amber-600/40 flex items-center justify-center gap-3 cursor-pointer font-mono"
              >
                <span>{locale === "en" ? "Enter Safi.io SaaS Application Portal 🚀" : "⏩ ادخل إلى منصة Safi.io واصنع رابط المصالحة 🚀"}</span>
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 3. BOTTOM CINEMATIC PROGRESS BAR & POETIC TOAST */}
      <div className="w-full max-w-7xl mx-auto space-y-4 z-30 relative">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono font-bold">
          <span>{locale === "en" ? "Automated Cinematic Reel" : "العرض التوثيقي التلقائي"}</span>
          <span>Chapter {sceneIndex} / 4</span>
        </div>
        
        {/* Progress Display */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(sceneIndex / 4) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

    </div>
  );
}
