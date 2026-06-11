import React, { useRef, useState, useCallback, useEffect } from "react";

/**
 * TiltWrapper — Magnetic Proximity + 3D Tilt
 * Sprint 6 upgrade: cursor proximity attraction with spring-back.
 * GPU-only: uses translate3d + rotateX/Y exclusively.
 * Mobile upgrade: Touch-based tilt, auto-tilting CSS animation when idle.
 */
export default function TiltWrapper({ children, className = "", maxTilt = 8, maxShift = 6, ...props }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(isMobileUA || window.innerWidth < 768);
  }, []);

  const handleMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Tilt calculation (when cursor is over the element)
      const relX = (mouseX - rect.left) / rect.width - 0.5;
      const relY = (mouseY - rect.top) / rect.height - 0.5;
      const tiltX = -(relY * maxTilt);
      const tiltY = relX * maxTilt;

      // Magnetic shift (subtle pull toward cursor)
      const distX = mouseX - centerX;
      const distY = mouseY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const maxDist = 300;
      const pull = Math.max(0, 1 - dist / maxDist);
      const shiftX = (distX / maxDist) * maxShift * pull;
      const shiftY = (distY / maxDist) * maxShift * pull;

      setStyle({
        transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${shiftX}px, ${shiftY}px, 0)`,
        transition: "transform 0.1s ease-out",
      });
    });
  }, [maxTilt, maxShift]);

  const handleLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)",
      transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    });
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!e.touches || !e.touches[0]) return;
    setIsTouched(true);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const relX = (touchX - rect.left) / rect.width - 0.5;
      const relY = (touchY - rect.top) / rect.height - 0.5;
      
      const clampedX = Math.max(-0.5, Math.min(0.5, relX));
      const clampedY = Math.max(-0.5, Math.min(0.5, relY));

      const tiltX = -(clampedY * maxTilt);
      const tiltY = clampedX * maxTilt;

      setStyle({
        transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(0, 0, 0)`,
        transition: "transform 0.1s ease-out",
      });
    });
  }, [maxTilt]);

  const handleTouchEnd = useCallback(() => {
    setIsTouched(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)",
      transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const animationStyle = isMobile && !isTouched ? {
    animation: "mobileFloatTilt 6s ease-in-out infinite",
  } : {};

  return (
    <>
      {isMobile && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes mobileFloatTilt {
            0% { transform: perspective(800px) rotateX(2.5deg) rotateY(-2.5deg) translate3d(0.5px, -0.5px, 0); }
            50% { transform: perspective(800px) rotateX(-2.5deg) rotateY(2.5deg) translate3d(-0.5px, 0.5px, 0); }
            100% { transform: perspective(800px) rotateX(2.5deg) rotateY(-2.5deg) translate3d(0.5px, -0.5px, 0); }
          }
        `}} />
      )}
      <div
        ref={ref}
        className={className}
        style={{
          willChange: "transform",
          transformStyle: "preserve-3d",
          ...style,
          ...animationStyle,
        }}
        onMouseMove={isMobile ? undefined : handleMove}
        onMouseLeave={isMobile ? undefined : handleLeave}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        {...props}
      >
        {children}
      </div>
    </>
  );
}
