import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function ScratchToReveal({ src, alt, className = "" }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [averageColor, setAverageColor] = useState("rgba(180, 165, 140, 0.2)");
  const [cleared, setCleared] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const lastHapticRef = useRef(0);

  // Extract average color for adaptive glow
  const handleImageLoad = () => {
    setImageLoaded(true);
    try {
      const img = imgRef.current;
      if (!img) return;

      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      
      // Save rgb for shadow styling
      setAverageColor(`rgba(${r}, ${g}, ${b}, 0.35)`);
    } catch (e) {
      console.warn("Failed to extract average color for adaptive glow (CORS or canvas error)", e);
    }
  };

  // Set up Scratch Canvas
  useEffect(() => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Resolve CSS variables dynamically since canvas doesn't parse var()
    const getCssVariable = (name, fallback) => {
      if (typeof window === "undefined") return fallback;
      const val = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return val || fallback;
    };

    const bgSurface2 = getCssVariable("--bg-surface-2", "#F4F0E8");
    const textMuted = getCssVariable("--text-muted", "#9C8E7E");
    const textPrimary = getCssVariable("--text-primary", "#1A1510");

    // Draw scratchable overlay (premium warm smoke gradient)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, bgSurface2);
    gradient.addColorStop(1, textMuted);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text instruction
    ctx.font = "bold 14px 'Cairo', sans-serif";
    ctx.fillStyle = textPrimary;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("امسحي الصورة لتتذكري 💭", canvas.width / 2, canvas.height / 2);

    // Add noise to give a textured smoky feel
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

  }, [imageLoaded]);

  // Handle Scratching
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch or mouse event
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

  // Check how much is cleared to trigger full reveal
  const checkClearedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    
    // Low-resolution sample of alpha channel to avoid heavy processing
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let clearedCount = 0;
    const totalPixels = data.length / 4;
    const step = 20; // sample every 20th pixel
    let samples = 0;

    for (let i = 3; i < data.length; i += 4 * step) {
      samples++;
      if (data[i] === 0) {
        clearedCount++;
      }
    }

    const ratio = clearedCount / samples;
    if (ratio > 0.40) { // 40% cleared is enough for full reveal
      setCleared(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 30, 50]); // Success double vibration
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden w-full h-full bg-[#FAF8F3] dark:bg-[#141622] transition-all duration-500 ${className}`}
      style={{
        boxShadow: `0 20px 50px -10px ${averageColor}`,
        borderRadius: "1.5rem",
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
        className="w-full h-full object-cover select-none pointer-events-none"
      />
      
      {imageLoaded && (
        <AnimatePresence>
          {!cleared && (
            <motion.canvas
              ref={canvasRef}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onMouseDown={startScratching}
              onMouseMove={scratch}
              onMouseUp={stopScratching}
              onMouseLeave={stopScratching}
              onTouchStart={startScratching}
              onTouchMove={scratch}
              onTouchEnd={stopScratching}
              className="absolute inset-0 z-10 cursor-pointer touch-none"
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
