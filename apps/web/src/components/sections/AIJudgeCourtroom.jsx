import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Scale, Gavel } from "lucide-react";
import DecryptedText from "@/components/DecryptedText";
import { useApp } from "@/context/AppContext";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

export default function AIJudgeCourtroom({ onNext }) {
  const { updateState, config, t, siteSlug } = useApp();
  const [text, setText] = useState("");
  const [slam, setSlam] = useState(false);
  const [verdict, setVerdict] = useState(false);
  
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

  const handleSubmit = useCallback(async () => {
    setSlam(true);
    setIsJudging(true);

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

    updateState({ pleaText: text, lastAction: "plea-submitted" });

    // AI Live Verdict
    let finalTitle = config?.judgeText?.title || "بعد دراسة الأدلة والمرافعات... المحكمة تحكم لصالح {girlName}! ⚖️❤️";
    let finalDetails = config?.judgeText?.details || "القاضي: كل اللي عملته {girlName} صح والباقي كلامه فارغ 😂";

    if (siteSlug) {
      try {
        const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}/judge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pleaText: text,
            girlName: config?.girlName,
            boyName: config?.boyName
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title && data.details) {
            finalTitle = data.title;
            finalDetails = data.details;
          }
        }
      } catch (err) {
        console.error("AI Judge Error:", err);
      }
    }

    setDynamicTitle(finalTitle);
    setDynamicDetails(finalDetails);
    
    setIsJudging(false);
    setVerdict(true);
    updateState({ batteryLevel: 70, lastAction: "verdict" });
  }, [text, onNext, updateState, siteSlug, config]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <motion.div
        ref={cardRef}
        className={`${CARD} w-full max-w-lg p-10 text-center relative overflow-hidden`}
        animate={slam ? { rotate: [0, -1.5, 1.5, 0], scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Scale size={48} className="mx-auto mb-4 text-[#1A1A1A]" />
        <h3 className="mb-2 text-2xl font-semibold text-[#1A1A1A]">
          <DecryptedText text={t("محكمة العدل العليا ⚖️")} speed={30} />
        </h3>
        <p className="mb-6 text-sm font-medium text-[#5A5955]">
          {t("القاضي الذكي جاهز للاستماع لمرافعتك")}
        </p>

        {verdict ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="rounded-3xl border border-[#DFBA73]/40 bg-[#DFBA73]/10 p-6"
          >
            <p className="text-lg font-semibold leading-relaxed text-[#1A1A1A]">
              {t(dynamicTitle)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#5A5955]">
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
                className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-8 py-3 text-sm font-medium text-[#F4F3EF] hover:bg-[#DFBA73] transition-colors"
              >
                {t("قرأت الحكم، استمرار")} <Gavel size={16} />
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <label className="mb-2 block text-start text-sm font-medium text-[#1A1A1A]">
              {t("اكتبي سبب زعلِك هنا عشان سيادة القاضي يحكم بينكم بالعدل")}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("اكتب دفاعك هنا... (خليك رومانسي)")}
              className="w-full resize-none rounded-2xl border border-[#E5E0D8] bg-white/50 p-5 text-sm text-[#1A1A1A] placeholder-[#8A7E72] outline-none transition-all focus:border-[#1A1A1A] focus:bg-white"
              rows={4}
              disabled={isJudging}
            />

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || isJudging}
                className={`inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-8 py-3 text-sm font-medium text-[#F4F3EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2 ${
                  !text.trim() || isJudging
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#DFBA73]"
                }`}
              >
                <Gavel size={18} /> {isJudging ? t("جاري النطق بالحكم...") : t("إرسال حكم المحكمة")}
              </button>

              <motion.button
                ref={courtRunBtnRef}
                type="button"
                onMouseEnter={courtJump}
                onClick={courtJump}
                onTouchStart={() => {
                  courtJump();
                }}
                animate={{ x: courtRunPos.x, y: courtRunPos.y }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-full border border-red-300 bg-white px-6 py-3 text-sm font-medium text-red-500 cursor-pointer"
                style={{ willChange: "transform" }}
                disabled={isJudging}
              >
                {t("رفض الصلح 😡")}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
