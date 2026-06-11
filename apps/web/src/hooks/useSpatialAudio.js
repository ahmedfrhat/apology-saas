import { useRef, useCallback, useEffect } from "react";
import { useApp } from "@/context/AppContext";

/**
 * useSpatialAudio — Synthesized micro-feedback tones using Web Audio API.
 * No audio files needed — pure oscillator synthesis.
 * Auto-disabled on mobile or when user hasn't opted into audio.
 */
export default function useSpatialAudio() {
  const { audioPlaying } = useApp() || {};
  const ctxRef = useRef(null);
  const enabledRef = useRef(true);

  // Lazy-init AudioContext on first interaction
  const getCtx = useCallback(() => {
    if (!enabledRef.current || !audioPlaying) return null;
    if (typeof window === "undefined") return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!ctxRef.current) {
      try {
        ctxRef.current = new AudioContextClass();
      } catch {
        enabledRef.current = false;
        return null;
      }
    }

    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }

    return ctxRef.current;
  }, [audioPlaying]);

  // Core tone synthesizer
  const playTone = useCallback((freq, duration = 0.08, gain = 0.06, type = "sine") => {
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.01);
  }, [getCtx]);

  // Sweep synthesizer (ascending/descending)
  const playSweep = useCallback((startFreq, endFreq, duration = 0.3, gain = 0.04) => {
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.01);
  }, [getCtx]);

  // Pre-built interaction sounds
  const hoverSound = useCallback(() => {
    playTone(800, 0.05, 0.04, "sine");
  }, [playTone]);

  const clickSound = useCallback(() => {
    playTone(1200, 0.08, 0.06, "sine");
    setTimeout(() => playTone(600, 0.06, 0.04, "sine"), 20);
  }, [playTone]);

  const transitionSound = useCallback(() => {
    playSweep(400, 1200, 0.3, 0.04);
  }, [playSweep]);

  const errorSound = useCallback(() => {
    playSweep(300, 100, 0.15, 0.05);
  }, [playSweep]);

  const successSound = useCallback(() => {
    playTone(523, 0.1, 0.05, "sine");
    setTimeout(() => playTone(659, 0.1, 0.05, "sine"), 100);
    setTimeout(() => playTone(784, 0.15, 0.06, "sine"), 200);
  }, [playTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  return {
    hoverSound,
    clickSound,
    transitionSound,
    errorSound,
    successSound,
    playTone,
    playSweep,
  };
}
