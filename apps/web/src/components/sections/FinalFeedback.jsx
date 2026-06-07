import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Star,
  ShieldAlert,
  Gift,
  Terminal as TerminalIcon,
  CheckCircle,
  Heart,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { grandConfetti, heartConfetti, celebrate } from "@/utils/confetti";

// ---- Individual full-screen takeover scenarios ----

function OneStar({ text, onEscalate }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count <= 0) {
      heartConfetti();
      const t = setTimeout(onEscalate, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onEscalate]);

  const renderedText = text.replace(/{count}/g, Math.max(count, 0));

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black px-6 text-center">
      {[
        "top-6 start-6",
        "top-6 end-6",
        "bottom-6 start-6",
        "bottom-6 end-6",
      ].map((p) => (
        <motion.span
          key={p}
          className={`absolute ${p} h-5 w-5 rounded-full bg-red-600`}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      ))}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 0.9 }}
      >
        <ShieldAlert size={90} className="mb-6 text-red-500" />
      </motion.div>
      <p className="mb-6 max-w-md text-base font-medium leading-relaxed text-red-300">
        {renderedText}
      </p>
      <span className="text-7xl font-semibold text-white">
        {Math.max(count, 0)}
      </span>
    </div>
  );
}

function TwoStar({ text, onEscalate }) {
  const { t } = useApp();
  useEffect(() => {
    const t = setTimeout(onEscalate, 3800);
    return () => clearTimeout(t);
  }, [onEscalate]);
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-6 text-center"
      style={{
        background: "radial-gradient(circle at center, #78350F, #1A1207)",
      }}
    >
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 0.9 }}
      >
        <Gift size={80} className="mb-6 text-amber-300" />
      </motion.div>
      <p className="mb-6 max-w-md text-base font-medium leading-relaxed text-amber-100">
        {text}
      </p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm font-medium text-amber-100"
      >
        {t("🎁 تمت إضافة كوبون حلو غزل بنات/سينابون إضافي للحساب لتعديل المزاج!")}
      </motion.div>
    </div>
  );
}

function ThreeStar({ text, onEscalate }) {
  const { t } = useApp();
  const full = t(
    "> تم العثور على كلمة 'بحبك' مشطوبة في النص المدخل! السيستم يقرر ترقية التقييم فوراً لـ 5 نجوم للامتثال لمعايير الرومانسية العالمية."
  );
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        setTimeout(onEscalate, 1200);
      }
    }, 28);
    return () => clearInterval(id);
  }, [onEscalate, full]);
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center"
      animate={{ x: [0, -8, 8, -6, 6, 0] }}
      transition={{ repeat: Infinity, duration: 0.5 }}
    >
      <TerminalIcon size={70} className="mb-5 text-emerald-400" />
      <p className="mb-6 max-w-md text-base font-medium leading-relaxed text-gray-300">
        {text}
      </p>
      <div
        dir="rtl"
        className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-black/60 p-4 text-start font-mono text-xs leading-relaxed text-emerald-400 sm:text-sm"
      >
        {typed}
      </div>
    </motion.div>
  );
}

function FourStar({ text, onEscalate }) {
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setClicked(true), 1900);
    const t2 = setTimeout(() => {
      celebrate();
      onEscalate();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onEscalate]);
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
      style={{
        background: "radial-gradient(circle at center, #701A75, #2A0A2E)",
      }}
    >
      <CheckCircle size={80} className="mb-6 text-fuchsia-300" />
      <p className="mb-8 max-w-md text-base font-medium leading-relaxed text-fuchsia-100">
        {text}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={34}
            className={
              n <= (clicked ? 5 : 4) ? "text-amber-300" : "text-white/30"
            }
            fill={n <= (clicked ? 5 : 4) ? "#FCD34D" : "transparent"}
          />
        ))}
      </div>
      {/* fake cursor flying to the 5th star */}
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        className="absolute"
        initial={{ bottom: 20, left: "50%", opacity: 0 }}
        animate={{
          bottom: ["5%", "42%"],
          opacity: [0, 1, 1],
          scale: clicked ? [1, 0.8, 1] : 1,
        }}
        transition={{ duration: 1.8 }}
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
      >
        <path
          d="M3 2l7 18 2.5-7L20 10.5 3 2z"
          fill="white"
          stroke="black"
          strokeWidth="1"
        />
      </motion.svg>
    </div>
  );
}

function FiveStar({ text, onDone }) {
  useEffect(() => {
    grandConfetti(5000);
    const t = setTimeout(onDone, 5200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-6 text-center"
      style={{
        background: "radial-gradient(circle at center, #831843, #2A0A1E)",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <Heart size={100} fill="#F472B6" className="mb-6 text-pink-400" />
      </motion.div>
      <p className="max-w-md text-lg font-semibold leading-relaxed text-pink-100">
        {text}
      </p>
    </div>
  );
}

// ---- Main feedback component ----

export default function FinalFeedback({ onNext }) {
  const { updateState, config, t } = useApp();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [takeover, setTakeover] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const lockRef = useRef(false);

  const feedbackTexts = {
    oneStar: t(
      config?.feedbackTexts?.oneStar ||
        "🚨 تنبيه أمني خطير! تم رصد تقييم عدائي (1 نجمة). السيستم يعتبر هذا تهديداً لسلامة روقان {boyName}، وجاري تفجير الشاشة بقلوب ناعمة للدفاع عن النفس خلال {count} ثوانٍ..."
    ),
    twoStar: t(
      config?.feedbackTexts?.twoStar ||
        "ممم.. نجمتين؟ تحسن طفيف ولكن لا يليق بالملكة {girlName}. جاري تفعيل بروتوكول الرشوة التلقائية..."
    ),
    threeStar: t(
      config?.feedbackTexts?.threeStar ||
        "3 نجوم؟ يعني صافي يا لبن بس كبرياء {boyName} مجروح شوية. جاري فحص ملفات السيرفر..."
    ),
    fourStar: t(
      config?.feedbackTexts?.fourStar ||
        "يا سلاام! 4 نجوم! وصلنا لـ 80% من الروقان الكامل. بس {boyName} محتاج النجمة الأخيرة دي عشان يعدي ترم هندسة الكمبيوتر بسلام 😂"
    ),
    fiveStar: t(
      config?.feedbackTexts?.fiveStar ||
        "كفاءة 100%! تم توثيق الصلح الشامل، وإعلان {girlName} كأعظم ملكة في المجرة! 🥰❤️"
    ),
  };

  const escalateToFive = useCallback(() => {
    setTakeover(5);
  }, []);

  const runScenario = useCallback(
    (rating) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setSubmitted(true);
      updateState({
        starRating: rating,
        finalComment: comment,
        lastAction: `rated-${rating}`,
      });
      setTakeover(rating);
    },
    [comment, updateState],
  );

  const finish = useCallback(() => {
    updateState({ isEternalVoid: true, lastAction: "eternal-void" });
    onNext();
  }, [onNext, updateState]);

  const renderTakeover = () => {
    switch (takeover) {
      case 1:
        return <OneStar text={feedbackTexts.oneStar} onEscalate={escalateToFive} />;
      case 2:
        return <TwoStar text={feedbackTexts.twoStar} onEscalate={escalateToFive} />;
      case 3:
        return <ThreeStar text={feedbackTexts.threeStar} onEscalate={escalateToFive} />;
      case 4:
        return <FourStar text={feedbackTexts.fourStar} onEscalate={escalateToFive} />;
      case 5:
        return <FiveStar text={feedbackTexts.fiveStar} onDone={finish} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mt-10 rounded-[2.5rem] border border-[#1A1A1A]/10 bg-[#F4F3EF]/60 p-8 text-center backdrop-blur-3xl">
        <h3 className="mb-6 text-xl font-semibold text-[#1A1A1A]">
          {t("تقييمك لتجربة الصلح؟ 🌟")}
        </h3>

        <div
          className="mb-7 flex justify-center gap-2"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onClick={() => setStars(n)}
              disabled={submitted}
              aria-label={`${n} نجوم`}
              className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
            >
              <Star
                size={36}
                className={
                  n <= (hover || stars) ? "text-[#DFBA73]" : "text-[#1A1A1A]/20"
                }
                fill={n <= (hover || stars) ? "#DFBA73" : "transparent"}
              />
            </button>
          ))}
        </div>

        <label className="mb-2 block text-start text-sm font-medium text-[#1A1A1A]">
          {t("كلمة أخيرة (بتتكتب لايف عندي 😉)")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={t("اكتبي أي حاجة في قلبك...")}
          className="mb-5 w-full resize-none rounded-2xl border border-[#1A1A1A]/10 bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73]"
        />

        <button
          type="button"
          disabled={stars === 0 || submitted}
          onClick={() => runScenario(stars)}
          className="rounded-full bg-[#1A1A1A] px-8 py-3.5 text-sm font-medium text-[#F4F3EF] transition-colors hover:bg-[#DFBA73] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
        >
          {t("إرسال صك الصلح النهائي")}
        </button>
      </div>

      <AnimatePresence>
        {takeover && (
          <motion.div
            key={takeover}
            className="fixed inset-0 z-[150]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTakeover()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
