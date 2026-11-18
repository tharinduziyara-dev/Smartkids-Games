import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Home,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AppCategory,
  DifficultyLevel,
  EnglishMode,
  LEVEL_CONFIGS,
  LEVEL_ORDER,
  MascotMood,
  PlayerProfile,
  RewardItem,
  WardrobeItem,
} from '../types/game';
import { EnglishWordItem, pickEnglishRound } from '../data/englishWords';
import { soundEngine } from '../audio/soundEngine';
import { speakWord, stopSpeaking } from '../utils/speech';
import { MascotStage } from './MascotStage';
import { AppLanguage, TEXT } from '../i18n/translations';

interface EnglishStageProps {
  profile: PlayerProfile;
  mode: EnglishMode;
  level: DifficultyLevel;
  muted: boolean;
  language?: AppLanguage;
  onSelectLevel: (level: DifficultyLevel) => void;
  onOpenWardrobe: () => void;
  onOpenRewards: () => void;
  onToggleMute: () => void;
  onRecordProgress: (opts: {
    starsEarned: number;
    completedCategory?: AppCategory;
    level?: DifficultyLevel;
    streak?: number;
  }) => { newWardrobe: WardrobeItem[]; newRewards: RewardItem[] };
  onTriggerConfetti: (intensity: 'small' | 'big') => void;
  onBackToCategory: () => void;
  onBackToHome: () => void;
  externalLocked?: boolean;
}

const TOTAL_ROUNDS = 5;

export function EnglishStage({
  profile,
  mode,
  level,
  muted,
  language = 'en',
  onSelectLevel,
  onOpenWardrobe,
  onOpenRewards,
  onToggleMute,
  onRecordProgress,
  onTriggerConfetti,
  onBackToCategory,
  onBackToHome,
  externalLocked = false,
}: EnglishStageProps) {
  const t = TEXT[language];
  const [round, setRound] = useState(1);
  const [setStars, setSetStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const [target, setTarget] = useState<EnglishWordItem>(() =>
    pickEnglishRound(level, undefined, 4).target
  );
  const [choices, setChoices] = useState<EnglishWordItem[]>([]);
  const [typedWord, setTypedWord] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [roundResolved, setRoundResolved] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState(t.english.dictationPrompt);
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);

  const speechRate =
    level === 'beginner' ? 0.82 : level === 'intermediate' ? 0.88 : 0.96;

  const pronounceCurrent = useCallback(
    (word: string) => {
      setMascotMood('listening');
      speakWord(word, muted, speechRate);
      soundEngine.schedule(() => {
        setMascotMood((m) => (m === 'listening' ? 'idle' : m));
      }, 950);
    },
    [muted, speechRate]
  );

  const loadRound = useCallback(
    (prevWord?: string) => {
      soundEngine.clearScheduled();
      stopSpeaking();
      const optionCount =
        level === 'advanced' || level === 'extreme' ? 6 : 4;
      const picked = pickEnglishRound(level, prevWord, optionCount);
      setTarget(picked.target);
      setChoices(picked.choices);
      setTypedWord('');
      setShowHint(false);
      setRoundResolved(false);
      setUnlockNotice(null);

      if (mode === 'DICTATION') {
        setMascotMessage(t.english.dictationPrompt);
        soundEngine.schedule(() => {
          pronounceCurrent(picked.target.word);
        }, 200);
      } else if (mode === 'NAME_PICTURE') {
        setMascotMood('idle');
        setMascotMessage(t.english.namePicturePrompt);
      } else {
        setMascotMood('idle');
        setMascotMessage(t.english.matchWordPrompt);
        soundEngine.schedule(() => {
          pronounceCurrent(picked.target.word);
        }, 200);
      }
    },
    [
      level,
      mode,
      pronounceCurrent,
      t.english.dictationPrompt,
      t.english.matchWordPrompt,
      t.english.namePicturePrompt,
    ]
  );

  useEffect(() => {
    setRound(1);
    setSetStars(0);
    setStreak(0);
    setIsPaused(false);
    setIsVictory(false);
    loadRound();
    return () => {
      soundEngine.clearScheduled();
      stopSpeaking();
    };
  }, [mode, level, loadRound]);

  useEffect(() => {
    if (externalLocked) {
      soundEngine.clearScheduled();
      stopSpeaking();
      if (!isVictory) {
        setIsPaused(true);
      }
    }
  }, [externalLocked, isVictory]);

  const handleSuccess = useCallback(
    (msg: string) => {
      setRoundResolved(true);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setSetStars((s) => s + 1);
      setMascotMood('happy');
      setMascotMessage(msg);

      const isFinal = round >= TOTAL_ROUNDS;
      const { newWardrobe, newRewards } = onRecordProgress({
        starsEarned: 1,
        completedCategory: isFinal ? 'english' : undefined,
        level,
        streak: nextStreak,
      });

      const rewardNames = [
        ...newRewards.map(
          (r) => `${r.emoji} ${t.rewards.items[r.id]?.name ?? r.name}`
        ),
        ...(profile.mascot === 'fairy'
          ? newWardrobe.map((w) => `✨ ${t.wardrobe.items[w.id] ?? w.name}`)
          : []),
      ];
      if (rewardNames.length > 0) {
        setUnlockNotice(`${t.common.unlockedPrefix} ${rewardNames[0]}`);
      }

      onTriggerConfetti(isFinal ? 'big' : 'small');
      soundEngine.schedule(() => {
        if (rewardNames.length > 0) {
          soundEngine.playUnlockFanfare();
        } else if (isFinal) {
          soundEngine.playVictoryFanfare();
        } else {
          soundEngine.playCorrectChime();
        }
      }, 120);

      soundEngine.schedule(() => {
        if (isFinal) {
          setMascotMood('celebrating');
          setIsVictory(true);
        } else {
          const nextR = round + 1;
          setRound(nextR);
          loadRound(target.word);
        }
      }, rewardNames.length > 0 ? 1850 : 1500);
    },
    [
      level,
      loadRound,
      onRecordProgress,
      onTriggerConfetti,
      profile.mascot,
      round,
      streak,
      t,
      target.word,
    ]
  );

  const handleWrong = useCallback((msg: string) => {
    setStreak(0);
    setMascotMood('confused');
    setMascotMessage(msg);
    soundEngine.playGentleOops();
    soundEngine.schedule(() => {
      setMascotMood((m) => (m === 'confused' ? 'idle' : m));
    }, 1850);
  }, []);

  const handleTypedSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (roundResolved || isPaused || isVictory) return;
    const cleaned = typedWord.trim().toLowerCase();
    if (!cleaned) return;

    if (cleaned === target.word.toLowerCase()) {
      handleSuccess(t.english.correctTyped(target.emoji, target.word));
    } else {
      handleWrong(t.english.wrongTyped);
    }
  };

  const handleMatchChoice = (item: EnglishWordItem) => {
    if (roundResolved || isPaused || isVictory) return;
    soundEngine.playTapPop();

    if (item.word === target.word) {
      handleSuccess(t.english.correctMatch(item.emoji, item.word));
    } else {
      handleWrong(t.english.wrongMatch(item.word));
    }
  };

  const handleRestartSet = useCallback(() => {
    soundEngine.playTapPop();
    setIsVictory(false);
    setIsPaused(false);
    setRound(1);
    setSetStars(0);
    setStreak(0);
    loadRound();
  }, [loadRound]);

  const dashedMask = target.word
    .split('')
    .map((ch, idx) => (idx === 0 && showHint ? ch.toUpperCase() : '_'))
    .join(' ');

  return (
    <div className="min-h-dvh w-full flex flex-col justify-between px-3 py-3 sm:px-6 sm:py-5 max-w-5xl mx-auto relative">
      {/* Top HUD Bar */}
      <header className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.clearScheduled();
              stopSpeaking();
              soundEngine.playTapPop();
              onBackToCategory();
            }}
            aria-label="Back to English modes"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
              {t.english.stageTitles[mode]}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-500 tabular-nums">
              <span className="truncate max-w-[90px] sm:max-w-none">{profile.name}</span>
              <span aria-hidden="true">·</span>
              <span>{t.levels[level].label}</span>
              <span aria-hidden="true">·</span>
              <span>
                {t.common.round} {round}/{TOTAL_ROUNDS}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.common.streak} {streak}
              </span>
            </div>
          </div>
        </div>

        {/* Right HUD Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 text-slate-800">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-400 shrink-0" />
            <span className="font-display text-lg sm:text-xl font-bold tabular-nums">
              {profile.totalStars}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onOpenRewards();
            }}
            aria-label={t.header.myRewards}
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow: '0 4px 0 0 #B45309',
            }}
            className="toy-btn h-11 px-3 rounded-2xl text-amber-950 font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-white/60 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden md:inline">{t.header.rewardsShort}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.header.unmute : t.header.mute}
            style={{ boxShadow: muted ? '0 4px 0 0 #CBD5E1' : '0 4px 0 0 #0284C7' }}
            className={`toy-btn w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white cursor-pointer ${
              muted ? 'bg-slate-200 text-slate-600' : 'bg-sky-400 text-white'
            }`}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              setIsPaused(true);
            }}
            aria-label="Pause game"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Round Progress Stars Strip */}
      <div className="flex items-center justify-center gap-2 my-2">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
          const filled = i < setStars;
          const isCurrent = i === round - 1 && !filled;
          return (
            <div
              key={i}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform ${
                filled
                  ? 'bg-amber-400 text-white shadow-[0_3px_0_0_#D97706] scale-105'
                  : isCurrent
                  ? 'bg-white border-2 border-indigo-400 text-indigo-400 shadow-sm'
                  : 'bg-white/70 border border-slate-200 text-slate-300'
              }`}
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${filled ? 'fill-white' : ''}`} />
            </div>
          );
        })}
      </div>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-5 py-2">
        {unlockNotice && (
          <div className="clay-card rounded-2xl px-4 py-2 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-pink-50 text-amber-950 font-display text-sm sm:text-base font-bold flex items-center gap-2 shadow-md">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{unlockNotice}</span>
          </div>
        )}

        <MascotStage
          mascot={profile.mascot}
          mood={mascotMood}
          message={mascotMessage}
          size="md"
          streak={streak}
          equipped={profile.equippedWardrobe}
          variant="gameplay"
        />

        {/* Mode 1: Dictation (TTS Audio -> Type Spelling) */}
        {mode === 'DICTATION' && (
          <div className="w-full max-w-lg clay-surface rounded-[30px] p-5 sm:p-7 border-2 border-white flex flex-col items-center gap-4">
            <button
              type="button"
              disabled={roundResolved}
              onClick={() => pronounceCurrent(target.word)}
              style={{
                background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
                boxShadow: '0 7px 0 0 #B45309',
              }}
              className="toy-btn min-h-[54px] px-7 py-3 rounded-full text-amber-950 font-display text-lg sm:text-xl font-bold flex items-center gap-2.5 border-2 border-white/70 cursor-pointer"
            >
              <Volume2 className="w-6 h-6" />
              <span>{t.english.hearWordAgain}</span>
            </button>

            {roundResolved ? (
              <div className="text-center">
                <div className="text-5xl mb-1">{target.emoji}</div>
                <div className="font-display text-3xl font-bold text-emerald-600 uppercase tracking-wider">
                  {target.word}
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleTypedSubmit} className="w-full flex flex-col gap-3">
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={typedWord}
                    onChange={(e) => setTypedWord(e.target.value)}
                    placeholder={t.english.typeSpellingPlaceholder}
                    className="w-full min-h-[54px] px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 text-center font-display text-2xl font-bold text-slate-900 tracking-wide focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={!typedWord.trim()}
                    style={{
                      background: typedWord.trim()
                        ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                        : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)',
                      boxShadow: typedWord.trim()
                        ? '0 6px 0 0 #065F46'
                        : '0 4px 0 0 #64748B',
                    }}
                    className="toy-btn min-h-[50px] w-full rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>{t.english.checkSpelling}</span>
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTapPop();
                    setShowHint((h) => !h);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>
                    {showHint
                      ? `${dashedMask} (${target.hint})`
                      : t.common.needHint}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Mode 2: Name the Picture (Clear Emoji -> Type English Word) */}
        {mode === 'NAME_PICTURE' && (
          <div className="w-full max-w-lg clay-surface rounded-[30px] p-5 sm:p-7 border-2 border-white flex flex-col items-center gap-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-gradient-to-b from-sky-50 to-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-7xl sm:text-8xl shadow-inner select-none">
              {target.emoji}
            </div>

            {(level === 'beginner' || level === 'intermediate' || showHint) && !roundResolved && (
              <div className="font-display text-lg font-bold text-slate-500 tracking-widest">
                {dashedMask} ({t.english.lettersCount(target.word.length)})
              </div>
            )}

            {roundResolved ? (
              <div className="font-display text-3xl font-bold text-emerald-600 uppercase tracking-wider">
                {target.word}
              </div>
            ) : (
              <>
                <form onSubmit={handleTypedSubmit} className="w-full flex flex-col gap-3">
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={typedWord}
                    onChange={(e) => setTypedWord(e.target.value)}
                    placeholder={t.english.typeWordPlaceholder}
                    className="w-full min-h-[54px] px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 text-center font-display text-2xl font-bold text-slate-900 tracking-wide focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={!typedWord.trim()}
                    style={{
                      background: typedWord.trim()
                        ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                        : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)',
                      boxShadow: typedWord.trim()
                        ? '0 6px 0 0 #065F46'
                        : '0 4px 0 0 #64748B',
                    }}
                    className="toy-btn min-h-[50px] w-full rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>{t.english.checkWord}</span>
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTapPop();
                    setShowHint((h) => !h);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint ? target.hint : t.common.needHint}</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Mode 3: Match the Word (Word -> Pick Matching Emoji) */}
        {mode === 'MATCH_WORD' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="clay-surface rounded-[28px] px-8 py-4 border-2 border-white flex items-center gap-4">
              <span className="font-display text-3xl sm:text-5xl font-bold text-slate-900 capitalize">
                {target.word}
              </span>
              <button
                type="button"
                onClick={() => pronounceCurrent(target.word)}
                aria-label="Hear word"
                style={{
                  background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
                  boxShadow: '0 4px 0 0 #B45309',
                }}
                className="toy-btn w-11 h-11 rounded-2xl text-amber-950 flex items-center justify-center border-2 border-white/70 cursor-pointer shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`w-full grid gap-3 sm:gap-4 ${
                choices.length <= 4
                  ? 'grid-cols-2 max-w-xl'
                  : 'grid-cols-2 sm:grid-cols-3 max-w-2xl'
              }`}
            >
              {choices.map((item) => {
                const isTarget = roundResolved && item.word === target.word;
                return (
                  <button
                    key={item.word}
                    type="button"
                    disabled={roundResolved}
                    onClick={() => handleMatchChoice(item)}
                    style={{
                      boxShadow: isTarget
                        ? '0 4px 0 0 #059669, 0 0 20px rgba(16, 185, 129, 0.4)'
                        : '0 8px 0 0 #CBD5E1, 0 12px 18px -6px rgba(15, 23, 42, 0.14)',
                    }}
                    className={`toy-btn min-h-[104px] sm:min-h-[124px] rounded-[26px] p-4 border-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isTarget
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-white border-white hover:border-indigo-200'
                    }`}
                  >
                    <span className="text-5xl sm:text-6xl select-none">
                      {item.emoji}
                    </span>
                    {roundResolved && (
                      <span className="font-display text-sm font-bold text-slate-700 capitalize">
                        {item.word}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center pt-1">
        <p className="text-xs font-medium text-slate-400">
          {mode === 'MATCH_WORD' ? t.english.footerMatch : t.english.footerType}
        </p>
      </footer>

      {/* Pause Modal */}
      {isPaused && !isVictory && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.common.pausedTitle}
        >
          <div className="clay-surface rounded-[32px] p-6 sm:p-8 w-full max-w-sm border-2 border-white flex flex-col items-center gap-4 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              {t.common.pausedTitle}
            </h2>

            <div className="w-full flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">
                {t.common.difficultyLevel}
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100">
                {LEVEL_ORDER.map((lvlId) => {
                  const cfg = LEVEL_CONFIGS[lvlId];
                  const active = level === lvlId;
                  return (
                    <button
                      key={lvlId}
                      type="button"
                      onClick={() => {
                        soundEngine.playTapPop();
                        onSelectLevel(lvlId);
                        setIsPaused(false);
                      }}
                      style={active ? { backgroundColor: cfg.accentColor } : undefined}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold cursor-pointer ${
                        active ? 'text-white shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      {t.levels[lvlId].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  setIsPaused(false);
                }}
                style={{
                  background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                  boxShadow: '0 6px 0 0 #065F46',
                }}
                className="toy-btn w-full min-h-[48px] rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t.common.resume}</span>
              </button>

              {profile.mascot === 'fairy' && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playMagicWand();
                    setIsPaused(false);
                    onOpenWardrobe();
                  }}
                  style={{
                    background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
                    boxShadow: '0 6px 0 0 #9D174D',
                  }}
                  className="toy-btn w-full min-h-[48px] rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shirt className="w-5 h-5" />
                  <span>{t.common.fairyWardrobe}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRestartSet}
                style={{
                  background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                  boxShadow: '0 6px 0 0 #075985',
                }}
                className="toy-btn w-full min-h-[48px] rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.common.restartSet}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  soundEngine.playTapPop();
                  onBackToHome();
                }}
                style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
                className="toy-btn w-full min-h-[48px] rounded-2xl bg-slate-100 text-slate-700 font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" />
                <span>{t.common.switchCategory}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {isVictory && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="English Set Complete"
        >
          <div className="clay-surface rounded-[34px] p-6 sm:p-8 w-full max-w-md border-2 border-white flex flex-col items-center gap-4 text-center">
            <MascotStage
              mascot={profile.mascot}
              mood="celebrating"
              message={t.english.victoryMascotMsg}
              size="sm"
              streak={streak}
              equipped={profile.equippedWardrobe}
            />

            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                {t.english.victoryHeading(profile.name)}
              </h2>
              <p className="mt-1 text-base font-medium text-slate-600">
                {t.english.victorySubtitle(
                  t.levels[level].label,
                  t.english.stageTitles[mode]
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 py-1">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                <Star
                  key={i}
                  className="w-9 h-9 text-amber-500 fill-amber-400 drop-shadow-sm"
                />
              ))}
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRestartSet}
                style={{
                  background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                  boxShadow: '0 6px 0 0 #065F46',
                }}
                className="toy-btn min-h-[50px] px-5 rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.common.playAgain}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  soundEngine.playTapPop();
                  onBackToCategory();
                }}
                style={{
                  background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                  boxShadow: '0 6px 0 0 #075985',
                }}
                className="toy-btn min-h-[50px] px-5 rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Home className="w-5 h-5" />
                <span>{t.common.englishModes}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
