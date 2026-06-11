import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "@/context/AppContext";
import { sectionContainer } from "@/utils/motionVariants";
import HiddenMultiSourcePlayer from "@/components/HiddenMultiSourcePlayer";

import TerminalLoader from "@/components/TerminalLoader";
import AmbientParticles from "@/components/AmbientParticles";
import FilmGrain from "@/components/FilmGrain";
import HeartTrail from "@/components/HeartTrail";
import LoveBatteryHUD from "@/components/LoveBatteryHUD";
import PanicButton from "@/components/PanicButton";
import AudioController from "@/components/AudioController";
import BroadcastToast from "@/components/BroadcastToast";

import LandingSection from "@/components/sections/LandingSection";
import HackerTerminal from "@/components/sections/HackerTerminal";
import SmileDetector from "@/components/sections/SmileDetector";
import MoodSlider from "@/components/sections/MoodSlider";
import LoveTimeline from "@/components/sections/LoveTimeline";
import TriviaQuiz from "@/components/sections/TriviaQuiz";
import AIJudgeCourtroom from "@/components/sections/AIJudgeCourtroom";
import GiftCoupons from "@/components/sections/GiftCoupons";
import FingerprintScanner from "@/components/sections/FingerprintScanner";
import DeadlyTrapQuestion from "@/components/sections/DeadlyTrapQuestion";
import FinalLetter from "@/components/sections/FinalLetter";
import EternalVoidCanvas from "@/components/sections/EternalVoidCanvas";

import sql from "@/app/api/utils/sql";

export async function loader({ params }) {
  try {
    const result = await sql`SELECT config FROM apology_sites WHERE slug = ${params.slug}`;
    if (result && result.length > 0) {
      const { boyName, girlName } = result[0].config;
      return { boyName, girlName };
    }
  } catch (err) {
    console.error("OG Loader Error:", err);
  }
  return { boyName: "أنا", girlName: "أنتي" };
}

export function meta({ data }) {
  const boy = data?.boyName || "أنا";
  const girl = data?.girlName || "أنتي";
  return [
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: `مفاجأة خاصة من ${boy} إلى ${girl} 🎁` },
    { property: "og:description", content: "Safi.io - منصة المصالحة والاعتذار الذكية" },
    { property: "og:image", content: `/api/og?boy=${encodeURIComponent(boy)}&girl=${encodeURIComponent(girl)}` },
    { name: "twitter:card", content: "summary_large_image" }
  ];
}

const SECTIONS = [
  LandingSection,
  HackerTerminal,
  SmileDetector,
  MoodSlider,
  LoveTimeline,
  TriviaQuiz,
  AIJudgeCourtroom,
  GiftCoupons,
  FingerprintScanner,
  DeadlyTrapQuestion,
  FinalLetter,
  EternalVoidCanvas,
];

function Experience() {
  const { config, playMusic } = useApp();
  const [booted, setBooted] = useState(false);
  const [step, setStep] = useState(0);
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);

  useEffect(() => {
    if (booted) {
      setShowMusicPrompt(true);
    }
  }, [booted]);

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, SECTIONS.length - 1));
  }, []);

  const handlePlayMusic = useCallback(() => {
    playMusic();
    setShowMusicPrompt(false);
  }, [playMusic]);

  const Current = SECTIONS[step];
  const isVoid = Current === EternalVoidCanvas;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {!booted && <TerminalLoader onDone={() => setBooted(true)} />}

      {booted && (
        <>
          {!isVoid && (
            <>
              <AmbientParticles />
              <FilmGrain />
              <HeartTrail />
              <LoveBatteryHUD />
              <PanicButton />
              <AudioController />
            </>
          )}

          {showMusicPrompt && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayMusic}
                className="bg-[#F4F3EF]/95 backdrop-blur-xl border border-[#DFBA73] shadow-[0_20px_50px_rgba(223,186,115,0.5)] px-8 py-4 rounded-full text-base font-semibold text-[#1A1A1A] flex items-center gap-3 cursor-pointer transition-all hover:bg-[#DFBA73]/10"
              >
                <span className="animate-bounce text-xl">🎵</span>
                تشغيل الموسيقى المفضلة
              </motion.button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={sectionContainer}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative z-10"
            >
              <Current onNext={next} />
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

import AuthGate from "@/components/AuthGate";

export default function ExperiencePage() {
  return (
    <AppProvider>
      <AuthGate>
        <Experience />
        <HiddenMultiSourcePlayer />
        <BroadcastToast />
      </AuthGate>
    </AppProvider>
  );
}
