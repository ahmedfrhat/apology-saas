import { useEffect, useRef } from "react";
import { useMood } from "@/context/MoodProvider";

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export default function AmbientParticles() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const { moodColors } = useMood();
  const moodColorsRef = useRef(moodColors);

  useEffect(() => {
    moodColorsRef.current = moodColors;
  }, [moodColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const maxParticles = 80;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor(x, y, isMouseFollower = false) {
        this.x = x;
        this.y = y;
        this.isMouseFollower = isMouseFollower;
        this.size = isMouseFollower ? Math.random() * 3 + 2 : Math.random() * 4 + 1;
        this.speedX = isMouseFollower ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.8;
        this.speedY = isMouseFollower ? (Math.random() - 0.5) * 2 : -Math.random() * 1.2 - 0.3;
        this.life = 1;
        this.decay = isMouseFollower ? Math.random() * 0.015 + 0.01 : Math.random() * 0.008 + 0.003;
        this.opacity = Math.random() * 0.6 + 0.2;
      }

      update() {
        // Magnetic pull for background particles near the mouse
        if (!this.isMouseFollower) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            const force = 0.3 / dist;
            this.speedX += dx * force;
            this.speedY += dy * force;
          }
        }
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Mood-aware particle color
        const alpha = Math.max(0, this.life * this.opacity);
        const { r, g, b } = hexToRgb(moodColorsRef.current.particle);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        
        // Shadow/glow properties (soft blur on canvas)
        ctx.shadowBlur = this.isMouseFollower ? 8 : 4;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset to prevent drawing lag
      }
    }

    // Populate initial background floating particles
    for (let i = 0; i < 35; i++) {
      particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, false));
    }

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      // Spawn mouse-following gold dust particles
      if (particles.length < maxParticles) {
        particles.push(new Particle(e.clientX, e.clientY, true));
        if (Math.random() > 0.5) {
          particles.push(new Particle(e.clientX, e.clientY, true));
        }
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        mouseRef.current.x = touch.clientX;
        mouseRef.current.y = touch.clientY;
        mouseRef.current.active = true;

        if (particles.length < maxParticles) {
          particles.push(new Particle(touch.clientX, touch.clientY, true));
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Periodically spawn slow floating background particles
      if (Math.random() < 0.12 && particles.filter(p => !p.isMouseFollower).length < 40) {
        particles.push(new Particle(Math.random() * canvas.width, canvas.height + 10, false));
      }

      // Update & Draw
      particles = particles.filter((p) => {
        p.update();
        if (p.life <= 0) return false;
        p.draw();
        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
        overflow: "hidden",
      }}
    />
  );
}
