import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DEFAULT_EQUIPPED_WARDROBE,
  EquippedWardrobe,
  MascotMood,
  WARDROBE_CATALOG,
  WardrobeItem,
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { TapTrick } from './MusicalOwl';
import { FlightOriginRect, FullScreenFlightLayer } from './FullScreenFlightLayer';

interface MusicalFairyProps {
  mood: MascotMood;
  message?: string;
  size?: 'avatar' | 'sm' | 'md' | 'lg' | 'xl';
  streak?: number;
  equipped?: EquippedWardrobe;
  interactive?: boolean;
  enableFullScreenFly?: boolean;
  onTap?: () => void;
}

interface FairySvgProps {
  idPrefix: string;
  dressItem: WardrobeItem;
  shoesItem: WardrobeItem;
  crownItem: WardrobeItem;
  wingsItem: WardrobeItem;
  isDancing: boolean;
  isConfused: boolean;
  isListening: boolean;
  isSleeping: boolean;
  isStreakSparkle: boolean;
  isWinking: boolean;
  isFlyingLoop: boolean;
  trick: TapTrick;
}

function FairySvg({
  idPrefix,
  dressItem,
  shoesItem,
  crownItem,
  wingsItem,
  isDancing,
  isConfused,
  isListening,
  isSleeping,
  isStreakSparkle,
  isWinking,
  isFlyingLoop,
  trick,
}: FairySvgProps) {
  const skinGradId = `${idPrefix}_fairySkinGrad`;
  const hairGradId = `${idPrefix}_fairyHairGrad`;
  const dressGradId = `${idPrefix}_fairyDressGrad`;
  const wingsGradId = `${idPrefix}_fairyWingsGrad`;

  const flappingFast = isDancing || isFlyingLoop || trick === 'magic';

  const wingAuraId = `${idPrefix}_fairyWingAura`;

  return (
    <svg
      viewBox="0 0 210 210"
      className="w-full h-full drop-shadow-[0_14px_18px_rgba(236,72,153,0.22)]"
    >
      <defs>
        <radialGradient id={skinGradId} cx="42%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#FFF5ED" />
          <stop offset="68%" stopColor="#FDE2CA" />
          <stop offset="100%" stopColor="#F7C59F" />
        </radialGradient>

        <linearGradient id={hairGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id={dressGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={dressItem.primaryColor} />
          <stop offset="100%" stopColor={dressItem.secondaryColor} />
        </linearGradient>

        <linearGradient id={wingsGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCE7F3" stopOpacity="0.96" />
          <stop offset="50%" stopColor={wingsItem.primaryColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={wingsItem.secondaryColor} stopOpacity="0.82" />
        </linearGradient>

        <radialGradient id={wingAuraId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDF2F8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!isFlyingLoop && (
        <ellipse cx="105" cy="195" rx="44" ry="7" fill="rgba(219, 39, 119, 0.14)" />
      )}

      {/* Subtle Magical Aura behind wings */}
      <circle cx="105" cy="112" r="78" fill={`url(#${wingAuraId})`} opacity="0.45" />

      {/* Shimmering Pastel Butterfly Wings */}
      <motion.g
        style={{ transformOrigin: '105px 115px' }}
        animate={
          isConfused
            ? { scaleY: [1, 0.72, 0.68, 0.72, 1], y: [0, 12, 14, 12, 0] }
            : isFlyingLoop
            ? { scaleX: [1, 0.56, 1.08, 0.58, 1] }
            : flappingFast
            ? { scaleX: [1, 0.72, 1.05, 0.75, 1] }
            : { scaleX: [1, 0.91, 1] }
        }
        transition={
          isConfused
            ? { duration: 1.75, times: [0, 0.28, 0.45, 0.72, 1], ease: 'easeInOut' }
            : {
                duration: isFlyingLoop ? 0.2 : flappingFast ? 0.34 : 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <path
          d="M 94 110 C 46 48, 12 70, 30 114 C 44 140, 76 130, 94 120 Z"
          fill={`url(#${wingsGradId})`}
          stroke="#FFFFFF"
          strokeWidth="2.6"
        />
        <path
          d="M 94 122 C 52 122, 26 150, 48 168 C 66 180, 86 154, 94 132 Z"
          fill={`url(#${wingsGradId})`}
          stroke="#FFFFFF"
          strokeWidth="2.3"
        />
        <path
          d="M 116 110 C 164 48, 198 70, 180 114 C 166 140, 134 130, 116 120 Z"
          fill={`url(#${wingsGradId})`}
          stroke="#FFFFFF"
          strokeWidth="2.6"
        />
        <path
          d="M 116 122 C 158 122, 184 150, 162 168 C 144 180, 124 154, 116 132 Z"
          fill={`url(#${wingsGradId})`}
          stroke="#FFFFFF"
          strokeWidth="2.3"
        />
        {/* Iridescent lacy wing veins & shimmer dots */}
        <path d="M 88 112 Q 56 84 40 94" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
        <path d="M 122 112 Q 154 84 170 94" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
        <circle cx="48" cy="94" r="4.5" fill={wingsItem.accentColor} opacity="0.92" />
        <circle cx="162" cy="94" r="4.5" fill={wingsItem.accentColor} opacity="0.92" />
        <circle cx="58" cy="148" r="3" fill="#FFFFFF" opacity="0.85" />
        <circle cx="152" cy="148" r="3" fill="#FFFFFF" opacity="0.85" />
      </motion.g>

      {/* Legs */}
      <rect x="88" y="156" width="11" height="24" rx="5.5" fill={`url(#${skinGradId})`} />
      <rect x="111" y="156" width="11" height="24" rx="5.5" fill={`url(#${skinGradId})`} />

      {/* Equipped Shoes */}
      <g>
        {shoesItem.id === 'shoes_gold' ? (
          <>
            <rect x="83" y="168" width="19" height="16" rx="7" fill={shoesItem.primaryColor} stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="108" y="168" width="19" height="16" rx="7" fill={shoesItem.primaryColor} stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="92" cy="175" r="2.5" fill={shoesItem.accentColor} />
            <circle cx="117" cy="175" r="2.5" fill={shoesItem.accentColor} />
          </>
        ) : (
          <>
            <ellipse cx="92" cy="180" rx="11" ry="6.5" fill={shoesItem.primaryColor} stroke="#FFFFFF" strokeWidth="1.5" />
            <ellipse cx="118" cy="180" rx="11" ry="6.5" fill={shoesItem.primaryColor} stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="94" cy="178" r="2.5" fill={shoesItem.accentColor} />
            <circle cx="120" cy="178" r="2.5" fill={shoesItem.accentColor} />
          </>
        )}
      </g>

      {/* Left Arm */}
      <motion.g
        style={{ transformOrigin: '80px 116px' }}
        animate={
          isConfused
            ? { rotate: [0, 35, 38, 35, 0] }
            : isDancing || isFlyingLoop
            ? { rotate: [-22, 18, -22] }
            : { rotate: [0, 5, 0] }
        }
        transition={
          isConfused
            ? { duration: 1.75, times: [0, 0.28, 0.45, 0.72, 1] }
            : { duration: isDancing || isFlyingLoop ? 0.45 : 2, repeat: Infinity }
        }
      >
        <path
          d="M 82 114 Q 60 124 64 138"
          fill="none"
          stroke={`url(#${skinGradId})`}
          strokeWidth="10"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Right Arm + Magic Wand */}
      <motion.g
        style={{ transformOrigin: '130px 116px' }}
        animate={
          isConfused
            ? { rotate: [0, 52, 58, 52, 0] }
            : trick === 'magic'
            ? { rotate: [-35, 32, -28, 25, 0] }
            : isDancing || isFlyingLoop
            ? { rotate: [16, -24, 16] }
            : isListening
            ? { rotate: [-12, 10, -12] }
            : { rotate: [0, -6, 0] }
        }
        transition={
          isConfused
            ? { duration: 1.75, times: [0, 0.28, 0.45, 0.72, 1] }
            : {
                duration: trick === 'magic' ? 0.65 : isDancing || isFlyingLoop || isListening ? 0.45 : 2,
                repeat: trick === 'magic' ? 0 : Infinity,
              }
        }
      >
        <path
          d="M 128 114 Q 152 120 156 104"
          fill="none"
          stroke={`url(#${skinGradId})`}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Wand Glow Halo */}
        <circle cx="179" cy="64" r="16" fill="#FDE047" opacity="0.28" />
        <line
          x1="156"
          y1="104"
          x2="178"
          y2="68"
          stroke="#FDE047"
          strokeWidth="4.8"
          strokeLinecap="round"
        />
        <motion.path
          animate={{ scale: [0.92, 1.22, 0.92], rotate: [0, 18, 0] }}
          transition={{ duration: 1.15, repeat: Infinity }}
          style={{ transformOrigin: '179px 64px' }}
          d="M179 49 L183.5 58.5 L194 61 L185.5 67.5 L187.5 78 L179 72.5 L170.5 78 L172.5 67.5 L164 61 L174.5 58.5 Z"
          fill="#FACC15"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </motion.g>

      {/* Equipped Layered Petal Fairy Dress */}
      <g>
        <path
          d="M 85 106 L 125 106 L 122 132 L 88 132 Z"
          fill={`url(#${dressGradId})`}
          stroke="#FFFFFF"
          strokeWidth="1.6"
        />
        {/* Layered fairy petal skirt */}
        <path
          d="M 88 128 Q 66 154 65 166 Q 85 174 105 164 Q 125 174 145 166 Q 144 154 122 128 Z"
          fill={`url(#${dressGradId})`}
          stroke="#FFFFFF"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        <path
          d="M 92 129 Q 82 149 84 156 Q 105 163 126 156 Q 128 149 118 129 Z"
          fill={dressItem.accentColor}
          opacity="0.28"
        />
        <rect x="86" y="125" width="38" height="5.5" rx="2.75" fill={dressItem.accentColor} />
        <circle cx="105" cy="127.7" r="3" fill="#FDE047" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="90" cy="148" r="2.8" fill="#FFFFFF" opacity="0.9" />
        <circle cx="105" cy="153" r="3.4" fill={dressItem.accentColor} opacity="0.95" />
        <circle cx="120" cy="148" r="2.8" fill="#FFFFFF" opacity="0.9" />
      </g>

      {/* Hair Back & Buns */}
      <circle cx="72" cy="54" r="16" fill={`url(#${hairGradId})`} />
      <circle cx="138" cy="54" r="16" fill={`url(#${hairGradId})`} />
      <circle cx="105" cy="68" r="34" fill={`url(#${hairGradId})`} />

      {/* Cute Clay Head */}
      <circle cx="105" cy="76" r="30" fill={`url(#${skinGradId})`} />
      <path
        d="M 75 72 Q 86 52 105 56 Q 124 52 135 72 Q 120 60 105 64 Q 90 60 75 72 Z"
        fill={`url(#${hairGradId})`}
      />

      {/* Rosy Cheeks */}
      <ellipse cx="86" cy="86" rx="6.5" ry="4" fill="#FB7185" opacity={isDancing || isFlyingLoop ? 0.7 : 0.45} />
      <ellipse cx="124" cy="86" rx="6.5" ry="4" fill="#FB7185" opacity={isDancing || isFlyingLoop ? 0.7 : 0.45} />

      {/* Starry Tiara + Equipped Crown */}
      <g>
        {/* Subtle sparkling tiara base so Sparkle Fairy always has a princess tiara */}
        <path
          d="M 89 47 L 95 36 L 105 42 L 115 36 L 121 47 Z"
          fill="#FDE047"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="105" cy="39" r="2.6" fill="#F472B6" />

        {crownItem.id === 'crown_flower' && (
          <g transform="translate(127, 49)">
            <circle cx="0" cy="-5" r="5" fill={crownItem.secondaryColor} />
            <circle cx="5" cy="0" r="5" fill={crownItem.secondaryColor} />
            <circle cx="0" cy="5" r="5" fill={crownItem.secondaryColor} />
            <circle cx="-5" cy="0" r="5" fill={crownItem.secondaryColor} />
            <circle cx="0" cy="0" r="4.5" fill={crownItem.primaryColor} />
          </g>
        )}
        {crownItem.id === 'crown_silver' && (
          <path
            d="M 85 48 L 92 34 L 105 42 L 118 34 L 125 48 Z"
            fill={crownItem.primaryColor}
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}
        {crownItem.id === 'crown_royal' && (
          <g>
            <path
              d="M 83 48 L 88 28 L 98 40 L 105 24 L 112 40 L 122 28 L 127 48 Z"
              fill={crownItem.primaryColor}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="105" cy="39" r="3.5" fill={crownItem.accentColor} />
          </g>
        )}
        {crownItem.id === 'crown_rainbow' && (
          <g>
            <path
              d="M 80 46 Q 105 18 130 46"
              fill="none"
              stroke={crownItem.primaryColor}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M 83 47 Q 105 23 127 47"
              fill="none"
              stroke={crownItem.secondaryColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="105" cy="27" r="5" fill={crownItem.accentColor} stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}
      </g>

      {/* Expressive Eyes */}
      {isSleeping ? (
        <g stroke="#1E1B4B" strokeWidth="3.2" strokeLinecap="round" fill="none">
          <path d="M 86 76 Q 93 83 100 76" />
          <path d="M 110 76 Q 117 83 124 76" />
        </g>
      ) : isWinking ? (
        <g>
          <path
            d="M 86 78 Q 93 70 100 78"
            stroke="#1E1B4B"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="117" cy="76" r="6" fill="#1E1B4B" />
          <circle cx="119" cy="74" r="2.2" fill="#FFFFFF" />
        </g>
      ) : isStreakSparkle ? (
        <g>
          <motion.path
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 0.55, repeat: Infinity }}
            style={{ transformOrigin: '93px 76px' }}
            d="M93 66 L95.5 73 L103 76 L95.5 79 L93 86 L90.5 79 L83 76 L90.5 73 Z"
            fill="#F59E0B"
          />
          <motion.path
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 0.55, repeat: Infinity }}
            style={{ transformOrigin: '117px 76px' }}
            d="M117 66 L119.5 73 L127 76 L119.5 79 L117 86 L114.5 79 L107 76 L114.5 73 Z"
            fill="#F59E0B"
          />
        </g>
      ) : isDancing || isFlyingLoop ? (
        <g stroke="#1E1B4B" strokeWidth="3.8" strokeLinecap="round" fill="none">
          <path d="M 86 78 Q 93 69 100 78" />
          <path d="M 110 78 Q 117 69 124 78" />
        </g>
      ) : isConfused ? (
        <g>
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '93px 76px' }}
          >
            <path
              d="M93 76 m-1.5 0 a 1.5 1.5 0 1 0 3 0 a 4 4 0 1 0 -8 0 a 6.5 6.5 0 1 0 13 0"
              fill="none"
              stroke="#1E1B4B"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '117px 76px' }}
          >
            <path
              d="M117 76 m-1.5 0 a 1.5 1.5 0 1 0 3 0 a 4 4 0 1 0 -8 0 a 6.5 6.5 0 1 0 13 0"
              fill="none"
              stroke="#1E1B4B"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      ) : (
        <g>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            style={{ transformOrigin: '93px 76px' }}
          >
            {/* Delicate upper eyelashes */}
            <path d="M 85 72 L 88 74 M 88 69 L 90 72" stroke="#1E1B4B" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="93" cy="76" r="6.4" fill="#1E1B4B" />
            <circle cx="95.4" cy="73.5" r="2.4" fill="#FFFFFF" />
            <circle cx="91.2" cy="78.5" r="1.1" fill="#FFFFFF" opacity="0.85" />
          </motion.g>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            style={{ transformOrigin: '117px 76px' }}
          >
            <path d="M 125 72 L 122 74 M 122 69 L 120 72" stroke="#1E1B4B" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="117" cy="76" r="6.4" fill="#1E1B4B" />
            <circle cx="119.4" cy="73.5" r="2.4" fill="#FFFFFF" />
            <circle cx="115.2" cy="78.5" r="1.1" fill="#FFFFFF" opacity="0.85" />
          </motion.g>
        </g>
      )}

      {/* Singing / Expressive Mouth */}
      {isSleeping ? (
        <circle cx="105" cy="90" r="3.2" fill="#E11D48" opacity="0.75" />
      ) : isListening ? (
        <motion.ellipse
          cx="105"
          cy="91"
          rx="4.8"
          ry="4.2"
          fill="#E11D48"
          animate={{ scaleY: [0.45, 1.25, 0.55, 1.2, 0.45] }}
          transition={{ duration: 0.45, repeat: Infinity }}
          style={{ transformOrigin: '105px 91px' }}
        />
      ) : isConfused ? (
        <path
          d="M 98 92 Q 102 88 105 92 Q 108 96 112 92"
          fill="none"
          stroke="#9F1239"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      ) : isDancing || isFlyingLoop || trick !== 'none' ? (
        <path
          d="M 97 88 Q 105 97 113 88 Z"
          fill="#E11D48"
          stroke="#9F1239"
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="M 98 89 Q 105 95 112 89"
          fill="none"
          stroke="#9F1239"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function MusicalFairy({
  mood,
  message,
  size = 'md',
  streak = 0,
  equipped = DEFAULT_EQUIPPED_WARDROBE,
  interactive = true,
  enableFullScreenFly = false,
  onTap,
}: MusicalFairyProps) {
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

  const dressItem =
    WARDROBE_CATALOG.find((i) => i.id === equipped.dress) ?? WARDROBE_CATALOG[0];
  const shoesItem =
    WARDROBE_CATALOG.find((i) => i.id === equipped.shoes) ??
    WARDROBE_CATALOG.find((i) => i.category === 'shoes')!;
  const crownItem =
    WARDROBE_CATALOG.find((i) => i.id === equipped.crown) ??
    WARDROBE_CATALOG.find((i) => i.category === 'crown')!;
  const wingsItem =
    WARDROBE_CATALOG.find((i) => i.id === equipped.wings) ??
    WARDROBE_CATALOG.find((i) => i.category === 'wings')!;

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
    if (!interactive || isFlying) return;
    const tricks: TapTrick[] = ['magic', 'spin', 'wink'];
    const nextTrick = tricks[trickIndex % tricks.length];
    setTrickIndex((i) => i + 1);
    setTrick(nextTrick);
    soundEngine.playMagicWand();
    onTap?.();
    window.setTimeout(() => {
      setTrick('none');
    }, 880);
  };

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
                : 'bg-white text-slate-800 border-2 border-pink-200'
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fairy Character Stage */}
      <div
        ref={stageRef}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? 'Tap Sparkle the Musical Fairy' : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`relative flex items-center justify-center ${dimensions} ${
          interactive
            ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-400 rounded-full'
            : ''
        }`}
      >
        {/* Takeoff Shadow */}
        {isFlying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.85, 1.05, 0.85] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="absolute bottom-2 w-20 h-5 rounded-full bg-pink-400/35 blur-[2px] pointer-events-none"
          />
        )}

        {/* Sleeping Zzz Floating Bubbles */}
        <AnimatePresence>
          {isSleeping && (
            <>
              <motion.span
                key="fairy-zzz-1"
                aria-hidden="true"
                initial={{ opacity: 0, y: 6, x: 4, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [4, -18, -36],
                  x: [8, 18, 26],
                  scale: [0.7, 1.05, 1.2],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute right-1 top-2 font-display font-bold text-lg sm:text-xl text-pink-300 pointer-events-none select-none"
              >
                Z
              </motion.span>
              <motion.span
                key="fairy-zzz-2"
                aria-hidden="true"
                initial={{ opacity: 0, y: 6, x: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [2, -16, -30],
                  x: [14, 24, 30],
                  scale: [0.6, 0.9, 1],
                }}
                transition={{ duration: 2.4, delay: 0.9, repeat: Infinity, ease: 'easeOut' }}
                className="absolute right-0 top-5 font-display font-bold text-sm sm:text-base text-amber-300 pointer-events-none select-none"
              >
                zz
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* Floating Musical Notes & Wand Sparkles */}
        <AnimatePresence>
          {!isFlying && (isDancing || isListening || trick === 'magic') && (
            <>
              <motion.span
                key="fairy-sparkle-1"
                aria-hidden="true"
                initial={{ opacity: 0, y: 8, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-6, -30, -46],
                  x: [-18, -28, -22],
                  scale: [0.7, 1.2, 0.9],
                }}
                transition={{ duration: 1.25, repeat: Infinity, ease: 'easeOut' }}
                className="absolute -left-2 top-4 text-2xl font-display font-bold text-pink-500 pointer-events-none"
              >
                ✦
              </motion.span>
              <motion.span
                key="fairy-note-2"
                aria-hidden="true"
                initial={{ opacity: 0, y: 8, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-4, -28, -44],
                  x: [18, 30, 24],
                  scale: [0.7, 1.2, 0.9],
                }}
                transition={{ duration: 1.35, delay: 0.35, repeat: Infinity, ease: 'easeOut' }}
                className="absolute -right-2 top-3 text-2xl font-display font-bold text-amber-500 pointer-events-none"
              >
                ♫
              </motion.span>
            </>
          )}
        </AnimatePresence>

        {/* Confused Badge & Floor Dust Puffs */}
        <AnimatePresence>
          {isConfused && (
            <>
              <motion.div
                key="fairy-confused"
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
                key={`fairy-dust-l-${collapseSeq}`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.25, 1.5], x: -24, y: -6 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="absolute bottom-1 left-2 text-lg pointer-events-none select-none"
              >
                💨
              </motion.span>
              <motion.span
                key={`fairy-dust-r-${collapseSeq}`}
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

        {/* Main Animated Fairy SVG */}
        <motion.div
          key={isConfused ? `fairy-collapse-${collapseSeq}` : 'fairy-steady'}
          style={{ transformOrigin: '50% 84%' }}
          animate={
            isFlying
              ? { opacity: 0 }
              : trick === 'spin'
              ? { opacity: 1, rotate: [0, 360], scale: [1, 1.12, 1] }
              : trick === 'magic'
              ? { opacity: 1, y: [0, -14, 0], rotate: [0, -6, 6, 0], scale: [1, 1.07, 1] }
              : isConfused
              ? {
                  opacity: 1,
                  y: [0, -8, 28, 18, 26, 26, 0],
                  rotate: [0, 16, -76, -66, -74, -72, 0],
                  scaleX: [1, 0.95, 1.15, 1.04, 1.1, 1.08, 1],
                  scaleY: [1, 1.05, 0.8, 0.92, 0.85, 0.86, 1],
                }
              : isStreakSparkle
              ? {
                  opacity: 1,
                  y: [0, -20, 0, -15, 0],
                  rotate: [-6, 6, -6, 6, 0],
                  scale: [1, 1.08, 0.97, 1.07, 1],
                }
              : mood === 'celebrating'
              ? { opacity: 1, y: [0, -16, 0, -12, 0], rotate: [-7, 7, -7, 0] }
              : mood === 'happy'
              ? { opacity: 1, y: [0, -13, 0, -9, 0], rotate: [-4, 4, -4, 0] }
              : mood === 'listening'
              ? { opacity: 1, y: [0, -6, 0], rotate: [-4, 4, -4] }
              : isSleeping
              ? { opacity: 1, y: [0, 2.5, 0], scaleY: [1, 0.97, 1], rotate: -4 }
              : { opacity: 1, y: [0, -5, 0], rotate: 0, scaleX: 1, scaleY: 1 }
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
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
          className="w-full h-full"
        >
          <FairySvg
            idPrefix="inline"
            dressItem={dressItem}
            shoesItem={shoesItem}
            crownItem={crownItem}
            wingsItem={wingsItem}
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
        variant="fairy"
        onFlightComplete={() => setIsFlying(false)}
      >
        <FairySvg
          idPrefix="fly"
          dressItem={dressItem}
          shoesItem={shoesItem}
          crownItem={crownItem}
          wingsItem={wingsItem}
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
