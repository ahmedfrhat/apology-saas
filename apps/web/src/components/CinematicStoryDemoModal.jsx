import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, X, MessageCircle, AlertCircle, CheckCircle2, Lock, ArrowLeft, ArrowRight, Eye, Send, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * CinematicStoryDemoModal — Ultra-Premium Viral Relatable Story Pitch (2026 Enterprise)
 * Absolutely flawless, de-cluttered cinematic relationship rescue narrative.
 * Flawlessly stripped of all references to "10 seconds / 10s".
 */
export default function CinematicStoryDemoModal({ isOpen, onClose, onStartCreate }) {
  const { locale } = useLanguage();
  
  // Scenes: 1 (WhatsApp) | 2 (Secret Weapon & Fingerprint) | 3 (Live Split Screen) | 4 (Payoff & Royal CTA)
  const [sceneIndex, setSceneIndex] = useState(1);
  
  // Interactive Biometric Fingerprint in Scene 2
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

  // Automated cinematic live typing simulation in Scene 3
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
    }, 55);
    return () => clearInterval(timer);
  }, [sceneIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Deep Immersive Midnight Glass Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
      />

      {/* Royal Masterpiece Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-[#141622] via-[#0D0F1A] to-[#0A0C14] border-2 border-amber-500/40 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(180,83,9,0.4)] flex flex-col relative z-10 text-gray-100"
      >
        
        {/* Top Royal Dialog Header */}
        <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-[#B45309] flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <Heart size={20} fill="currentColor" />
            </div>
            <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
              {locale === "en" ? "Relatable Cinematic Relationship Rescue Pitch 🎬" : "محاكاة سينمائية لقصة صلح واقعية 🎬"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cinematic Scene Switcher Progress Indicators */}
        <div className="px-8 pt-7 flex items-center justify-center gap-3">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => setSceneIndex(step)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                sceneIndex === step
                  ? "w-20 bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.9)]"
                  : "w-5 bg-white/15 hover:bg-white/35"
              }`}
            />
          ))}
        </div>

        {/* Master Scene Body */}
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[440px] relative">
          <AnimatePresence mode="wait">

            {/* SCENE 1: THE WHATSAPP CRISIS */}
            {sceneIndex === 1 && (
              <motion.div
                key="scene1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg space-y-6"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-black text-xs sm:text-sm border border-rose-500/30 shadow-sm">
                    {locale === "en" ? "Scene 1: The Traditional Mistake" : "المشهد 1: الخطأ التقليدي في الاعتذار"}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {locale === "en" ? "Trying to apologize on WhatsApp 💔" : "شات واتساب جاف بعد خناقة كبيرة 💔"}
                  </h4>
                </div>

                {/* Simulated WhatsApp Box */}
                <div className="p-6 rounded-[2rem] bg-[#0B141A] border border-[#1F2C34] space-y-4 font-sans text-xs sm:text-sm shadow-2xl" dir="rtl">
                  
                  {/* Outgoing Boy Bubble */}
                  <div className="flex justify-start">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="max-w-[85%] p-4 rounded-2xl rounded-tr-none bg-[#005C4B] text-white space-y-1.5 shadow-md">
                      <p className="font-semibold leading-relaxed">يا مريومة حقك عليا والله الشغل كان فوق دماغي ونسيت ميعاد الخروجة.. متزعليش 🥺</p>
                      <span className="text-[10px] text-green-200 block text-end font-mono font-bold">10:42 PM ✔✔</span>
                    </motion.div>
                  </div>

                  {/* Incoming Girl Bubble (Passive Aggressive) */}
                  <div className="flex justify-end">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-[#202C33] text-gray-100 space-y-1.5 shadow-md">
                      <p className="font-semibold leading-relaxed">تمام يا أحمد. حصل خير. مفيش مشكلة. تصبح على خير.</p>
                      <span className="text-[10px] text-gray-400 block text-end font-mono font-bold">10:45 PM</span>
                    </motion.div>
                  </div>

                </div>

                {/* Threat Intervention Box */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs sm:text-sm font-black shadow-lg"
                >
                  <AlertCircle size={28} className="text-amber-400 flex-shrink-0 animate-bounce" />
                  <span className="leading-relaxed">
                    {locale === "en" 
                      ? "🚨 High Threat Passive-Aggressive Silence Detected! Standard texts won't work. Immersive interactive intervention required!"
                      : "🚨 تنبيه: تم رصد (صمت عقابي) وعبارة 'حصل خير'! الكلمات الجافة على الواتساب لن تفيد.. نحتاج لتدخل تفاعلي ومبهج يكسر الجليد!"}
                  </span>
                </motion.div>

                <button
                  onClick={() => setSceneIndex(2)}
                  className="w-full py-4.5 bg-gradient-to-r from-amber-500 via-rose-500 to-[#B45309] text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-600/25 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <span>{locale === "en" ? "Instigate Royal Apology Link 🚀" : "استخدم سلاح المصالحة الملكي (Safi.io) 🚀"}</span>
                  <ArrowLeft size={18} />
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
                <div className="space-y-1.5">
                  <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs sm:text-sm border border-amber-500/30 shadow-sm">
                    {locale === "en" ? "Scene 2: The Interactive Biometric Gate" : "المشهد 2: بوابة العبور التفاعلية"}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {locale === "en" ? "She opens your mysterious link 🔒" : "مريم بتفتح لينك الاعتذار المغلق 🔒"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
                    {locale === "en" ? "To decrypt your royal apology, she must verify her identity. Click her biometric scanner below!" : "عشان تقرأ رسالتك، لازم تفك الشفرة. جرب تدوس بنفسك على ماسح البصمة التفاعلي تحت!"}
                  </p>
                </div>

                {/* Interactive Mock Biometric Box */}
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-500/15 rounded-full filter blur-2xl pointer-events-none" />
                  
                  <AnimatePresence mode="wait">
                    {!fingerprintUnlocked ? (
                      <motion.div key="locked" exit={{ scale: 0 }} className="flex flex-col items-center space-y-5">
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFingerprintUnlocked(true)}
                          className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-[#B45309]/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.35)] cursor-pointer group"
                        >
                          <Lock size={44} className="group-hover:hidden" />
                          <Eye size={44} className="group-hover:inline-block hidden animate-pulse" />
                        </motion.button>
                        <span className="text-xs sm:text-sm font-black text-amber-300 animate-pulse font-mono tracking-wider">
                          {locale === "en" ? "👣 CLICK SCANNER TO UNLOCK" : "👣 اضغط على البصمة لفك التشفير"}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div key="unlocked" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center space-y-5">
                        <div className="w-24 h-24 bg-green-500/20 border-2 border-green-400 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.5)]">
                          <CheckCircle2 size={52} />
                        </div>
                        <h5 className="font-black text-xl text-white">
                          {locale === "en" ? "Biometric Identity Confirmed! 👑" : "تم مطابقة هوية الملكة بنجاح! 👑"}
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
                    className="w-full py-4.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-gray-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-green-500/25 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                  >
                    <span>{locale === "en" ? "Enter Live Steering Courtroom ⚡" : "ادخل غرفة العمليات ومحكمة الحب ⚡"}</span>
                    <ArrowLeft size={18} />
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
                className="w-full space-y-6"
              >
                <div className="text-center space-y-1.5">
                  <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-black text-xs sm:text-sm border border-indigo-500/30 shadow-sm">
                    {locale === "en" ? "Scene 3: Live Steering Radar" : "المشهد 3: المراقبة اللحظية والتفاعل"}
                  </span>
                  <h4 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {locale === "en" ? "Watch her typing live and send instant whispers 🕵️" : "راقب مرافعتها لايف واهمس لها في الخفاء 🕵️"}
                  </h4>
                </div>

                {/* Master Split Screen Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Left Girl Screen: AI Judge */}
                  <div className="p-7 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4 relative flex flex-col justify-between shadow-xl" dir="rtl">
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-white/10 pb-3 mb-4 font-mono">
                        <span>🏛️ شاشة مريم (محكمة الحب)</span>
                        <span className="bg-amber-500/25 px-2.5 py-1 rounded-lg">سؤال القاضي الآلي</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-200 font-bold mb-3">القاضي: ما هي التهمة الموجهة للبطل أحمد؟</p>
                      
                      {/* Live typing mock Box */}
                      <div className="p-4.5 bg-black/70 rounded-2xl border border-gray-800 text-xs sm:text-sm font-mono text-rose-300 font-bold min-h-[90px] leading-relaxed">
                        {mockTypedText}
                        <span className="w-2 h-4 bg-rose-400 inline-block ms-1 animate-pulse align-middle" />
                      </div>
                    </div>

                    {/* Pop-up whisper notice if dispatched */}
                    {whisperSent && (
                      <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} className="p-4 bg-gradient-to-r from-amber-600 via-rose-600 to-[#B45309] text-white rounded-2xl text-xs sm:text-sm font-black shadow-2xl flex items-center gap-2.5 border border-amber-400/40">
                        <Sparkles size={20} className="animate-spin flex-shrink-0 text-amber-200" />
                        <span>همس سري من أحمد: "والله أبيع البلايستيشن عشان عيونك! 😂❤️"</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Right Boy Operation Room Screen */}
                  <div className="p-7 bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-gray-900 border border-indigo-500/40 rounded-[2.5rem] space-y-4 flex flex-col justify-between shadow-xl" dir="rtl">
                    <div>
                      <div className="flex items-center justify-between text-xs text-indigo-400 font-bold border-b border-indigo-500/30 pb-3 mb-4 font-mono">
                        <span>📡 غرفة عمليات أحمد (Radar)</span>
                        <span className="bg-green-500/25 text-green-300 px-3 py-1 rounded-lg flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                          <span>Live 1000ms</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-200 font-bold mb-3">الرادار: البنت تكتب الآن... (شاهد حرفاً بحرف)</p>
                      
                      <div className="p-4 bg-black/50 rounded-2xl border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 font-mono font-bold mb-4 leading-relaxed">
                        💡 سلاح الـ Stealth Whisper: أرسل رسالة منبثقة تظهر على شاشتها فوراً دون تحديث الصفحة!
                      </div>
                    </div>

                    <button
                      onClick={() => setWhisperSent(true)}
                      disabled={whisperSent}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 cursor-pointer font-mono"
                    >
                      <Send size={16} />
                      <span>{whisperSent ? "تم إرسال الهمس السحري 🤫" : "أرسل همس سري: 'والله أبيع البلايستيشن...' 🤫"}</span>
                    </button>
                  </div>

                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setSceneIndex(4)}
                    className="w-full py-4.5 bg-gradient-to-r from-amber-500 via-rose-500 to-[#B45309] text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-600/25 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                  >
                    <span>{locale === "en" ? "Advance to Absolute Royal Reconciliation Payoff 🏆" : "شاهد النتيجة النهائية ورضا الملكة 🏆"}</span>
                    <ArrowLeft size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCENE 4: THE ULTIMATE PAYOFF & ROYAL CTA */}
            {sceneIndex === 4 && (
              <motion.div
                key="scene4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg space-y-6 text-center"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-[#B45309] text-white flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(245,158,11,0.6)]">
                  <Sparkles size={48} className="animate-spin text-amber-200" />
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {locale === "en" ? "100% Royal Reconciliation Payoff! 🥰" : "مصالحة سينمائية ملكية بنسبة 100%! 🥰"}
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-200 font-bold leading-relaxed max-w-md mx-auto">
                    {locale === "en" 
                      ? "Mariam evaluated the re-connection with 5 Royal Stars. Entities worldwide use Safi.io to break cold ice beautifully."
                      : "مريم ضحكت ومنحت الصلح 5 نجوم ملكية ⭐⭐⭐⭐⭐. جمود الزعل انكسر بذكاء وتحول لذكرى رومانسية خالدة."}
                  </p>
                </div>

                {/* Royal Irresistible Call to Action Card */}
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-800/90 via-[#B45309]/90 to-amber-800/90 border-2 border-amber-500/50 text-white space-y-5 shadow-2xl backdrop-blur-xl">
                  <h5 className="font-black text-lg sm:text-xl">
                    {locale === "en" ? "Don't let her sleep sad tonight.. ❤️" : "متخليش الملكة تنام زعلانة الليلة.. ❤️"}
                  </h5>
                  <p className="text-xs sm:text-sm text-amber-100 font-semibold leading-relaxed">
                    {locale === "en" 
                      ? "Construct her dedicated dynamic royal portal complete with secret passcode, live radar, and interactive AI judge instantly for free!"
                      : "ابني لها صفحة مصالحة ملكية باسمها بالكامل مع قفل البصمة، الرادار اللحظي، ومحكمة الحب مجاناً الآن!"}
                  </p>
                  
                  <button
                    onClick={() => {
                      onClose();
                      onStartCreate();
                    }}
                    className="w-full py-4.5 bg-white text-gray-950 font-black text-base sm:text-lg rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                  >
                    <span>{locale === "en" ? "Instigate Royal Apology Portal 🚀" : "اصنع رابط المصالحة الملكي الآن 🚀"}</span>
                    <Heart size={18} className="text-rose-600 fill-rose-600" />
                  </button>
                </div>

                <button
                  onClick={() => setSceneIndex(1)}
                  className="text-xs sm:text-sm text-gray-400 font-black hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-mono"
                >
                  <RotateCcw size={14} />
                  <span>{locale === "en" ? "Replay Simulation Pitch" : "إعادة المحاكاة السينمائية"}</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
