import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotMood } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { FlightOriginRect, FullScreenFlightLayer } from './FullScreenFlightLayer';

export type TapTrick = 'none' | 'spin' | 'wink' | 'magic';

interface MusicalOwlProps {
  mood: MascotMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  streak?: number;
  interactive?: boolean;
  enableFullScreenFly?: boolean;
  onTap?: () => void;
}

interface OwlSvgProps {
  isDancing: boolean;
  isConfused: boolean;
  isListening: boolean;
  isSleeping: boolean;
  isStreakSparkle: boolean;
  isWinking: boolean;
  isFlyingLoop: boolean;
  trick: TapTrick;
}

function OwlSvg({
  isDancing,
  isConfused,
  isListening,
  isSleeping,
  isStreakSparkle,
  isWinking,
  isFlyingLoop,
  trick,
}: OwlSvgProps) {
  const flappingFast = isDancing || isFlyingLoop || trick === 'magic';

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full drop-shadow-[0_12px_14px_rgba(30,58,138,0.18)]"
    >
      <defs>
        <radialGradient id="owlBodyGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="65%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </radialGradient>

        <radialGradient id="owlBellyGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="75%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>

        <linearGradient id="headphoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        <linearGradient id="beakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {!isFlyingLoop && (
        <ellipse cx="100" cy="184" rx="48" ry="8" fill="rgba(30, 58, 138, 0.12)" />
      )}

      {/* Feet */}
      <g fill="url(#beakGrad)">
        <rect x="70" y="164" width="18" height="14" rx="7" />
        <rect x="112" y="164" width="18" height="14" rx="7" />
      </g>

      {/* Headphone Band */}
      <path
        d="M 38 96 C 38 30, 162 30, 162 96"
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M 42 92 C 42 36, 158 36, 158 92"
        fill="none"
        stroke="#BAE6FD"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Ear Tufts */}
      <path
        d="M 55 58 L 42 32 L 75 48 Z"
        fill="#4338CA"
        stroke="#4338CA"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M 145 58 L 158 32 L 125 48 Z"
        fill="#4338CA"
        stroke="#4338CA"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Left Wing (flaps fast when flying, droops heavily when collapsed) */}
      <motion.g
        style={{ transformOrigin: '52px 115px' }}
        animate={
          isConfused
            ? { rotate: [0, 42, 48, 45, 0], y: [0, 10, 12, 10, 0] }
            : isFlyingLoop
            ? { rotate: [-52, 26, -52] }
            : flappingFast
            ? { rotate: [-38, 22, -38] }
            : isListening
            ? { rotate: [-12, 8, -12] }
            : { rotate: [0, 3, 0] }
        }
        transition={
          isConfused
            ? { duration: 1.75, times: [0, 0.28, 0.45, 0.72, 1], ease: 'easeInOut' }
            : {
                duration: isFlyingLoop ? 0.18 : flappingFast ? 0.28 : isListening ? 0.55 : 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <ellipse
          cx="42"
          cy="126"
          rx="18"
          ry="30"
          transform="rotate(14 42 126)"
          fill="url(#wingGrad)"
        />
      </motion.g>

      {/* Right Wing */}
      <motion.g
        style={{ transformOrigin: '148px 115px' }}
        animate={
          isConfused
            ? { rotate: [0, -40, -46, -42, 0], y: [0, 10, 12, 10, 0] }
            : isFlyingLoop
            ? { rotate: [52, -26, 52] }
            : flappingFast
            ? { rotate: [38, -22, 38] }
            : isListening
            ? { rotate: [12, -8, 12] }
            : { rotate: [0, -3, 0] }
        }
        transition={
          isConfused
            ? { duration: 1.75, times: [0, 0.28, 0.45, 0.72, 1], ease: 'easeInOut' }
            : {
                duration: isFlyingLoop ? 0.18 : flappingFast ? 0.28 : isListening ? 0.55 : 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <ellipse
          cx="158"
          cy="126"
          rx="18"
          ry="30"
          transform="rotate(-14 158 126)"
          fill="url(#wingGrad)"
        />
      </motion.g>

      {/* Main Round Clay Body */}
      <rect x="44" y="46" width="112" height="126" rx="56" fill="url(#owlBodyGrad)" />
      <ellipse cx="88" cy="60" rx="34" ry="12" fill="rgba(255,255,255,0.22)" />

      {/* Belly Patch */}
      <ellipse cx="100" cy="134" rx="38" ry="34" fill="url(#owlBellyGrad)" />
      <path
        d="M 82 126 Q 88 133 94 126 M 100 126 Q 106 133 112 126 M 91 140 Q 97 147 103 140 M 109 140 Q 115 147 121 140"
        fill="none"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Headphone Ear Cups */}
      <rect
        x="26"
        y="78"
        width="22"
        height="38"
        rx="11"
        fill="url(#headphoneGrad)"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
      <rect
        x="152"
        y="78"
        width="22"
        height="38"
        rx="11"
        fill="url(#headphoneGrad)"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />

      {/* Eye Sockets */}
      <circle cx="77" cy="90" r="24" fill="#FFFFFF" />
      <circle cx="123" cy="90" r="24" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <ellipse cx="58" cy="108" rx="8" ry="5" fill="#FB7185" opacity={isDancing ? 0.8 : 0.45} />
      <ellipse cx="142" cy="108" rx="8" ry="5" fill="#FB7185" opacity={isDancing ? 0.8 : 0.45} />

      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#1E1B4B" strokeWidth="4.2" strokeLinecap="round" fill="none">
          <path d="M 65 90 Q 77 100 89 90" />
          <path d="M 111 90 Q 123 100 135 90" />
        </g>
      ) : isWinking ? (
        <g>
          <path
            d="M 65 92 Q 77 80 89 92"
            stroke="#1E1B4B"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="123" cy="90" r="12" fill="#1E1B4B" />
          <circle cx="127" cy="85" r="4.2" fill="#FFFFFF" />
        </g>
      ) : isStreakSparkle ? (
        <g>
          <motion.path
            animate={{ scale: [0.9, 1.18, 0.9], rotate: [0, 12, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: '77px 90px' }}
            d="M77 74 L81 85 L92 89 L81 93 L77 104 L73 93 L62 89 L73 85 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="1.5"
          />
          <motion.path
            animate={{ scale: [0.9, 1.18, 0.9], rotate: [0, -12, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: '123px 90px' }}
            d="M123 74 L127 85 L138 89 L127 93 L123 104 L119 93 L108 89 L119 85 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="1.5"
          />
        </g>
      ) : isDancing || isFlyingLoop ? (
        <g stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M 66 92 Q 77 78 88 92" />
          <path d="M 112 92 Q 123 78 134 92" />
        </g>
      ) : isConfused ? (
        <g>
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '77px 90px' }}
          >
            <path
              d="M77 90 m-2 0 a 2 2 0 1 0 4 0 a 5 5 0 1 0 -10 0 a 9 9 0 1 0 18 0"
              fill="none"
              stroke="#1E1B4B"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '123px 90px' }}
          >
            <path
              d="M123 90 m-2 0 a 2 2 0 1 0 4 0 a 5 5 0 1 0 -10 0 a 9 9 0 1 0 18 0"
              fill="none"
              stroke="#1E1B4B"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </motion.g>
          <path
            d="M 63 67 Q 77 74 90 67"
            stroke="#312E81"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 110 64 Q 123 56 137 64"
            stroke="#312E81"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ) : (
        <g>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            style={{ transformOrigin: '77px 90px' }}
          >
            <circle cx="77" cy="90" r={isListening ? 13 : 11.5} fill="#1E1B4B" />
            <circle cx="81" cy="85" r="4.2" fill="#FFFFFF" />
            <circle cx="73" cy="94" r="1.8" fill="#FFFFFF" />
          </motion.g>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            style={{ transformOrigin: '123px 90px' }}
          >
            <circle cx="123" cy="90" r={isListening ? 13 : 11.5} fill="#1E1B4B" />
            <circle cx="127" cy="85" r="4.2" fill="#FFFFFF" />
            <circle cx="119" cy="94" r="1.8" fill="#FFFFFF" />
          </motion.g>
        </g>
      )}

      {/* Animated Singing / Expressive Beak */}
      <g>
        <path
          d="M 91 96 Q 100 92 109 96 L 100 107 Z"
          fill="url(#beakGrad)"
          stroke="#C2410C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {(isListening || isDancing || isFlyingLoop || trick === 'magic') && (
          <motion.ellipse
            cx="100"
            cy="107"
            rx="4.8"
            ry="4"
            fill="#7C2D12"
            animate={
              isListening
                ? { scaleY: [0.4, 1.3, 0.5, 1.2, 0.4] }
                : { scaleY: [0.8, 1.15, 0.8] }
            }
            transition={{ duration: 0.45, repeat: Infinity }}
            style={{ transformOrigin: '100px 107px' }}
          />
        )}
        <motion.path
          d="M 94 105 L 106 105 L 100 114 Z"
          fill="#EA580C"
          animate={
            isListening
              ? { y: [0, 3, 0, 2.5, 0] }
              : isDancing || isFlyingLoop
              ? { y: [0, 2, 0] }
              : { y: 0 }
          }
          transition={{ duration: 0.45, repeat: Infinity }}
        />
      </g>
    </svg>
  );
}

export function MusicalOwl({
  mood,
  message,
  size = 'md',
  streak = 0,
  interactive = true,
  enableFullScreenFly = false,
  onTap,
}: MusicalOwlProps) {
  const [trick, setTrick] = useState<TapTrick>('none');
  const [trickIndex, setTrickIndex] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const [flightOrigin, setFlightOrigin] = useState<FlightOriginRect | null>(null);
  const [collapseSeq, setCollapseSeq] = useState(0);
  const prevMoodRef = useRef<MascotMood>(mood);

  useEffect(() => {
    const prev = prevMoodRef.current;
    prevMoodRef.current = mood;

    if (mood === 'happy' && prev !== 'happy' && enableFullScreenFly) {
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        setFlightOrigin({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
        setIsFlying(true);
        soundEngine.playFlySparkle();
      }
    } else if (mood !== 'happy' && isFlying) {
      setIsFlying(false);
    }

    if (mood === 'confused' && prev !== 'confused') {
      setCollapseSeq((c) => c + 1);
      if (enableFullScreenFly) {
        soundEngine.schedule(() => {
          soundEngine.playCollapseThud();
        }, 230);
      }
    }
  }, [enableFullScreenFly, isFlying, mood]);

  const isDancing = mood === 'happy' || mood === 'celebrating';
  const isConfused = mood === 'confused';
  const isListening = mood === 'listening';
  const isSleeping = mood === 'sleeping';
  const isStreakSparkle = isDancing && streak >= 2;
  const isWinking = trick === 'wink';

  const dimensions =
    size === 'sm'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : size === 'lg'
      ? 'w-32 h-32 sm:w-40 sm:h-40'
      : 'w-28 h-28 sm:w-36 sm:h-36';

  const handleClick = () => {
    if (!interactive || isFlying) return;
    const tricks: TapTrick[] = ['spin', 'wink', 'magic'];
    const nextTrick = tricks[trickIndex % tricks.length];
    setTrickIndex((i) => i + 1);
    setTrick(nextTrick);
    soundEngine.playOwlHoot();
    onTap?.();
    window.setTimeout(() => {
      setTrick('none');
    }, 850);
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Mascot Speech Bubble */}
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

      {/* Owl Character Stage */}
      <div
        ref={stageRef}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? 'Tap Ollie the Musical Owl' : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`relative flex items-center justify-center ${dimensions} ${
          interactive
            ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 rounded-full'
            : ''
        }`}
      >
        {/* Soft takeoff glow shadow while flying across the screen */}
        {isFlying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.85, 1.05, 0.85] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="absolute bottom-2 w-20 h-5 rounded-full bg-indigo-400/35 blur-[2px] pointer-events-none"
          />
        )}

        {/* Sleeping Zzz Floating Bubbles */}
        <AnimatePresence>
          {isSleeping && (
            <>
              <motion.span
                key="owl-zzz-1"
                aria-hidden="true"
                initial={{ opacity: 0, y: 6, x: 4, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [4, -18, -36],
                  x: [8, 18, 26],
                  scale: [0.7, 1.05, 1.2],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute right-1 top-2 font-display font-bold text-lg sm:text-xl text-indigo-300 pointer-events-none select-none"
              >
                Z
              </motion.span>
              <motion.span
                key="owl-zzz-2"
                aria-hidden="true"
                initial={{ opacity: 0, y: 6, x: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [2, -16, -30],
                  x: [14, 24, 30],
                  scale: [0.6, 0.9, 1],
                }}
                transition={{ duration: 2.4, delay: 0.9, repeat: Infinity, ease: 'easeOut' }}
                className="absolute right-0 top-5 font-display font-bold text-sm sm:text-base text-sky-300 pointer-events-none select-none"
              >
                zz
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* Floating Notes when Listening / Happy / Magic Tap */}
        <AnimatePresence>
          {!isFlying && (isDancing || isListening || trick === 'magic') && (
            <>
              <motion.span
                key="note-1"
                aria-hidden="true"
                initial={{ opacity: 0, y: 10, x: -12, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-6, -28, -44],
                  x: [-16, -26, -20],
                  scale: [0.7, 1.15, 0.9],
                  rotate: [-10, 12, -8],
                }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                className="absolute -left-2 top-3 text-2xl font-display font-bold text-sky-500 pointer-events-none"
              >
                ♪
              </motion.span>
              <motion.span
                key="note-2"
                aria-hidden="true"
                initial={{ opacity: 0, y: 10, x: 12, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-4, -26, -42],
                  x: [18, 28, 22],
                  scale: [0.7, 1.15, 0.9],
                  rotate: [12, -10, 10],
                }}
                transition={{ duration: 1.4, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute -right-2 top-4 text-2xl font-display font-bold text-rose-500 pointer-events-none"
              >
                ♫
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* Dizzy Question Badge & Floor Impact Dust Puffs */}
        <AnimatePresence>
          {isConfused && (
            <>
              <motion.div
                key="confused-q"
                initial={{ opacity: 0, scale: 0.4, y: 8 }}
                animate={{
                  opacity: 1,
                  scale: [1, 1.2, 1],
                  y: [16, 10, 16],
                  rotate: [-10, 12, -10],
                }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.85, repeat: Infinity }}
                className="absolute top-1 right-0 w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-display font-bold text-lg flex items-center justify-center shadow-md border-2 border-white z-20"
              >
                ?!
              </motion.div>
              <motion.span
                key={`dust-l-${collapseSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.25, 1.5], x: -24, y: -6 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="absolute bottom-1 left-2 text-lg pointer-events-none select-none"
              >
                💨
              </motion.span>
              <motion.span
                key={`dust-r-${collapseSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.25, 1.5], x: 24, y: -6 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="absolute bottom-1 right-2 text-lg pointer-events-none select-none"
              >
                💫
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* Main Animated Owl Body */}
        <motion.div
          key={isConfused ? `owl-collapse-${collapseSeq}` : 'owl-steady'}
          style={{ transformOrigin: '50% 82%' }}
          animate={
            isFlying
              ? { opacity: 0 }
              : trick === 'spin'
              ? { opacity: 1, rotate: [0, 360], scale: [1, 1.12, 1] }
              : trick === 'magic'
              ? { opacity: 1, y: [0, -16, 0], scale: [1, 1.08, 1] }
              : isConfused
              ? {
                  opacity: 1,
                  y: [0, -8, 28, 18, 26, 26, 0],
                  rotate: [0, -16, 76, 66, 74, 72, 0],
                  scaleX: [1, 0.95, 1.15, 1.04, 1.1, 1.08, 1],
                  scaleY: [1, 1.05, 0.8, 0.92, 0.85, 0.86, 1],
                }
              : isStreakSparkle
              ? {
                  opacity: 1,
                  y: [0, -22, 0, -16, 0],
                  rotate: [-7, 7, -7, 7, 0],
                  scale: [1, 1.09, 0.96, 1.08, 1],
                }
              : mood === 'celebrating'
              ? {
                  opacity: 1,
                  y: [0, -18, 0, -14, 0],
                  rotate: [0, -8, 8, -6, 0],
                  scale: [1, 1.07, 1, 1.05, 1],
                }
              : mood === 'happy'
              ? {
                  opacity: 1,
                  y: [0, -14, 0, -10, 0],
                  rotate: [-5, 5, -5, 5, 0],
                  scale: [1, 1.06, 0.97, 1.05, 1],
                }
              : mood === 'listening'
              ? { opacity: 1, y: [0, -6, 0], rotate: [-4, 4, -4] }
              : isSleeping
              ? { opacity: 1, y: [0, 2.5, 0], scaleY: [1, 0.97, 1], rotate: -4 }
              : { opacity: 1, y: [0, -4, 0], rotate: 0, scaleX: 1, scaleY: 1 }
          }
          transition={
            isFlying
              ? { duration: 0.1 }
              : trick !== 'none'
              ? { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }
              : isConfused
              ? { duration: 1.78, times: [0, 0.12, 0.28, 0.36, 0.45, 0.72, 1], ease: 'easeInOut' }
              : isDancing
              ? { duration: 0.65, repeat: Infinity, ease: 'easeInOut' }
              : isListening
              ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
              : isSleeping
              ? { duration: 3.1, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          }
          className="w-full h-full"
        >
          <OwlSvg
            isDancing={isDancing}
            isConfused={isConfused}
            isListening={isListening}
            isSleeping={isSleeping}
            isStreakSparkle={isStreakSparkle}
            isWinking={isWinking}
            isFlyingLoop={false}
            trick={trick}
          />
        </motion.div>
      </div>

      {/* Full-Screen Celebratory Flight Portal */}
      <FullScreenFlightLayer
        active={isFlying}
        origin={flightOrigin}
        variant="owl"
        onFlightComplete={() => setIsFlying(false)}
      >
        <OwlSvg
          isDancing={true}
          isConfused={false}
          isListening={false}
          isSleeping={false}
          isStreakSparkle={streak >= 2}
          isWinking={false}
          isFlyingLoop={true}
          trick="none"
        />
      </FullScreenFlightLayer>
    </div>
  );
}
