import { ReactElement, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotMood } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { TapTrick } from './MusicalOwl';

export type ExtraCharacterId =
  | 'bunny'
  | 'watch_hero'
  | 'giant'
  | 'unicorn'
  | 'dino'
  | 'astronaut'
  | 'panda'
  | 'superhero';

interface MascotCharacterProps {
  characterId: ExtraCharacterId;
  mood: MascotMood;
  message?: string;
  size?: 'avatar' | 'sm' | 'md' | 'lg' | 'xl';
  streak?: number;
  interactive?: boolean;
  onTap?: () => void;
}

interface SharedEyeProps {
  cx1: number;
  cx2: number;
  cy: number;
  r?: number;
  eyeColor?: string;
  isSleeping: boolean;
  isWinking: boolean;
  isHappy: boolean;
  isConfused: boolean;
  isStreakSparkle: boolean;
}

function ExpressiveEyes({
  cx1,
  cx2,
  cy,
  r = 6.2,
  eyeColor = '#1E1B4B',
  isSleeping,
  isWinking,
  isHappy,
  isConfused,
  isStreakSparkle,
}: SharedEyeProps) {
  if (isSleeping) {
    return (
      <g stroke={eyeColor} strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d={`M ${cx1 - 6} ${cy} Q ${cx1} ${cy + 6} ${cx1 + 6} ${cy}`} />
        <path d={`M ${cx2 - 6} ${cy} Q ${cx2} ${cy + 6} ${cx2 + 6} ${cy}`} />
      </g>
    );
  }
  if (isWinking) {
    return (
      <g>
        <path
          d={`M ${cx1 - 6} ${cy + 1} Q ${cx1} ${cy - 6} ${cx1 + 6} ${cy + 1}`}
          stroke={eyeColor}
          strokeWidth="3.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={cx2} cy={cy} r={r} fill={eyeColor} />
        <circle cx={cx2 + r * 0.35} cy={cy - r * 0.35} r={r * 0.38} fill="#FFFFFF" />
        <circle cx={cx2 - r * 0.25} cy={cy + r * 0.35} r={r * 0.18} fill="#FFFFFF" opacity="0.85" />
      </g>
    );
  }
  if (isStreakSparkle) {
    return (
      <g>
        <motion.path
          animate={{ scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 0.55, repeat: Infinity }}
          style={{ transformOrigin: `${cx1}px ${cy}px` }}
          d={`M ${cx1} ${cy - 8} L ${cx1 + 2.4} ${cy - 2.4} L ${cx1 + 8} ${cy} L ${cx1 + 2.4} ${cy + 2.4} L ${cx1} ${cy + 8} L ${cx1 - 2.4} ${cy + 2.4} L ${cx1 - 8} ${cy} L ${cx1 - 2.4} ${cy - 2.4} Z`}
          fill="#F59E0B"
        />
        <motion.path
          animate={{ scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 0.55, repeat: Infinity }}
          style={{ transformOrigin: `${cx2}px ${cy}px` }}
          d={`M ${cx2} ${cy - 8} L ${cx2 + 2.4} ${cy - 2.4} L ${cx2 + 8} ${cy} L ${cx2 + 2.4} ${cy + 2.4} L ${cx2} ${cy + 8} L ${cx2 - 2.4} ${cy + 2.4} L ${cx2 - 8} ${cy} L ${cx2 - 2.4} ${cy - 2.4} Z`}
          fill="#F59E0B"
        />
      </g>
    );
  }
  if (isHappy) {
    return (
      <g stroke={eyeColor} strokeWidth="3.6" strokeLinecap="round" fill="none">
        <path d={`M ${cx1 - 6.5} ${cy + 1} Q ${cx1} ${cy - 7} ${cx1 + 6.5} ${cy + 1}`} />
        <path d={`M ${cx2 - 6.5} ${cy + 1} Q ${cx2} ${cy - 7} ${cx2 + 6.5} ${cy + 1}`} />
      </g>
    );
  }
  if (isConfused) {
    return (
      <g>
        <circle cx={cx1} cy={cy} r={r} fill="#FFFFFF" stroke={eyeColor} strokeWidth="2.2" />
        <circle cx={cx1 - 1.5} cy={cy + 1} r={r * 0.48} fill={eyeColor} />
        <circle cx={cx2} cy={cy} r={r} fill="#FFFFFF" stroke={eyeColor} strokeWidth="2.2" />
        <circle cx={cx2 + 1.5} cy={cy - 1} r={r * 0.48} fill={eyeColor} />
      </g>
    );
  }
  return (
    <g>
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1] }}
        transition={{ duration: 3.9, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
        style={{ transformOrigin: `${cx1}px ${cy}px` }}
      >
        <circle cx={cx1} cy={cy} r={r} fill={eyeColor} />
        <circle cx={cx1 + r * 0.34} cy={cy - r * 0.35} r={r * 0.38} fill="#FFFFFF" />
        <circle cx={cx1 - r * 0.25} cy={cy + r * 0.36} r={r * 0.18} fill="#FFFFFF" opacity="0.85" />
      </motion.g>
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1] }}
        transition={{ duration: 3.9, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
        style={{ transformOrigin: `${cx2}px ${cy}px` }}
      >
        <circle cx={cx2} cy={cy} r={r} fill={eyeColor} />
        <circle cx={cx2 + r * 0.34} cy={cy - r * 0.35} r={r * 0.38} fill="#FFFFFF" />
        <circle cx={cx2 - r * 0.25} cy={cy + r * 0.36} r={r * 0.18} fill="#FFFFFF" opacity="0.85" />
      </motion.g>
    </g>
  );
}

interface CharacterArtProps {
  idPrefix: string;
  moodProps: {
    isDancing: boolean;
    isConfused: boolean;
    isListening: boolean;
    isSleeping: boolean;
    isStreakSparkle: boolean;
    isWinking: boolean;
    trick: TapTrick;
  };
}

function CuteBunnySvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const furGrad = `${idPrefix}_bunnyFur`;
  const earGrad = `${idPrefix}_bunnyEar`;
  const carrotGrad = `${idPrefix}_carrot`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(244,63,94,0.18)]">
      <defs>
        <radialGradient id={furGrad} cx="42%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="72%" stopColor="#FFF1F2" />
          <stop offset="100%" stopColor="#FECDD3" />
        </radialGradient>
        <linearGradient id={earGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <linearGradient id={carrotGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="46" ry="7" fill="rgba(190, 24, 93, 0.12)" />

      {/* Fluffy Cotton Tail */}
      <circle cx="62" cy="160" r="14" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />

      {/* Long Ears */}
      <motion.g
        style={{ transformOrigin: '86px 64px' }}
        animate={{ rotate: isDancing ? [-8, 6, -8] : [-3, 3, -3] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="82" cy="40" rx="14" ry="34" transform="rotate(-12 82 40)" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
        <ellipse cx="82" cy="42" rx="7.5" ry="23" transform="rotate(-12 82 42)" fill={`url(#${earGrad})`} opacity="0.85" />
      </motion.g>
      <motion.g
        style={{ transformOrigin: '124px 64px' }}
        animate={{ rotate: isDancing ? [8, -6, 8] : [3, -3, 3] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="128" cy="40" rx="14" ry="34" transform="rotate(12 128 40)" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
        <ellipse cx="128" cy="42" rx="7.5" ry="23" transform="rotate(12 128 42)" fill={`url(#${earGrad})`} opacity="0.85" />
      </motion.g>

      {/* Plump Cute Body */}
      <ellipse cx="105" cy="148" rx="40" ry="38" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
      <ellipse cx="105" cy="150" rx="24" ry="24" fill="#FFF5F7" />

      {/* Feet */}
      <ellipse cx="82" cy="184" rx="15" ry="9" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
      <ellipse cx="128" cy="184" rx="15" ry="9" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
      <circle cx="82" cy="184" r="4" fill="#FDA4AF" />
      <circle cx="128" cy="184" r="4" fill="#FDA4AF" />

      {/* Head */}
      <ellipse cx="105" cy="96" rx="42" ry="36" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />

      {/* Rosy Cheeks */}
      <ellipse cx="76" cy="105" rx="7.5" ry="4.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="134" cy="105" rx="7.5" ry="4.5" fill="#FB7185" opacity="0.55" />

      {/* Eyes */}
      <ExpressiveEyes
        cx1={88}
        cx2={122}
        cy={94}
        r={6.4}
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      {/* Cute Pink Nose & Bunny Smile */}
      <ellipse cx="105" cy="103" rx="5.2" ry="3.8" fill="#F43F5E" />
      <path d="M 97 110 Q 101 114 105 109 Q 109 114 113 110" fill="none" stroke="#9F1239" strokeWidth="2.4" strokeLinecap="round" />

      {/* Crunchy Carrot + Arms */}
      <g transform="translate(124, 126) rotate(14)">
        <path d="M 10 -12 C 4 -24, 12 -28, 16 -14 C 20 -28, 28 -22, 20 -10 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <path d="M 4 -10 L 26 -10 L 17 34 C 15 39, 11 39, 10 34 Z" fill={`url(#${carrotGrad})`} stroke="#C2410C" strokeWidth="1.8" />
        <line x1="9" y1="2" x2="18" y2="2" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
        <line x1="11" y1="12" x2="18" y2="12" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round" />
      </g>
      <ellipse cx="76" cy="144" rx="12" ry="9" transform="rotate(-18 76 144)" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
      <ellipse cx="132" cy="144" rx="12" ry="9" transform="rotate(18 132 144)" fill={`url(#${furGrad})`} stroke="#FECDD3" strokeWidth="2" />
    </svg>
  );
}

function WatchHeroSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const skinGrad = `${idPrefix}_whSkin`;
  const hairGrad = `${idPrefix}_whHair`;
  const suitGrad = `${idPrefix}_whSuit`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(16,185,129,0.22)]">
      <defs>
        <radialGradient id={skinGrad} cx="42%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#FFF2E5" />
          <stop offset="100%" stopColor="#F5C49E" />
        </radialGradient>
        <linearGradient id={hairGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5C3A21" />
          <stop offset="100%" stopColor="#2D1B10" />
        </linearGradient>
        <linearGradient id={suitGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="44" ry="7" fill="rgba(5, 150, 105, 0.16)" />

      {/* Legs & Sneakers */}
      <rect x="85" y="152" width="14" height="28" rx="6" fill="#1E293B" />
      <rect x="111" y="152" width="14" height="28" rx="6" fill="#1E293B" />
      <rect x="80" y="176" width="22" height="12" rx="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />
      <rect x="108" y="176" width="22" height="12" rx="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.8" />

      {/* Cool Sci-Fi Jacket */}
      <path d="M 76 112 L 134 112 L 130 156 L 80 156 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 88 112 L 122 112 L 120 156 L 90 156 Z" fill={`url(#${suitGrad})`} />
      <line x1="105" y1="112" x2="105" y2="156" stroke="#064E3B" strokeWidth="2.5" />
      <circle cx="105" cy="130" r="6" fill="#0F172A" stroke="#6EE7B7" strokeWidth="2" />

      {/* Left Arm */}
      <path d="M 78 118 Q 58 134 65 148" fill="none" stroke={`url(#${skinGrad})`} strokeWidth="11" strokeLinecap="round" />

      {/* Right Arm Raised Showing Glowing Green Cosmic Wristwatch (100% Original Design) */}
      <path d="M 132 118 Q 158 110 152 90" fill="none" stroke={`url(#${skinGrad})`} strokeWidth="11" strokeLinecap="round" />
      {/* Wristwatch strap & glowing cosmic ring */}
      <motion.g
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '154px 96px' }}
      >
        <circle cx="154" cy="96" r="17" fill="#34D399" opacity="0.24" />
        <rect x="142" y="88" width="24" height="16" rx="6" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.8" />
        <circle cx="154" cy="96" r="10.5" fill="#064E3B" stroke="#34D399" strokeWidth="2.4" />
        {/* Original geometric cosmic dial (orb + crescent arc, no copyrighted icons) */}
        <circle cx="154" cy="96" r="5" fill="#4ADE80" />
        <circle cx="154" cy="96" r="2.2" fill="#ECFDF5" />
      </motion.g>

      {/* Head & Spiky/Tousled Hero Hair */}
      <circle cx="105" cy="74" r="33" fill={`url(#${skinGrad})`} />
      <path
        d="M 68 70 Q 72 34 105 32 Q 138 34 142 70 Q 134 52 120 56 Q 112 42 98 54 Q 82 48 68 70 Z"
        fill={`url(#${hairGrad})`}
      />
      <path d="M 96 34 L 106 20 L 112 36" fill={`url(#${hairGrad})`} />

      {/* Rosy Cheeks */}
      <ellipse cx="84" cy="84" rx="6" ry="3.8" fill="#FB7185" opacity="0.45" />
      <ellipse cx="126" cy="84" rx="6" ry="3.8" fill="#FB7185" opacity="0.45" />

      <ExpressiveEyes
        cx1={91}
        cx2={119}
        cy={75}
        r={5.8}
        eyeColor="#065F46"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      {/* Confident Friendly Smile */}
      <path d="M 96 89 Q 105 97 115 88" fill="none" stroke="#9A3412" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function FriendlyGiantSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const skinGrad = `${idPrefix}_giantSkin`;
  const tunicGrad = `${idPrefix}_giantTunic`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(217,119,6,0.2)]">
      <defs>
        <radialGradient id={skinGrad} cx="42%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="65%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <linearGradient id={tunicGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="196" rx="54" ry="8" fill="rgba(180, 83, 9, 0.16)" />

      {/* Big Cozy Legs & Boots */}
      <rect x="74" y="156" width="22" height="26" rx="9" fill="#78350F" />
      <rect x="114" y="156" width="22" height="26" rx="9" fill="#78350F" />
      <ellipse cx="83" cy="184" rx="17" ry="10" fill="#92400E" stroke="#FDE68A" strokeWidth="1.6" />
      <ellipse cx="127" cy="184" rx="17" ry="10" fill="#92400E" stroke="#FDE68A" strokeWidth="1.6" />

      {/* Big Warm Round Torso */}
      <ellipse cx="105" cy="128" rx="54" ry="44" fill={`url(#${skinGrad})`} stroke="#B45309" strokeWidth="2" />
      {/* Friendly Sky-Blue Overalls */}
      <path d="M 60 124 Q 105 112 150 124 L 146 164 Q 105 174 64 164 Z" fill={`url(#${tunicGrad})`} stroke="#FFFFFF" strokeWidth="2" />
      <rect x="70" y="96" width="12" height="32" rx="5" fill={`url(#${tunicGrad})`} stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="128" y="96" width="12" height="32" rx="5" fill={`url(#${tunicGrad})`} stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="76" cy="126" r="4" fill="#FDE047" />
      <circle cx="134" cy="126" r="4" fill="#FDE047" />

      {/* Big Cozy Arms */}
      <path d="M 54 114 Q 34 128 44 148" fill="none" stroke={`url(#${skinGrad})`} strokeWidth="18" strokeLinecap="round" />
      <path d="M 156 114 Q 176 128 166 148" fill="none" stroke={`url(#${skinGrad})`} strokeWidth="18" strokeLinecap="round" />

      {/* Cute Sprout Leaf on Top of Head */}
      <path d="M 105 32 Q 105 18 118 16 Q 116 30 105 32 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />

      {/* Gentle Giant Head */}
      <circle cx="105" cy="68" r="36" fill={`url(#${skinGrad})`} stroke="#B45309" strokeWidth="2" />
      {/* Cute tuft of brown hair */}
      <path d="M 80 42 Q 95 28 115 36 Q 128 38 134 50 Q 112 40 80 42 Z" fill="#92400E" />

      {/* Big Rosy Nose & Warm Cheeks */}
      <ellipse cx="80" cy="76" rx="7" ry="4.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="130" cy="76" rx="7" ry="4.5" fill="#FB7185" opacity="0.55" />

      <ExpressiveEyes
        cx1={89}
        cx2={121}
        cy={65}
        r={5.6}
        eyeColor="#451A03"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />
      <ellipse cx="105" cy="74" rx="7.5" ry="5.5" fill="#F97316" />

      {/* Huge Warm Gentle Smile */}
      <path d="M 88 84 Q 105 98 122 84" fill="#FFFFFF" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function MagicalUnicornSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const bodyGrad = `${idPrefix}_uniBody`;
  const hornGrad = `${idPrefix}_uniHorn`;
  const maneGrad = `${idPrefix}_uniMane`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(217,70,239,0.2)]">
      <defs>
        <radialGradient id={bodyGrad} cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="72%" stopColor="#FDF4FF" />
          <stop offset="100%" stopColor="#F5D0FE" />
        </radialGradient>
        <linearGradient id={hornGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={maneGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="46" ry="7" fill="rgba(192, 38, 211, 0.14)" />

      {/* Rainbow Tail */}
      <motion.path
        animate={{ rotate: [-6, 8, -6] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '66px 150px' }}
        d="M 66 150 C 32 138, 26 170, 48 182 C 58 186, 68 172, 68 160 Z"
        fill={`url(#${maneGrad})`}
        stroke="#FFFFFF"
        strokeWidth="2"
      />

      {/* Body */}
      <ellipse cx="105" cy="150" rx="38" ry="34" fill={`url(#${bodyGrad})`} stroke="#F0ABFC" strokeWidth="2" />
      <circle cx="105" cy="152" r="8" fill="#FDE047" opacity="0.7" />

      {/* Golden Hooves */}
      <rect x="78" y="170" width="15" height="18" rx="7" fill={`url(#${bodyGrad})`} stroke="#F0ABFC" strokeWidth="1.8" />
      <rect x="117" y="170" width="15" height="18" rx="7" fill={`url(#${bodyGrad})`} stroke="#F0ABFC" strokeWidth="1.8" />
      <rect x="78" y="180" width="15" height="8" rx="4" fill="#FBBF24" />
      <rect x="117" y="180" width="15" height="8" rx="4" fill="#FBBF24" />

      {/* Rainbow Mane */}
      <path d="M 68 62 C 44 64, 42 96, 66 106 C 52 114, 56 132, 76 126 Z" fill={`url(#${maneGrad})`} stroke="#FFFFFF" strokeWidth="1.8" />

      {/* Ears */}
      <path d="M 74 58 L 68 32 L 88 48 Z" fill={`url(#${bodyGrad})`} stroke="#F0ABFC" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 136 58 L 142 32 L 122 48 Z" fill={`url(#${bodyGrad})`} stroke="#F0ABFC" strokeWidth="2" strokeLinejoin="round" />

      {/* Head */}
      <ellipse cx="105" cy="90" rx="40" ry="35" fill={`url(#${bodyGrad})`} stroke="#F0ABFC" strokeWidth="2" />
      {/* Fluffy Rainbow Forelock */}
      <path d="M 80 62 C 92 42, 118 42, 130 62 C 118 56, 94 56, 80 62 Z" fill={`url(#${maneGrad})`} stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Golden Spiral Horn */}
      <path d="M 97 52 L 105 18 L 113 52 Z" fill={`url(#${hornGrad})`} stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
      <line x1="100" y1="42" x2="110" y2="39" stroke="#FFFFFF" strokeWidth="1.6" />
      <line x1="102" y1="33" x2="108" y2="31" stroke="#FFFFFF" strokeWidth="1.6" />

      {/* Soft Muzzle & Rosy Cheeks */}
      <ellipse cx="105" cy="105" rx="22" ry="14" fill="#FCE7F3" />
      <ellipse cx="77" cy="96" rx="6.5" ry="4" fill="#F472B6" opacity="0.55" />
      <ellipse cx="133" cy="96" rx="6.5" ry="4" fill="#F472B6" opacity="0.55" />

      <ExpressiveEyes
        cx1={88}
        cx2={122}
        cy={84}
        r={6.2}
        eyeColor="#701A75"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      <circle cx="98" cy="103" r="2.2" fill="#DB2777" />
      <circle cx="112" cy="103" r="2.2" fill="#DB2777" />
      <path d="M 98 110 Q 105 116 112 110" fill="none" stroke="#9D174D" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function BabyDinoSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const skinGrad = `${idPrefix}_dinoSkin`;
  const bellyGrad = `${idPrefix}_dinoBelly`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(101,163,13,0.2)]">
      <defs>
        <radialGradient id={skinGrad} cx="42%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#BEF264" />
          <stop offset="68%" stopColor="#84CC16" />
          <stop offset="100%" stopColor="#4D7C0F" />
        </radialGradient>
        <linearGradient id={bellyGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="48" ry="7" fill="rgba(77, 124, 15, 0.16)" />

      {/* Cute Back Spikes */}
      <path d="M 66 64 L 54 70 L 66 80 Z" fill="#FB923C" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M 62 94 L 48 102 L 62 112 Z" fill="#FB923C" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M 60 124 L 46 134 L 62 142 Z" fill="#FB923C" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Tail */}
      <path d="M 68 152 Q 30 144 26 128 Q 48 166 78 168 Z" fill={`url(#${skinGrad})`} stroke="#3F6212" strokeWidth="2" strokeLinejoin="round" />

      {/* Plump Body + Yellow Belly */}
      <ellipse cx="106" cy="144" rx="40" ry="38" fill={`url(#${skinGrad})`} stroke="#3F6212" strokeWidth="2" />
      <ellipse cx="112" cy="148" rx="24" ry="26" fill={`url(#${bellyGrad})`} />

      {/* Feet */}
      <ellipse cx="86" cy="183" rx="15" ry="9" fill={`url(#${skinGrad})`} stroke="#3F6212" strokeWidth="2" />
      <ellipse cx="126" cy="183" rx="15" ry="9" fill={`url(#${skinGrad})`} stroke="#3F6212" strokeWidth="2" />

      {/* Tiny Cute T-Rex Arms */}
      <path d="M 134 128 Q 152 124 150 136" fill="none" stroke={`url(#${skinGrad})`} strokeWidth="10" strokeLinecap="round" />
      <path d="M 78 128 Q 64 134 68 144" fill="none" stroke={`url(#${skinGrad})`} strokeWidth="10" strokeLinecap="round" />

      {/* Big Cute Dino Head */}
      <ellipse cx="110" cy="82" rx="44" ry="36" fill={`url(#${skinGrad})`} stroke="#3F6212" strokeWidth="2" />
      <circle cx="80" cy="64" r="5" fill="#A3E635" opacity="0.7" />
      <circle cx="142" cy="70" r="4" fill="#A3E635" opacity="0.7" />

      {/* Cheeks */}
      <ellipse cx="82" cy="92" rx="7" ry="4.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="138" cy="92" rx="7" ry="4.5" fill="#FB7185" opacity="0.55" />

      <ExpressiveEyes
        cx1={94}
        cx2={126}
        cy={78}
        r={6.4}
        eyeColor="#1A2E05"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      {/* Happy Grin */}
      <path d="M 94 96 Q 112 108 130 94" fill="none" stroke="#365314" strokeWidth="3" strokeLinecap="round" />
      <path d="M 103 99 L 106 105 L 109 99 Z" fill="#FFFFFF" />
      <path d="M 116 99 L 119 105 L 122 99 Z" fill="#FFFFFF" />
    </svg>
  );
}

function LittleAstronautSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const suitGrad = `${idPrefix}_astroSuit`;
  const visorGrad = `${idPrefix}_astroVisor`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(2,132,199,0.2)]">
      <defs>
        <linearGradient id={suitGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id={visorGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="44" ry="7" fill="rgba(2, 132, 199, 0.16)" />

      {/* Space Backpack */}
      <rect x="64" y="106" width="82" height="50" rx="16" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />

      {/* Legs & Moon Boots */}
      <rect x="82" y="150" width="16" height="28" rx="7" fill={`url(#${suitGrad})`} stroke="#94A3B8" strokeWidth="2" />
      <rect x="112" y="150" width="16" height="28" rx="7" fill={`url(#${suitGrad})`} stroke="#94A3B8" strokeWidth="2" />
      <rect x="78" y="172" width="24" height="14" rx="7" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.8" />
      <rect x="108" y="172" width="24" height="14" rx="7" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.8" />

      {/* Space Suit Body */}
      <rect x="74" y="110" width="62" height="48" rx="18" fill={`url(#${suitGrad})`} stroke="#94A3B8" strokeWidth="2" />
      <rect x="90" y="122" width="30" height="20" rx="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="98" cy="132" r="3" fill="#FDE047" />
      <circle cx="106" cy="132" r="3" fill="#4ADE80" />
      <circle cx="114" cy="132" r="3" fill="#FB7185" />

      {/* Arms */}
      <path d="M 74 120 Q 52 132 58 148" fill="none" stroke={`url(#${suitGrad})`} strokeWidth="13" strokeLinecap="round" />
      <path d="M 136 120 Q 158 106 154 90" fill="none" stroke={`url(#${suitGrad})`} strokeWidth="13" strokeLinecap="round" />
      <circle cx="58" cy="148" r="7" fill="#38BDF8" />
      <circle cx="154" cy="90" r="7" fill="#38BDF8" />

      {/* Big Bubble Helmet */}
      <circle cx="105" cy="70" r="44" fill={`url(#${suitGrad})`} stroke="#94A3B8" strokeWidth="2.4" />
      <ellipse cx="105" cy="72" rx="34" ry="30" fill={`url(#${visorGrad})`} stroke="#38BDF8" strokeWidth="2.4" />
      {/* Helmet Glare */}
      <path d="M 80 54 Q 90 44 106 46" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.45" />

      {/* Glowing Expressive Eyes inside Helmet */}
      <ExpressiveEyes
        cx1={91}
        cx2={119}
        cy={72}
        r={5.8}
        eyeColor="#38BDF8"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      {/* Cute Visor Smile */}
      <path d="M 96 86 Q 105 93 114 86" fill="none" stroke="#7DD3FC" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function CutePandaSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const furGrad = `${idPrefix}_pandaFur`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(30,41,59,0.18)]">
      <defs>
        <radialGradient id={furGrad} cx="42%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="48" ry="7" fill="rgba(15, 23, 42, 0.14)" />

      {/* Round Ears */}
      <circle cx="68" cy="48" r="17" fill="#1E293B" />
      <circle cx="142" cy="48" r="17" fill="#1E293B" />

      {/* Chubby Body + Dark Shoulder Band */}
      <ellipse cx="105" cy="148" rx="44" ry="38" fill={`url(#${furGrad})`} stroke="#CBD5E1" strokeWidth="2" />
      <path d="M 68 122 Q 105 134 142 122 Q 146 138 140 144 Q 105 152 70 144 Q 64 138 68 122 Z" fill="#1E293B" />

      {/* Feet */}
      <ellipse cx="82" cy="182" rx="15" ry="10" fill="#1E293B" />
      <ellipse cx="128" cy="182" rx="15" ry="10" fill="#1E293B" />
      <circle cx="82" cy="183" r="4.5" fill="#FDA4AF" />
      <circle cx="128" cy="183" r="4.5" fill="#FDA4AF" />

      {/* Arms + Bamboo Stalk */}
      <ellipse cx="66" cy="142" rx="13" ry="10" transform="rotate(-24 66 142)" fill="#1E293B" />
      <ellipse cx="144" cy="142" rx="13" ry="10" transform="rotate(24 144 142)" fill="#1E293B" />
      <rect x="140" y="104" width="8" height="46" rx="4" transform="rotate(14 144 128)" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      <path d="M 148 112 Q 162 104 166 112 Q 158 118 148 112 Z" fill="#4ADE80" />

      {/* Big Cute Round Panda Head */}
      <ellipse cx="105" cy="86" rx="46" ry="39" fill={`url(#${furGrad})`} stroke="#CBD5E1" strokeWidth="2" />

      {/* Panda Eye Patches */}
      <ellipse cx="84" cy="86" rx="13" ry="15" transform="rotate(-14 84 86)" fill="#1E293B" />
      <ellipse cx="126" cy="86" rx="13" ry="15" transform="rotate(14 126 86)" fill="#1E293B" />

      {/* Rosy Cheeks */}
      <ellipse cx="70" cy="100" rx="7" ry="4.5" fill="#FB7185" opacity="0.65" />
      <ellipse cx="140" cy="100" rx="7" ry="4.5" fill="#FB7185" opacity="0.65" />

      {/* Sparkling Eyes (White catchlights on dark eye patches!) */}
      <ExpressiveEyes
        cx1={85}
        cx2={125}
        cy={85}
        r={5.8}
        eyeColor="#FFFFFF"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      {/* Little Nose & Mouth */}
      <ellipse cx="105" cy="96" rx="6.5" ry="4.5" fill="#0F172A" />
      <path d="M 97 104 Q 101 108 105 103 Q 109 108 113 104" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function MiniSuperheroSvg({ idPrefix, moodProps }: CharacterArtProps) {
  const { isDancing, isConfused, isSleeping, isStreakSparkle, isWinking } = moodProps;
  const skinGrad = `${idPrefix}_heroSkin`;
  const suitGrad = `${idPrefix}_heroSuit`;
  return (
    <svg viewBox="0 0 210 210" className="w-full h-full drop-shadow-[0_14px_18px_rgba(239,68,68,0.22)]">
      <defs>
        <radialGradient id={skinGrad} cx="42%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#FFF2E5" />
          <stop offset="100%" stopColor="#F5C49E" />
        </radialGradient>
        <linearGradient id={suitGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <ellipse cx="105" cy="195" rx="44" ry="7" fill="rgba(220, 38, 38, 0.14)" />

      {/* Fluttering Scarlet Cape */}
      <motion.path
        animate={{ d: ['M 76 112 Q 48 148 56 172 L 154 172 Q 162 148 134 112 Z', 'M 76 112 Q 42 146 52 174 L 158 174 Q 168 146 134 112 Z'] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth="2"
      />

      {/* Legs & Red Hero Boots */}
      <rect x="85" y="152" width="14" height="28" rx="6" fill={`url(#${suitGrad})`} />
      <rect x="111" y="152" width="14" height="28" rx="6" fill={`url(#${suitGrad})`} />
      <rect x="81" y="172" width="21" height="16" rx="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.6" />
      <rect x="108" y="172" width="21" height="16" rx="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.6" />

      {/* Suit Torso + Belt + Star Emblem */}
      <path d="M 80 112 L 130 112 L 126 156 L 84 156 Z" fill={`url(#${suitGrad})`} stroke="#FFFFFF" strokeWidth="1.8" />
      <rect x="82" y="144" width="46" height="7" rx="3" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
      <path
        d="M105 119 L108.5 126 L116 127 L110.5 132 L112 139.5 L105 136 L98 139.5 L99.5 132 L94 127 L101.5 126 Z"
        fill="#FACC15"
        stroke="#FFFFFF"
        strokeWidth="1.2"
      />

      {/* Arms */}
      <path d="M 80 118 Q 58 130 66 146" fill="none" stroke={`url(#${suitGrad})`} strokeWidth="11" strokeLinecap="round" />
      <path d="M 130 118 Q 154 102 148 86" fill="none" stroke={`url(#${suitGrad})`} strokeWidth="11" strokeLinecap="round" />
      <circle cx="66" cy="146" r="6" fill="#EF4444" />
      <circle cx="148" cy="86" r="6" fill="#EF4444" />

      {/* Head & Hair */}
      <circle cx="105" cy="74" r="33" fill={`url(#${skinGrad})`} />
      <path d="M 70 68 Q 74 34 105 34 Q 136 34 140 68 Q 124 52 105 56 Q 86 52 70 68 Z" fill="#F59E0B" />

      {/* Vibrant Hero Eye Mask */}
      <path d="M 74 70 Q 105 64 136 70 Q 138 84 120 84 Q 105 78 90 84 Q 72 84 74 70 Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Cheeks */}
      <ellipse cx="83" cy="87" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="127" cy="87" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.55" />

      <ExpressiveEyes
        cx1={91}
        cx2={119}
        cy={75}
        r={5.8}
        eyeColor="#1E1B4B"
        isSleeping={isSleeping}
        isWinking={isWinking}
        isHappy={isDancing}
        isConfused={isConfused}
        isStreakSparkle={isStreakSparkle}
      />

      {/* Big Joyful Hero Smile */}
      <path d="M 96 90 Q 105 98 114 90" fill="none" stroke="#9A3412" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

const CHARACTER_RENDERERS: Record<
  ExtraCharacterId,
  (props: CharacterArtProps) => ReactElement
> = {
  bunny: CuteBunnySvg,
  watch_hero: WatchHeroSvg,
  giant: FriendlyGiantSvg,
  unicorn: MagicalUnicornSvg,
  dino: BabyDinoSvg,
  astronaut: LittleAstronautSvg,
  panda: CutePandaSvg,
  superhero: MiniSuperheroSvg,
};

export function MascotCharacter({
  characterId,
  mood,
  message,
  size = 'md',
  streak = 0,
  interactive = true,
  onTap,
}: MascotCharacterProps) {
  const reactId = useId().replace(/:/g, '');
  const [trick, setTrick] = useState<TapTrick>('none');
  const [trickIndex, setTrickIndex] = useState(0);

  const isDancing = mood === 'happy' || mood === 'celebrating';
  const isConfused = mood === 'confused';
  const isListening = mood === 'listening';
  const isSleeping = mood === 'sleeping';
  const isStreakSparkle = isDancing && streak >= 2;
  const isWinking = trick === 'wink';

  const dimensions =
    size === 'avatar'
      ? 'w-9 h-9'
      : size === 'sm'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : size === 'lg'
      ? 'w-32 h-32 sm:w-40 sm:h-40'
      : size === 'xl'
      ? 'w-[196px] h-[196px] sm:w-[248px] sm:h-[248px]'
      : 'w-28 h-28 sm:w-36 sm:h-36';

  const handleClick = () => {
    if (!interactive) return;
    const tricks: TapTrick[] = ['magic', 'spin', 'wink'];
    const nextTrick = tricks[trickIndex % tricks.length];
    setTrickIndex((i) => i + 1);
    setTrick(nextTrick);
    soundEngine.playRunnerCheer();
    onTap?.();
    window.setTimeout(() => {
      setTrick('none');
    }, 850);
  };

  const ArtComponent = CHARACTER_RENDERERS[characterId];

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Speech Bubble */}
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

      {/* Interactive Character Stage */}
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `Tap ${characterId}` : undefined}
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
        <motion.div
          animate={
            trick === 'spin'
              ? { rotate: [0, 360], scale: [1, 1.12, 1] }
              : trick === 'magic'
              ? { y: [0, -14, 0], rotate: [0, -6, 6, 0], scale: [1, 1.07, 1] }
              : isConfused
              ? { rotate: [0, -10, 10, -8, 0], y: [0, 4, 0] }
              : isDancing
              ? { y: [0, -14, 0, -10, 0], rotate: [-4, 4, -4, 0] }
              : isListening
              ? { y: [0, -5, 0], rotate: [-3, 3, -3] }
              : isSleeping
              ? { y: [0, 2.5, 0], scaleY: [1, 0.97, 1] }
              : { y: [0, -5, 0], scaleY: [1, 1.015, 1] }
          }
          transition={
            trick !== 'none'
              ? { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }
              : isDancing
              ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
              : isListening
              ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.7, repeat: Infinity, ease: 'easeInOut' }
          }
          className="w-full h-full"
        >
          <ArtComponent
            idPrefix={reactId}
            moodProps={{
              isDancing,
              isConfused,
              isListening,
              isSleeping,
              isStreakSparkle,
              isWinking,
              trick,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
