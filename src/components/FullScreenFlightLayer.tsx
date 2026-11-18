import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

export interface FlightOriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  symbol: string;
  color: string;
  dx: number;
  dy: number;
  rotate: number;
}

interface FullScreenFlightLayerProps {
  active: boolean;
  origin: FlightOriginRect | null;
  variant: 'owl' | 'fairy';
  onFlightComplete?: () => void;
  children: ReactNode;
}

const OWL_SYMBOLS = ['♪', '♫', '✦', '★', '♩'];
const OWL_COLORS = ['#4F46E5', '#0EA5E9', '#F59E0B', '#EC4899', '#10B981'];

const FAIRY_SYMBOLS = ['✦', '✨', '♫', '★', '♪'];
const FAIRY_COLORS = ['#EC4899', '#F59E0B', '#A855F7', '#38BDF8', '#FB7185'];

export function FullScreenFlightLayer({
  active,
  origin,
  variant,
  onFlightComplete,
  children,
}: FullScreenFlightLayerProps) {
  const flyerRef = useRef<HTMLDivElement | null>(null);
  const particleIdRef = useRef(0);
  const [particles, setParticles] = useState<TrailParticle[]>([]);

  useEffect(() => {
    if (!active || !origin) {
      setParticles([]);
      return;
    }

    const symbols = variant === 'fairy' ? FAIRY_SYMBOLS : OWL_SYMBOLS;
    const colors = variant === 'fairy' ? FAIRY_COLORS : OWL_COLORS;

    const spawnInterval = window.setInterval(() => {
      const el = flyerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const idx = particleIdRef.current++;
      const particle: TrailParticle = {
        id: idx,
        x: cx + (Math.random() - 0.5) * 24,
        y: cy + (Math.random() - 0.5) * 24,
        symbol: symbols[idx % symbols.length],
        color: colors[idx % colors.length],
        dx: (Math.random() - 0.5) * 34,
        dy: (Math.random() - 0.5) * 30 + 12,
        rotate: (Math.random() - 0.5) * 50,
      };

      setParticles((prev) => [...prev.slice(-18), particle]);
    }, 62);

    const completeTimer = window.setTimeout(() => {
      onFlightComplete?.();
    }, 1360);

    return () => {
      window.clearInterval(spawnInterval);
      window.clearTimeout(completeTimer);
    };
  }, [active, onFlightComplete, origin, variant]);

  if (!active || !origin || typeof document === 'undefined') {
    return null;
  }

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  const w = origin.width;
  const h = origin.height;
  const padX = Math.max(18, vw * 0.06);
  const padY = Math.max(22, vh * 0.08);

  const minX = padX;
  const maxX = Math.max(padX, vw - w - padX);
  const minY = padY;
  const maxY = Math.max(padY, vh - h - padY);
  const centerX = Math.max(minX, Math.min(maxX, vw / 2 - w / 2));

  // Waypoints relative to initial fixed position (origin.left, origin.top)
  const dxRight = maxX - origin.left;
  const dxLeft = minX - origin.left;
  const dxCenter = centerX - origin.left;
  const dyTop = minY - origin.top;
  const dyBottom = maxY - origin.top;
  const dyMid = (minY + maxY) * 0.42 - origin.top;

  return createPortal(
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {/* Sparkle & Musical Note Flight Trail */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0.95, scale: 0.7, x: p.x, y: p.y, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: [0.85, 1.35, 0.4],
              x: p.x + p.dx,
              y: p.y + p.dy,
              rotate: p.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              color: p.color,
              transform: 'translate(-50%, -50%)',
            }}
            className="font-display font-bold text-2xl sm:text-3xl drop-shadow-sm select-none"
          >
            {p.symbol}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Flying Character */}
      <motion.div
        ref={flyerRef}
        style={{
          position: 'fixed',
          left: origin.left,
          top: origin.top,
          width: origin.width,
          height: origin.height,
        }}
        initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
        animate={{
          x: [0, dxRight * 0.82, dxLeft * 0.86, dxLeft * 0.72, dxRight * 0.85, dxCenter, 0],
          y: [0, dyTop + 14, dyTop, dyBottom * 0.82, dyMid, dyTop * 0.75, 0],
          rotate: [0, 18, -20, -14, 20, -10, 0],
          scale: [1, 1.12, 1.18, 1.1, 1.15, 1.08, 1],
        }}
        transition={{
          duration: 1.32,
          times: [0, 0.16, 0.34, 0.54, 0.72, 0.88, 1],
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </div>,
    document.body
  );
}
