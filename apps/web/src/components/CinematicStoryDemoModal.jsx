import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, X, MessageCircle, AlertCircle, CheckCircle2, Lock, ArrowLeft, ArrowRight, Eye, Send, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * CinematicStoryDemoModal — Ultimate Viral Relatable Story Hook (2026 Enterprise)
 * Replaces the dry 12-step flipbook with a jaw-dropping interactive relatable narrative:
 *  - Scene 1: The Relatable WhatsApp Crisis (The dreaded passive aggressive "تمام").
 *  - Scene 2: Instigating The Safi.io Weapon complete with an interactive biometric fingerprint scanner.
 *  - Scene 3: The Live Radar Split-Screen (Watching her live typing and dispatching a Stealth Whisper).
 *  - Scene 4: The 5-Star Re-connection Payoff & an Irresistible Onboarding CTA.
 */
export default function CinematicStoryDemoModal({ isOpen, onClose, onStartCreate }) {
  const { locale, t } = useLanguage();
  
  // Scenes: 1 (WhatsApp) | 2 (Secret Weapon & Fingerprint) | 3 (Live Split Screen) | 4 (Payoff & CTA)
  const [sceneIndex, setSceneIndex] = useState(1);
  
  // Interactive Fingerprint in Scene 2
  const [fingerprintUnlocked, setFingerprintUnlocked] = useState(false);
  
  // Simulated Live typing in Scene 3
  const [mockTypedText, setMockTypedText] = useState("");
  const [whisperSent, setWhisperSent] = useState(false);

  // Reset demo on open
  useEffect(() => {
    if (isOpen) {
      setSceneIndex(1);
      setFingerprintUnlocked(false);
      setMockTypedText("");
      setWhisperSent(false);
    }
  }, [isOpen]);

  // Automated typing simulation in Scene 3
  useEffect(() => {
    if (sceneIndex !== 3) return;
    const fullText = "هو دايماً بينسى ميعاد خروجتنا ويقعد يلعب بلايستيشن مع أصحابه... ";
    let idx = 0;
    setMockTypedText("");
    const timer = setInterval(() => {
      if (idx < fullText.length) {
        setMockTypedText((prev) => prev + fullText.charAt(idx));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [sceneIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Cinematic Deep Dark Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
      />

      {/* Main Masterpiece Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-[#141622] to-[#0D0F1A] border-2 border-amber-500/30 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(180,83,9,0.35)] flex flex-col relative z-10 text-gray-100"
      >
        
        {/* Top Dialog Header */}
        <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Heart size={18} fill="currentColor" />
            </div>
            <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
              {locale === "en" ? "Safi.io Interactive Relatable Story Hook 🎬" : "محاكاة إنقاذ علاقة حقيقية (قصة تفاعلية 🎬)"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scene Switcher Navigation Indicators */}
        <div className="px-8 pt-6 flex items-center justify-center gap-3">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => setSceneIndex(step)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                sceneIndex === step
                  ? "w-16 bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  : "w-4 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Master Scene Body */}
        <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[420px] relative">
          <AnimatePresence mode="wait">

            {/* SCENE 1: THE WHATSAPP CRISIS */}
            {sceneIndex === 1 && (
              <motion.div
                key="scene1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black text-xs border border-rose-500/30">
                    {locale === "en" ? "Scene 1: The Traditional Mistake" : "المشهد 1: الخطأ التقليدي في الاعتذار"}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {locale === "en" ? "Trying to apologize on WhatsApp 💔" : "شات واتساب جاف بعد خناقة كبيرة 💔"}
                  </h4>
                </div>

                {/* Simulated WhatsApp Box */}
                <div className="p-5 rounded-3xl bg-[#0B141A] border border-[#1F2C34] space-y-3 font-sans text-xs sm:text-sm shadow-xl" dir="rtl">
                  
                  {/* Outgoing Boy Bubble */}
                  <div className="flex justify-start">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="max-w-[80%] p-3 rounded-2xl rounded-tr-none bg-[#005C4B] text-white space-y-1 shadow">
                      <p>يا مريومة حقك عليا والله الشغل كان فوق دماغي ونسيت ميعاد الخروجة.. متزعليش 🥺</p>
                      <span className="text-[9px] text-green-200 block text-end font-mono">10:42 PM ✔✔</span>
                    </motion.div>
                  </div>

                  {/* Incoming Girl Bubble (Passive Aggressive) */}
                  <div className="flex justify-end">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="max-w-[80%] p-3 rounded-2xl rounded-tl-none bg-[#202C33] text-gray-100 space-y-1 shadow">
                      <p>تمام يا أحمد. حصل خير. مفيش مشكلة. تصبح على خير.</p>
                      <span className="text-[9px] text-gray-400 block text-end font-mono">10:45 PM</span>
                    </motion.div>
                  </div>

                </div>

                {/* Warning Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs sm:text-sm font-black"
                >
                  <AlertCircle size={24} className="text-amber-400 flex-shrink-0 animate-bounce" />
                  <span>
                    {locale === "en" 
                      ? "🚨 High Threat Passive-Aggressive Silence Detected! Standard texts won't work. Instant immersive intervention required!"
                      : "🚨 تنبيه: تم رصد (صمت عقابي) وعبارة 'حصل خير'! الكلمات الجافة على الواتساب لن تفيد.. نحتاج لتدخل تفاعلي ومبهج يكسر الجليد!"}
                  </span>
                </motion.div>

                <button
                  onClick={() => setSceneIndex(2)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-sm rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{locale === "en" ? "Deploy Secret Interactive Weapon 🚀" : "استخدم سلاح المصالحة السحري (Safi.io) 🚀"}</span>
                  <ArrowLeft size={16} />
                </button>
              </motion.div>
            )}

            {/* SCENE 2: THE SECRET WEAPON & INTERACTIVE FINGERPRINT */}
            {sceneIndex === 2 && (
              <motion.div
                key="scene2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md space-y-6 text-center"
              >
                <div className="space-y-1">
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                    {locale === "en" ? "Scene 2: The Interactive Lock" : "المشهد 2: بوابة العبور التفاعلية"}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {locale === "en" ? "She opens your mysterious link 🔒" : "مريم بتفتح لينك الاعتذار المغلق 🔒"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">
                    {locale === "en" ? "To unlock your custom apology, she must verify her identity. Click her biometric scanner below!" : "عشان تقرأ رسالتك، لازم تفك الشفرة. جرب تدوس بنفسك على ماسح البصمة التفاعلي تحت!"}
                  </p>
                </div>

                {/* Interactive Mock Biometric Box */}
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full filter blur-xl pointer-events-none" />
                  
                  <AnimatePresence mode="wait">
                    {!fingerprintUnlocked ? (
                      <motion.div key="locked" exit={{ scale: 0 }} className="flex flex-col items-center space-y-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFingerprintUnlocked(true)}
                          className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)] cursor-pointer group"
                        >
                          <Lock size={40} className="group-hover:hidden" />
                          <Eye size={40} className="group-hover:inline-block hidden animate-pulse" />
                        </motion.button>
                        <span className="text-xs font-black text-amber-300 animate-pulse font-mono">
                          {locale === "en" ? "👣 CLICK SCANNER TO UNLOCK" : "👣 اضغط على البصمة لفك التشفير"}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div key="unlocked" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-green-500/20 border-2 border-green-400 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.4)]">
                          <CheckCircle2 size={44} />
                        </div>
                        <h5 className="font-black text-lg text-white">
                          {locale === "en" ? "Biometric Match Confirmed! 👑" : "تم مطابقة هوية الملكة بنجاح! 👑"}
                        </h5>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {fingerprintUnlocked && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSceneIndex(3)}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-gray-950 font-black text-sm rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{locale === "en" ? "Enter Live Steering Room ⚡" : "ادخل غرفة العمليات السري ومحكمة الحب ⚡"}</span>
                    <ArrowLeft size={16} />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* SCENE 3: LIVE RADAR SPLIT SCREEN */}
            {sceneIndex === 3 && (
              <motion.div
                key="scene3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-black text-xs border border-indigo-500/30">
                    {locale === "en" ? "Scene 3: Live Emotional Radar" : "المشهد 3: المراقبة اللحظية والتفاعل"}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {locale === "en" ? "Watch her typing live and send instant whispers 🕵️" : "راقب مرافعتها لايف واهمس لها في الخفاء 🕵️"}
                  </h4>
                </div>

                {/* Master Split Screen Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Girl Screen: AI Judge */}
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 relative flex flex-col justify-between" dir="rtl">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold border-b border-white/10 pb-2 mb-3">
                        <span>🏛️ شاشة مريم (محكمة الحب)</span>
                        <span className="bg-amber-500/20 px-2 py-0.5 rounded font-mono">سؤال القاضي الآلي</span>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold mb-2">القاضي: ما هي التهمة الموجهة للبطل أحمد؟</p>
                      
                      {/* Live typing mock Box */}
                      <div className="p-4 bg-black/60 rounded-2xl border border-gray-800 text-xs font-mono text-rose-300 font-medium min-h-[80px]">
                        {mockTypedText}
                        <span className="w-1.5 h-3 bg-rose-400 inline-block ms-1 animate-pulse" />
                      </div>
                    </div>

                    {/* Pop-up whisper notice if dispatched */}
                    {whisperSent && (
                      <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} className="p-3.5 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2">
                        <Sparkles size={16} className="animate-spin flex-shrink-0" />
                        <span>همس سري من أحمد: "والله أبيع البلايستيشن عشان عيونك! 😂❤️"</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Right Boy Operation Room Screen */}
                  <div className="p-6 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 rounded-3xl space-y-4 flex flex-col justify-between" dir="rtl">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold border-b border-indigo-500/20 pb-2 mb-3">
                        <span>📡 غرفة عمليات أحمد (Dashboard)</span>
                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                          <span>Live 1000ms</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold mb-2">الرادار: البنت تكتب الآن... (شاهد حرفاً بحرف)</p>
                      
                      <div className="p-3 bg-black/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-200 font-mono font-bold mb-4">
                        💡 سلاح الـ Stealth Whisper: أرسل رسالة منبثقة تظهر على شاشتها فوراً دون تحديث الصفحة!
                      </div>
                    </div>

                    <button
                      onClick={() => setWhisperSent(true)}
                      disabled={whisperSent}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>{whisperSent ? "تم إرسال الهمس السحري 🤫" : "أرسل همس سري: 'والله أبيع البلايستيشن...' 🤫"}</span>
                    </button>
                  </div>

                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSceneIndex(4)}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{locale === "en" ? "Advance to Absolute Payoff Payoff 🏆" : "شاهد النتيجة النهائية ورضا الملكة 🏆"}</span>
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCENE 4: THE ULTIMATE PAYOFF & ONBOARDING CTA */}
            {sceneIndex === 4 && (
              <motion.div
                key="scene4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.6)]">
                  <Sparkles size={40} className="animate-spin" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {locale === "en" ? "Complete 100% Reconciliation Payoff! 🥰" : "كفاءة ومصالحة سينمائية بنسبة 100%! 🥰"}
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed max-w-md mx-auto">
                    {locale === "en" 
                      ? "Mariam evaluated the re-connection with 5 Stars. Young entities everywhere use Safi.io to break the cold ice playfully."
                      : "مريم ضحكت ومنحت الصلح 5 نجوم ⭐⭐⭐⭐⭐. جمود الزعل انكسر بذكاء وتحول لذكرى رومانسية جميلة."}
                  </p>
                </div>

                {/* Irresistible Product Call to Action Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-800/80 to-[#B45309]/80 border border-amber-500/40 text-white space-y-4 shadow-2xl">
                  <h5 className="font-black text-base sm:text-lg">
                    {locale === "en" ? "Don't let her sleep sad tonight.. ❤️" : "متخليش الملكة تنام زعلانة الليلة.. ❤️"}
                  </h5>
                  <p className="text-xs text-amber-100 font-medium">
                    {locale === "en" 
                      ? "Construct her dedicated dynamic web page complete with secret passcode, live radar, and interactive AI courtroom instantly!"
                      : "ابني لها صفحة مصالحة باسمها بالكامل مع قفل البصمة، الرادار اللحظي، ومحكمة الحب في 10 ثوانٍ مجاناً!"}
                  </p>
                  
                  <button
                    onClick={() => {
                      onClose();
                      onStartCreate();
                    }}
                    className="w-full py-4 bg-white text-gray-950 font-black text-sm sm:text-base rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{locale === "en" ? "Instigate Her Apology Link Now 🚀" : "اصنع رابط المصالحة الخاص بكم الآن 🚀"}</span>
                    <Heart size={16} className="text-rose-600 fill-rose-600" />
                  </button>
                </div>

                <button
                  onClick={() => setSceneIndex(1)}
                  className="text-xs text-gray-400 font-bold hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer font-mono"
                >
                  <RotateCcw size={13} />
                  <span>{locale === "en" ? "Replay Simulation" : "إعادة المحاكاة السينمائية"}</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
