import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Divide,
  Image as ImageIcon,
  Languages,
  Layers,
  Lock,
  Mic,
  Minus,
  Music,
  Play,
  Plus,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  User,
  Volume2,
  VolumeX,
  Wand2,
  X as MultiplyIcon,
} from 'lucide-react';
import {
  AppCategory,
  DifficultyLevel,
  EnglishMode,
  GameMode,
  InstrumentType,
  LEVEL_CONFIGS,
  LEVEL_ORDER,
  MASCOT_BY_ID,
  MASCOT_LIST,
  MascotId,
  MascotMood,
  MathMode,
  PlayerProfile,
  REWARDS_CATALOG,
  WARDROBE_CATALOG,
} from '../types/game';
import { MascotStage } from './MascotStage';
import { soundEngine } from '../audio/soundEngine';
import { PWAInstallButton } from './PWAInstallButton';
import { AppLanguage, TEXT } from '../i18n/translations';
import { RewardedAdModal, RewardedUnlockTarget } from './RewardedAdModal';

export type HomeScreenStep = 'CHARACTER_SELECT' | 'DASHBOARD';

interface TitleScreenProps {
  profile: PlayerProfile;
  screenStep: HomeScreenStep;
  language: AppLanguage;
  selectedCategory: AppCategory | null;
  instrument: InstrumentType;
  level: DifficultyLevel;
  muted: boolean;
  onChangeScreenStep: (step: HomeScreenStep) => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onSelectCategory: (cat: AppCategory | null) => void;
  onSelectInstrument: (inst: InstrumentType) => void;
  onSelectLevel: (level: DifficultyLevel) => void;
  onSelectMascot: (mascot: MascotId) => void;
  onUnlockCharacter: (mascot: MascotId) => void;
  onOpenProfiles: () => void;
  onOpenWardrobe: () => void;
  onOpenRewards: () => void;
  onOpenDictionary: () => void;
  onOpenParentalSettings: () => void;
  onToggleMute: () => void;
  onStartMusicMode: (mode: GameMode) => void;
  onStartMathMode: (mode: MathMode) => void;
  onStartEnglishMode: (mode: EnglishMode) => void;
  onStartSkyRun: (category: AppCategory) => void;
}

export function TitleScreen({
  profile,
  screenStep,
  language,
  selectedCategory,
  instrument,
  level,
  muted,
  onChangeScreenStep,
  onChangeLanguage,
  onSelectCategory,
  onSelectInstrument,
  onSelectLevel,
  onSelectMascot,
  onUnlockCharacter,
  onOpenProfiles,
  onOpenWardrobe,
  onOpenRewards,
  onOpenDictionary,
  onOpenParentalSettings,
  onToggleMute,
  onStartMusicMode,
  onStartMathMode,
  onStartEnglishMode,
  onStartSkyRun,
}: TitleScreenProps) {
  const t = TEXT[language];
  const [viewedIndex, setViewedIndex] = useState<number>(() => {
    const idx = MASCOT_LIST.findIndex((m) => m.id === profile.mascot);
    return idx >= 0 ? idx : 0;
  });
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [adTarget, setAdTarget] = useState<RewardedUnlockTarget | null>(null);
  const swipeStartXRef = useRef<number | null>(null);

  // Sync viewed character when switching profiles
  useEffect(() => {
    const idx = MASCOT_LIST.findIndex((m) => m.id === profile.mascot);
    if (idx >= 0) {
      setViewedIndex(idx);
    }
  }, [profile.id, profile.mascot]);

  const viewedMeta = MASCOT_LIST[viewedIndex] ?? MASCOT_LIST[0];
  const isViewedUnlocked =
    viewedMeta.defaultUnlocked ||
    profile.unlockedCharacters.includes(viewedMeta.id);

  const playMascotPreviewSound = (id: MascotId) => {
    if (id === 'owl') {
      soundEngine.playOwlHoot();
    } else if (id === 'fairy' || id === 'unicorn') {
      soundEngine.playMagicWand();
    } else {
      soundEngine.playRunnerCheer();
    }
  };

  const cycleCharacter = (delta: 1 | -1) => {
    const next = (viewedIndex + delta + MASCOT_LIST.length) % MASCOT_LIST.length;
    const nextMeta = MASCOT_LIST[next];
    setSlideDir(delta);
    setViewedIndex(next);
    soundEngine.playTapPop();
    if (
      nextMeta.defaultUnlocked ||
      profile.unlockedCharacters.includes(nextMeta.id)
    ) {
      onSelectMascot(nextMeta.id);
    }
  };

  const handleMascotTap = () => {
    setMascotMood('happy');
    window.setTimeout(() => {
      setMascotMood('idle');
    }, 950);
  };

  const handleStartDashboard = () => {
    if (!isViewedUnlocked) return;
    playMascotPreviewSound(viewedMeta.id);
    if (profile.mascot !== viewedMeta.id) {
      onSelectMascot(viewedMeta.id);
    }
    onSelectCategory(null);
    onChangeScreenStep('DASHBOARD');
  };

  const levelConfig = LEVEL_CONFIGS[level];
  const levelText = t.levels[level];

  const renderLanguageSwitch = () => (
    <div
      className="flex items-center p-0.5 rounded-xl bg-white/95 shadow-sm border-2 border-slate-200/90 shrink-0"
      role="group"
      aria-label="Language toggle"
    >
      <button
        type="button"
        onClick={() => {
          soundEngine.playTapPop();
          onChangeLanguage('en');
        }}
        aria-pressed={language === 'en'}
        className={`min-h-[32px] px-2 py-0.5 rounded-lg font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          language === 'en'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => {
          soundEngine.playTapPop();
          onChangeLanguage('si');
        }}
        aria-pressed={language === 'si'}
        style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}
        className={`min-h-[32px] px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          language === 'si'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        සිං
      </button>
    </div>
  );

  // ============================================================================
  // SCREEN 1: CHARACTER SELECTION SCREEN (100dvh, ZERO VERTICAL SCROLLING)
  // ============================================================================
  if (screenStep === 'CHARACTER_SELECT') {
    const activeCharName = t.mascots[viewedMeta.id].name;

    return (
      <div className="safe-screen h-dvh max-h-dvh w-full overflow-hidden flex flex-col justify-between max-w-4xl mx-auto">
        {/* Compact Top Bar: SmartKids Logo + Quick Controls */}
        <header className="app-header-bar min-h-[42px]">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-sm border-2 border-white shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none truncate">
              Smart<span className="text-pink-500">Kids</span>
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {renderLanguageSwitch()}

            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onOpenProfiles();
              }}
              aria-label={t.profiles.title}
              style={{ boxShadow: '0 3px 0 0 #CBD5E1' }}
              className="toy-btn w-9 h-9 sm:w-auto sm:min-h-[40px] sm:px-2.5 rounded-xl bg-white text-slate-800 border-2 border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <User className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline font-display text-xs font-bold max-w-[84px] truncate">
                {profile.name}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? t.header.unmute : t.header.mute}
              style={{
                boxShadow: muted ? '0 3px 0 0 #CBD5E1' : '0 3px 0 0 #0284C7',
              }}
              className={`toy-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 border-white cursor-pointer shrink-0 ${
                muted ? 'bg-slate-200 text-slate-600' : 'bg-sky-400 text-white'
              }`}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <PWAInstallButton language={language} />

            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onOpenParentalSettings();
              }}
              aria-label={t.header.parentLock}
              style={{ boxShadow: '0 3px 0 0 #CBD5E1' }}
              className="toy-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-slate-700 border-2 border-slate-200 flex items-center justify-center cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </header>

        {/* Center Stage: Very Large Character + Left/Right Arrows + Wardrobe */}
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 sm:gap-3 w-full">
          {/* Clean Character Title & Index */}
          <div className="text-center shrink-0">
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {activeCharName}
              </h2>
              {!isViewedUnlocked && (
                <Lock className="w-5 h-5 text-amber-600 shrink-0" aria-label={t.home.lockedLabel} />
              )}
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 tabular-nums">
              {viewedIndex + 1} / {MASCOT_LIST.length} ·{' '}
              <span className={isViewedUnlocked ? 'text-emerald-600' : 'text-amber-600'}>
                {isViewedUnlocked ? t.home.unlockedLabel : t.home.lockedLabel}
              </span>
            </p>
          </div>

          {/* Interactive Character Carousel Row */}
          <div
            className="w-full max-w-lg flex items-center justify-between gap-2 sm:gap-4 px-1"
            onPointerDown={(e) => {
              swipeStartXRef.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (swipeStartXRef.current === null) return;
              const dx = e.clientX - swipeStartXRef.current;
              swipeStartXRef.current = null;
              if (dx > 40) cycleCharacter(-1);
              else if (dx < -40) cycleCharacter(1);
            }}
          >
            {/* Large Easy-to-Tap Left (<) Arrow */}
            <button
              type="button"
              onClick={() => cycleCharacter(-1)}
              aria-label="Previous character"
              style={{ boxShadow: '0 6px 0 0 #CBD5E1, 0 10px 16px -4px rgba(15, 23, 42, 0.14)' }}
              className="toy-btn w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white text-indigo-600 border-2 border-white flex items-center justify-center cursor-pointer shrink-0 z-10"
            >
              <ChevronLeft className="w-8 h-8 stroke-[3]" />
            </button>

            {/* Very Large Character Container (~40-45% height, 220px-260px) */}
            <div className="relative flex-1 flex items-center justify-center min-w-0">
              <div
                aria-hidden="true"
                className="absolute w-[190px] h-[190px] sm:w-[244px] sm:h-[244px] rounded-full bg-white/65 border-4 border-white/80 shadow-[0_14px_34px_rgba(79,70,229,0.12)]"
              />

              <AnimatePresence mode="wait" custom={slideDir}>
                <motion.div
                  key={viewedMeta.id}
                  custom={slideDir}
                  initial={{ opacity: 0, x: slideDir * 44, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: slideDir * -44, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <MascotStage
                    mascot={viewedMeta.id}
                    mood={mascotMood}
                    size="xl"
                    equipped={profile.equippedWardrobe}
                    onTap={handleMascotTap}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Corner Lock Indicator when viewing a locked character */}
              {!isViewedUnlocked && (
                <div className="absolute bottom-2 right-3 sm:right-8 z-20 w-10 h-10 rounded-full bg-amber-400 text-amber-950 border-2 border-white shadow-md flex items-center justify-center">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Large Easy-to-Tap Right (>) Arrow */}
            <button
              type="button"
              onClick={() => cycleCharacter(1)}
              aria-label="Next character"
              style={{ boxShadow: '0 6px 0 0 #CBD5E1, 0 10px 16px -4px rgba(15, 23, 42, 0.14)' }}
              className="toy-btn w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white text-indigo-600 border-2 border-white flex items-center justify-center cursor-pointer shrink-0 z-10"
            >
              <ChevronRight className="w-8 h-8 stroke-[3]" />
            </button>
          </div>

          {/* 10 Character Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 shrink-0">
            {MASCOT_LIST.map((m, idx) => {
              const active = idx === viewedIndex;
              const unlocked =
                m.defaultUnlocked || profile.unlockedCharacters.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-label={t.mascots[m.id].name}
                  onClick={() => {
                    soundEngine.playTapPop();
                    setSlideDir(idx >= viewedIndex ? 1 : -1);
                    setViewedIndex(idx);
                    if (unlocked) onSelectMascot(m.id);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    active
                      ? 'w-6 bg-indigo-600'
                      : unlocked
                      ? 'w-2.5 bg-emerald-400'
                      : 'w-2.5 bg-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Below Character: Wardrobe (4/14) Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playMagicWand();
              onOpenWardrobe();
            }}
            style={{
              background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
              boxShadow: '0 5px 0 0 #9D174D',
            }}
            className="toy-btn shrink-0 min-h-[44px] px-5 py-2 rounded-2xl text-white font-display text-sm sm:text-base font-bold flex items-center gap-2 border-2 border-white/50 cursor-pointer whitespace-nowrap"
          >
            <Shirt className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {t.home.wardrobeBtn} ({profile.unlockedItems.length}/{WARDROBE_CATALOG.length})
            </span>
          </button>
        </main>

        {/* Bottom Primary Action: Green START (if unlocked) or Watch Video to Unlock (if locked) */}
        <footer className="shrink-0 w-full max-w-md mx-auto pt-1 pb-0.5">
          {isViewedUnlocked ? (
            <button
              type="button"
              onClick={handleStartDashboard}
              style={{
                background: 'linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)',
                boxShadow: '0 7px 0 0 #166534, 0 14px 24px -4px rgba(22, 163, 74, 0.35)',
              }}
              className="toy-btn w-full min-h-[56px] sm:min-h-[62px] px-6 rounded-2xl text-white font-display text-2xl sm:text-3xl font-bold tracking-wide flex items-center justify-center gap-3 border-2 border-white/50 cursor-pointer"
            >
              <Play className="w-7 h-7 fill-current shrink-0" />
              <span>{t.home.startBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                setAdTarget({
                  kind: 'character',
                  mascotId: viewedMeta.id,
                  title: activeCharName,
                });
              }}
              style={{
                background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
                boxShadow: '0 7px 0 0 #92400E, 0 14px 24px -4px rgba(217, 119, 6, 0.3)',
              }}
              className="toy-btn w-full min-h-[56px] sm:min-h-[62px] px-5 rounded-2xl text-amber-950 font-display text-lg sm:text-xl font-bold flex items-center justify-center gap-2.5 border-2 border-white/60 cursor-pointer"
            >
              <Lock className="w-5 h-5 shrink-0" />
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span className="truncate">{t.home.watchVideoUnlock}</span>
            </button>
          )}
        </footer>

        <RewardedAdModal
          target={adTarget}
          language={language}
          onRewardGranted={(granted) => {
            if (granted.kind === 'character') {
              onUnlockCharacter(granted.mascotId);
              onSelectMascot(granted.mascotId);
            }
          }}
          onClose={() => setAdTarget(null)}
        />
      </div>
    );
  }

  // ============================================================================
  // SCREEN 2: GAMES DASHBOARD SCREEN (100dvh, ZERO VERTICAL SCROLLING)
  // ============================================================================
  const musicModes: Array<{
    mode: GameMode;
    title: string;
    subtitle: string;
    gradient: string;
    bevel: string;
    iconBg: string;
    icon: typeof Music;
  }> = [
    {
      mode: 'GUESS_NOTE',
      title: t.music.modes.GUESS_NOTE.title,
      subtitle: t.music.modes.GUESS_NOTE.subtitle(
        level,
        levelConfig.melodyStartLen,
        levelConfig.melodyMaxLen
      ),
      gradient: 'linear-gradient(180deg, #FF6B7E 0%, #E11D48 100%)',
      bevel: '#9F1239',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: Music,
    },
    {
      mode: 'COPY_MELODY',
      title: t.music.modes.COPY_MELODY.title,
      subtitle: t.music.modes.COPY_MELODY.subtitle(
        level,
        levelConfig.melodyStartLen,
        levelConfig.melodyMaxLen
      ),
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      bevel: '#065F46',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: Sparkles,
    },
    {
      mode: 'HIGH_LOW',
      title: t.music.modes.HIGH_LOW.title,
      subtitle: t.music.modes.HIGH_LOW.subtitle(
        level,
        levelConfig.melodyStartLen,
        levelConfig.melodyMaxLen
      ),
      gradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
      bevel: '#075985',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: ArrowUpDown,
    },
    {
      mode: 'GUESS_CHORD',
      title: t.music.modes.GUESS_CHORD.title,
      subtitle: t.music.modes.GUESS_CHORD.subtitle(
        level,
        levelConfig.melodyStartLen,
        levelConfig.melodyMaxLen
      ),
      gradient: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
      bevel: '#5B21B6',
      iconBg: 'bg-violet-100 text-violet-600',
      icon: Layers,
    },
  ];

  const mathModes: Array<{
    mode: MathMode;
    title: string;
    gradient: string;
    bevel: string;
    iconBg: string;
    icon: typeof Plus;
  }> = [
    {
      mode: 'ADDITION',
      title: t.math.modes.ADDITION.title,
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      bevel: '#065F46',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: Plus,
    },
    {
      mode: 'SUBTRACTION',
      title: t.math.modes.SUBTRACTION.title,
      gradient: 'linear-gradient(180deg, #FF6B7E 0%, #E11D48 100%)',
      bevel: '#9F1239',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: Minus,
    },
    {
      mode: 'MULTIPLICATION',
      title: t.math.modes.MULTIPLICATION.title,
      gradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
      bevel: '#075985',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: MultiplyIcon,
    },
    {
      mode: 'DIVISION',
      title: t.math.modes.DIVISION.title,
      gradient: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
      bevel: '#5B21B6',
      iconBg: 'bg-violet-100 text-violet-600',
      icon: Divide,
    },
    {
      mode: 'MIXED',
      title: t.math.modes.MIXED.title,
      gradient: 'linear-gradient(180deg, #FFA447 0%, #EA580C 100%)',
      bevel: '#9A3412',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: Calculator,
    },
  ];

  const englishModes: Array<{
    mode: EnglishMode;
    title: string;
    gradient: string;
    bevel: string;
    iconBg: string;
    icon: typeof Mic;
  }> = [
    {
      mode: 'DICTATION',
      title: t.english.modes.DICTATION.title,
      gradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
      bevel: '#075985',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: Mic,
    },
    {
      mode: 'NAME_PICTURE',
      title: t.english.modes.NAME_PICTURE.title,
      gradient: 'linear-gradient(180deg, #FFA447 0%, #EA580C 100%)',
      bevel: '#9A3412',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: ImageIcon,
    },
    {
      mode: 'MATCH_WORD',
      title: t.english.modes.MATCH_WORD.title,
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      bevel: '#065F46',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: BookOpen,
    },
  ];

  const subjectCards = [
    {
      id: 'music' as const,
      title: t.home.categories.music.title,
      subtitle: t.home.categories.music.subtitle,
      bgGrad: 'linear-gradient(160deg, #FFF1F2 0%, #FFE4E6 100%)',
      border: 'border-rose-200',
      iconWrap: 'bg-rose-500 text-white shadow-[0_5px_0_0_#9F1239]',
      titleColor: 'text-rose-950',
      subColor: 'text-rose-700',
      ctaBg: '#E11D48',
      ctaBevel: '#9F1239',
      icon: Music,
      onClick: () => {
        soundEngine.playTapPop();
        onSelectCategory('music');
      },
    },
    {
      id: 'math' as const,
      title: t.home.categories.math.title,
      subtitle: t.home.categories.math.subtitle,
      bgGrad: 'linear-gradient(160deg, #F0F9FF 0%, #E0F2FE 100%)',
      border: 'border-sky-200',
      iconWrap: 'bg-sky-500 text-white shadow-[0_5px_0_0_#075985]',
      titleColor: 'text-sky-950',
      subColor: 'text-sky-700',
      ctaBg: '#0284C7',
      ctaBevel: '#075985',
      icon: Calculator,
      onClick: () => {
        soundEngine.playTapPop();
        onSelectCategory('math');
      },
    },
    {
      id: 'english' as const,
      title: t.home.categories.english.title,
      subtitle: t.home.categories.english.subtitle,
      bgGrad: 'linear-gradient(160deg, #ECFDF5 0%, #D1FAE5 100%)',
      border: 'border-emerald-200',
      iconWrap: 'bg-emerald-500 text-white shadow-[0_5px_0_0_#065F46]',
      titleColor: 'text-emerald-950',
      subColor: 'text-emerald-700',
      ctaBg: '#059669',
      ctaBevel: '#065F46',
      icon: BookOpen,
      onClick: () => {
        soundEngine.playTapPop();
        onSelectCategory('english');
      },
    },
    {
      id: 'sinhala' as const,
      title: t.home.sinhalaTitle,
      subtitle: t.home.sinhalaSubtitle,
      bgGrad: 'linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 100%)',
      border: 'border-violet-200',
      iconWrap: 'bg-violet-500 text-white shadow-[0_5px_0_0_#5B21B6]',
      titleColor: 'text-violet-950',
      subColor: 'text-violet-700',
      ctaBg: '#7C3AED',
      ctaBevel: '#5B21B6',
      icon: Languages,
      onClick: () => {
        soundEngine.playTapPop();
        onOpenDictionary();
      },
    },
  ];

  const renderCompactSkyRunBar = (category: AppCategory) => {
    const hasTurns = profile.flightTurns > 0;
    return (
      <div className="shrink-0 clay-card rounded-2xl p-2.5 sm:p-3 border-2 border-white bg-gradient-to-r from-pink-50 via-white to-sky-50 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
              {t.skyRun.cardTitle}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-pink-600 tabular-nums truncate">
              {t.skyRun.earnedTurnsLabel(profile.flightTurns)} ·{' '}
              {t.skyRun.nextTurnProgress(profile.flightTurnProgress)}
            </div>
          </div>
        </div>

        {hasTurns ? (
          <button
            type="button"
            onClick={() => {
              soundEngine.playMagicWand();
              onStartSkyRun(category);
            }}
            style={{
              background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
              boxShadow: '0 4px 0 0 #9D174D',
            }}
            className="toy-btn min-h-[42px] px-3.5 py-1.5 rounded-xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-white/40 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.skyRun.playWithTurnCta(profile.flightTurns)}</span>
          </button>
        ) : (
          <div className="min-h-[42px] px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-display text-[11px] sm:text-xs font-bold flex items-center gap-1 border border-slate-200 whitespace-nowrap shrink-0">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>{t.skyRun.needTurnsCta(profile.flightTurnProgress)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="safe-screen h-dvh max-h-dvh w-full overflow-hidden flex flex-col justify-between gap-2 sm:gap-3.5 max-w-5xl mx-auto">
      {/* Compact Top Header: Non-overlapping Flexbox bar */}
      <header className="app-header-bar min-h-[42px]">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {selectedCategory === null ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onChangeScreenStep('CHARACTER_SELECT');
              }}
              aria-label={t.home.changeCharacterBtn}
              style={{ boxShadow: '0 3px 0 0 #CBD5E1' }}
              className="toy-btn min-h-[36px] sm:min-h-[42px] px-2.5 sm:px-3 py-1 rounded-xl bg-white text-slate-800 border-2 border-slate-200 flex items-center gap-1 font-display text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.8] shrink-0" />
              <span className="sm:hidden">{t.header.backShort}</span>
              <span className="hidden sm:inline">{t.home.changeCharacterBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onSelectCategory(null);
              }}
              aria-label={t.header.categories}
              style={{ boxShadow: '0 3px 0 0 #CBD5E1' }}
              className="toy-btn min-h-[36px] sm:min-h-[42px] px-2.5 sm:px-3 py-1 rounded-xl bg-white text-slate-800 border-2 border-slate-200 flex items-center gap-1 font-display text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.8] shrink-0" />
              <span className="sm:hidden">{t.header.backShort}</span>
              <span className="hidden sm:inline">{t.header.categories}</span>
            </button>
          )}

          {/* Selected Character Mini Avatar + Stars */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/90 border-2 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              <MascotStage
                mascot={profile.mascot}
                mood="idle"
                size="avatar"
                equipped={profile.equippedWardrobe}
                interactive={false}
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight min-w-0">
              <span className="font-display text-sm font-bold text-slate-900 truncate">
                {MASCOT_BY_ID[profile.mascot] ? t.mascots[profile.mascot].shortLabel : ''}
              </span>
              <span className="text-[11px] font-bold text-amber-700 inline-flex items-center gap-0.5 tabular-nums">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                {profile.totalStars}
              </span>
            </div>
            <div className="sm:hidden flex items-center gap-0.5 text-amber-700 font-display text-xs font-bold tabular-nums truncate">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
              <span>{profile.totalStars}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {renderLanguageSwitch()}

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenRewards();
            }}
            aria-label={t.header.myRewards}
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow: '0 3px 0 0 #B45309',
            }}
            className="toy-btn w-9 h-9 sm:w-auto sm:min-h-[40px] sm:px-2.5 rounded-xl text-amber-950 font-display text-xs font-bold flex items-center justify-center gap-1 border-2 border-white/60 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline tabular-nums">
              {profile.unlockedRewards.length}/{REWARDS_CATALOG.length}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.header.unmute : t.header.mute}
            style={{
              boxShadow: muted ? '0 3px 0 0 #CBD5E1' : '0 3px 0 0 #0284C7',
            }}
            className={`toy-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 border-white cursor-pointer shrink-0 ${
              muted ? 'bg-slate-200 text-slate-600' : 'bg-sky-400 text-white'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenParentalSettings();
            }}
            aria-label={t.header.parentLock}
            style={{ boxShadow: '0 3px 0 0 #CBD5E1' }}
            className="toy-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-slate-700 border-2 border-slate-200 flex items-center justify-center cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </header>

      {/* Middle: Compact Difficulty Selector (Beginner, Intermediate, Advanced, Extreme) */}
      <section
        aria-label={t.common.difficultyLevel}
        className="shrink-0 w-full max-w-2xl mx-auto"
      >
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl clay-surface border-2 border-white">
          {LEVEL_ORDER.map((lvlId) => {
            const cfg = LEVEL_CONFIGS[lvlId];
            const isSelected = level === lvlId;
            return (
              <button
                key={lvlId}
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  onSelectLevel(lvlId);
                }}
                style={
                  isSelected
                    ? {
                        backgroundColor: cfg.accentColor,
                        boxShadow: '0 3px 0 0 rgba(15, 23, 42, 0.2)',
                      }
                    : undefined
                }
                className={`min-h-[38px] px-2 py-1 rounded-xl font-display text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {t.levels[lvlId].label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Area: Clean 2x2 Grid of 4 Subjects OR Selected Subject Modes (100% Zero Scroll) */}
      {selectedCategory === null ? (
        <main
          aria-label="Subject Games"
          className="flex-1 min-h-0 w-full grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4"
        >
          {subjectCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={card.onClick}
                style={{
                  background: card.bgGrad,
                  boxShadow: '0 6px 0 0 rgba(148, 163, 184, 0.25), 0 12px 20px -6px rgba(15, 23, 42, 0.1)',
                }}
                className={`toy-btn h-full min-h-0 rounded-[26px] sm:rounded-[30px] p-3.5 sm:p-6 border-2 ${card.border} flex flex-col items-center justify-between text-center cursor-pointer transition-transform`}
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 min-h-0">
                  <div
                    className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl flex items-center justify-center border-2 border-white ${card.iconWrap}`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <div className="min-w-0">
                    <h2 className={`font-display text-xl sm:text-3xl font-bold leading-tight ${card.titleColor}`}>
                      {card.title}
                    </h2>
                    <p className={`text-[11px] sm:text-sm font-semibold mt-0.5 line-clamp-1 ${card.subColor}`}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: card.ctaBg,
                    boxShadow: `0 4px 0 0 ${card.ctaBevel}`,
                  }}
                  className="w-full min-h-[36px] sm:min-h-[42px] px-3 rounded-xl text-white font-display text-xs sm:text-base font-bold flex items-center justify-center gap-1.5 border border-white/40 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
                  <span>{levelText.label}</span>
                </div>
              </button>
            );
          })}
        </main>
      ) : (
        <main className="flex-1 min-h-0 flex flex-col justify-between gap-2.5">
          {/* Category Mode Grid */}
          {selectedCategory === 'music' && (
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <div className="shrink-0 flex items-center justify-center gap-1.5">
                <div
                  className="inline-flex items-center p-1 rounded-xl bg-white/95 shadow-sm border border-slate-200"
                  role="group"
                  aria-label={t.music.instrumentSound}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onSelectInstrument('piano');
                      soundEngine.playChord([261.63, 329.63, 392.0], 'piano', 0.85);
                    }}
                    className={`px-3 py-1 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                      instrument === 'piano'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.header.piano}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onSelectInstrument('marimba');
                      soundEngine.playChord([261.63, 329.63, 392.0], 'marimba', 0.85);
                    }}
                    className={`px-3 py-1 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                      instrument === 'marimba'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.header.marimba}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4">
                {musicModes.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.mode}
                      type="button"
                      onClick={() => {
                        soundEngine.playTapPop();
                        onStartMusicMode(card.mode);
                      }}
                      style={{
                        background: card.gradient,
                        boxShadow: `0 6px 0 0 ${card.bevel}`,
                      }}
                      className="toy-btn h-full min-h-0 rounded-[24px] p-3.5 sm:p-5 border-2 border-white/60 text-white flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
                    >
                      <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/95 shadow-sm ${card.iconBg}`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div className="font-display text-base sm:text-xl font-bold leading-snug">
                        {card.title}
                      </div>
                      <p className="hidden sm:block text-xs text-white/90 font-medium line-clamp-2 max-w-[240px]">
                        {card.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedCategory === 'math' && (
            <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2 gap-2.5 sm:gap-4">
              {mathModes.map((card, idx) => {
                const Icon = card.icon;
                const isLast = idx === mathModes.length - 1;
                return (
                  <button
                    key={card.mode}
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onStartMathMode(card.mode);
                    }}
                    style={{
                      background: card.gradient,
                      boxShadow: `0 6px 0 0 ${card.bevel}`,
                    }}
                    className={`toy-btn h-full min-h-0 rounded-[24px] p-3 sm:p-5 border-2 border-white/60 text-white flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 cursor-pointer ${
                      isLast ? 'col-span-2 sm:col-span-1' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center bg-white/95 shadow-sm ${card.iconBg}`}>
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                    <div className="font-display text-base sm:text-xl font-bold leading-tight">
                      {card.title}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCategory === 'english' && (
            <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4">
              {englishModes.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.mode}
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onStartEnglishMode(card.mode);
                    }}
                    style={{
                      background: card.gradient,
                      boxShadow: `0 6px 0 0 ${card.bevel}`,
                    }}
                    className="toy-btn h-full min-h-0 rounded-[24px] p-3.5 sm:p-5 border-2 border-white/60 text-white flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
                  >
                    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/95 shadow-sm ${card.iconBg}`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="font-display text-base sm:text-xl font-bold leading-snug">
                      {card.title}
                    </div>
                  </button>
                );
              })}

              {/* Picture Dictionary Shortcut Card */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  onOpenDictionary();
                }}
                style={{
                  background: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
                  boxShadow: '0 6px 0 0 #5B21B6',
                }}
                className="toy-btn h-full min-h-0 rounded-[24px] p-3.5 sm:p-5 border-2 border-white/60 text-white flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/95 shadow-sm text-violet-600">
                  <Languages className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="font-display text-base sm:text-xl font-bold leading-snug">
                  {t.dictionary.title}
                </div>
              </button>
            </div>
          )}

          {/* Compact 3D Fairy Sky Flight Launch Strip */}
          {renderCompactSkyRunBar(selectedCategory)}
        </main>
      )}
    </div>
  );
}
