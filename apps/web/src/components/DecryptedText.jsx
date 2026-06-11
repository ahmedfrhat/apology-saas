import { useState, useEffect, useRef } from "react";

const SCRAMBLE =
  "!<>-_\\/[]{}—=+*^?#________أبتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789";

let audioCtx = null;
function playKeyboardClickSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    // Very short white noise buffer (0.015 seconds)
    const bufferSize = audioCtx.sampleRate * 0.015;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1500 + Math.random() * 700; // slightly randomized click pitch
    filter.Q.value = 9;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime); // soft volume
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.012);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
  } catch (e) {
    // Ignore Web Audio errors (e.g. if autoplay blocked)
  }
}

// Reveals text char-by-char, each char scrambling through random glyphs first.
export default function DecryptedText({
  text,
  className = "",
  speed = 28,
  startDelay = 0,
  onDone,
  playTypingSound = false,
}) {
  const [display, setDisplay] = useState("");
  const frameRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let revealed = 0;
    let tick = 0;
    let cancelled = false;
    let timeoutId = null;

    const run = () => {
      const animate = () => {
        if (cancelled) return;
        tick += 1;

        // every few ticks, lock in another character
        if (tick % 2 === 0 && revealed < text.length) {
          revealed += 1;
          if (playTypingSound && text[revealed - 1] !== " ") {
            playKeyboardClickSound();
          }
        }

        let out = "";
        for (let i = 0; i < text.length; i += 1) {
          if (i < revealed) {
            out += text[i];
          } else if (text[i] === " ") {
            out += " ";
          } else {
            out += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
          }
        }
        setDisplay(out);

        if (revealed < text.length) {
          frameRef.current = setTimeout(animate, speed);
        } else {
          setDisplay(text);
          if (onDoneRef.current) onDoneRef.current();
        }
      };
      animate();
    };

    timeoutId = setTimeout(run, startDelay);

    return () => {
      cancelled = true;
      if (frameRef.current) clearTimeout(frameRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, speed, startDelay, playTypingSound]);

  return <span className={className}>{display}</span>;
}
