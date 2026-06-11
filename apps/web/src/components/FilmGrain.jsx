import { useEffect, useState } from "react";

// Subtle film-grain overlay. Pure CSS/SVG noise, very low opacity.
export default function FilmGrain() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(isMobileUA || window.innerWidth < 768);
  }, []);

  if (isMobile) return null;

  const noise =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
    );

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
        opacity: 0.04,
        backgroundImage: `url("${noise}")`,
        backgroundRepeat: "repeat",
        mixBlendMode: "multiply",
      }}
    />
  );
}
