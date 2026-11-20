import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Delete,
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
  LEVEL_CONFIGS,
  LEVEL_ORDER,
  MascotMood,
  MathMode,
  PlayerProfile,
  RewardItem,
  WardrobeItem,
} from '../types/game';
import { MathProblem, generateMathProblem } from '../data/mathProblems';
import { soundEngine } from '../audio/soundEngine';
import { MascotStage } from './MascotStage';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';
import {
  FlightTurnProgressStrip,
  FlightTurnRewardModal,
  QuizGameOverModal,
} from './FlightTurnWidgets';

interface MathStageProps {
  profile: PlayerProfile;
  mode: MathMode;
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
  }) => {
    newWardrobe: WardrobeItem[];
    newRewards: RewardItem[];
    earnedFlightTurn: boolean;
  };
  onResetFlightProgress: () => void;
  onTriggerConfetti: (intensity: 'small' | 'big') => void;
  onLaunchSkyRun: () => void;
  onBackToCategory: () => void;
  onBackToHome: () => void;
  externalLocked?: boolean;
}

const TOTAL_ROUNDS = 5;

const CHOICE_STYLES = [
  { top: '#FF6B7E', bottom: '#E11D48', bevel: '#9F1239' },
  { top: '#38BDF8', bottom: '#0284C7', bevel: '#075985' },
  { top: '#34D399', bottom: '#059669', bevel: '#065F46' },
  { top: '#A78BFA', bottom: '#7C3AED', bevel: '#5B21B6' },
];

export function MathStage({
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
  onResetFlightProgress,
  onTriggerConfetti,
  onLaunchSkyRun,
  onBackToCategory,
  onBackToHome,
  externalLocked = false,
}: MathStageProps) {
  const t = TEXT[language];
  const [round, setRound] = useState(1);
  const [setStars, setSetStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [confirmExitTarget, setConfirmExitTarget] = useState<'category' | 'home' | null>(null);
  const [showFlightReward, setShowFlightReward] = useState(false);
  const [pendingFinalVictory, setPendingFinalVictory] = useState(false);

  const [problem, setProblem] = useState<MathProblem>(() =>
    generateMathProblem(mode, level)
  );
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [roundResolved, setRoundResolved] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState(t.math.initialMsg);
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);

  const useKeypad = level === 'advanced' || level === 'extreme';

  const loadRound = useCallback(
    (nextRound: number) => {
      soundEngine.clearScheduled();
      setProblem(generateMathProblem(mode, level));
      setTypedAnswer('');
      setShowHint(false);
      setRoundResolved(false);
      setUnlockNotice(null);
      setMascotMood('idle');
      setMascotMessage(
        nextRound === 1 ? t.math.initialMsg : t.math.nextMsg
      );
    },
    [level, mode, t.math.initialMsg, t.math.nextMsg]
  );

  useEffect(() => {
    setRound(1);
    setSetStars(0);
    setStreak(0);
    setIsPaused(false);
    setIsVictory(false);
    setIsGameOver(false);
    setGameOverReason('');
    setShowFlightReward(false);
    setPendingFinalVictory(false);
    loadRound(1);
    return () => {
      soundEngine.clearScheduled();
    };
  }, [mode, level, loadRound]);

  const submitAnswer = useCallback(
    (candidate: number) => {
      if (
        roundResolved ||
        isPaused ||
        isVictory ||
        isGameOver ||
        showFlightReward ||
        Number.isNaN(candidate)
      ) {
        return;
      }

      if (candidate === problem.answer) {
        setRoundResolved(true);
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setSetStars((s) => s + 1);
        setMascotMood('happy');
        setMascotMessage(t.math.correctMsg(problem.expression, problem.answer));

        const isFinal = round >= TOTAL_ROUNDS;
        const { newWardrobe, newRewards, earnedFlightTurn } = onRecordProgress({
          starsEarned: 1,
          completedCategory: isFinal ? 'math' : undefined,
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

        onTriggerConfetti(isFinal || earnedFlightTurn ? 'big' : 'small');
        soundEngine.schedule(() => {
          if (rewardNames.length > 0 || earnedFlightTurn) {
            soundEngine.playUnlockFanfare();
          } else if (isFinal) {
            soundEngine.playVictoryFanfare();
          } else {
            soundEngine.playCorrectChime();
          }
        }, 120);

        soundEngine.schedule(() => {
          if (earnedFlightTurn) {
            setPendingFinalVictory(isFinal);
            setShowFlightReward(true);
          } else if (isFinal) {
            setMascotMood('celebrating');
            setIsVictory(true);
          } else {
            const nextR = round + 1;
            setRound(nextR);
            loadRound(nextR);
          }
        }, earnedFlightTurn ? 950 : rewardNames.length > 0 ? 1850 : 1500);
      } else {
        soundEngine.clearScheduled();
        setRoundResolved(true);
        setStreak(0);
        setMascotMood('confused');
        setMascotMessage(t.math.wrongMsg);
        setGameOverReason(t.math.wrongMsg);
        setIsGameOver(true);
        onResetFlightProgress();
        soundEngine.playGentleOops();
        soundEngine.playCollapseThud();
      }
    },
    [
      isGameOver,
      isPaused,
      isVictory,
      level,
      loadRound,
      onRecordProgress,
      onResetFlightProgress,
      onTriggerConfetti,
      problem.answer,
      problem.expression,
      profile.mascot,
      round,
      roundResolved,
      showFlightReward,
      streak,
      t,
    ]
  );

  const handleRestartSet = useCallback(() => {
    soundEngine.playTapPop();
    onResetFlightProgress();
    setIsVictory(false);
    setIsGameOver(false);
    setGameOverReason('');
    setIsPaused(false);
    setShowFlightReward(false);
    setPendingFinalVictory(false);
    setRound(1);
    setSetStars(0);
    setStreak(0);
    loadRound(1);
  }, [loadRound, onResetFlightProgress]);

  const handleContinueAfterFlightReward = useCallback(() => {
    setShowFlightReward(false);
    if (pendingFinalVictory) {
      setPendingFinalVictory(false);
      setMascotMood('celebrating');
      setIsVictory(true);
    } else {
      const nextR = round + 1;
      setRound(nextR);
      loadRound(nextR);
    }
  }, [loadRound, pendingFinalVictory, round]);

  useEffect(() => {
    if (externalLocked) {
      soundEngine.clearScheduled();
      if (!isVictory && !isGameOver) {
        setIsPaused(true);
      }
    }
  }, [externalLocked, isGameOver, isVictory]);

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (confirmExitTarget !== null || externalLocked || showFlightReward || isGameOver || e.repeat) return;
      if (e.key === 'Escape') {
        if (!isVictory) setIsPaused((p) => !p);
        return;
      }
      if (isPaused || isVictory || roundResolved) return;

      if (useKeypad) {
        if (/^[0-9]$/.test(e.key)) {
          setTypedAnswer((prev) => (prev.length < 5 ? prev + e.key : prev));
        } else if (e.key === 'Backspace') {
          setTypedAnswer((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter' && typedAnswer.length > 0) {
          submitAnswer(parseInt(typedAnswer, 10));
        }
      } else {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < problem.choices.length) {
          submitAnswer(problem.choices[idx]);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmExitTarget, externalLocked, isGameOver, isPaused, isVictory, problem.choices, roundResolved, showFlightReward, submitAnswer, typedAnswer, useKeypad]);

  const activeHint = language === 'si' ? problem.hintSi : problem.hint;

  return (
    <div className="min-h-dvh w-full flex flex-col justify-between px-3 py-3 sm:px-6 sm:py-5 max-w-5xl mx-auto relative">
      {/* Top HUD Bar */}
      <header className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              if (isVictory || isGameOver) {
                soundEngine.clearScheduled();
                onBackToCategory();
              } else {
                setConfirmExitTarget('category');
              }
            }}
            aria-label="Back to Math modes"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
              {t.math.stageTitles[mode]}
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

      {/* Round Progress Stars Strip + 3D Flight Turn Counter */}
      <div className="flex flex-col items-center gap-1.5 my-2">
        <div className="flex items-center justify-center gap-2">
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
        <FlightTurnProgressStrip
          progress={showFlightReward ? 5 : profile.flightTurnProgress}
          turnsAvailable={profile.flightTurns}
          language={language}
        />
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

        {/* Problem Card */}
        <div className="w-full max-w-xl clay-surface rounded-[30px] p-5 sm:p-7 border-2 border-white flex flex-col items-center gap-3 text-center">
          <div className="font-display text-3xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight">
            {problem.expression} ={' '}
            <span className="text-indigo-600">
              {roundResolved
                ? problem.answer
                : useKeypad
                ? typedAnswer || '?'
                : '?'}
            </span>
          </div>

          {!roundResolved && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                setShowHint((h) => !h);
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint ? activeHint : t.common.needHint}</span>
            </button>
          )}
        </div>

        {/* Beginner/Intermediate: 4 Glossy Choice Buttons | Advanced/Extreme: 3D Number Keypad */}
        {!useKeypad ? (
          <div className="w-full max-w-xl grid grid-cols-2 gap-3.5 sm:gap-4">
            {problem.choices.map((choice, idx) => {
              const palette = CHOICE_STYLES[idx % CHOICE_STYLES.length];
              return (
                <button
                  key={`${choice}-${idx}`}
                  type="button"
                  disabled={roundResolved}
                  onClick={() => submitAnswer(choice)}
                  style={{
                    background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`,
                    boxShadow: `0 8px 0 0 ${palette.bevel}, 0 12px 20px -6px rgba(15, 23, 42, 0.22)`,
                  }}
                  className={`toy-btn min-h-[78px] sm:min-h-[92px] rounded-3xl p-4 text-white font-display text-3xl sm:text-4xl font-bold tabular-nums border-2 border-white/50 flex items-center justify-center cursor-pointer ${
                    roundResolved ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="w-full max-w-sm clay-surface rounded-[28px] p-4 border-2 border-white flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={roundResolved}
                  onClick={() => {
                    soundEngine.playTapPop();
                    setTypedAnswer((prev) =>
                      prev.length < 5 ? prev + digit : prev
                    );
                  }}
                  style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
                  className="toy-btn min-h-[50px] rounded-2xl bg-white text-slate-900 font-display text-2xl font-bold border-2 border-slate-200 cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                disabled={roundResolved}
                onClick={() => {
                  soundEngine.playTapPop();
                  setTypedAnswer((prev) => prev.slice(0, -1));
                }}
                aria-label="Backspace"
                style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
                className="toy-btn min-h-[50px] rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer"
              >
                <Delete className="w-6 h-6" />
              </button>

              <button
                type="button"
                disabled={roundResolved}
                onClick={() => {
                  soundEngine.playTapPop();
                  setTypedAnswer((prev) => (prev.length < 5 ? prev + '0' : prev));
                }}
                style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
                className="toy-btn min-h-[50px] rounded-2xl bg-white text-slate-900 font-display text-2xl font-bold border-2 border-slate-200 cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                disabled={roundResolved || typedAnswer.length === 0}
                onClick={() => submitAnswer(parseInt(typedAnswer, 10))}
                style={{
                  background:
                    typedAnswer.length > 0
                      ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                      : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)',
                  boxShadow:
                    typedAnswer.length > 0
                      ? '0 5px 0 0 #065F46'
                      : '0 4px 0 0 #64748B',
                }}
                aria-label="Check Answer"
                className="toy-btn min-h-[50px] rounded-2xl text-white font-display font-bold flex items-center justify-center border-2 border-white/40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Check className="w-7 h-7 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center pt-1">
        <p className="text-xs font-medium text-slate-400">
          {useKeypad ? t.math.footerKeypad : t.math.footerChoices}
        </p>
      </footer>

      {/* Pause Modal */}
      {isPaused && !isVictory && !isGameOver && (
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
                        onResetFlightProgress();
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
                  soundEngine.playTapPop();
                  setConfirmExitTarget('home');
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
          aria-label="Math Set Complete"
        >
          <div className="clay-surface rounded-[34px] p-6 sm:p-8 w-full max-w-md border-2 border-white flex flex-col items-center gap-4 text-center">
            <MascotStage
              mascot={profile.mascot}
              mood="celebrating"
              message={t.math.victoryMascotMsg}
              size="sm"
              streak={streak}
              equipped={profile.equippedWardrobe}
            />

            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                {t.math.victoryHeading(profile.name)}
              </h2>
              <p className="mt-1 text-base font-medium text-slate-600">
                {t.math.victorySubtitle(
                  t.levels[level].label,
                  t.math.stageTitles[mode]
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
                <span>{t.common.mathModes}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <FlightTurnRewardModal
        open={showFlightReward && !externalLocked}
        equippedWardrobe={profile.equippedWardrobe}
        turnsAvailable={profile.flightTurns}
        language={language}
        onPlaySkyRun={() => {
          soundEngine.clearScheduled();
          setShowFlightReward(false);
          setPendingFinalVictory(false);
          onLaunchSkyRun();
        }}
        onContinue={handleContinueAfterFlightReward}
      />

      <QuizGameOverModal
        open={isGameOver && !externalLocked}
        mascot={profile.mascot}
        equippedWardrobe={profile.equippedWardrobe}
        reason={gameOverReason}
        correctCount={setStars}
        totalRounds={TOTAL_ROUNDS}
        language={language}
        onTryAgain={handleRestartSet}
        onExit={() => {
          soundEngine.clearScheduled();
          onBackToCategory();
        }}
      />

      <ConfirmCloseDialog
        open={confirmExitTarget !== null}
        language={language}
        message={t.common.confirmExitGameMessage}
        onConfirm={() => {
          const target = confirmExitTarget;
          setConfirmExitTarget(null);
          soundEngine.clearScheduled();
          if (target === 'home') {
            onBackToHome();
          } else {
            onBackToCategory();
          }
        }}
        onCancel={() => setConfirmExitTarget(null)}
      />
    </div>
  );
}
