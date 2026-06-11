import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scale, Gavel, FileText, CheckSquare, Square } from "lucide-react";
import DecryptedText from "@/components/DecryptedText";
import { useApp } from "@/context/AppContext";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

const DEFENSE_CONDITIONS = [
  { key: "dinner", label: "🍽️ عشاء رومانسي فخم لتصفية النفوس" },
  { key: "chocolates", label: "🍫 علبة شيكولاتة باتشي/جوديفا فاخرة" },
  { key: "massage", label: "💆 جلسة مساج فورية للقدمين والظهر" },
  { key: "no_code", label: "📵 حظر كامل للبرمجة وفتح اللاب توب في الويكيند" },
  { key: "shopping", label: "🛍️ خروجة شوبينج مفتوحة الميزانية لتعويض الضرر" }
];

export default function AIJudgeCourtroom({ onNext }) {
  const { updateState, config, t, siteSlug, state } = useApp();
  const [text, setText] = useState("");
  const [courtStep, setCourtStep] = useState(1); // 1: grievance, 2: followup + memo, 3: verdict
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [followupResponse, setFollowupResponse] = useState("");
  const [selectedConditions, setSelectedConditions] = useState({});
  const [slam, setSlam] = useState(false);
  
  const [dynamicTitle, setDynamicTitle] = useState("");
  const [dynamicDetails, setDynamicDetails] = useState("");
  const [isJudging, setIsJudging] = useState(false);
  
  const cardRef = useRef(null);
  const courtRunBtnRef = useRef(null);
  const [courtRunPos, setCourtRunPos] = useState({ x: 0, y: 0 });
  const firstNoHoverTime = useRef(null);

  useEffect(() => {
    updateState({ currentSection: "judge", lastAction: "courtroom" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courtJump = useCallback(() => {
    if (!firstNoHoverTime.current) {
      firstNoHoverTime.current = Date.now();
    }
    const card = cardRef.current;
    const btn = courtRunBtnRef.current;
    if (!card || !btn) return;
    const cardRect = card.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const pad = 12;
    const maxX = Math.max(0, cardRect.width - btnRect.width - pad * 2);
    const maxY = Math.max(0, cardRect.height - btnRect.height - pad * 2);
    const x = pad + Math.random() * maxX;
    const y = pad + Math.random() * maxY;
    setCourtRunPos({
      x: x - (btnRect.left - cardRect.left),
      y: y - (btnRect.top - cardRect.top),
    });
  }, []);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // Step 1: Submit grievance to get followup question
  const handleGrievanceSubmit = async () => {
    triggerHaptic();
    setIsJudging(true);
    setSlam(true);
    setTimeout(() => setSlam(false), 500);

    let followupQ = t("هل ده بيحصل معاكي كل مرة فعلاً ولا هو بيستهبل بس؟ 👀");
    if (siteSlug) {
      try {
        const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/judge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 1,
            pleaText: text,
            girlName: config?.girlName,
            boyName: config?.boyName,
            angerLevel: state.angerLevel ?? 100,
            trapCount: state.details?.trapCount ?? 0
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.question) {
            followupQ = data.question;
          }
        }
      } catch (err) {
        console.error("AI Judge Step 1 Error:", err);
      }
    }

    setFollowupQuestion(followupQ);
    setIsJudging(false);
    setCourtStep(2);
  };

  const toggleCondition = (key) => {
    triggerHaptic();
    setSelectedConditions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Step 2: Submit followup response and selected conditions to get verdict
  const handleFinalSubmit = async () => {
    triggerHaptic();
    setIsJudging(true);
    setSlam(true);
    setTimeout(() => setSlam(false), 500);

    // Track hesitation
    if (firstNoHoverTime.current) {
      const seconds = (Date.now() - firstNoHoverTime.current) / 1000;
      if (seconds >= 2) {
        updateState({
          hesitationDetected: true,
          hesitationSeconds: Math.round(seconds),
        });
      }
    }

    const memoText = DEFENSE_CONDITIONS
      .filter(c => selectedConditions[c.key])
      .map(c => c.label)
      .join(", ");

    // Sync to tracking columns
    updateState({ 
      pleaText: text,
      courtroom_followup: `السؤال: ${followupQuestion} | الإجابة: ${followupResponse} | شروط الدفاع: ${memoText || "لا يوجد"}`,
      lastAction: "plea-submitted" 
    });

    // AI Live Verdict
    let finalTitle = config?.judgeText?.title || "بعد دراسة الأدلة والمرافعات... المحكمة تحكم لصالح {girlName}! ⚖️❤️";
    let finalDetails = config?.judgeText?.details || "القاضي: كل اللي عملته {girlName} صح والباقي كلامه فارغ 😂";

    if (siteSlug) {
      try {
        const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/judge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: 2,
            pleaText: text,
            followupQuestion: followupQuestion,
            followupResponse: followupResponse,
            memoConditions: memoText || "ألا يكرر خطأه أبداً ويرضيها بكل السبل الممكنة",
            girlName: config?.girlName,
            boyName: config?.boyName,
            angerLevel: state.angerLevel ?? 100,
            trapCount: state.details?.trapCount ?? 0
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title && data.details) {
            finalTitle = data.title;
            finalDetails = data.details;
            if (typeof data.sentiment === "number") {
              updateState({
                details: {
                  ...state.details,
                  sentiment: data.sentiment
                }
              });
            }
          }
        }
      } catch (err) {
        console.error("AI Judge Step 2 Error:", err);
      }
    }

    setDynamicTitle(finalTitle);
    setDynamicDetails(finalDetails);
    
    setIsJudging(false);
    setCourtStep(3);
    updateState({ batteryLevel: 70, lastAction: "verdict" });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 py-10">
      <motion.div
        ref={cardRef}
        className={`${CARD} w-full max-w-lg p-10 text-center relative overflow-hidden`}
        animate={slam ? { rotate: [0, -1.5, 1.5, 0], scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Scale size={48} className="mx-auto mb-4 text-[#1A1A1A] dark:text-white" />
        
        <h3 className="mb-2 text-2xl font-semibold text-[#1A1A1A] dark:text-white">
          <DecryptedText text={config?.locale === 'en' ? "Supreme Court of Justice ⚖️" : "محكمة العدل العليا ⚖️"} speed={30} />
        </h3>
        
        <p className="mb-6 text-sm font-medium text-[#5A5955] dark:text-slate-300">
          {config?.locale === 'en' ? "The AI Judge is ready to hear your grievance" : "القاضي الذكي جاهز للاستماع لمرافعتك وتأديبه"}
        </p>

        <AnimatePresence mode="wait">
          {courtStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <label className="mb-2 block text-start text-sm font-semibold text-[#1A1A1A] dark:text-white">
                {config?.locale === 'en' ? "Tell the Court.. What exactly did he do to upset you?" : "فضفضي للمحكمة.. احكي بالتفصيل عمل إيه زعلك؟"}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={config?.locale === 'en' ? "Write your grievance here..." : "اكتب دفاعك هنا... (فضفض براحتك)"}
                className="w-full h-32 resize-none rounded-2xl border border-[#E5E0D8] dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 text-sm text-[#1A1A1A] dark:text-white placeholder-[#8A7E72] dark:placeholder-slate-500 outline-none transition-all focus:border-[#1A1A1A] dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900"
                disabled={isJudging}
              />

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGrievanceSubmit}
                  disabled={!text.trim() || isJudging}
                  className={`inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-8 py-3.5 text-sm font-medium text-[#F4F3EF] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] cursor-pointer ${
                    !text.trim() || isJudging
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#DFBA73]"
                  }`}
                >
                  <Gavel size={18} /> {isJudging ? t("جاري إبلاغ القاضي...") : t("إرسال الشكوى للمراجعة")}
                </button>

                <motion.button
                  ref={courtRunBtnRef}
                  type="button"
                  onMouseEnter={courtJump}
                  onClick={courtJump}
                  onTouchStart={courtJump}
                  animate={{ x: courtRunPos.x, y: courtRunPos.y }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="rounded-full border border-red-300 bg-white px-6 py-3.5 text-sm font-medium text-red-500 cursor-pointer"
                  style={{ willChange: "transform" }}
                  disabled={isJudging}
                >
                  {t("رفض الصلح 😡")}
                </motion.button>
              </div>
            </motion.div>
          )}

          {courtStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5 text-start"
            >
              {/* Follow-up question box */}
              <div className="p-4 rounded-2xl bg-[#DFBA73]/10 border border-[#DFBA73]/30">
                <p className="text-xs font-bold text-[#855B1B] dark:text-[#E8C280] mb-1 select-none">⚖️ {t("سؤال القاضي التفصيلي:")}</p>
                <p className="text-sm font-medium text-[#1A1A1A] dark:text-white leading-relaxed">{followupQuestion}</p>
              </div>

              {/* Response text area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1A1A1A] dark:text-white select-none">
                  {t("ردك على سؤال القاضي:")}
                </label>
                <textarea
                  value={followupResponse}
                  onChange={(e) => setFollowupResponse(e.target.value)}
                  placeholder={t("اكتبي تفاصيل إضافية أو ردك الساخر هنا...")}
                  className="w-full h-20 resize-none rounded-2xl border border-[#E5E0D8] dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 text-xs font-medium text-[#1A1A1A] dark:text-white placeholder-[#8A7E72] dark:placeholder-slate-500 outline-none transition-all focus:border-[#1A1A1A] dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900"
                  disabled={isJudging}
                />
              </div>

              {/* Defense Memo sub-form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 select-none">
                  <FileText size={14} className="text-[#DFBA73]" /> {t("شروط صك الصلح النهائي (مذكرة الدفاع) 📝:")}
                </label>
                <div className="flex flex-col gap-2">
                  {DEFENSE_CONDITIONS.map((cond) => {
                    const isSelected = !!selectedConditions[cond.key];
                    return (
                      <button
                        key={cond.key}
                        type="button"
                        onClick={() => toggleCondition(cond.key)}
                        disabled={isJudging}
                        className={`w-full flex items-center gap-3 rounded-xl border p-3 text-start transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#DFBA73]/15 border-[#DFBA73] text-[#855B1B] dark:text-[#E8C280]"
                            : "bg-white/40 dark:bg-slate-900/30 border-black/5 dark:border-white/5 text-[#5A5955] dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-[var(--accent)] shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-gray-400 shrink-0" />
                        )}
                        <span className="text-[11px] font-bold">{t(cond.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!followupResponse.trim() || isJudging}
                  className={`inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] dark:bg-white dark:text-[#1A1A1A] px-10 py-3.5 text-sm font-bold shadow-md transition-all cursor-pointer ${
                    !followupResponse.trim() || isJudging
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#DFBA73] hover:text-white"
                  }`}
                >
                  <Gavel size={18} /> {isJudging ? t("جاري صياغة الحكم النهائي...") : t("إصدار حكم المحكمة النهائي ⚖️")}
                </button>
              </div>
            </motion.div>
          )}

          {courtStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-[#DFBA73]/40 bg-[#DFBA73]/10 p-6 text-center"
            >
              <p className="text-lg font-semibold leading-relaxed text-[#1A1A1A] dark:text-white">
                {t(dynamicTitle)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#5A5955] dark:text-slate-300">
                {t(dynamicDetails)}
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 flex flex-col items-center gap-4"
              >
                <Gavel size={32} className="text-[#DFBA73]" />
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] dark:bg-white dark:text-[#1A1A1A] px-8 py-3.5 text-sm font-bold text-[#F4F3EF] hover:bg-[#DFBA73] hover:text-white cursor-pointer transition-colors"
                >
                  {config?.locale === 'en' ? "Read Verdict, Continue" : "قرأت الحكم، استمرار"} <Gavel size={16} />
                </button>
                <p className="mt-4 text-[10px] text-gray-400 opacity-70">
                  {config?.locale === 'en' ? "✨ Generated by AI for entertainment and reconciliation." : "✨ تم توليد هذا الحكم بواسطة الذكاء الاصطناعي للترفيه والمصالحة الودية."}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
