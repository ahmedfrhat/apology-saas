import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Heart, FastForward, AlertCircle, ArrowRight, ShieldAlert, 
  CheckCircle2, Lock, Eye, Zap, RefreshCw, Volume2, VolumeX, Flame 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * InteractiveCinematicStoryReel — Enterprise Highly Interactive Graphic Narrative Engine (2026 Engine)
 * Phenomenally replaces external MP4 video loops with an absolute 60 FPS interactive dopamine narrative:
 *  - Stage 1: The Relatable Interactive WhatsApp Tense Conversation (Click to dispatch text, instant passive-aggressive incoming reply).
 *  - Stage 2: Workbench Magnetic Charging Race (Hold to actively charge love signals & decrypt protocols).
 *  - Stage 3: Royal Biometric Decryption (Click fingerprint scanner to instantly unlock the royal envelope).
 *  - Stage 4: 5-Star Triumphant Gateway & absolute high-elegance CTA crossfade.
 */
export default function InteractiveCinematicStoryReel({ onFinishReel }) {
  const { locale, t } = useLanguage();
  
  // Stages: 1 (WhatsApp) | 2 (Hold to Charge) | 3 (Biometric Gate) | 4 (Payoff Gateway)
  const [stageIndex, setStageIndex] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Stage 1 interactive state
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [showThreatAlarm, setShowThreatAlarm] = useState(false);

  // Stage 2 Magnetic Charging state
  const [chargingProgress, setChargingProgress] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const chargingRef = useRef(null);

  // Stage 3 Fingerprint state
  const [fingerprintUnlocked, setFingerprintUnlocked] = useState(false);

  // Sound Synthesizers Web Audio API (Zero MP3 buffering)
  const playHeartbeatThump = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playThump = (offset, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + offset + 0.2);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.2);
      };
      playThump(0, 120);
      playThump(0.2, 150);
    } catch (err) {}
  }, [soundEnabled]);

  const playSynthBeep = useCallback((freq = 800, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {}
  }, [soundEnabled]);

  const playTriumphantSwell = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playNote = (freq, delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 1.2);
      };
      playNote(261.63, 0);   // C4
      playNote(329.63, 0.08);// E4
      playNote(392.00, 0.16);// G4
      playNote(523.25, 0.24);// C5
    } catch (err) {}
  }, [soundEnabled]);

  // Stage 1 Initial Heartbeat thump
  useEffect(() => {
    if (stageIndex === 1) {
      playHeartbeatThump();
    }
  }, [stageIndex, playHeartbeatThump]);

  // Stage 2 Magnetic Charging active loop
  useEffect(() => {
    if (!isCharging) return;
    chargingRef.current = setInterval(() => {
      setChargingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(chargingRef.current);
          setIsCharging(false);
          playSynthBeep(1200, 0.3);
          setTimeout(() => setStageIndex(3), 800);
          return 100;
        }
        playSynthBeep(400 + prev * 8, 0.05);
        return prev + 5;
      });
    }, 60);
    return () => clearInterval(chargingRef.current);
  }, [isCharging, playSynthBeep]);

  const handleExecuteBypass = () => {
    localStorage.setItem("safi_interactive_reel_watched", "true");
    onFinishReel();
  };

  const handleDispatchWhatsApp = () => {
    if (whatsappSent) return;
    playSynthBeep(600, 0.1);
    setWhatsappSent(true);
    setTimeout(() => {
      playSynthBeep(400, 0.2);
      setShowThreatAlarm(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-gradient-to-b from-[#11131E] via-[#090A10] to-[#05060A] text-white flex flex-col justify-between p-4 sm:p-8 select-none font-sans overflow-hidden">
      
      {/* 1. TOP HEADER BRANDING & SKIP CONTROL */}
      <header className="flex items-center justify-between z-30 relative w-full max-w-7xl mx-auto py-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5 font-mono font-black text-base sm:text-lg text-amber-400">
          <Flame size={22} className="animate-pulse text-amber-500 fill-amber-500" />
          <span>Safi.io Live Interactive Masterpiece 🎬</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
            title={soundEnabled ? "Mute Synthesizers" : "Unmute Synthesizers"}
          >
            {soundEnabled ? <Volume2 size={18} className="text-emerald-400" /> : <VolumeX size={18} className="text-rose-400" />}
          </button>

          <button
            onClick={handleExecuteBypass}
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 border border-white/20 cursor-pointer shadow-xl backdrop-blur-md font-mono"
          >
            <span>{locale === "en" ? "Skip Interactive Reel ⏩" : "⏩ تخطي المحاكاة التفاعلية"}</span>
            <FastForward size={14} />
          </button>
        </div>
      </header>

      {/* 2. MASTER STAGE SWITCHER PROGRESS PILLS */}
      <nav className="flex items-center justify-center gap-2.5 my-3 z-30 relative">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            onClick={() => {
              if (step === 3 && stageIndex < 2) return;
              if (step === 4 && !fingerprintUnlocked) return;
              setStageIndex(step);
            }}
            disabled={step > stageIndex + 1}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              stageIndex === step
                ? "w-20 bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                : "w-5 bg-white/20 hover:bg-white/40 disabled:bg-white/5 disabled:cursor-not-allowed"
            }`}
          />
        ))}
      </nav>

      {/* 3. MASTER INTERACTIVE CENTRAL ECOSYSTEM */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-20 w-full max-w-4xl mx-auto my-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">

          {/* STAGE 1: THE WHATSAPP DISPUTE */}
          {stageIndex === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg space-y-6 flex flex-col items-center"
            >
              <div className="text-center space-y-2">
                <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black text-xs border border-rose-500/30 inline-flex items-center gap-1.5 shadow-sm">
                  <ShieldAlert size={14} className="text-rose-400" />
                  <span>{locale === "en" ? "Interactive Act I : The Relationship Crisis" : "المشهد التفاعلي 1 : خناقة الواتساب الواقعية"}</span>
                </span>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
                  {locale === "en" ? "Trying traditional dry messaging 💬" : "محاولة الاعتذار التقليدي على الواتساب 💬"}
                </h2>
              </div>

              {/* Tense Relatable WhatsApp Chat Card */}
              <div className="w-full p-6 rounded-[2.5rem] bg-[#0B141A] border border-[#1F2C34] space-y-4 shadow-2xl font-sans" dir="rtl">
                
                {/* Initial Outgoing Boy Message */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-4 rounded-2xl rounded-tr-none bg-[#005C4B] text-white space-y-1.5 shadow-md">
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">يا مريومة حقك عليا والله الشغل كان فوق دماغي ونسيت ميعاد خروجتنا.. متزعليش 🥺</p>
                    <span className="text-[10px] text-green-200 block text-end font-mono font-bold">10:42 PM ✔✔</span>
                  </div>
                </div>

                {/* Clickable Action to trigger girl's reply */}
                {!whatsappSent ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDispatchWhatsApp}
                      className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-gray-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Zap size={16} className="fill-gray-950" />
                      <span>{locale === "en" ? "Click to Send Another Apology Text ⚡" : "⚡ اضغط هنا لإرسال رسالة اعتذار ثانية الآن"}</span>
                    </motion.button>
                    <span className="text-[11px] text-emerald-400 animate-pulse font-mono font-bold">
                      👆 {locale === "en" ? "Click button to participate live" : "اضغط بنفسك على الزرار لتشارك في المحاكاة"}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Secondary Sent Message */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-start">
                      <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-none bg-[#005C4B] text-white space-y-1 shadow">
                        <p className="text-xs sm:text-sm font-semibold">ردي عليا يا قلبي متسيبينيش قلقان كده.. 🤍</p>
                        <span className="text-[10px] text-green-200 block text-end font-mono font-bold">10:44 PM ✔✔</span>
                      </div>
                    </motion.div>

                    {/* Highly Dreaded Passive Aggressive Girl Reply */}
                    <AnimatePresence>
                      {showThreatAlarm && (
                        <motion.div initial={{ scale: 0, x: -20 }} animate={{ scale: 1, x: 0 }} className="flex justify-end pt-2">
                          <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-[#202C33] text-gray-100 space-y-1.5 shadow-lg border border-red-500/30">
                            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-rose-100">تمام يا أحمد. حصل خير. مفيش أي مشكلة. تصبح على خير.</p>
                            <span className="text-[10px] text-red-400 block text-end font-mono font-bold">10:45 PM ● Passive Aggressive Reply</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

              </div>

              {/* Threat Psychological Alarm Glitch Box */}
              {showThreatAlarm && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-5 rounded-2xl bg-red-500/15 border-2 border-red-500/50 flex flex-wrap items-center justify-between gap-4 shadow-2xl text-red-200"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle size={28} className="text-red-400 flex-shrink-0 animate-bounce" />
                    <p className="text-xs sm:text-sm font-black leading-relaxed">
                      {locale === "en"
                        ? "🚨 High Threat: 'It's over / Passive' tone detected! Traditional messaging failed completely. Immediate Enterprise Immersive Intervention Required!"
                        : "🚨 إنذار نفسي خطير: عبارة 'حصل خير' تنذر بالخطر! الطرق التقليدية فشلت.. مريم تتسرب من بين يديك! نحتاج لتدخل بسلاح المصالحة التفاعلي فوراً!"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      playSynthBeep(900, 0.2);
                      setStageIndex(2);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg font-mono flex items-center justify-center gap-2 ml-auto"
                  >
                    <span>{locale === "en" ? "Assemble Safi.io Weapon 🚀" : "🚀 جهز ترسانة Safi.io السرية الآن"}</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* STAGE 2: WORKBENCH MAGNETIC CHARGING RACE */}
          {stageIndex === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md space-y-8 flex flex-col items-center text-center font-sans"
            >
              <div className="space-y-2">
                <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30 inline-flex items-center gap-1.5 shadow-sm">
                  <Zap size={14} className="text-amber-400" />
                  <span>{locale === "en" ? "Interactive Act II : The Magnetic Workbench" : "المشهد التفاعلي 2 : غرفة الشحن المغناطيسي"}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {locale === "en" ? "Hold button to charge love signals ⚡" : "ثبت إصبعك لشحن وتفعيل سلاح المصالحة ⚡"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 font-semibold leading-relaxed">
                  {locale === "en"
                    ? "Generate her tailored cinematic micro-site complete with interactive AI judge and hilarious quiz trapdoos."
                    : "السيستم يقوم بتحضير الموقع المصغر الخاص بها، تحميل أجمل صوركم، وتجهيز قاضي المحكمة الآلي!"}
                </p>
              </div>

              {/* Charging interactive HUD block */}
              <div className="w-full p-8 rounded-[3rem] bg-white/5 border-2 border-white/10 shadow-2xl flex flex-col items-center space-y-6 relative overflow-hidden">
                <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-amber-500/10 rounded-full filter blur-2xl pointer-events-none" />
                
                {/* Circular Progress Ring HUD */}
                <div className="w-36 h-36 rounded-full bg-black/60 border-4 border-gray-800 flex items-center justify-center shadow-inner relative">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-amber-500 pointer-events-none transition-all duration-75"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% ${chargingProgress}%, 0 ${chargingProgress}%)`
                    }}
                  />
                  <div className="text-center font-mono">
                    <span className="text-3xl font-black text-amber-400">{chargingProgress}%</span>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Loaded</span>
                  </div>
                </div>

                {/* Interactive Hold Button */}
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onMouseDown={() => {
                    playSynthBeep(500, 0.1);
                    setIsCharging(true);
                  }}
                  onMouseUp={() => setIsCharging(false)}
                  onTouchStart={() => {
                    playSynthBeep(500, 0.1);
                    setIsCharging(true);
                  }}
                  onTouchEnd={() => setIsCharging(false)}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-[#B45309] text-white font-black text-sm sm:text-base shadow-2xl shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer select-none font-mono"
                >
                  <Zap size={18} className="fill-white animate-bounce" />
                  <span>{isCharging ? "⚡ CHARGING... KEEP HOLDING!" : (locale === "en" ? "HOLD DOWN TO CHARGE WEAPON" : "⚡ اضغط واثبت هنا لشحن الترسانة")}</span>
                </motion.button>
              </div>

            </motion.div>
          )}

          {/* STAGE 3: ROYAL BIOMETRIC DECRYPTION */}
          {stageIndex === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md space-y-6 flex flex-col items-center text-center font-sans"
            >
              <div className="space-y-2">
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-sm">
                  <Lock size={14} className="text-emerald-400" />
                  <span>{locale === "en" ? "Interactive Act III : Royal Gate" : "المشهد التفاعلي 3 : بوابة العبور الملكية"}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {locale === "en" ? "She opens your encrypted envelope 👑" : "الملكة تستلم وتفتح رابط الصلح المغلق 👑"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 font-semibold leading-relaxed">
                  {locale === "en" 
                    ? "To decrypt your royal immersive narrative, she must scan her biometric identity. Click scanner below!" 
                    : "لمشاهدة ذكرياتكم ورسالتك الصادقة، يجب التأكد من هويتها. اضغط بنفسك على ماسح البصمة التفاعلي لفتح القفل!"}
                </p>
              </div>

              {/* Interactive Biometric Card */}
              <div className="w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-36 h-36 bg-emerald-500/10 rounded-full filter blur-2xl pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  {!fingerprintUnlocked ? (
                    <motion.div key="locked" exit={{ scale: 0 }} className="flex flex-col items-center space-y-5">
                      <motion.button
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          playSynthBeep(900, 0.2);
                          setFingerprintUnlocked(true);
                          setTimeout(() => {
                            playTriumphantSwell();
                            setStageIndex(4);
                          }, 1200);
                        }}
                        className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-blue-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)] cursor-pointer group transition-all"
                      >
                        <Lock size={44} className="group-hover:hidden" />
                        <Eye size={44} className="group-hover:inline-block hidden animate-pulse" />
                      </motion.button>
                      <span className="text-xs sm:text-sm font-black text-emerald-300 animate-pulse font-mono tracking-wider">
                        {locale === "en" ? "👣 CLICK SCANNER TO UNLOCK" : "👣 اضغط على البصمة لفك التشفير"}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div key="unlocked" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center space-y-4">
                      <div className="w-24 h-24 bg-green-500/20 border-2 border-green-400 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(74,222,128,0.5)]">
                        <CheckCircle2 size={52} />
                      </div>
                      <h5 className="font-black text-xl text-white">
                        {locale === "en" ? "Biometric Match Confirmed! 👑" : "تم مطابقة هوية الملكة بنجاح! 👑"}
                      </h5>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          )}

          {/* STAGE 4: TRIUMPHANT REUNION GATEWAY */}
          {stageIndex === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg space-y-8 flex flex-col items-center text-center font-sans"
            >
              <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-amber-500 via-rose-500 to-[#B45309] text-white flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.6)] animate-bounce">
                <Sparkles size={52} className="animate-spin text-amber-200" />
              </div>

              <div className="space-y-3">
                <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black text-xs sm:text-sm border border-rose-500/30">
                  {locale === "en" ? "Ultimate Payoff : The Happy Reunion" : "النتيجة النهائية : الرضا والمصالحة التامة"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {locale === "en" ? "Mariam completely pardoned Ahmad! 🥰" : "الملكة ضحكت ومنحت الصلح 5 نجوم! 🥰"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 font-semibold leading-relaxed max-w-md mx-auto">
                  {locale === "en"
                    ? "Cold ice completely melted. Don't let your queen sleep sad tonight. Instigate her interactive miracle now!"
                    : "جمود الخناقة انكسر بذكاء وتحول لذكرى رومانسية خالدة. متخليش شريكتك تنام زعلانة الليلة.. ابني لها موقع مصالحة ملكي مجاناً الآن! ❤️"}
                </p>
              </div>

              {/* Launch Central Gateway Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExecuteBypass}
                className="w-full py-5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-[#B45309] text-white font-black text-base sm:text-lg transition-all shadow-2xl shadow-amber-600/40 flex items-center justify-center gap-3 cursor-pointer font-mono"
              >
                <span>{locale === "en" ? "Instigate Royal Apology Portal Now 🚀" : "⏩ ادخل إلى منصة Safi.io واصنع رابط المصالحة 🚀"}</span>
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 4. BOTTOM POETIC CAPTION Footer */}
      <footer className="z-30 relative w-full max-w-7xl mx-auto py-4 text-center pointer-events-none font-mono">
        <p className="text-xs sm:text-sm font-bold text-gray-400 bg-black/60 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md inline-block max-w-xl mx-auto leading-relaxed">
          {locale === "en"
            ? "● Highly graphic interactive relational rescue narrative engine (Zero buffering, 60 FPS Engine)"
            : "● محرك محاكاة تفاعلي حي: خض بنفسك تجربة المصالحة الملكية التي تصنعها منصة Safi.io بذكاء."}
        </p>
      </footer>

    </div>
  );
}
