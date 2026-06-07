// Lightweight dependency-free confetti.
// Creates a temporary full-screen canvas, animates particles, then cleans up.

function createCanvas() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  return canvas;
}

const DEFAULT_COLORS = [
  "#DFBA73",
  "#F472B6",
  "#FB7185",
  "#FBBF24",
  "#34D399",
  "#60A5FA",
  "#1A1A1A",
];

/**
 * Fire a confetti burst.
 * @param {Object} opts
 * @param {number} opts.particleCount
 * @param {{x:number,y:number}} opts.origin  normalized 0..1
 * @param {number} opts.spread  degrees
 * @param {number} opts.angle   degrees (0 = right, 90 = up)
 * @param {string[]} opts.colors
 * @param {string[]} opts.shapes  'square' | 'heart'
 * @param {number} opts.startVelocity
 */
export function fireConfetti(opts = {}) {
  if (typeof window === "undefined") return;

  const {
    particleCount = 80,
    origin = { x: 0.5, y: 0.5 },
    spread = 70,
    angle = 90,
    colors = DEFAULT_COLORS,
    shapes = ["square"],
    startVelocity = 45,
  } = opts;

  const canvas = createCanvas();
  const ctx = canvas.getContext("2d");
  const gravity = 0.45;
  const drag = 0.92;

  const ox = origin.x * canvas.width;
  const oy = origin.y * canvas.height;
  const baseRad = (angle * Math.PI) / 180;
  const spreadRad = (spread * Math.PI) / 180;

  const particles = Array.from({ length: particleCount }).map(() => {
    const dir = baseRad + (Math.random() - 0.5) * spreadRad;
    const velocity = startVelocity * (0.5 + Math.random() * 0.6);
    return {
      x: ox,
      y: oy,
      // canvas y grows downward, so subtract the vertical component
      vx: Math.cos(dir) * velocity,
      vy: -Math.sin(dir) * velocity,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 110 + Math.random() * 40,
    };
  });

  function drawHeart(x, y, size, color, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 16, size / 16);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-8, -6, -16, 4, 0, 14);
    ctx.bezierCurveTo(16, 4, 8, -6, 0, 4);
    ctx.fill();
    ctx.restore();
  }

  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.life += 1;
      if (p.life > p.maxLife) continue;
      alive = true;

      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;

      const opacity = Math.max(0, 1 - p.life / p.maxLife);
      ctx.globalAlpha = opacity;

      if (p.shape === "heart") {
        drawHeart(p.x, p.y, p.size * 1.6, p.color, p.rotation);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    ctx.globalAlpha = 1;
    frame += 1;

    if (alive && frame < 240) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(tick);
}

// Celebration burst from both bottom corners + center.
export function celebrate(colors) {
  fireConfetti({
    particleCount: 60,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.7 },
    colors,
  });
  fireConfetti({
    particleCount: 60,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.7 },
    colors,
  });
  fireConfetti({
    particleCount: 80,
    angle: 90,
    spread: 100,
    origin: { x: 0.5, y: 0.6 },
    colors,
  });
}

// Grand confetti from all corners for a duration (ms).
export function grandConfetti(durationMs = 5000, colors) {
  const end = Date.now() + durationMs;
  const corners = [
    { x: 0, y: 0, angle: -45 },
    { x: 1, y: 0, angle: 225 },
    { x: 0, y: 1, angle: 45 },
    { x: 1, y: 1, angle: 135 },
  ];
  (function loop() {
    fireConfetti({
      particleCount: 18,
      spread: 80,
      startVelocity: 50,
      origin: { x: corners[0].x, y: corners[0].y },
      angle: corners[0].angle,
      colors,
    });
    corners.push(corners.shift());
    if (Date.now() < end) {
      setTimeout(loop, 220);
    }
  })();
}

// Soft pink hearts confetti.
export function heartConfetti() {
  fireConfetti({
    particleCount: 70,
    spread: 110,
    angle: 90,
    origin: { x: 0.5, y: 0.55 },
    colors: ["#F472B6", "#FB7185", "#FBCFE8", "#FDA4AF"],
    shapes: ["heart"],
    startVelocity: 48,
  });
}
