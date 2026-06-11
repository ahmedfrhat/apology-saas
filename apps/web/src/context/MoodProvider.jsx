import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { useApp } from "./AppContext";

const MoodContext = createContext({ mood: "love", moodColors: {}, setStageOverride: () => {} });

const MOOD_PALETTES = {
  love: {
    accent: "#FF6B9D",
    accentAlt: "#E84393",
    glow: "rgba(255,107,157,0.30)",
    glowStrong: "rgba(255,107,157,0.50)",
    particle: "#FF6B9D",
    particleAlt: "#E84393",
    gradientStart: "#FF6B9D",
    gradientMid: "#A855F7",
    gradientEnd: "#EC4899",
  },
  anger: {
    accent: "#FF4444",
    accentAlt: "#FF6B35",
    glow: "rgba(255,68,68,0.25)",
    glowStrong: "rgba(255,68,68,0.45)",
    particle: "#FF4444",
    particleAlt: "#FF8C00",
    gradientStart: "#FF4444",
    gradientMid: "#DC2626",
    gradientEnd: "#EA580C",
  },
  reconciliation: {
    accent: "#4ECDC4",
    accentAlt: "#45B7D1",
    glow: "rgba(78,205,196,0.30)",
    glowStrong: "rgba(78,205,196,0.50)",
    particle: "#4ECDC4",
    particleAlt: "#06B6D4",
    gradientStart: "#4ECDC4",
    gradientMid: "#06B6D4",
    gradientEnd: "#34D399",
  },
};

/**
 * HYBRID MOOD ENGINE — Stage-based mood overrides
 * Maps the 12-stage flow index to forced mood palettes:
 *  - Stages 0-4 (Landing → LoveTimeline): love
 *  - Stages 5-6 (TriviaQuiz, AIJudgeCourtroom): anger
 *  - Stages 7-10 (GiftCoupons → FinalLetter): reconciliation
 *  - Stage 11 (EternalVoidCanvas): reconciliation
 * Falls back to config.mood from the database.
 */
const STAGE_MOOD_MAP = {
  0: "love",           // LandingSection
  1: "love",           // HackerTerminal
  2: "love",           // SmileDetector
  3: "love",           // MoodSlider
  4: "love",           // LoveTimeline
  5: "anger",          // TriviaQuiz
  6: "anger",          // AIJudgeCourtroom
  7: "reconciliation", // GiftCoupons
  8: "reconciliation", // FingerprintScanner
  9: "reconciliation", // DeadlyTrapQuestion
  10: "reconciliation",// FinalLetter
  11: "reconciliation",// EternalVoidCanvas
};

export function MoodProvider({ children, stageIndex }) {
  const appCtx = useApp();
  const configMood = appCtx?.config?.mood;
  const [stageOverride, setStageOverride] = useState(null);
  const prevMoodRef = useRef(null);

  // Determine effective mood: stage override > prop stageIndex > config.mood > "love"
  const mood = useMemo(() => {
    // Priority 1: Explicit stage override from setStageOverride()
    if (stageOverride && MOOD_PALETTES[stageOverride]) return stageOverride;
    // Priority 2: Stage index from the 12-step flow
    if (stageIndex !== undefined && stageIndex !== null && STAGE_MOOD_MAP[stageIndex]) {
      return STAGE_MOOD_MAP[stageIndex];
    }
    // Priority 3: config.mood from database
    if (configMood && MOOD_PALETTES[configMood]) return configMood;
    // Fallback
    return "love";
  }, [stageOverride, stageIndex, configMood]);

  const moodColors = useMemo(() => MOOD_PALETTES[mood], [mood]);

  // Inject data-mood attribute and CSS variables onto <html> with crossfade
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const prev = prevMoodRef.current;

    // Smooth crossfade: add transition class for 300ms
    if (prev && prev !== mood) {
      html.classList.add("mood-transitioning");
      const timer = setTimeout(() => {
        html.classList.remove("mood-transitioning");
      }, 350);
      // Cleanup if mood changes again before transition ends
      prevMoodRef.current = mood;
      return () => {
        clearTimeout(timer);
        html.classList.remove("mood-transitioning");
      };
    }

    prevMoodRef.current = mood;

    // Set mood data attribute for CSS selectors
    html.dataset.mood = mood;

    // Inject CSS custom properties for the active mood
    const colors = MOOD_PALETTES[mood];
    html.style.setProperty("--mood-accent", colors.accent);
    html.style.setProperty("--mood-accent-alt", colors.accentAlt);
    html.style.setProperty("--mood-glow", colors.glow);
    html.style.setProperty("--mood-glow-strong", colors.glowStrong);
    html.style.setProperty("--mood-particle", colors.particle);
    html.style.setProperty("--mood-particle-alt", colors.particleAlt);
    html.style.setProperty("--mood-gradient-start", colors.gradientStart);
    html.style.setProperty("--mood-gradient-mid", colors.gradientMid);
    html.style.setProperty("--mood-gradient-end", colors.gradientEnd);

    return () => {
      delete html.dataset.mood;
    };
  }, [mood]);

  const value = useMemo(
    () => ({ mood, moodColors, setStageOverride }),
    [mood, moodColors]
  );

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}

export default MoodContext;
