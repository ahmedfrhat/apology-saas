import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MoodProvider } from "@/context/MoodProvider";
import { sectionContainer } from "@/utils/motionVariants";
import HiddenMultiSourcePlayer from "@/components/HiddenMultiSourcePlayer";
import useSpatialAudio from "@/hooks/useSpatialAudio";

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

export async function loader({ request, params }) {
  const origin = request?.url ? new URL(request.url).origin : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://safi.io");
  try {
    const result = await sql`SELECT config FROM apology_sites WHERE slug = ${params.slug}`;
    if (result && result.length > 0) {
      const { boyName, girlName } = result[0].config;
      return { boyName, girlName, origin };
    }
  } catch (err) {
    console.error("OG Loader Error:", err);
  }
  return { boyName: "أنا", girlName: "أنتي", origin };
}

export function meta({ data }) {
  const boy = data?.boyName || "أنا";
  const girl = data?.girlName || "أنتي";
  const origin = data?.origin || "https://safi.io";
  const ogUrl = `${origin}/api/og?boy=${encodeURIComponent(boy)}&girl=${encodeURIComponent(girl)}`;
  
  return [
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "أنا آسف.. افتح الرابط لرؤية الرسالة المغلقة 🔒" },
    { property: "og:description", content: `أرسل لك ${boy} رسالة اعتذار سرية وخاصة جداً.. اضغط لفتحها وتفعيل البصمة 🔑` },
    { property: "og:image", content: ogUrl },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Safi.io" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "أنا آسف.. افتح الرابط لرؤية الرسالة المغلقة 🔒" },
    { name: "twitter:description", content: `أرسل لك ${boy} رسالة اعتذار سرية وخاصة جداً.. اضغط لفتحها وتفعيل البصمة 🔑` },
    { name: "twitter:image", content: ogUrl }
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

function Experience({ stepState }) {
  const { config, playMusic } = useApp();
  const [booted, setBooted] = useState(false);
  const [step, setStep] = stepState;
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);
  const { transitionSound } = useSpatialAudio();
  const prevStepRef = useRef(step);

  useEffect(() => {
    if (step > prevStepRef.current) {
      transitionSound();
    }
    prevStepRef.current = step;
  }, [step, transitionSound]);

  useEffect(() => {
    if (booted) {
      setShowMusicPrompt(true);
    }
  }, [booted]);

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, SECTIONS.length - 1));
  }, [setStep]);

  const handlePlayMusic = useCallback(() => {
    playMusic();
    setShowMusicPrompt(false);
  }, [playMusic]);

  const Current = SECTIONS[step];
  const isVoid = Current === EternalVoidCanvas;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Aurora ambient glow — mood-reactive background layer */}
      <div className="aurora-bg" aria-hidden="true" />

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md">
              <motion.button
                initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayMusic}
                className="glass-card-elevated mood-glow-btn px-8 py-4 rounded-full text-base font-semibold text-[#1A1A1A] flex items-center gap-3 cursor-pointer"
              >
                <span className="animate-bounce text-xl">🎵</span>
                <span className="glow-text font-bold">تشغيل الموسيقى المفضلة</span>
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
              className="relative z-10 gpu-accelerated"
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
import StealthChatWidget from "@/components/StealthChatWidget";

export default function ExperiencePage() {
  return (
    <AppProvider>
      <AuthGate>
        <ExperienceWithMood />
        <HiddenMultiSourcePlayer />
        <BroadcastToast />
        <StealthChatWidget />
      </AuthGate>
    </AppProvider>
  );
}

/** Wrapper that provides MoodProvider with the current stage index */
function ExperienceWithMood() {
  const [step, setStep] = useState(0);
  return (
    <MoodProvider stageIndex={step}>
      <Experience stepState={[step, setStep]} />
    </MoodProvider>
  );
}

