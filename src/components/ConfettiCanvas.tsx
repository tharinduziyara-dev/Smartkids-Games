import { useEffect, useRef } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

interface ConfettiCanvasProps {
  burstTrigger: number;
  intensity?: 'small' | 'big';
}

const COLORS = [
  '#FF5A6E', // Coral Red
  '#FF9B38', // Sunny Orange
  '#FFD43B', // Buttercup Yellow
  '#10B981', // Mint Emerald
  '#38BDF8', // Sky Blue
  '#A855F7', // Toy Violet
];

export function ConfettiCanvas({ burstTrigger, intensity = 'small' }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (burstTrigger <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const count = intensity === 'big' ? 110 : 44;
    const originX = width * 0.5;
    const originY = intensity === 'big' ? height * 0.32 : height * 0.4;

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 1.6) - Math.PI * 1.3; // upward fan
      const speed = (intensity === 'big' ? 420 : 280) + Math.random() * 440;
      const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'circle', 'star'];

      particlesRef.current.push({
        x: originX + (Math.random() - 0.5) * (intensity === 'big' ? width * 0.45 : 120),
        y: originY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 200,
        vy: Math.sin(angle) * speed - 120,
        size: 7 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 10,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 0,
        maxLife: 1.8 + Math.random() * 1.1,
      });
    }

    if (rafRef.current === null) {
      lastTimeRef.current = performance.now();
      const renderLoop = (now: number) => {
        const rawDt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        const dt = Math.min(rawDt, 0.05);

        const c = canvasRef.current;
        if (!c) {
          rafRef.current = null;
          return;
        }
        const ctx = c.getContext('2d');
        if (!ctx) {
          rafRef.current = null;
          return;
        }

        const currentDpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (c.width !== w * currentDpr || c.height !== h * currentDpr) {
          c.width = w * currentDpr;
          c.height = h * currentDpr;
        }

        ctx.save();
        ctx.scale(currentDpr, currentDpr);
        ctx.clearRect(0, 0, w, h);

        const nextParticles: ConfettiParticle[] = [];
        for (const p of particlesRef.current) {
          p.life += dt;
          if (p.life >= p.maxLife || p.y > h + 40) continue;

          p.vy += 880 * dt; // gravity
          p.vx *= 1 - 0.8 * dt; // air drag
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.vr * dt;

          const alpha = Math.max(0, 1 - Math.pow(p.life / p.maxLife, 2));
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size * 0.32, p.size, p.size * 0.64);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 4-point sparkle star
            ctx.beginPath();
            const r = p.size * 0.55;
            for (let s = 0; s < 5; s++) {
              const a = (s * Math.PI * 2) / 5 - Math.PI / 2;
              const innerA = a + Math.PI / 5;
              if (s === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
              else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
              ctx.lineTo(Math.cos(innerA) * (r * 0.45), Math.sin(innerA) * (r * 0.45));
            }
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
          nextParticles.push(p);
        }

        ctx.restore();
        particlesRef.current = nextParticles;

        if (nextParticles.length > 0) {
          rafRef.current = requestAnimationFrame(renderLoop);
        } else {
          ctx.clearRect(0, 0, c.width, c.height);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [burstTrigger, intensity]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 w-full h-full pointer-events-none"
    />
  );
}
