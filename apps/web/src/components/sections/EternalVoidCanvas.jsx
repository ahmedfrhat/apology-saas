import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Lock, Unlock, Download, Calendar, Sparkles } from "lucide-react";

// Simple client-side XOR + Base64 encryption helpers
function encryptText(text, key = "safi-love") {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(unescape(encodeURIComponent(result)));
}

function decryptText(base64Text, key = "safi-love") {
  try {
    const raw = decodeURIComponent(escape(atob(base64Text)));
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      result += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return "فشل فك التشفير";
  }
}

export default function EternalVoidCanvas() {
  const { config, t, state, updateState, siteSlug } = useApp();
  const [textStage, setTextStage] = useState("initial"); // 'initial' | 'funny' | 'forever'
  const [showControlCenter, setShowControlCenter] = useState(false);
  
  const [capsuleInput, setCapsuleInput] = useState("");
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("capsule"); // 'capsule' | 'certificate'

  const certificateRef = useRef(null);

  const voidText = t(config?.voidText || "منورتي للأبد 💛");
  const enableFunnyText = config?.enableFunnyText ?? true;
  const funnyText = t(config?.funnyText || "احا انتي لسه هنا يلا انطري ابلكاش 😂");

  const hearts = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 22,
        delay: Math.random() * 6,
        duration: 7 + Math.random() * 6,
      })),
    [],
  );

  useEffect(() => {
    // Stage 1: Show initial text for 4 seconds
    const timer1 = setTimeout(() => {
      if (enableFunnyText) {
        setTextStage("funny");
      } else {
        setTextStage("forever");
      }
    }, 4000);

    // Stage 2: Show the funny message for 3 seconds, then go back to forever
    let timer2;
    if (textStage === "funny") {
      timer2 = setTimeout(() => {
        setTextStage("forever");
      }, 3000);
    }

    return () => {
      clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [textStage, enableFunnyText]);

  // Fade in control center after initial sequences
  useEffect(() => {
    if (textStage === "forever") {
      const timer = setTimeout(() => {
        setShowControlCenter(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [textStage]);

  // Compute countdown for Time Capsule
  useEffect(() => {
    if (!state.capsule_created_at || !state.time_capsule) return;

    const updateCountdown = () => {
      const createdAt = new Date(state.capsule_created_at).getTime();
      const unlockAt = createdAt + 365 * 24 * 60 * 60 * 1000; // Exactly 1 year in ms
      const diff = unlockAt - Date.now();

      if (diff <= 0) {
        setTimeLeftStr("");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeftStr(
          config?.locale === "en"
            ? `${days}d ${hours}h ${mins}m ${secs}s`
            : `${days} يوم، ${hours} ساعة، ${mins} دقيقة، ${secs} ثانية`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [state.capsule_created_at, state.time_capsule, config?.locale]);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleLockCapsule = () => {
    if (!capsuleInput.trim()) return;
    triggerHaptic();
    const encrypted = encryptText(capsuleInput.trim());
    updateState({
      time_capsule: encrypted,
      capsule_created_at: new Date().toISOString()
    });
    setCapsuleInput("");
  };

  const downloadCertificate = async () => {
    if (typeof window === "undefined") return;
    setIsGenerating(true);
    triggerHaptic();
    
    const element = certificateRef.current;
    if (!element) return;
    
    try {
      element.style.display = "block";
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      element.style.display = "none";
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`reconciliation_certificate_${siteSlug || "safi"}.pdf`);
    } catch (err) {
      console.error("PDF generation error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const isCapsuleLocked = !!state.time_capsule;
  const isCapsuleUnlocked = isCapsuleLocked && timeLeftStr === "";

  return (
    <div
      className="fixed inset-0 z-[140] flex flex-col items-center justify-start overflow-y-auto px-6 py-12"
      style={{ background: "#050505" }}
    >
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-15vh", opacity: [0, 0.9, 0] }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${h.left}%`,
            fontSize: h.size,
            willChange: "transform, opacity",
          }}
        >
          💛
        </motion.span>
      ))}

      {/* Sequential Intro Text */}
      <div className="h-28 shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {textStage === "initial" && (
            <motion.h1
              key="initial"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8 }}
              className="px-6 text-center text-4xl font-semibold tracking-tight sm:text-6xl"
              style={{
                color: "#DFBA73",
                textShadow: "0 0 30px rgba(223,186,115,0.5)",
              }}
            >
              {voidText}
            </motion.h1>
          )}

          {textStage === "funny" && (
            <motion.h1
              key="funny"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="px-6 text-center text-3xl font-semibold tracking-tight sm:text-5xl"
              style={{
                color: "#EF4444",
                textShadow: "0 0 30px rgba(239,68,68,0.5)",
              }}
            >
              {funnyText}
            </motion.h1>
          )}

          {textStage === "forever" && (
            <motion.h1
              key="forever"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="px-6 text-center text-4xl font-semibold tracking-tight sm:text-6xl"
              style={{
                color: "#DFBA73",
                textShadow: "0 0 30px rgba(223,186,115,0.5)",
              }}
            >
              {voidText}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Glassmorphic Control Center */}
      <AnimatePresence>
        {showControlCenter && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="glass-card w-full max-w-lg mt-8 p-8 relative z-35 text-center flex flex-col gap-6"
          >
            {/* Tabs */}
            <div className="flex rounded-full bg-white/5 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => { triggerHaptic(); setActiveTab("capsule"); }}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "capsule"
                    ? "bg-[#DFBA73] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                ⏳ {t("كبسولة الزمن")}
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic(); setActiveTab("certificate"); }}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "certificate"
                    ? "bg-[#DFBA73] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                📜 {t("وثيقة الصلح")}
              </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[220px] flex flex-col justify-center">
              {activeTab === "capsule" && (
                <div className="space-y-4">
                  {!isCapsuleLocked ? (
                    <>
                      <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                        <Lock size={16} className="text-[#DFBA73]" /> {t("اكتبي رسالة للمستقبل ⏳")}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {t("سيتم تشفير هذه الرسالة وقفلها بالكامل. لن يظهر محتواها أو يُسمح بفتحها إلا بعد مرور عام كامل بالتمام والكمال من الآن!")}
                      </p>
                      <textarea
                        value={capsuleInput}
                        onChange={(e) => setCapsuleInput(e.target.value)}
                        placeholder={t("اكتبي شيئاً لنفسك أو له للمستقبل...")}
                        className="w-full h-24 p-4 rounded-2xl border border-white/10 bg-white/5 text-xs font-medium text-white placeholder-gray-500 outline-none focus:border-[#DFBA73] transition-colors resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleLockCapsule}
                        disabled={!capsuleInput.trim()}
                        className={`mood-glow-btn w-full py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all ${
                          !capsuleInput.trim() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Lock size={14} /> {t("قفل الكبسولة للأبد 🔐")}
                      </button>
                    </>
                  ) : !isCapsuleUnlocked ? (
                    <div className="py-6 flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full border border-yellow-500/20 bg-yellow-500/10 flex items-center justify-center text-yellow-500 animate-pulse">
                        <Lock size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-white select-none">
                        {t("الكبسولة مغلقة بأمان 🔒")}
                      </h3>
                      <p className="text-xs text-gray-400 max-w-sm select-none">
                        {t("تم تشفير رسالتك وحفظها في قاعدة البيانات. سيتم فك التشفير تلقائياً بعد سنة واحدة.")}
                      </p>
                      <div className="mt-4 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-center font-mono">
                        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-1 select-none flex items-center justify-center gap-1">
                          <Calendar size={12} /> {t("العد التنازلي للفتح:")}
                        </p>
                        <p className="text-base font-extrabold text-white">{timeLeftStr}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-4">
                      <div className="h-16 w-16 mx-auto rounded-full border border-green-500/20 bg-green-500/10 flex items-center justify-center text-green-500">
                        <Unlock size={28} />
                      </div>
                      <h3 className="text-base font-bold text-green-400 select-none">
                        {t("تم فتح كبسولة الزمن! 🎉🔓")}
                      </h3>
                      <div className="p-5 rounded-2xl border border-green-500/20 bg-green-950/20 text-start">
                        <p className="text-[10px] text-green-500 font-bold mb-2">
                          📬 {t("الرسالة التي كتبتيها قبل سنة:")}
                        </p>
                        <p className="text-xs font-semibold text-white leading-relaxed whitespace-pre-wrap">
                          {decryptText(state.time_capsule)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "certificate" && (
                <div className="space-y-4 flex flex-col items-center">
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-[#DFBA73]" /> {t("صك الصلح النهائي 📜")}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                    {t("يمكنك الآن تحميل وثيقة الصلح والوفاق الرسمية المعتمدة بصيغة PDF وتوثيق هذا اليوم التاريخي!")}
                  </p>
                  
                  {/* Visual Preview Card */}
                  <div className="w-full max-w-xs border border-[#DFBA73]/30 bg-[#DFBA73]/10 p-4 rounded-2xl flex flex-col items-center text-center select-none gap-2">
                    <span className="text-[32px]">📜</span>
                    <span className="text-xs font-bold text-white">{t("وثيقة صلح رسمية")}</span>
                    <span className="text-[10px] text-gray-400">{config?.girlName} ❤️ {config?.boyName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={downloadCertificate}
                    disabled={isGenerating}
                    className="mood-glow-btn w-full max-w-xs py-3 rounded-full bg-[#DFBA73] hover:bg-[#C9956C] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Download size={14} /> {isGenerating ? t("جاري توليد صك الصلح...") : t("تحميل الوثيقة الرسمية (PDF) 📥")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Certificate layout for PDF rendering */}
      <div 
        ref={certificateRef}
        style={{
          display: "none",
          width: "800px",
          height: "600px",
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          background: "#FAF8F2", // Cream parchment background
          color: "#2E1E12",
          fontFamily: "'Cairo', 'Inter', sans-serif",
          boxSizing: "border-box"
        }}
        className="p-10 border-[12px] border-double border-[#C9956C] relative rounded-lg"
      >
        {/* Elegant corners */}
        <div className="absolute top-2 left-2 text-[#C9956C] text-xl font-bold">✥</div>
        <div className="absolute top-2 right-2 text-[#C9956C] text-xl font-bold">✥</div>
        <div className="absolute bottom-2 left-2 text-[#C9956C] text-xl font-bold">✥</div>
        <div className="absolute bottom-2 right-2 text-[#C9956C] text-xl font-bold">✥</div>
        
        {/* Certificate Body */}
        <div className="border border-[#C9956C]/30 h-full w-full p-8 flex flex-col justify-between items-center text-center">
          <div className="space-y-2">
            <h2 className="text-[#855B1B] text-xs font-bold uppercase tracking-[0.25em]">
              {t("صك صلح رسمي وعقد حماية عاطفية")}
            </h2>
            <h1 className="text-3xl font-extrabold text-[#2E1E12] tracking-wide mt-2 font-serif">
              {t("وثيقة الصلح الكبرى 📜")}
            </h1>
          </div>
          
          <p className="text-sm leading-relaxed max-w-xl text-[#5C4533] mt-4">
            {t("بموجب هذه الوثيقة الصادرة عن المحكمة العاطفية العليا لعام 2026، نعلن أن الملكة")} <strong>{config?.girlName}</strong> {t("قد تفضلت بقبول اعتذار المشكو في حقه")} <strong>{config?.boyName}</strong> {t("بعد ثبوت براءته من نية التكدير، وتعهده بالالتزام بشروط صك الصلح المتفق عليها.")}
          </p>
          
          <div className="w-full flex justify-around mt-8">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[#855B1B] border-b border-[#2E1E12]/30 w-32 pb-2 mb-2 font-handwritten italic text-center">
                {config?.girlName}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t("توقيع الملكة")}</span>
            </div>
            
            {/* Seal deco */}
            <div className="w-16 h-16 rounded-full border border-dashed border-[#DFBA73] bg-[#DFBA73]/10 flex items-center justify-center relative select-none">
              <div className="w-12 h-12 rounded-full bg-[#DFBA73]/20 flex items-center justify-center font-bold text-[#855B1B] text-[10px]">
                OFFICIAL
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-[#855B1B] border-b border-[#2E1E12]/30 w-32 pb-2 mb-2 font-handwritten italic text-center">
                {config?.boyName}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t("توقيع المحكوم عليه")}</span>
            </div>
          </div>
          
          <div className="text-[9px] text-[#A89E90] tracking-wider mt-4">
            {t("صدرت في تاريخ:")} {new Date().toLocaleDateString(config?.locale === 'en' ? 'en-US' : 'ar-EG')} • {t("منصة المصالحة الذكية Safi.io")}
          </div>
        </div>
      </div>
    </div>
  );
}
