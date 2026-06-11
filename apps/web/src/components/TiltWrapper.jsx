import React, { useRef, useState, useCallback } from "react";

/**
 * TiltWrapper — Magnetic Proximity + 3D Tilt
 * Sprint 6 upgrade: cursor proximity attraction with spring-back.
 * GPU-only: uses translate3d + rotateX/Y exclusively.
 */
export default function TiltWrapper({ children, className = "", maxTilt = 8, maxShift = 6, ...props }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const rafRef = useRef(null);

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

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, willChange: "transform", transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </div>
  );
}
