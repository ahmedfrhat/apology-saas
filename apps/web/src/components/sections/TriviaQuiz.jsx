import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import TiltWrapper from "@/components/TiltWrapper";
import { useApp } from "@/context/AppContext";
import { fireConfetti } from "@/utils/confetti";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

const QUESTIONS = [
  {
    q: "مين أكتر حد بحبه وبيدعمني؟",
    options: ["زيزو صاحبي", "احمد النسوانجي اللي معايا ف السكن", "انتي"],
    correct: ["زيزو صاحبي", "احمد النسوانجي اللي معايا ف السكن"],
    trap: { option: "انتي", msg: "بطلي عبط صحابي اهم اختاري تاني" },
  },
  {
    q: "إيه أكتر حاجة ببقى مبسوط وأنا بعملها؟",
    options: ["البرمجة", "العب كورة", "النوم"],
    correct: "العب كورة",
    trap: null,
  },
  {
    q: "مين أكتر حد بحبه؟",
    options: ["إنتي", "رونالدو"],
    correct: "رونالدو",
    trap: { option: "إنتي", msg: "اختاري صح خلي يومك يعدي يا منورتي! 😂" },
  },
];

export default function TriviaQuiz({ onNext }) {
  const { updateState, state, config, t, logLedgerEvent } = useApp();
  const [index, setIndex] = useState(0);
  const [shake, setShake] = useState(false);
  const [trapMsg, setTrapMsg] = useState("");
  const [finished, setFinished] = useState(false);
  const firstWrongHoverTime = useRef(null);

  const rawQuestions = config?.triviaQuestions || QUESTIONS;

  const questions = rawQuestions.map((question) => {
    const translatedOptions = (question.options || []).map((opt) => t(opt));

    let correct = question.correct;
    if (Array.isArray(correct)) {
      correct = correct.map((c) => t(c));
    } else if (typeof correct === "string") {
      correct = t(correct);
    }

    let trap = null;
    if (question.trap) {
      trap = {
        option: t(question.trap.option),
        msg: t(question.trap.msg),
      };
    }

    return {
      q: t(question.q),
      options: translatedOptions,
      correct,
      trap,
    };
  });

  const current = questions[index];

  useEffect(() => {
    updateState({ currentSection: "trivia", lastAction: "trivia-quiz" });
    if (logLedgerEvent) {
      logLedgerEvent("دخلت شاشة اختبار الذاكرة 👀");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCorrectOption = useCallback((opt) => {
    if (!current) return false;
    return Array.isArray(current.correct)
      ? current.correct.includes(opt)
      : opt === current.correct;
  }, [current]);

  const handleMouseEnterOption = useCallback((opt) => {
    if (!isCorrectOption(opt)) {
      if (!firstWrongHoverTime.current) {
        firstWrongHoverTime.current = Date.now();
        if (logLedgerEvent) {
          logLedgerEvent(`ترددت وحركت الماوس فوق خيار خاطئ: "${opt}" 🤔`);
        }
      }
    }
  }, [isCorrectOption, logLedgerEvent]);

    const handleAnswer = useCallback(
      (option) => {
        const currentQ = questions[index];
        if (!currentQ) return;

        // Log choice for tracking
        const currentChoices = state?.details?.quizChoices || [];
        const updatedDetails = {
          ...(state?.details || {}),
          quizChoices: [...currentChoices, { q: currentQ.q, answer: option }]
        };

        if (currentQ.trap && option === currentQ.trap.option) {
          updatedDetails.trapCount = (updatedDetails.trapCount || 0) + 1;
          updateState({ details: updatedDetails });
          
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]); // double buzz for trap
          }

          if (logLedgerEvent) {
            logLedgerEvent(`وقعت في فخ سؤال الذاكرة واختارت: "${option}" 🪤`);
          }

          setShake(true);
          setTrapMsg(currentQ.trap.msg);
          setTimeout(() => setShake(false), 500);
          return;
        }
        
        updateState({ details: updatedDetails });

        const isCorrect = Array.isArray(currentQ.correct)
          ? currentQ.correct.includes(option)
          : option === currentQ.correct;
  
        if (!isCorrect) {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]); // double buzz for wrong answer
          }

          if (logLedgerEvent) {
            logLedgerEvent(`أجابت بشكل خاطئ واختارت: "${option}" ❌`);
          }

          setShake(true);
          setTrapMsg(t(config?.quizWrongMessage) || t("جرّبي تاني يا {girlNickname} 😅"));
          setTimeout(() => setShake(false), 500);
          return;
        }

      // Correct answer haptic
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(40); // clean short buzz
      }

      // Check for hesitation
      if (firstWrongHoverTime.current) {
        const seconds = (Date.now() - firstWrongHoverTime.current) / 1000;
        if (seconds >= 2) {
          updateState({
            hesitationDetected: true,
            hesitationSeconds: Math.round(seconds),
          });
        }
      }

      setTrapMsg("");
      if (logLedgerEvent) {
        logLedgerEvent(`أجابت إجابة صحيحة واختارت: "${option}" ✅`);
      }
      fireConfetti({
        particleCount: 70,
        spread: 80,
        origin: { x: 0.5, y: 0.5 },
      });
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
        firstWrongHoverTime.current = null; // reset for next question
      } else {
        setFinished(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 150]); // premium success vibration
        }
        if (logLedgerEvent) {
          logLedgerEvent("أكملت جميع أسئلة اختبار الذاكرة بنجاح! 🏆");
        }
        updateState({ batteryLevel: 60, lastAction: "trivia-done" });
        setTimeout(onNext, 2600);
      }
    },
    [index, onNext, updateState, questions, t],
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        <TiltWrapper className={`${CARD} w-full max-w-md p-10 text-center`}>
          {finished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Trophy size={56} className="mx-auto mb-4 text-[#DFBA73]" />
              <p className="text-2xl font-semibold text-[#1A1A1A]">
                {t("🏆 برافو عليكي!")}
              </p>
              <p className="mt-3 text-base font-medium text-[#5A5955]">
                {t("كده أقدر أطمن عليكي إنك فهمني صح 😂")}
              </p>
            </motion.div>
          ) : (
            current && (
              <>
                <p className="mb-2 text-xs font-medium text-[#5A5955]">
                  {t("سؤال")} {index + 1} {t("من")} {questions.length}
                </p>
                <h3 className="mb-8 text-xl font-semibold text-[#1A1A1A]">
                  {t("اختبار بسيط كده 👀")}
                </h3>
                <p className="mb-7 text-lg font-medium text-[#1A1A1A]">
                  {current.q}
                </p>

                <div className="flex flex-col gap-3">
                  {current.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onMouseEnter={() => handleMouseEnterOption(opt)}
                      onClick={() => handleAnswer(opt)}
                      className="rounded-full border border-[#1A1A1A]/10 bg-white px-6 py-3 text-base font-medium text-[#1A1A1A] transition-colors hover:border-[#DFBA73] hover:bg-[#DFBA73]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {trapMsg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 text-sm font-semibold text-red-500"
                  >
                    {trapMsg}
                  </motion.p>
                )}
              </>
            )
          )}
        </TiltWrapper>
      </motion.div>
    </div>
  );
}
