export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY';

export type AppCategory = 'music' | 'math' | 'english';

export type GameMode = 'GUESS_NOTE' | 'COPY_MELODY' | 'HIGH_LOW' | 'GUESS_CHORD';

export type MathMode = 'ADDITION' | 'SUBTRACTION' | 'MULTIPLICATION' | 'DIVISION' | 'MIXED';

export type EnglishMode = 'DICTATION' | 'NAME_PICTURE' | 'MATCH_WORD';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'extreme';

export type InstrumentType = 'marimba' | 'piano';

export type MascotId = 'owl' | 'fairy' | 'runner_boy' | 'runner_girl';

export interface MascotMeta {
  id: MascotId;
  name: string;
  shortLabel: string;
  badgeColor: string;
  accentHex: string;
}

export const MASCOT_LIST: MascotMeta[] = [
  {
    id: 'owl',
    name: 'Ollie the Owl',
    shortLabel: 'Ollie Owl',
    badgeColor: 'bg-indigo-600',
    accentHex: '#4F46E5',
  },
  {
    id: 'fairy',
    name: 'Sparkle the Fairy',
    shortLabel: 'Sparkle Fairy',
    badgeColor: 'bg-pink-500',
    accentHex: '#EC4899',
  },
  {
    id: 'runner_boy',
    name: 'Leo the Runner',
    shortLabel: 'Leo (Boy)',
    badgeColor: 'bg-sky-500',
    accentHex: '#0EA5E9',
  },
  {
    id: 'runner_girl',
    name: 'Maya the Runner',
    shortLabel: 'Maya (Girl)',
    badgeColor: 'bg-emerald-500',
    accentHex: '#10B981',
  },
];

export const MASCOT_BY_ID: Record<MascotId, MascotMeta> = MASCOT_LIST.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<MascotId, MascotMeta>
);

export type MascotMood =
  | 'idle'
  | 'listening'
  | 'happy'
  | 'confused'
  | 'celebrating'
  | 'sleeping';

export type ParentalTimeLimitMinutes = 15 | 30 | 45 | 60;

export interface ParentalSettings {
  pin: string;
  pinConfigured: boolean;
  timeLimitMinutes: ParentalTimeLimitMinutes;
  elapsedSeconds: number;
  isLocked: boolean;
}

export type WardrobeCategory = 'dress' | 'shoes' | 'crown' | 'wings';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  unlockStars: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
}

export interface EquippedWardrobe {
  dress: string;
  shoes: string;
  crown: string;
  wings: string;
}

export type RewardKind = 'trophy' | 'badge' | 'sticker';

export interface RewardItem {
  id: string;
  name: string;
  kind: RewardKind;
  emoji: string;
  description: string;
  unlockStars?: number;
  categoryTrigger?: AppCategory;
  extremeTrigger?: boolean;
  streakTrigger?: number;
  gradientTop: string;
  gradientBottom: string;
}

export const REWARDS_CATALOG: RewardItem[] = [
  {
    id: 'reward_first_star',
    name: 'First Sparkle Sticker',
    kind: 'sticker',
    emoji: '🌟',
    description: 'Earn your very first star!',
    unlockStars: 1,
    gradientTop: '#FFE066',
    gradientBottom: '#F59E0B',
  },
  {
    id: 'reward_music_maestro',
    name: 'Music Maestro Badge',
    kind: 'badge',
    emoji: '🎵',
    description: 'Complete a Music round set',
    categoryTrigger: 'music',
    gradientTop: '#FF6B7E',
    gradientBottom: '#E11D48',
  },
  {
    id: 'reward_math_whiz',
    name: 'Math Whiz Trophy',
    kind: 'trophy',
    emoji: '🧮',
    description: 'Complete a Math round set',
    categoryTrigger: 'math',
    gradientTop: '#38BDF8',
    gradientBottom: '#0284C7',
  },
  {
    id: 'reward_english_star',
    name: 'Spelling Star Sticker',
    kind: 'sticker',
    emoji: '📖',
    description: 'Complete an English round set',
    categoryTrigger: 'english',
    gradientTop: '#34D399',
    gradientBottom: '#059669',
  },
  {
    id: 'reward_rising_5',
    name: 'Rising Star Badge',
    kind: 'badge',
    emoji: '🏅',
    description: 'Collect 5 total stars',
    unlockStars: 5,
    gradientTop: '#FFA447',
    gradientBottom: '#EA580C',
  },
  {
    id: 'reward_streak_5',
    name: '5-in-a-Row Streak Sticker',
    kind: 'sticker',
    emoji: '🔥',
    description: 'Get 5 answers right in a row',
    streakTrigger: 5,
    gradientTop: '#FB7185',
    gradientBottom: '#E11D48',
  },
  {
    id: 'reward_golden_10',
    name: 'Golden Owl Trophy',
    kind: 'trophy',
    emoji: '🏆',
    description: 'Collect 10 total stars',
    unlockStars: 10,
    gradientTop: '#FBBF24',
    gradientBottom: '#D97706',
  },
  {
    id: 'reward_rainbow_20',
    name: 'Rainbow Crown Medal',
    kind: 'badge',
    emoji: '👑',
    description: 'Collect 20 total stars',
    unlockStars: 20,
    gradientTop: '#A78BFA',
    gradientBottom: '#7C3AED',
  },
  {
    id: 'reward_extreme_hero',
    name: 'Extreme Explorer Trophy',
    kind: 'trophy',
    emoji: '🚀',
    description: 'Beat any game on Extreme level',
    extremeTrigger: true,
    gradientTop: '#F472B6',
    gradientBottom: '#DB2777',
  },
  {
    id: 'reward_genius_35',
    name: 'Super Genius Cup',
    kind: 'trophy',
    emoji: '💎',
    description: 'Collect 35 total stars',
    unlockStars: 35,
    gradientTop: '#2DD4BF',
    gradientBottom: '#0D9488',
  },
];

export const WARDROBE_CATALOG: WardrobeItem[] = [
  // Dresses
  {
    id: 'dress_petal',
    name: 'Pink Blossom Dress',
    category: 'dress',
    unlockStars: 0,
    primaryColor: '#FB7185',
    secondaryColor: '#F43F5E',
    accentColor: '#FFE4E6',
    description: 'Sweet rosy starter dress',
  },
  {
    id: 'dress_starlight',
    name: 'Starlight Gown',
    category: 'dress',
    unlockStars: 2,
    primaryColor: '#A78BFA',
    secondaryColor: '#7C3AED',
    accentColor: '#FDE047',
    description: 'Sparkling lavender star dress',
  },
  {
    id: 'dress_rainbow',
    name: 'Rainbow Prism Gown',
    category: 'dress',
    unlockStars: 6,
    primaryColor: '#38BDF8',
    secondaryColor: '#EC4899',
    accentColor: '#FACC15',
    description: 'Dazzling rainbow party dress',
  },
  {
    id: 'dress_emerald',
    name: 'Emerald Melody Gown',
    category: 'dress',
    unlockStars: 10,
    primaryColor: '#34D399',
    secondaryColor: '#059669',
    accentColor: '#FEF08A',
    description: 'Royal forest shimmer gown',
  },

  // Shoes
  {
    id: 'shoes_ballet',
    name: 'Rose Slippers',
    category: 'shoes',
    unlockStars: 0,
    primaryColor: '#F43F5E',
    secondaryColor: '#FB7185',
    accentColor: '#FFFFFF',
    description: 'Comfy pink ribbon slippers',
  },
  {
    id: 'shoes_crystal',
    name: 'Sky Crystal Shoes',
    category: 'shoes',
    unlockStars: 3,
    primaryColor: '#38BDF8',
    secondaryColor: '#BAE6FD',
    accentColor: '#FFFFFF',
    description: 'Shimmering sky glass slippers',
  },
  {
    id: 'shoes_gold',
    name: 'Golden Star Boots',
    category: 'shoes',
    unlockStars: 8,
    primaryColor: '#FBBF24',
    secondaryColor: '#D97706',
    accentColor: '#FEF9C3',
    description: 'Shiny gold dancing boots',
  },

  // Crowns / Tiaras
  {
    id: 'crown_flower',
    name: 'Daisy Clip',
    category: 'crown',
    unlockStars: 0,
    primaryColor: '#FDE047',
    secondaryColor: '#FFFFFF',
    accentColor: '#F472B6',
    description: 'Cute starter hair flower',
  },
  {
    id: 'crown_silver',
    name: 'Silver Note Tiara',
    category: 'crown',
    unlockStars: 1,
    primaryColor: '#E2E8F0',
    secondaryColor: '#94A3B8',
    accentColor: '#38BDF8',
    description: 'Sparkly musical tiara',
  },
  {
    id: 'crown_royal',
    name: 'Golden Gem Crown',
    category: 'crown',
    unlockStars: 5,
    primaryColor: '#FBBF24',
    secondaryColor: '#D97706',
    accentColor: '#F43F5E',
    description: 'Royal fairy queen crown',
  },
  {
    id: 'crown_rainbow',
    name: 'Rainbow Star Halo',
    category: 'crown',
    unlockStars: 12,
    primaryColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    accentColor: '#FDE047',
    description: 'Grand prismatic star halo',
  },

  // Wings
  {
    id: 'wings_dewdrop',
    name: 'Dewdrop Wings',
    category: 'wings',
    unlockStars: 0,
    primaryColor: '#BAE6FD',
    secondaryColor: '#7DD3FC',
    accentColor: '#FFFFFF',
    description: 'Light glowing sky wings',
  },
  {
    id: 'wings_butterfly',
    name: 'Sunset Butterfly Wings',
    category: 'wings',
    unlockStars: 4,
    primaryColor: '#FDBA74',
    secondaryColor: '#FB7185',
    accentColor: '#FEF08A',
    description: 'Warm fluttering butterfly wings',
  },
  {
    id: 'wings_aurora',
    name: 'Aurora Prism Wings',
    category: 'wings',
    unlockStars: 9,
    primaryColor: '#A7F3D0',
    secondaryColor: '#C4B5FD',
    accentColor: '#FDE68A',
    description: 'Magical glowing aurora wings',
  },
];

export const DEFAULT_EQUIPPED_WARDROBE: EquippedWardrobe = {
  dress: 'dress_petal',
  shoes: 'shoes_ballet',
  crown: 'crown_flower',
  wings: 'wings_dewdrop',
};

export const STARTER_UNLOCKED_ITEMS: string[] = WARDROBE_CATALOG.filter(
  (item) => item.unlockStars === 0
).map((item) => item.id);

export interface PlayerProfile {
  id: string;
  name: string;
  totalStars: number;
  mascot: MascotId;
  unlockedItems: string[];
  unlockedRewards: string[];
  equippedWardrobe: EquippedWardrobe;
  createdAt: number;
}

export type NoteId =
  | 'C4'
  | 'C#4'
  | 'D4'
  | 'D#4'
  | 'E4'
  | 'F4'
  | 'F#4'
  | 'G4'
  | 'G#4'
  | 'A4'
  | 'A#4'
  | 'B4';

export type ExtendedNoteId = NoteId | 'C5';

export type ChordQualityId =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'sus4'
  | 'dom7'
  | 'maj7';

export interface ChordQualityDef {
  id: ChordQualityId;
  label: string;
  shortLabel: string;
  moodHint: string;
  intervals: number[];
  gradientTop: string;
  gradientBottom: string;
  bevelColor: string;
  textColor: string;
}

export const CHORD_QUALITIES: ChordQualityDef[] = [
  {
    id: 'major',
    label: 'Major',
    shortLabel: 'Maj',
    moodHint: 'Bright & Happy',
    intervals: [0, 4, 7],
    gradientTop: '#34D399',
    gradientBottom: '#059669',
    bevelColor: '#065F46',
    textColor: '#FFFFFF',
  },
  {
    id: 'minor',
    label: 'Minor',
    shortLabel: 'Min',
    moodHint: 'Soft & Dreamy',
    intervals: [0, 3, 7],
    gradientTop: '#38BDF8',
    gradientBottom: '#0284C7',
    bevelColor: '#075985',
    textColor: '#FFFFFF',
  },
  {
    id: 'diminished',
    label: 'Diminished',
    shortLabel: 'Dim',
    moodHint: 'Tense & Spooky',
    intervals: [0, 3, 6],
    gradientTop: '#FB7185',
    gradientBottom: '#E11D48',
    bevelColor: '#9F1239',
    textColor: '#FFFFFF',
  },
  {
    id: 'augmented',
    label: 'Augmented',
    shortLabel: 'Aug',
    moodHint: 'Floaty & Cosmic',
    intervals: [0, 4, 8],
    gradientTop: '#A78BFA',
    gradientBottom: '#7C3AED',
    bevelColor: '#5B21B6',
    textColor: '#FFFFFF',
  },
  {
    id: 'sus4',
    label: 'Sus4',
    shortLabel: 'Sus4',
    moodHint: 'Open & Waiting',
    intervals: [0, 5, 7],
    gradientTop: '#FFA447',
    gradientBottom: '#EA580C',
    bevelColor: '#9A3412',
    textColor: '#FFFFFF',
  },
  {
    id: 'dom7',
    label: 'Dominant 7th',
    shortLabel: '7',
    moodHint: 'Jazzy & Bluesy',
    intervals: [0, 4, 7, 10],
    gradientTop: '#F472B6',
    gradientBottom: '#DB2777',
    bevelColor: '#9D174D',
    textColor: '#FFFFFF',
  },
  {
    id: 'maj7',
    label: 'Major 7th',
    shortLabel: 'Maj7',
    moodHint: 'Lush & Warm',
    intervals: [0, 4, 7, 11],
    gradientTop: '#FFE066',
    gradientBottom: '#F59E0B',
    bevelColor: '#B45309',
    textColor: '#451A03',
  },
];

export const CHORD_QUALITY_BY_ID: Record<ChordQualityId, ChordQualityDef> =
  CHORD_QUALITIES.reduce((acc, q) => {
    acc[q.id] = q;
    return acc;
  }, {} as Record<ChordQualityId, ChordQualityDef>);

export interface ToyNote {
  id: NoteId;
  western: string;
  sargam: string;
  freq: number;
  semitone: number;
  isSharp: boolean;
  naturalIndex: number;
  shortcut: string;
  gradientTop: string;
  gradientBottom: string;
  bevelColor: string;
  glowColor: string;
  textColor: string;
  subTextColor: string;
}

export const CHROMATIC_NOTES: ToyNote[] = [
  {
    id: 'C4',
    western: 'C',
    sargam: 'Sa',
    freq: 261.63,
    semitone: 0,
    isSharp: false,
    naturalIndex: 0,
    shortcut: 'A',
    gradientTop: '#FF6B7E',
    gradientBottom: '#E11D48',
    bevelColor: '#9F1239',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255, 255, 255, 0.92)',
  },
  {
    id: 'C#4',
    western: 'C#',
    sargam: 'Re♭',
    freq: 277.18,
    semitone: 1,
    isSharp: true,
    naturalIndex: 0,
    shortcut: 'W',
    gradientTop: '#334155',
    gradientBottom: '#0F172A',
    bevelColor: '#020617',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    textColor: '#FFFFFF',
    subTextColor: '#CBD5E1',
  },
  {
    id: 'D4',
    western: 'D',
    sargam: 'Re',
    freq: 293.66,
    semitone: 2,
    isSharp: false,
    naturalIndex: 1,
    shortcut: 'S',
    gradientTop: '#FFA447',
    gradientBottom: '#EA580C',
    bevelColor: '#9A3412',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255, 255, 255, 0.92)',
  },
  {
    id: 'D#4',
    western: 'D#',
    sargam: 'Ga♭',
    freq: 311.13,
    semitone: 3,
    isSharp: true,
    naturalIndex: 1,
    shortcut: 'E',
    gradientTop: '#334155',
    gradientBottom: '#0F172A',
    bevelColor: '#020617',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    textColor: '#FFFFFF',
    subTextColor: '#CBD5E1',
  },
  {
    id: 'E4',
    western: 'E',
    sargam: 'Ga',
    freq: 329.63,
    semitone: 4,
    isSharp: false,
    naturalIndex: 2,
    shortcut: 'D',
    gradientTop: '#FFE066',
    gradientBottom: '#F59E0B',
    bevelColor: '#B45309',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    textColor: '#451A03',
    subTextColor: 'rgba(69, 26, 3, 0.85)',
  },
  {
    id: 'F4',
    western: 'F',
    sargam: 'Ma',
    freq: 349.23,
    semitone: 5,
    isSharp: false,
    naturalIndex: 3,
    shortcut: 'F',
    gradientTop: '#34D399',
    gradientBottom: '#059669',
    bevelColor: '#065F46',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255, 255, 255, 0.92)',
  },
  {
    id: 'F#4',
    western: 'F#',
    sargam: 'Ma♯',
    freq: 369.99,
    semitone: 6,
    isSharp: true,
    naturalIndex: 3,
    shortcut: 'T',
    gradientTop: '#334155',
    gradientBottom: '#0F172A',
    bevelColor: '#020617',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    textColor: '#FFFFFF',
    subTextColor: '#CBD5E1',
  },
  {
    id: 'G4',
    western: 'G',
    sargam: 'Pa',
    freq: 392.0,
    semitone: 7,
    isSharp: false,
    naturalIndex: 4,
    shortcut: 'G',
    gradientTop: '#38BDF8',
    gradientBottom: '#0284C7',
    bevelColor: '#075985',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255, 255, 255, 0.92)',
  },
  {
    id: 'G#4',
    western: 'G#',
    sargam: 'Dha♭',
    freq: 415.3,
    semitone: 8,
    isSharp: true,
    naturalIndex: 4,
    shortcut: 'Y',
    gradientTop: '#334155',
    gradientBottom: '#0F172A',
    bevelColor: '#020617',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    textColor: '#FFFFFF',
    subTextColor: '#CBD5E1',
  },
  {
    id: 'A4',
    western: 'A',
    sargam: 'Dha',
    freq: 440.0,
    semitone: 9,
    isSharp: false,
    naturalIndex: 5,
    shortcut: 'H',
    gradientTop: '#A78BFA',
    gradientBottom: '#7C3AED',
    bevelColor: '#5B21B6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255, 255, 255, 0.92)',
  },
  {
    id: 'A#4',
    western: 'A#',
    sargam: 'Ni♭',
    freq: 466.16,
    semitone: 10,
    isSharp: true,
    naturalIndex: 5,
    shortcut: 'U',
    gradientTop: '#334155',
    gradientBottom: '#0F172A',
    bevelColor: '#020617',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    textColor: '#FFFFFF',
    subTextColor: '#CBD5E1',
  },
  {
    id: 'B4',
    western: 'B',
    sargam: 'Ni',
    freq: 493.88,
    semitone: 11,
    isSharp: false,
    naturalIndex: 6,
    shortcut: 'J',
    gradientTop: '#F472B6',
    gradientBottom: '#DB2777',
    bevelColor: '#9D174D',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255, 255, 255, 0.92)',
  },
];

export const NATURAL_NOTES = CHROMATIC_NOTES.filter((n) => !n.isSharp);
export const SHARP_NOTES = CHROMATIC_NOTES.filter((n) => n.isSharp);
export const BEGINNER_NOTES = NATURAL_NOTES.slice(0, 5);

export const NOTE_BY_ID: Record<NoteId, ToyNote> = CHROMATIC_NOTES.reduce(
  (acc, note) => {
    acc[note.id] = note;
    return acc;
  },
  {} as Record<NoteId, ToyNote>
);

export const EXTENDED_NOTES: Record<
  ExtendedNoteId,
  { western: string; sargam: string; freq: number; semitone: number }
> = {
  ...CHROMATIC_NOTES.reduce((acc, n) => {
    acc[n.id] = {
      western: n.western,
      sargam: n.sargam,
      freq: n.freq,
      semitone: n.semitone,
    };
    return acc;
  }, {} as Record<NoteId, { western: string; sargam: string; freq: number; semitone: number }>),
  C5: { western: "C'", sargam: "Sa'", freq: 523.25, semitone: 12 },
};

export function semitoneToFreq(semitoneFromC4: number): number {
  return 261.625565 * Math.pow(2, semitoneFromC4 / 12);
}

export interface LevelConfig {
  id: DifficultyLevel;
  label: string;
  summary: string;
  notePool: NoteId[];
  showSharps: boolean;
  naturalCount: 5 | 7;
  melodyStartLen: number;
  melodyMaxLen: number;
  melodyStepMs: number;
  highLowMinSemitones: number;
  highLowMaxSemitones: number;
  chordQualities: ChordQualityId[];
  exactChordMode: boolean;
  accentColor: string;
}

export const LEVEL_CONFIGS: Record<DifficultyLevel, LevelConfig> = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    summary: 'Single-digit basics · 5-key Music (C–G) · Short 3–4 letter words',
    notePool: BEGINNER_NOTES.map((n) => n.id),
    showSharps: false,
    naturalCount: 5,
    melodyStartLen: 2,
    melodyMaxLen: 4,
    melodyStepMs: 650,
    highLowMinSemitones: 5,
    highLowMaxSemitones: 12,
    chordQualities: ['major', 'minor'],
    exactChordMode: false,
    accentColor: '#10B981',
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    summary: '2-digit Math & tables · 7-note Music (C–B) · 5–6 letter vocabulary',
    notePool: NATURAL_NOTES.map((n) => n.id),
    showSharps: false,
    naturalCount: 7,
    melodyStartLen: 3,
    melodyMaxLen: 5,
    melodyStepMs: 580,
    highLowMinSemitones: 3,
    highLowMaxSemitones: 7,
    chordQualities: ['major', 'minor', 'diminished', 'augmented'],
    exactChordMode: false,
    accentColor: '#0EA5E9',
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    summary: 'Larger Math · 12-note Chromatic Music & 6 Chords · 6–8 letter words',
    notePool: CHROMATIC_NOTES.map((n) => n.id),
    showSharps: true,
    naturalCount: 7,
    melodyStartLen: 3,
    melodyMaxLen: 6,
    melodyStepMs: 520,
    highLowMinSemitones: 2,
    highLowMaxSemitones: 4,
    chordQualities: ['major', 'minor', 'diminished', 'augmented', 'sus4', 'dom7'],
    exactChordMode: false,
    accentColor: '#F59E0B',
  },
  extreme: {
    id: 'extreme',
    label: 'Extreme',
    summary: 'Multi-step Math · Exact Chromatic Chords · Challenging spelling',
    notePool: CHROMATIC_NOTES.map((n) => n.id),
    showSharps: true,
    naturalCount: 7,
    melodyStartLen: 4,
    melodyMaxLen: 7,
    melodyStepMs: 430,
    highLowMinSemitones: 1,
    highLowMaxSemitones: 2,
    chordQualities: ['major', 'minor', 'diminished', 'augmented', 'sus4', 'dom7', 'maj7'],
    exactChordMode: true,
    accentColor: '#E11D48',
  },
};

export const LEVEL_ORDER: DifficultyLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
  'extreme',
];
