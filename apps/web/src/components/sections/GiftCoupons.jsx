import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift } from "lucide-react";
import { useApp } from "@/context/AppContext";

const GIFTS = [
  "عزومة شاورما فورا مفيهاش نقاش 🧀",
  "كارت مصالحة فوري ومفتوح في الخناقة الجاية بدون أي عتاب 🕊️",
  "خروجة وفسحة كاملة في المكان اللي تختاريه على حساب {boyName} 🎟️",
];

function ScratchCard({ index, text, revealed, onReveal, locale }) {
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const lastHapticRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratchable overlay (premium rose-gold / bronze smoke gradient)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#E2D1B3");
    gradient.addColorStop(0.5, "#DFBA73");
    gradient.addColorStop(1, "#C9956C");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text instruction
    ctx.font = "bold 13px 'Cairo', sans-serif";
    ctx.fillStyle = "#1A1510";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      locale === "en" ? `Scratch Gift #${index + 1} 🎁` : `امسحي كارت الهدية ${index + 1} 🎁`,
      canvas.width / 2,
      canvas.height / 2
    );

    // Add noise to give a textured smoky feel
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
    setCanvasLoaded(true);
  }, [index, locale]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startScratching = (e) => {
    setIsDrawing(true);
    scratch(e);
  };

  const stopScratching = () => {
    setIsDrawing(false);
    checkClearedPercentage();
  };

  const scratch = (e) => {
    if (!isDrawing && e.type !== "touchstart") return;
    const canvas = canvasRef.current;
    if (!canvas || cleared) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI);
    ctx.fill();

    // Trigger subtle textured scratch vibration (throttled to 100ms)
    const now = Date.now();
    if (now - lastHapticRef.current > 100) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(3);
      }
      lastHapticRef.current = now;
    }
  };

  const checkClearedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let clearedCount = 0;
    const step = 20; 
    let samples = 0;

    for (let i = 3; i < data.length; i += 4 * step) {
      samples++;
      if (data[i] === 0) {
        clearedCount++;
      }
    }

    const ratio = clearedCount / samples;
    if (ratio > 0.40) { 
      setCleared(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 30, 50]); 
      }
      onReveal();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="glass-card relative h-52 w-full select-none overflow-hidden"
    >
      {/* Underlying revealed content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-[#DFBA73]/15 dark:bg-[#DFBA73]/10 border border-[#DFBA73]/40 rounded-[2rem]">
        <Gift size={32} className="text-[var(--accent)] mb-3 animate-pulse" />
        <span className="text-sm font-semibold leading-relaxed text-[#1A1A1A] dark:text-[#EDE8E0]">
          {text}
        </span>
      </div>

      {/* Canvas scratch layer */}
      <AnimatePresence>
        {!cleared && (
          <motion.canvas
            ref={canvasRef}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onMouseDown={startScratching}
            onMouseMove={scratch}
            onMouseUp={stopScratching}
            onMouseLeave={stopScratching}
            onTouchStart={startScratching}
            onTouchMove={scratch}
            onTouchEnd={stopScratching}
            className="absolute inset-0 z-20 cursor-pointer touch-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GiftCoupons({ onNext }) {
  const { updateState, config, t, logLedgerEvent } = useApp();
  const rawGifts = config?.giftCoupons || GIFTS;
  const gifts = rawGifts.map((g) => t(g));
  const [revealed, setRevealed] = useState([]);

  useEffect(() => {
    setRevealed(Array(gifts.length).fill(false));
  }, [gifts.length]);

  useEffect(() => {
    updateState({ currentSection: "gifts", lastAction: "gift-coupons" });
    if (logLedgerEvent) {
      logLedgerEvent("دخلت صفحة كروت الهدايا والمصالحة 🎁");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReveal = useCallback((i) => {
    setRevealed((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      if (logLedgerEvent) {
        logLedgerEvent(`امسحت كارت الهدية رقم ${i + 1} وكشفت: "${gifts[i]}" 🎟️`);
      }
      return next;
    });
  }, [gifts, logLedgerEvent]);

  const allRevealed = revealed.length > 0 && revealed.every(Boolean);

  useEffect(() => {
    if (allRevealed) {
      updateState({ batteryLevel: 80, lastAction: "gifts-revealed" });
      if (logLedgerEvent) {
        logLedgerEvent("كشفت جميع كروت الهدايا والمصالحة بنجاح! 🎉");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRevealed]);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center select-none">
      <h2 className="mb-2 text-3xl font-semibold tracking-tight text-[#1A1A1A] dark:text-[#EDE8E0]">
        {t("كروت الهدايا والمصالحة 🎁")}
      </h2>
      <p className="mb-10 text-sm font-medium text-[#5A5955] dark:text-[#A89E90]">
        {t("امسحي على الكروت لإزالة طبقة الحماية الفضية وكشف الهدايا الخاصة بك!")}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {gifts.map((g, i) => (
          <ScratchCard
            key={i}
            index={i}
            text={g}
            revealed={revealed[i] || false}
            onReveal={() => handleReveal(i)}
            locale={config?.locale}
          />
        ))}
      </div>

      {allRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex justify-center"
        >
          <button
            type="button"
            onClick={onNext}
            className="mood-glow-btn rounded-full bg-[#1A1A1A] dark:bg-[#EDE8E0] px-8 py-3.5 text-sm font-bold text-[#F4F3EF] dark:text-[#1A1510] transition-colors hover:bg-[var(--accent)] dark:hover:bg-[var(--accent)] hover:text-white dark:hover:text-white cursor-pointer shadow-md"
          >
            {t("استلام الهدايا وتفعيل الحماية 🔐")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
