import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { grandConfetti } from "@/utils/confetti";
import FinalFeedback from "@/components/sections/FinalFeedback";
import { motionVariantsLetter } from "@/utils/motionVariants";

const CARD =
  "bg-[#F4F3EF]/60 backdrop-blur-3xl border border-[#1A1A1A]/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] rounded-[2.5rem]";

const BODY = [
  "{girlNickname} الجميلة اللي ماليش غيرها،",
  "عارف إني ممكن أكون بزعلك أحياناً، وعارف إن الموقف الأخير ضايقك.. بس يعلم ربنا إنك عندي بالدنيا وما فيها. إنتي مش بس حبيبتي، إنتي الروح اللي بتنور أيامي والضحكة اللي بتمسح كل تعبي.",
  "عملتلك الموقع ده مخصوص عشان أثبتلك إن مفيش خناقة تقدر تبعدني عنك، وإنك تستاهلي كل حاجة حلوة في الدنيا وتستاهلي إني أتعب وأبرمج مخصوص عشان أشوف ضحكتك دي.",
  "أسف على كل لحظة زعل، وأوعدك إني دايماً هفضل جنبك وسندك. يا رب دايماً مع بعض، ويا رب دايماً مالية حياتي فرحة.",
];

export default function FinalLetter({ onNext }) {
  const { updateState, config, t } = useApp();
  const [opened, setOpened] = useState(false);

  const letterConfig = config?.finalLetter || {
    title: "إلى أغلى ما أملك.. 🤍",
    body: BODY,
    loveSignature: "بحبك يا {girlName} ❤️",
    boySignature: "- {boyName}",
  };

  const title = t(letterConfig.title);
  const body = (letterConfig.body || []).map((p) => t(p));
  const loveSignature = t(letterConfig.loveSignature);
  const boySignature = t(letterConfig.boySignature);

  useEffect(() => {
    updateState({
      batteryLevel: 100,
      currentSection: "letter",
      body: body,
      lastAction: "final-letter",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLetter = useCallback(() => {
    setOpened(true);
    grandConfetti(3500);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, rotateX: 90, scale: 0.7 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <button
              type="button"
              onClick={openLetter}
              className="group relative flex h-56 w-full max-w-md items-center justify-center rounded-[2rem] border border-[#1A1A1A]/10 bg-[#DFBA73]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBA73] focus-visible:ring-offset-2"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-[2rem] border-b border-[#1A1A1A]/10 bg-[#DFBA73]/25" />
              <motion.div
                className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
                animate={{
                  boxShadow: [
                    "0 0 0px #DC2626",
                    "0 0 28px #DC2626",
                    "0 0 0px #DC2626",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <Crown size={30} />
              </motion.div>
            </button>
            <p className="mt-6 text-sm font-medium text-[#5A5955]">
              {t("اضغطي لفتح الجواب")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            variants={motionVariantsLetter.container}
            initial="hidden"
            animate="show"
          >
            <div className={`${CARD} p-8 sm:p-12`}>
              <motion.h2
                variants={motionVariantsLetter.child}
                className="mb-7 text-center text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl"
              >
                {title}
              </motion.h2>

              {body.map((para, idx) => (
                <motion.p
                  key={idx}
                  variants={motionVariantsLetter.child}
                  className="mb-4 text-base leading-loose text-[#1A1A1A]"
                >
                  {para}
                </motion.p>
              ))}

              <motion.div
                variants={motionVariantsLetter.child}
                className="mt-8 text-end"
              >
                <p className="text-lg font-semibold text-[#1A1A1A]">
                  {loveSignature}
                </p>
                <p className="mt-1 text-sm font-medium text-[#5A5955]">
                  {boySignature}
                </p>
              </motion.div>
            </div>

            <FinalFeedback onNext={onNext} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
