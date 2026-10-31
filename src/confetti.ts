import { prefersReducedMotion } from './ui';

interface Options {
  count?: number;
  /** 'center' bursts upward from mid-screen, 'top' rains down from above. */
  origin?: 'center' | 'top';
  duration?: number;
}

const COLORS = ['#ecd08a', '#c9a24a', '#e8a13c', '#f8efd9', '#7d9a5a', '#a9c566', '#8f2d22'];

/** Lightweight canvas confetti. Returns a function that stops it early. */
export function launchConfetti({ count = 120, origin = 'top', duration = 4200 }: Options = {}): () => void {
  if (prefersReducedMotion()) return () => {};
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const particles = Array.from({ length: count }, (_, i) => {
    const fromTop = origin === 'top';
    return {
      x: fromTop ? Math.random() * w : w / 2 + (Math.random() - 0.5) * w * 0.25,
      y: fromTop ? -20 - Math.random() * h * 0.6 : h * 0.45,
      vx: fromTop ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 11,
      vy: fromTop ? 1.5 + Math.random() * 2 : -6 - Math.random() * 9,
      size: 5 + Math.random() * 6,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * Math.PI * 2,
      color: COLORS[i % COLORS.length],
      round: Math.random() < 0.3,
    };
  });

  const started = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const elapsed = now - started;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = Math.max(0, Math.min(1, (duration + 800 - elapsed) / 800));
    for (const p of particles) {
      p.vy = Math.min(p.vy + 0.18, 4.2);
      p.vx *= 0.985;
      p.wobble += 0.08;
      p.x += p.vx + Math.sin(p.wobble) * 0.6;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * (0.6 + Math.abs(Math.sin(p.wobble)) * 0.6));
      }
      ctx.restore();
    }
    if (elapsed < duration + 800) frame = requestAnimationFrame(tick);
    else stop();
  };
  frame = requestAnimationFrame(tick);

  function stop() {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    canvas.remove();
  }
  return stop;
}
