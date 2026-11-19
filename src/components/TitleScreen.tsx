import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  Calculator,
  Divide,
  Globe,
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

interface TitleScreenProps {
  profile: PlayerProfile;
  language: AppLanguage;
  selectedCategory: AppCategory | null;
  instrument: InstrumentType;
  level: DifficultyLevel;
  muted: boolean;
  onChangeLanguage: (lang: AppLanguage) => void;
  onSelectCategory: (cat: AppCategory | null) => void;
  onSelectInstrument: (inst: InstrumentType) => void;
  onSelectLevel: (level: DifficultyLevel) => void;
  onSelectMascot: (mascot: MascotId) => void;
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
  language,
  selectedCategory,
  instrument,
  level,
  muted,
  onChangeLanguage,
  onSelectCategory,
  onSelectInstrument,
  onSelectLevel,
  onSelectMascot,
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
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState<string>(
    t.home.welcomeMsg(profile.name)
  );

  useEffect(() => {
    if (selectedCategory) {
      setMascotMessage(t.home.categoryMsg[selectedCategory](profile.name));
    } else {
      setMascotMessage(t.home.welcomeMsg(profile.name));
    }
  }, [language, profile.id, profile.name, selectedCategory, t.home]);

  const levelConfig = LEVEL_CONFIGS[level];
  const levelText = t.levels[level];
  const mascotMeta = MASCOT_BY_ID[profile.mascot];

  const handleMascotTap = () => {
    setMascotMood('happy');
    setMascotMessage(t.home.tapMsg[profile.mascot]);
    window.setTimeout(() => {
      setMascotMood('idle');
    }, 1050);
  };

  const mainCategories: Array<{
    id: AppCategory;
    title: string;
    subtitle: string;
    cta: string;
    gradient: string;
    bevel: string;
    iconBg: string;
    icon: typeof Music;
  }> = [
    {
      id: 'music',
      title: t.home.categories.music.title,
      subtitle: t.home.categories.music.subtitle,
      cta: t.home.categories.music.cta,
      gradient: 'linear-gradient(180deg, #FF6B7E 0%, #E11D48 100%)',
      bevel: '#9F1239',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: Music,
    },
    {
      id: 'math',
      title: t.home.categories.math.title,
      subtitle: t.home.categories.math.subtitle,
      cta: t.home.categories.math.cta,
      gradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
      bevel: '#075985',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: Calculator,
    },
    {
      id: 'english',
      title: t.home.categories.english.title,
      subtitle: t.home.categories.english.subtitle,
      cta: t.home.categories.english.cta,
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      bevel: '#065F46',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: BookOpen,
    },
  ];

  const renderSkyRunCard = (category: AppCategory) => {
    const hasTurns = profile.flightTurns > 0;
    const theme =
      category === 'music'
        ? {
            bg: 'from-pink-50/90 via-white to-sky-50/90',
            iconBg: 'bg-pink-100 text-pink-600',
            accentText: 'text-pink-600',
            btnGrad: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
            btnBevel: '#9D174D',
          }
        : category === 'math'
        ? {
            bg: 'from-indigo-50/90 via-white to-sky-50/90',
            iconBg: 'bg-indigo-100 text-indigo-600',
            accentText: 'text-indigo-600',
            btnGrad: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
            btnBevel: '#312E81',
          }
        : {
            bg: 'from-emerald-50/90 via-white to-sky-50/90',
            iconBg: 'bg-emerald-100 text-emerald-600',
            accentText: 'text-emerald-600',
            btnGrad: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
            btnBevel: '#065F46',
          };

    return (
      <div
        className={`col-span-full clay-card clay-card-interactive rounded-[28px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-white bg-gradient-to-r ${theme.bg}`}
      >
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.iconBg}`}
          >
            <Wand2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h2 className="font-display text-xl font-bold text-slate-900">
                {t.skyRun.cardTitle}
              </h2>
              <span className={`text-xs font-bold tabular-nums ${theme.accentText}`}>
                {t.skyRun.earnedTurnsLabel(profile.flightTurns)} ·{' '}
                {t.skyRun.nextTurnProgress(profile.flightTurnProgress)} · {levelText.label}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.skyRun.cardSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-5 rounded-full transition-colors ${
                      idx < profile.flightTurnProgress
                        ? 'bg-pink-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {t.skyRun.useOneTurnHint}
              </span>
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
              background: theme.btnGrad,
              boxShadow: `0 6px 0 0 ${theme.btnBevel}, 0 10px 18px -4px rgba(15, 23, 42, 0.18)`,
            }}
            className="toy-btn w-full sm:w-auto sm:min-w-[230px] min-h-[48px] px-5 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{t.skyRun.playWithTurnCta(profile.flightTurns)}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="w-full sm:w-auto sm:min-w-[230px] min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-500 font-display text-sm sm:text-base font-bold flex items-center justify-center gap-2 border-2 border-slate-200 cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>{t.skyRun.needTurnsCta(profile.flightTurnProgress)}</span>
          </button>
        )}
      </div>
    );
  };

  const musicModes: Array<{
    mode: GameMode;
    title: string;
    subtitle: string;
    cta: string;
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
      cta: t.music.modes.GUESS_NOTE.cta,
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
      cta: t.music.modes.COPY_MELODY.cta,
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
      cta: t.music.modes.HIGH_LOW.cta,
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
      cta: t.music.modes.GUESS_CHORD.cta,
      gradient: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
      bevel: '#5B21B6',
      iconBg: 'bg-violet-100 text-violet-600',
      icon: Layers,
    },
  ];

  const mathModes: Array<{
    mode: MathMode;
    title: string;
    subtitle: string;
    cta: string;
    gradient: string;
    bevel: string;
    iconBg: string;
    icon: typeof Plus;
  }> = [
    {
      mode: 'ADDITION',
      title: t.math.modes.ADDITION.title,
      subtitle: t.math.modes.ADDITION.subtitle(level),
      cta: t.math.modes.ADDITION.cta,
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      bevel: '#065F46',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: Plus,
    },
    {
      mode: 'SUBTRACTION',
      title: t.math.modes.SUBTRACTION.title,
      subtitle: t.math.modes.SUBTRACTION.subtitle(level),
      cta: t.math.modes.SUBTRACTION.cta,
      gradient: 'linear-gradient(180deg, #FF6B7E 0%, #E11D48 100%)',
      bevel: '#9F1239',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: Minus,
    },
    {
      mode: 'MULTIPLICATION',
      title: t.math.modes.MULTIPLICATION.title,
      subtitle: t.math.modes.MULTIPLICATION.subtitle(level),
      cta: t.math.modes.MULTIPLICATION.cta,
      gradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
      bevel: '#075985',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: MultiplyIcon,
    },
    {
      mode: 'DIVISION',
      title: t.math.modes.DIVISION.title,
      subtitle: t.math.modes.DIVISION.subtitle(level),
      cta: t.math.modes.DIVISION.cta,
      gradient: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
      bevel: '#5B21B6',
      iconBg: 'bg-violet-100 text-violet-600',
      icon: Divide,
    },
    {
      mode: 'MIXED',
      title: t.math.modes.MIXED.title,
      subtitle: t.math.modes.MIXED.subtitle(level),
      cta: t.math.modes.MIXED.cta,
      gradient: 'linear-gradient(180deg, #FFA447 0%, #EA580C 100%)',
      bevel: '#9A3412',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: Calculator,
    },
  ];

  const englishModes: Array<{
    mode: EnglishMode;
    title: string;
    subtitle: string;
    cta: string;
    gradient: string;
    bevel: string;
    iconBg: string;
    icon: typeof Mic;
  }> = [
    {
      mode: 'DICTATION',
      title: t.english.modes.DICTATION.title,
      subtitle: t.english.modes.DICTATION.subtitle,
      cta: t.english.modes.DICTATION.cta,
      gradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
      bevel: '#075985',
      iconBg: 'bg-sky-100 text-sky-600',
      icon: Mic,
    },
    {
      mode: 'NAME_PICTURE',
      title: t.english.modes.NAME_PICTURE.title,
      subtitle: t.english.modes.NAME_PICTURE.subtitle,
      cta: t.english.modes.NAME_PICTURE.cta,
      gradient: 'linear-gradient(180deg, #FFA447 0%, #EA580C 100%)',
      bevel: '#9A3412',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: ImageIcon,
    },
    {
      mode: 'MATCH_WORD',
      title: t.english.modes.MATCH_WORD.title,
      subtitle: t.english.modes.MATCH_WORD.subtitle,
      cta: t.english.modes.MATCH_WORD.cta,
      gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
      bevel: '#065F46',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-dvh w-full flex flex-col justify-between px-4 py-4 sm:px-8 sm:py-5 max-w-6xl mx-auto">
      {/* Global Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {selectedCategory !== null && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onSelectCategory(null);
              }}
              style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
              className="toy-btn min-h-[44px] px-3.5 py-2 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 flex items-center gap-1.5 font-display text-sm sm:text-base font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.8]" />
              <span>{t.header.categories}</span>
            </button>
          )}

          {/* Active Player Profile Switcher Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenProfiles();
            }}
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn min-h-[44px] px-3.5 py-2 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-display font-bold ${mascotMeta.badgeColor}`}
            >
              <User className="w-3.5 h-3.5" />
            </span>
            <span className="font-display text-sm sm:text-base font-bold max-w-[110px] truncate">
              {profile.name}
            </span>
            <span className="text-xs font-bold text-indigo-600">
              {t.header.switchPlayer}
            </span>
          </button>

          {/* Global Star Counter */}
          <div className="flex items-center gap-1.5 text-slate-800 pl-1">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400 shrink-0" />
            <span className="font-display text-xl sm:text-2xl font-bold tabular-nums">
              {profile.totalStars}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Bilingual Language Toggle (English / සිංහල) */}
          <div
            className="flex items-center p-1 rounded-2xl bg-white/95 shadow-sm border-2 border-slate-200/90"
            role="group"
            aria-label="Language toggle"
          >
            <span className="hidden md:flex items-center pl-2 pr-1 text-indigo-500">
              <Globe className="w-4 h-4" />
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onChangeLanguage('en');
              }}
              aria-pressed={language === 'en'}
              className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onChangeLanguage('si');
              }}
              aria-pressed={language === 'si'}
              style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}
              className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                language === 'si'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              සිංහල
            </button>
          </div>

          {/* Simple EN <-> Sinhala Dictionary Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenDictionary();
            }}
            aria-label={t.header.dictionary}
            title={t.header.dictionary}
            style={{
              background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
              boxShadow: '0 4px 0 0 #065F46',
            }}
            className="toy-btn min-h-[44px] px-3 rounded-2xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-white/60 cursor-pointer whitespace-nowrap"
          >
            <Languages className="w-4 h-4 shrink-0" />
            <span>{t.header.dictionary}</span>
          </button>

          {/* My Rewards Collection Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenRewards();
            }}
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow: '0 4px 0 0 #B45309',
            }}
            className="toy-btn min-h-[44px] px-3.5 py-2 rounded-2xl text-amber-950 font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-white/60 cursor-pointer whitespace-nowrap"
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>
              {t.header.myRewards} ({profile.unlockedRewards.length}/{REWARDS_CATALOG.length})
            </span>
          </button>

          {/* Instrument Switcher (when in Music hub) */}
          {selectedCategory === 'music' && (
            <div
              className="hidden sm:flex items-center p-1 rounded-2xl bg-white/90 shadow-sm border border-slate-200/80"
              role="group"
              aria-label={t.music.instrumentSound}
            >
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  onSelectInstrument('marimba');
                  soundEngine.playChord([261.63, 329.63, 392.0], 'marimba', 0.9);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  instrument === 'marimba'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.header.marimba}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  onSelectInstrument('piano');
                  soundEngine.playChord([261.63, 329.63, 392.0, 523.25], 'piano', 1.25);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  instrument === 'piano'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.header.piano}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.header.unmute : t.header.mute}
            style={{
              boxShadow: muted ? '0 4px 0 0 #CBD5E1' : '0 4px 0 0 #0284C7',
            }}
            className={`toy-btn w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white cursor-pointer ${
              muted ? 'bg-slate-200 text-slate-600' : 'bg-sky-400 text-white'
            }`}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <PWAInstallButton language={language} />

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenParentalSettings();
            }}
            aria-label={t.header.parentLock}
            title={t.header.parentLock}
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn h-11 px-3 rounded-2xl bg-white text-slate-700 border-2 border-slate-200 flex items-center justify-center gap-1.5 font-display text-xs font-bold cursor-pointer"
          >
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="hidden lg:inline">{t.header.parentLock}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-3 sm:py-4 gap-4">
        {/* Mascot + SmartKids Header + Character Picker + Wardrobe */}
        <div className="flex flex-col items-center text-center gap-2">
          <MascotStage
            mascot={profile.mascot}
            mood={mascotMood}
            message={mascotMessage}
            size="md"
            equipped={profile.equippedWardrobe}
            onTap={handleMascotTap}
          />

          <div className="flex flex-col items-center">
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 text-balance">
              {selectedCategory ? (
                <>
                  {t.home.studioTitles[selectedCategory].first}{' '}
                  <span
                    className={
                      selectedCategory === 'music'
                        ? 'text-rose-500'
                        : selectedCategory === 'math'
                        ? 'text-sky-600'
                        : 'text-emerald-600'
                    }
                  >
                    {t.home.studioTitles[selectedCategory].accent}
                  </span>
                </>
              ) : (
                <>
                  Smart
                  <span
                    className={
                      profile.mascot === 'fairy'
                        ? 'text-pink-500'
                        : profile.mascot === 'runner_boy'
                        ? 'text-sky-600'
                        : profile.mascot === 'runner_girl'
                        ? 'text-emerald-600'
                        : 'text-indigo-600'
                    }
                  >
                    Kids
                  </span>
                </>
              )}
            </h1>

            {selectedCategory === null && (
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                {t.appTagline}
              </p>
            )}

            {/* Character Selector + Wardrobe Button (shown on Home Screen) */}
            {selectedCategory === null && (
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2.5">
                <div
                  className="flex flex-wrap items-center justify-center gap-1 p-1 rounded-2xl clay-surface border-2 border-white"
                  role="group"
                  aria-label="Choose Character"
                >
                  {MASCOT_LIST.map((m) => {
                    const active = profile.mascot === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (m.id === 'owl') {
                            soundEngine.playOwlHoot();
                          } else if (m.id === 'fairy') {
                            soundEngine.playMagicWand();
                          } else {
                            soundEngine.playRunnerCheer();
                          }
                          onSelectMascot(m.id);
                        }}
                        className={`min-h-[40px] px-3 py-1.5 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                          active
                            ? `${m.badgeColor} text-white shadow-sm`
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.mascots[m.id].shortLabel}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playMagicWand();
                    if (profile.mascot !== 'fairy') {
                      onSelectMascot('fairy');
                    }
                    onOpenWardrobe();
                  }}
                  style={{
                    background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
                    boxShadow: '0 5px 0 0 #9D174D',
                  }}
                  className="toy-btn min-h-[44px] px-4 py-2 rounded-2xl text-white font-display text-sm sm:text-base font-bold flex items-center gap-2 border-2 border-white/50 cursor-pointer whitespace-nowrap"
                >
                  <Shirt className="w-4 h-4" />
                  <span>
                    {t.home.wardrobeBtn} ({profile.unlockedItems.length}/{WARDROBE_CATALOG.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shared 4 Difficulty Levels (Beginner to Extreme) */}
        <section
          aria-label={t.common.difficultyLevel}
          className="w-full max-w-2xl flex flex-col items-center gap-1.5"
        >
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-[22px] clay-surface border-2 border-white">
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
                          boxShadow: '0 4px 0 0 rgba(15, 23, 42, 0.22)',
                        }
                      : undefined
                  }
                  className={`min-h-[44px] px-3 py-2 rounded-2xl font-display text-sm sm:text-base font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'text-white -translate-y-0.5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {t.levels[lvlId].label}
                </button>
              );
            })}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 text-center px-2">
            {levelText.summary}
          </p>
        </section>

        {/* View 1: 3 Main Category Cards (Music, Math, English) */}
        {selectedCategory === null && (
          <section
            aria-label="Learning Categories"
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5"
          >
            {mainCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="clay-card clay-card-interactive rounded-[30px] p-5 sm:p-6 flex flex-col justify-between gap-4 border-2 border-white"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-13 h-13 rounded-2xl flex items-center justify-center ${cat.iconBg}`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {levelText.label}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                        {cat.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onSelectCategory(cat.id);
                    }}
                    style={{
                      background: cat.gradient,
                      boxShadow: `0 7px 0 0 ${cat.bevel}, 0 12px 20px -4px rgba(15, 23, 42, 0.2)`,
                    }}
                    className="toy-btn w-full min-h-[50px] px-5 py-3 rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{cat.cta}</span>
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* View 2: Music Modes */}
        {selectedCategory === 'music' && (
          <section
            aria-label="Music Modes"
            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {musicModes.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.mode}
                  className="clay-card clay-card-interactive rounded-[28px] p-5 flex flex-col justify-between gap-4 border-2 border-white"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 tabular-nums">
                        {t.home.categories.music.title} {index + 1} · {levelText.label}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900">
                        {card.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onStartMusicMode(card.mode);
                    }}
                    style={{
                      background: card.gradient,
                      boxShadow: `0 6px 0 0 ${card.bevel}, 0 10px 18px -4px rgba(15, 23, 42, 0.18)`,
                    }}
                    className="toy-btn w-full min-h-[48px] px-4 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{card.cta}</span>
                  </button>
                </div>
              );
            })}

            {/* Featured 3D Endless Flight Card (Music) */}
            {renderSkyRunCard('music')}
          </section>
        )}

        {/* View 3: Math Modes */}
        {selectedCategory === 'math' && (
          <section
            aria-label="Math Modes"
            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5"
          >
            {mathModes.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.mode}
                  className="clay-card clay-card-interactive rounded-[28px] p-4 sm:p-5 flex flex-col justify-between gap-4 border-2 border-white"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {levelText.label}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900">
                        {card.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onStartMathMode(card.mode);
                    }}
                    style={{
                      background: card.gradient,
                      boxShadow: `0 6px 0 0 ${card.bevel}, 0 10px 18px -4px rgba(15, 23, 42, 0.18)`,
                    }}
                    className="toy-btn w-full min-h-[48px] px-4 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{card.cta}</span>
                  </button>
                </div>
              );
            })}

            {/* Featured 3D Endless Flight Card (Math) */}
            {renderSkyRunCard('math')}
          </section>
        )}

        {/* View 4: English Modes + Dictionary */}
        {selectedCategory === 'english' && (
          <section
            aria-label="English Modes"
            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {englishModes.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.mode}
                  className="clay-card clay-card-interactive rounded-[28px] p-5 flex flex-col justify-between gap-4 border-2 border-white"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 tabular-nums">
                        {t.home.categories.english.title} {index + 1} · {levelText.label}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900">
                        {card.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onStartEnglishMode(card.mode);
                    }}
                    style={{
                      background: card.gradient,
                      boxShadow: `0 6px 0 0 ${card.bevel}, 0 10px 18px -4px rgba(15, 23, 42, 0.18)`,
                    }}
                    className="toy-btn w-full min-h-[48px] px-4 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{card.cta}</span>
                  </button>
                </div>
              );
            })}

            {/* Sinhala Picture Dictionary Card */}
            <div className="clay-card clay-card-interactive rounded-[28px] p-5 flex flex-col justify-between gap-4 border-2 border-white">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-violet-100 text-violet-600">
                    <Languages className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    EN ↔ සිංහල
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    {t.dictionary.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {t.dictionary.cardSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  onOpenDictionary();
                }}
                style={{
                  background: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
                  boxShadow: '0 6px 0 0 #5B21B6, 0 10px 18px -4px rgba(15, 23, 42, 0.18)',
                }}
                className="toy-btn w-full min-h-[48px] px-4 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-5 h-5" />
                <span>{t.dictionary.openBtn}</span>
              </button>
            </div>

            {/* Featured 3D Endless Flight Card (English) */}
            {renderSkyRunCard('english')}
          </section>
        )}
      </main>

      {/* Single Flat Control Hint Line */}
      <footer className="text-center pt-2">
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          {t.home.footerHint}
        </p>
      </footer>
    </div>
  );
}
