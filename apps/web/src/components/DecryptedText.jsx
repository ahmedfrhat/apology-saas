import { useState, useEffect, useRef } from "react";

const SCRAMBLE =
  "!<>-_\\/[]{}—=+*^?#________أبتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789";

// Reveals text char-by-char, each char scrambling through random glyphs first.
export default function DecryptedText({
  text,
  className = "",
  speed = 28,
  startDelay = 0,
  onDone,
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
  }, [text, speed, startDelay]);

  return <span className={className}>{display}</span>;
}
