import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MascotMood } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export type RunnerGender = 'boy' | 'girl';
type RunnerTapTrick = 'none' | 'wave' | 'jump' | 'spin';
type ObstacleKind = 'hurdle' | 'blocks' | 'log';
type TrackPhase = 'running' | 'jumping' | 'tripped';

interface RunnerKidProps {
  gender: RunnerGender;
  mood: MascotMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  streak?: number;
  interactive?: boolean;
  trackMode?: boolean;
  onTap?: () => void;
}

const OBSTACLE_CYCLE: ObstacleKind[] = ['hurdle', 'blocks', 'log'];

function ToyObstacleSvg({ kind }: { kind: ObstacleKind }) {
  if (kind === 'hurdle') {
    return (
      <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md">
        {/* Cute Toy Hurdle */}
        <rect x="10" y="18" width="8" height="40" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="46" y="18" width="8" height="40" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="6" y="52" width="16" height="7" rx="3.5" fill="#475569" />
        <rect x="42" y="52" width="16" height="7" rx="3.5" fill="#475569" />
        <rect x="6" y="14" width="52" height="14" rx="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
        <rect x="15" y="16" width="10" height="10" rx="2" fill="#FFFFFF" />
        <rect x="39" y="16" width="10" height="10" rx="2" fill="#FFFFFF" />
      </svg>
    );
  }

  if (kind === 'blocks') {
    return (
      <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md">
        {/* Stacked Glossy Toy Blocks */}
        <rect x="8" y="34" width="24" height="24" rx="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
        <text x="20" y="51" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">A</text>
        <rect x="32" y="34" width="24" height="24" rx="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
        <text x="44" y="51" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">1</text>
        <rect x="20" y="12" width="24" height="24" rx="6" fill="#A855F7" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M32 17 L34 22 L39 22 L35 25 L36 30 L32 27 L28 30 L29 25 L25 22 L30 22 Z" fill="#FDE047" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md">
      {/* Friendly Cartoon Wooden Log */}
      <ellipse cx="32" cy="54" rx="24" ry="5" fill="rgba(15,23,42,0.18)" />
      <rect x="8" y="28" width="46" height="26" rx="12" fill="#92400E" stroke="#78350F" strokeWidth="2" />
      <path d="M16 35 H38 M22 44 H42" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="48" cy="41" rx="8" ry="12" fill="#FDE68A" stroke="#92400E" strokeWidth="2.5" />
      <ellipse cx="48" cy="41" rx="3.5" ry="5.5" fill="none" stroke="#D97706" strokeWidth="1.8" />
      {/* Cute tiny green sprout */}
      <path d="M26 28 Q26 17 34 17 Q32 25 26 28 Z" fill="#22C55E" />
      <path d="M26 28 Q24 19 17 20 Q20 27 26 28 Z" fill="#4ADE80" />
    </svg>
  );
}

interface RunnerSvgProps {
  idPrefix: string;
  gender: RunnerGender;
  isJogging: boolean;
  isJumping: boolean;
  isTripped: boolean;
  isDancing: boolean;
  isSleeping: boolean;
  isStreakSparkle: boolean;
  trick: RunnerTapTrick;
}

function RunnerSvg({
  idPrefix,
  gender,
  isJogging,
  isJumping,
  isTripped,
  isDancing,
  isSleeping,
  isStreakSparkle,
  trick,
}: RunnerSvgProps) {
  const skinGrad = `${idPrefix}_runnerSkin`;
  const jerseyGrad = `${idPrefix}_runnerJersey`;
  const hairGrad = `${idPrefix}_runnerHair`;

  const isBoy = gender === 'boy';
  const jerseyTop = isBoy ? '#38BDF8' : '#34D399';
  const jerseyBottom = isBoy ? '#0284C7' : '#059669';
  const shortsColor = isBoy ? '#1E3A8A' : '#0F766E';
  const shoeAccent = isBoy ? '#F97316' : '#EC4899';
  const bandColor = isBoy ? '#0EA5E9' : '#FB7185';
  const hairTop = isBoy ? '#78350F' : '#B45309';
  const hairBottom = isBoy ? '#451A03' : '#7C2D12';

  const activeStride = isJogging && !isTripped;

  return (
    <svg
      viewBox="0 0 180 190"
      className="w-full h-full drop-shadow-[0_10px_12px_rgba(15,23,42,0.18)]"
    >
      <defs>
        <radialGradient id={skinGrad} cx="42%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#FFF0E5" />
          <stop offset="100%" stopColor="#FBC9A5" />
        </radialGradient>

        <linearGradient id={jerseyGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={jerseyTop} />
          <stop offset="100%" stopColor={jerseyBottom} />
        </linearGradient>

        <linearGradient id={hairGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hairTop} />
          <stop offset="100%" stopColor={hairBottom} />
        </linearGradient>
      </defs>

      {/* Floor Shadow (Portrait / grounded state) */}
      {!isJumping && (
        <ellipse cx="90" cy="176" rx="38" ry="6.5" fill="rgba(15, 23, 42, 0.14)" />
      )}

      {/* Back Arm */}
      <motion.g
        style={{ transformOrigin: '78px 98px' }}
        animate={
          isTripped
            ? { rotate: 48 }
            : isJumping || trick === 'jump'
            ? { rotate: -125 }
            : isDancing
            ? { rotate: [-110, -75, -110] }
            : activeStride
            ? { rotate: [42, -46, 42] }
            : { rotate: [4, -4, 4] }
        }
        transition={
          isTripped
            ? { duration: 0.25 }
            : activeStride
            ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <path
          d="M 78 98 Q 62 114 68 128"
          fill="none"
          stroke={`url(#${skinGrad})`}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="68" cy="129" r="6" fill={`url(#${skinGrad})`} />
      </motion.g>

      {/* Back Leg + Sneaker */}
      <motion.g
        style={{ transformOrigin: '80px 132px' }}
        animate={
          isTripped
            ? { rotate: 38 }
            : isJumping || trick === 'jump'
            ? { rotate: 48 }
            : activeStride
            ? { rotate: [-42, 44, -42] }
            : { rotate: 0 }
        }
        transition={
          activeStride
            ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      >
        <rect x="74" y="130" width="13" height="28" rx="6.5" fill={`url(#${skinGrad})`} />
        <rect x="72" y="148" width="17" height="7" rx="3.5" fill="#FFFFFF" />
        {/* Sneaker */}
        <path
          d="M 70 155 Q 70 168 85 168 L 96 168 Q 100 168 98 161 Q 94 154 84 154 Z"
          fill={shoeAccent}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <rect x="71" y="165" width="27" height="4" rx="2" fill="#FFFFFF" />
      </motion.g>

      {/* Sporty Shorts / Skort */}
      <path
        d="M 67 120 L 112 120 L 116 138 Q 90 144 64 138 Z"
        fill={shortsColor}
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Front Leg + Sneaker */}
      <motion.g
        style={{ transformOrigin: '100px 132px' }}
        animate={
          isTripped
            ? { rotate: -26 }
            : isJumping || trick === 'jump'
            ? { rotate: -54 }
            : activeStride
            ? { rotate: [44, -42, 44] }
            : { rotate: 0 }
        }
        transition={
          activeStride
            ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      >
        <rect x="94" y="130" width="13" height="28" rx="6.5" fill={`url(#${skinGrad})`} />
        <rect x="92" y="148" width="17" height="7" rx="3.5" fill="#FFFFFF" />
        {/* Sneaker */}
        <path
          d="M 91 155 Q 91 168 107 168 L 119 168 Q 123 168 120 161 Q 116 154 106 154 Z"
          fill={shoeAccent}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <rect x="92" y="165" width="28" height="4" rx="2" fill="#FFFFFF" />
      </motion.g>

      {/* Athletic Jersey */}
      <rect
        x="68"
        y="86"
        width="44"
        height="40"
        rx="16"
        fill={`url(#${jerseyGrad})`}
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      {/* Jersey Racing Stripe & Star */}
      <rect x="76" y="88" width="6" height="36" rx="3" fill="rgba(255,255,255,0.28)" />
      <path
        d="M95 98 L97.5 104 L104 104.5 L99 108.5 L100.5 115 L95 111.5 L89.5 115 L91 108.5 L86 104.5 L92.5 104 Z"
        fill="#FDE047"
      />

      {/* Ponytail for Maya (Girl Runner) */}
      {!isBoy && (
        <motion.g
          style={{ transformOrigin: '60px 52px' }}
          animate={
            activeStride || isJumping
              ? { rotate: [-14, 16, -14] }
              : { rotate: [-4, 4, -4] }
          }
          transition={{ duration: activeStride ? 0.35 : 1.8, repeat: Infinity }}
        >
          <path
            d="M 62 50 Q 34 42 30 68 Q 38 78 52 66 Q 58 60 64 56 Z"
            fill={`url(#${hairGrad})`}
          />
          <circle cx="62" cy="52" r="5.5" fill="#FB7185" stroke="#FFFFFF" strokeWidth="1.5" />
        </motion.g>
      )}

      {/* Clay Head */}
      <circle cx="92" cy="58" r="30" fill={`url(#${skinGrad})`} />

      {/* Hair & Sporty Headband */}
      {isBoy ? (
        <>
          <path
            d="M 62 54 Q 64 24 94 24 Q 122 24 122 50 Q 108 38 92 40 Q 75 40 62 54 Z"
            fill={`url(#${hairGrad})`}
          />
          {/* Sporty Spiky Front Tuft */}
          <path d="M 88 26 L 98 16 L 104 28 L 114 20 L 114 35 Z" fill={`url(#${hairGrad})`} />
          <path
            d="M 63 45 Q 92 38 121 45"
            fill="none"
            stroke={bandColor}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M 61 56 Q 62 24 94 25 Q 122 26 122 54 Q 108 38 90 42 Q 72 44 61 56 Z"
            fill={`url(#${hairGrad})`}
          />
          <path
            d="M 63 46 Q 92 38 120 46"
            fill="none"
            stroke={bandColor}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="77" cy="68" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="111" cy="68" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.55" />

      {/* Expressive Eyes */}
      {isSleeping ? (
        <g stroke="#1E1B4B" strokeWidth="3.2" strokeLinecap="round" fill="none">
          <path d="M 76 58 Q 83 64 90 58" />
          <path d="M 99 58 Q 106 64 113 58" />
        </g>
      ) : isTripped ? (
        <g>
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '83px 58px' }}
          >
            <path
              d="M83 58 m-1.5 0 a 1.5 1.5 0 1 0 3 0 a 4 4 0 1 0 -8 0 a 6 6 0 1 0 12 0"
              fill="none"
              stroke="#1E1B4B"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '106px 58px' }}
          >
            <path
              d="M106 58 m-1.5 0 a 1.5 1.5 0 1 0 3 0 a 4 4 0 1 0 -8 0 a 6 6 0 1 0 12 0"
              fill="none"
              stroke="#1E1B4B"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      ) : isStreakSparkle ? (
        <g>
          <path d="M83 49 L85.5 55 L92 57 L85.5 59 L83 65 L80.5 59 L74 57 L80.5 55 Z" fill="#F59E0B" />
          <path d="M106 49 L108.5 55 L115 57 L108.5 59 L106 65 L103.5 59 L97 57 L103.5 55 Z" fill="#F59E0B" />
        </g>
      ) : isJumping || isDancing || trick === 'jump' ? (
        <g stroke="#1E1B4B" strokeWidth="3.8" strokeLinecap="round" fill="none">
          <path d="M 76 60 Q 83 51 90 60" />
          <path d="M 99 60 Q 106 51 113 60" />
        </g>
      ) : (
        <g>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            style={{ transformOrigin: '83px 58px' }}
          >
            <circle cx="83" cy="58" r="5.5" fill="#1E1B4B" />
            <circle cx="85" cy="56" r="2" fill="#FFFFFF" />
          </motion.g>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            style={{ transformOrigin: '106px 58px' }}
          >
            <circle cx="106" cy="58" r="5.5" fill="#1E1B4B" />
            <circle cx="108" cy="56" r="2" fill="#FFFFFF" />
          </motion.g>
        </g>
      )}

      {/* Expressive Mouth */}
      {isSleeping ? (
        <circle cx="95" cy="72" r="3" fill="#E11D48" opacity="0.75" />
      ) : isTripped ? (
        <path
          d="M 88 73 Q 92 69 96 73 Q 100 77 104 73"
          fill="none"
          stroke="#9F1239"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      ) : isJumping || isDancing || trick !== 'none' ? (
        <path
          d="M 86 70 Q 95 80 104 70 Z"
          fill="#E11D48"
          stroke="#9F1239"
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="M 87 71 Q 95 77 103 71"
          fill="none"
          stroke="#9F1239"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}

      {/* Front Arm */}
      <motion.g
        style={{ transformOrigin: '98px 98px' }}
        animate={
          isTripped
            ? { rotate: -38 }
            : trick === 'wave'
            ? { rotate: [-140, -100, -140, -100, -140] }
            : isJumping || trick === 'jump'
            ? { rotate: -135 }
            : isDancing
            ? { rotate: [-125, -85, -125] }
            : activeStride
            ? { rotate: [-46, 42, -46] }
            : { rotate: [-5, 5, -5] }
        }
        transition={
          isTripped
            ? { duration: 0.25 }
            : trick === 'wave'
            ? { duration: 0.7 }
            : activeStride
            ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <path
          d="M 98 98 Q 114 112 108 126"
          fill="none"
          stroke={`url(#${skinGrad})`}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="108" cy="127" r="6" fill={`url(#${skinGrad})`} />
      </motion.g>
    </svg>
  );
}

export function RunnerKid({
  gender,
  mood,
  message,
  size = 'md',
  streak = 0,
  interactive = true,
  trackMode = false,
  onTap,
}: RunnerKidProps) {
  const [trick, setTrick] = useState<RunnerTapTrick>('none');
  const [trickIdx, setTrickIdx] = useState(0);

  const [trackPhase, setTrackPhase] = useState<TrackPhase>('running');
  const [obstacleIndex, setObstacleIndex] = useState(0);
  const [actionSeq, setActionSeq] = useState(0);
  const prevMoodRef = useRef<MascotMood>(mood);

  const isDancing = mood === 'happy' || mood === 'celebrating';
  const isConfused = mood === 'confused';
  const isSleeping = mood === 'sleeping';
  const isStreakSparkle = isDancing && streak >= 2;
  const labelName = gender === 'boy' ? 'Leo the Runner' : 'Maya the Runner';

  useEffect(() => {
    const prev = prevMoodRef.current;
    prevMoodRef.current = mood;

    if (!trackMode) return;

    if (mood === 'happy' && prev !== 'happy') {
      setTrackPhase('jumping');
      setActionSeq((s) => s + 1);
      soundEngine.playRunnerJump();

      const resumeTimer = window.setTimeout(() => {
        setTrackPhase('running');
        setObstacleIndex((i) => i + 1);
      }, 1150);
      return () => window.clearTimeout(resumeTimer);
    }

    if (mood === 'confused' && prev !== 'confused') {
      setTrackPhase('tripped');
      setActionSeq((s) => s + 1);
      soundEngine.schedule(() => {
        soundEngine.playCollapseThud();
      }, 210);

      const recoverTimer = window.setTimeout(() => {
        setTrackPhase('running');
        setObstacleIndex((i) => i + 1);
      }, 1820);
      return () => window.clearTimeout(recoverTimer);
    }

    if (mood === 'idle' || mood === 'listening') {
      setTrackPhase('running');
    }
  }, [mood, trackMode]);

  const handleTap = () => {
    if (!interactive) return;
    const tricks: RunnerTapTrick[] = ['wave', 'jump', 'spin'];
    const nextTrick = tricks[trickIdx % tricks.length];
    setTrickIdx((i) => i + 1);
    setTrick(nextTrick);
    if (nextTrick === 'jump') {
      soundEngine.playRunnerJump();
    } else {
      soundEngine.playRunnerCheer();
    }
    onTap?.();
    window.setTimeout(() => {
      setTrick('none');
    }, 850);
  };

  const dimensions =
    size === 'sm'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : size === 'lg'
      ? 'w-32 h-32 sm:w-40 sm:h-40'
      : 'w-28 h-28 sm:w-36 sm:h-36';

  const currentObstacle = OBSTACLE_CYCLE[obstacleIndex % OBSTACLE_CYCLE.length];

  // Portrait Mode (Title Screen, Victory Modal, Profile preview)
  if (!trackMode) {
    return (
      <div className="relative flex flex-col items-center select-none">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`mb-2 px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-bold text-center max-w-[290px] sm:max-w-sm shadow-sm ${
                isConfused
                  ? 'bg-amber-100 text-amber-950 border-2 border-amber-300'
                  : isDancing
                  ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-300'
                  : 'bg-white text-slate-800 border-2 border-sky-200'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? `Tap ${labelName}` : undefined}
          onClick={handleTap}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleTap();
            }
          }}
          className={`relative flex items-center justify-center ${dimensions} ${
            interactive
              ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 rounded-full'
              : ''
          }`}
        >
          <AnimatePresence>
            {isSleeping && (
              <>
                <motion.span
                  key="runner-zzz-1"
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 6, x: 4, scale: 0.6 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [4, -18, -36],
                    x: [8, 18, 26],
                    scale: [0.7, 1.05, 1.2],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute right-1 top-2 font-display font-bold text-lg sm:text-xl text-sky-300 pointer-events-none select-none"
                >
                  Z
                </motion.span>
                <motion.span
                  key="runner-zzz-2"
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 6, x: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [2, -16, -30],
                    x: [14, 24, 30],
                    scale: [0.6, 0.9, 1],
                  }}
                  transition={{ duration: 2.4, delay: 0.9, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute right-0 top-5 font-display font-bold text-sm sm:text-base text-emerald-300 pointer-events-none select-none"
                >
                  zz
                </motion.span>
              </>
            )}
            {(isDancing || trick === 'jump' || trick === 'wave') && (
              <>
                <motion.span
                  key="runner-star-1"
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0], y: [-4, -34], x: [-12, -24] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="absolute -left-2 top-3 text-xl font-bold text-amber-500 pointer-events-none"
                >
                  ✦
                </motion.span>
                <motion.span
                  key="runner-star-2"
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 1, 0], y: [-4, -34], x: [12, 24] }}
                  transition={{ duration: 1.1, delay: 0.3, repeat: Infinity }}
                  className="absolute -right-2 top-3 text-xl font-bold text-sky-500 pointer-events-none"
                >
                  ★
                </motion.span>
              </>
            )}
          </AnimatePresence>

          <motion.div
            animate={
              trick === 'spin'
                ? { rotate: [0, 360], scale: [1, 1.1, 1] }
                : trick === 'jump'
                ? { y: [0, -26, 0], scale: [1, 1.06, 1] }
                : isDancing
                ? { y: [0, -14, 0, -10, 0], rotate: [-4, 4, -4, 0] }
                : isSleeping
                ? { y: [0, 2.5, 0], scaleY: [1, 0.97, 1], rotate: -4 }
                : { y: [0, -4, 0] }
            }
            transition={
              trick !== 'none'
                ? { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }
                : isDancing
                ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
                : isSleeping
                ? { duration: 3.1, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
            }
            className="w-full h-full"
          >
            <RunnerSvg
              idPrefix="portrait"
              gender={gender}
              isJogging={isDancing}
              isJumping={trick === 'jump'}
              isTripped={isConfused}
              isDancing={isDancing}
              isSleeping={isSleeping}
              isStreakSparkle={isStreakSparkle}
              trick={trick}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Gameplay Mini Track Mode (Continuous Running + Obstacles + Jump / Trip & Fall)
  const isJumping = trackPhase === 'jumping';
  const isTripped = trackPhase === 'tripped';
  const isRunning = trackPhase === 'running';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={`mb-2 px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-bold text-center max-w-[300px] sm:max-w-md shadow-sm ${
              isConfused || isTripped
                ? 'bg-amber-100 text-amber-950 border-2 border-amber-300'
                : isDancing || isJumping
                ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-300'
                : 'bg-white text-slate-800 border-2 border-sky-200'
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Colorful Mini Running Track Scene */}
      <div className="relative w-full h-[132px] sm:h-[148px] rounded-[28px] overflow-hidden border-2 border-white shadow-[0_10px_24px_-6px_rgba(30,58,138,0.16)] bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100">
        {/* Drifting Sky Clouds */}
        <motion.div
          aria-hidden="true"
          animate={isTripped ? undefined : { x: ['0%', '-50%'] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute top-2 left-0 w-[200%] flex items-center justify-around opacity-70 pointer-events-none"
        >
          <span className="w-14 h-5 rounded-full bg-white shadow-sm" />
          <span className="w-20 h-6 rounded-full bg-white shadow-sm mt-2" />
          <span className="w-12 h-4 rounded-full bg-white shadow-sm" />
          <span className="w-14 h-5 rounded-full bg-white shadow-sm" />
          <span className="w-20 h-6 rounded-full bg-white shadow-sm mt-2" />
          <span className="w-12 h-4 rounded-full bg-white shadow-sm" />
        </motion.div>

        {/* Distant Green Hills */}
        <div
          aria-hidden="true"
          className="absolute bottom-[42px] sm:bottom-[46px] inset-x-0 h-8 bg-gradient-to-b from-emerald-300/75 to-emerald-400/80 rounded-t-[100%]"
        />

        {/* Running Track Surface */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 inset-x-0 h-[46px] sm:h-[50px] bg-gradient-to-b from-[#FB923C] to-[#EA580C] border-t-4 border-[#FED7AA]"
        >
          {/* Scrolling Track Lane Dashes */}
          <motion.div
            animate={isTripped ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 1.05, repeat: Infinity, ease: 'linear' }}
            className="w-[200%] h-full flex items-center gap-6 px-4"
          >
            {Array.from({ length: 16 }).map((_, idx) => (
              <span
                key={idx}
                className="w-8 h-1.5 rounded-full bg-white/70 shrink-0"
              />
            ))}
          </motion.div>
        </div>

        {/* Approaching Cute Toy Obstacle */}
        <motion.div
          key={`obs-${obstacleIndex}-${isJumping ? 'j' : isTripped ? 't' : 'r'}-${actionSeq}`}
          aria-hidden="true"
          className="absolute bottom-[20px] sm:bottom-[22px] z-10 pointer-events-none"
          initial={{ left: isRunning ? '88%' : '56%', rotate: 0 }}
          animate={
            isJumping
              ? {
                  left: ['56%', '-16%'],
                  rotate: [0, 0],
                }
              : isTripped
              ? {
                  left: ['56%', '27%', '31%'],
                  rotate: [0, -16, 12],
                }
              : {
                  left: ['88%', '56%'],
                  y: [0, -2, 0],
                }
          }
          transition={
            isJumping
              ? { duration: 0.95, ease: 'linear' }
              : isTripped
              ? { duration: 0.45, times: [0, 0.45, 1], ease: 'easeOut' }
              : { duration: 0.8, ease: 'easeOut' }
          }
        >
          <ToyObstacleSvg kind={currentObstacle} />
        </motion.div>

        {/* Jump Sparkles & Cheers */}
        <AnimatePresence>
          {isJumping && (
            <>
              <motion.span
                key={`jump-spark-1-${actionSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.5, left: '22%', bottom: '45%' }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 0.6], left: '12%', bottom: '78%' }}
                transition={{ duration: 0.85 }}
                className="absolute text-2xl font-bold text-amber-400 pointer-events-none z-20"
              >
                ✦
              </motion.span>
              <motion.span
                key={`jump-spark-2-${actionSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.5, left: '32%', bottom: '50%' }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.35, 0.7], left: '42%', bottom: '82%' }}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="absolute text-2xl font-bold text-pink-500 pointer-events-none z-20"
              >
                ★
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* Trip & Fall Dizzy Stars & Dust Puff */}
        <AnimatePresence>
          {isTripped && (
            <>
              <motion.span
                key={`trip-dust-${actionSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.3, left: '20%', bottom: '20px' }}
                animate={{ opacity: [0, 0.95, 0], scale: [0.5, 1.35, 1.6], left: '14%', bottom: '32px' }}
                transition={{ duration: 0.75, delay: 0.22 }}
                className="absolute text-xl pointer-events-none z-20"
              >
                💨
              </motion.span>
              <motion.div
                key={`trip-stars-${actionSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.4, left: '24%', bottom: '58px' }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.15, 1, 0.6], rotate: [-12, 14, -12] }}
                transition={{ duration: 1.45, delay: 0.2 }}
                className="absolute text-xl pointer-events-none z-30"
              >
                💫
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Runner Kid Sprite on Track */}
        <motion.div
          key={isJumping ? `jump-${actionSeq}` : isTripped ? `trip-${actionSeq}` : 'jog'}
          style={{ transformOrigin: '50% 85%' }}
          className="absolute left-[14%] sm:left-[17%] bottom-[16px] sm:bottom-[18px] w-20 h-20 sm:w-24 sm:h-24 z-20"
          animate={
            isJumping
              ? {
                  y: [0, -58, -68, -42, 0],
                  rotate: [-4, -12, 4, 10, 0],
                  scale: [1, 1.08, 1.1, 1.05, 1],
                }
              : isTripped
              ? {
                  y: [0, -14, 16, 8, 15, 15, 0],
                  rotate: [0, -16, 82, 70, 78, 76, 0],
                  scaleX: [1, 0.95, 1.14, 1.04, 1.09, 1.06, 1],
                  scaleY: [1, 1.05, 0.8, 0.92, 0.86, 0.88, 1],
                }
              : {
                  y: [0, -5, 0],
                  rotate: 3,
                  scaleX: 1,
                  scaleY: 1,
                }
          }
          transition={
            isJumping
              ? { duration: 0.95, times: [0, 0.28, 0.52, 0.78, 1], ease: 'easeInOut' }
              : isTripped
              ? { duration: 1.75, times: [0, 0.12, 0.28, 0.38, 0.48, 0.72, 1], ease: 'easeInOut' }
              : { duration: 0.36, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <RunnerSvg
            idPrefix="track"
            gender={gender}
            isJogging={isRunning}
            isJumping={isJumping}
            isTripped={isTripped}
            isDancing={false}
            isSleeping={isSleeping}
            isStreakSparkle={isStreakSparkle}
            trick="none"
          />
        </motion.div>
      </div>
    </div>
  );
}
