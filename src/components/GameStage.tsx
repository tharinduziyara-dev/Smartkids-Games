import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Home,
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
  CHORD_QUALITY_BY_ID,
  CHROMATIC_NOTES,
  ChordQualityId,
  DifficultyLevel,
  EXTENDED_NOTES,
  ExtendedNoteId,
  GameMode,
  InstrumentType,
  LEVEL_CONFIGS,
  LEVEL_ORDER,
  MascotMood,
  NOTE_BY_ID,
  NoteId,
  PlayerProfile,
  RewardItem,
  ToyNote,
  WardrobeItem,
  semitoneToFreq,
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { MascotStage } from './MascotStage';
import { RainbowPiano } from './RainbowPiano';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';
import {
  FlightTurnProgressStrip,
  FlightTurnRewardModal,
  QuizGameOverModal,
} from './FlightTurnWidgets';

interface GameStageProps {
  profile: PlayerProfile;
  mode: GameMode;
  level: DifficultyLevel;
  instrument: InstrumentType;
  muted: boolean;
  language?: AppLanguage;
  onSelectInstrument: (inst: InstrumentType) => void;
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
  onExitToMenu: () => void;
  onBackToHome: () => void;
  externalLocked?: boolean;
}

const TOTAL_ROUNDS = 5;

const EXTENDED_ORDER: ExtendedNoteId[] = [
  ...CHROMATIC_NOTES.map((n) => n.id),
  'C5',
];

interface TargetChord {
  rootId: NoteId;
  qualityId: ChordQualityId;
}

export function GameStage({
  profile,
  mode,
  level,
  instrument,
  muted,
  language = 'en',
  onSelectInstrument,
  onSelectLevel,
  onOpenWardrobe,
  onOpenRewards,
  onToggleMute,
  onRecordProgress,
  onResetFlightProgress,
  onTriggerConfetti,
  onLaunchSkyRun,
  onExitToMenu,
  onBackToHome,
  externalLocked = false,
}: GameStageProps) {
  const t = TEXT[language];
  const tRef = useRef(t);
  tRef.current = t;

  const [round, setRound] = useState<number>(1);
  const [setStars, setSetStars] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [confirmExitTarget, setConfirmExitTarget] = useState<'menu' | 'home' | null>(null);
  const [showFlightReward, setShowFlightReward] = useState<boolean>(false);
  const [pendingFinalVictory, setPendingFinalVictory] = useState<boolean>(false);
  const pendingNextRoundRef = useRef<{
    nextPrevTarget?: NoteId;
    nextPrevChord?: TargetChord;
  }>({});

  const [owlMood, setOwlMood] = useState<MascotMood>('listening');
  const [owlMessage, setOwlMessage] = useState<string>(t.music.listenClosely);
  const [isPlayingPrompt, setIsPlayingPrompt] = useState<boolean>(false);
  const [roundResolved, setRoundResolved] = useState<boolean>(false);
  const [recentUnlockText, setRecentUnlockText] = useState<string | null>(null);

  const [activeKey, setActiveKey] = useState<NoteId | null>(null);
  const [playingBeatIdx, setPlayingBeatIdx] = useState<number | null>(null);
  const [activePitchCard, setActivePitchCard] = useState<1 | 2 | null>(null);

  // Mode 1: Guess the Note
  const [targetNote, setTargetNote] = useState<NoteId>('C4');

  // Mode 2: Copy the Melody
  const [melodySeq, setMelodySeq] = useState<NoteId[]>(['C4', 'E4']);
  const [playerMelodyIdx, setPlayerMelodyIdx] = useState<number>(0);

  // Mode 3: High or Low?
  const [pitchPair, setPitchPair] = useState<[ExtendedNoteId, ExtendedNoteId]>(['C4', 'G4']);
  const [revealedPitch, setRevealedPitch] = useState<boolean>(false);

  // Mode 4: Guess the Chord
  const [targetChord, setTargetChord] = useState<TargetChord>({
    rootId: 'C4',
    qualityId: 'major',
  });
  const [selectedChordRoot, setSelectedChordRoot] = useState<NoteId | null>(null);
  const [selectedChordQuality, setSelectedChordQuality] = useState<ChordQualityId | null>(null);
  const [revealedChord, setRevealedChord] = useState<boolean>(false);

  const instrumentRef = useRef(instrument);
  instrumentRef.current = instrument;

  const levelRef = useRef(level);
  levelRef.current = level;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isVictoryRef = useRef(isVictory);
  isVictoryRef.current = isVictory;

  const levelConfig = LEVEL_CONFIGS[level];

  const flashKey = useCallback((noteId: NoteId, durationMs = 240) => {
    setActiveKey(noteId);
    soundEngine.schedule(() => {
      setActiveKey((prev) => (prev === noteId ? null : prev));
    }, durationMs);
  }, []);

  const playGuessPrompt = useCallback((noteId: NoteId) => {
    soundEngine.clearScheduled();
    setIsPlayingPrompt(true);
    setOwlMood('listening');
    setOwlMessage(tRef.current.music.guessPrompt);

    soundEngine.playNote(NOTE_BY_ID[noteId].freq, instrumentRef.current, 0.85);
    soundEngine.schedule(() => {
      setIsPlayingPrompt(false);
      setOwlMood('idle');
    }, 650);
  }, []);

  const playMelodyPrompt = useCallback((seq: NoteId[]) => {
    soundEngine.clearScheduled();
    setIsPlayingPrompt(true);
    setPlayingBeatIdx(null);
    setOwlMood('listening');
    setOwlMessage(tRef.current.music.melodyPrompt(seq.length));

    const stepMs = LEVEL_CONFIGS[levelRef.current].melodyStepMs;
    seq.forEach((noteId, idx) => {
      soundEngine.schedule(() => {
        if (isPausedRef.current || isVictoryRef.current) return;
        setPlayingBeatIdx(idx);
        soundEngine.playNote(NOTE_BY_ID[noteId].freq, instrumentRef.current, 0.48);

        soundEngine.schedule(() => {
          setPlayingBeatIdx((prev) => (prev === idx ? null : prev));
        }, Math.max(220, stepMs - 160));
      }, 220 + idx * stepMs);
    });

    soundEngine.schedule(() => {
      setIsPlayingPrompt(false);
      setPlayingBeatIdx(null);
      setOwlMood('idle');
      setOwlMessage(tRef.current.music.melodyTurn);
    }, 260 + seq.length * stepMs);
  }, []);

  const playHighLowPrompt = useCallback((pair: [ExtendedNoteId, ExtendedNoteId]) => {
    soundEngine.clearScheduled();
    setIsPlayingPrompt(true);
    setActivePitchCard(null);
    setOwlMood('listening');
    setOwlMessage(tRef.current.music.highLowPrompt);

    const gapMs = levelRef.current === 'extreme' ? 680 : 800;

    soundEngine.schedule(() => {
      setActivePitchCard(1);
      soundEngine.playNote(EXTENDED_NOTES[pair[0]].freq, instrumentRef.current, 0.62);
    }, 150);

    soundEngine.schedule(() => {
      setActivePitchCard(2);
      soundEngine.playNote(EXTENDED_NOTES[pair[1]].freq, instrumentRef.current, 0.72);
    }, 150 + gapMs);

    soundEngine.schedule(() => {
      setActivePitchCard(null);
      setIsPlayingPrompt(false);
      setOwlMood('idle');
    }, 850 + gapMs);
  }, []);

  const playChordPrompt = useCallback((chord: TargetChord) => {
    soundEngine.clearScheduled();
    setIsPlayingPrompt(true);
    setOwlMood('listening');
    setOwlMessage(
      LEVEL_CONFIGS[levelRef.current].exactChordMode
        ? tRef.current.music.chordExactPrompt
        : tRef.current.music.chordTypePrompt
    );

    const rootSemi = NOTE_BY_ID[chord.rootId].semitone;
    const intervals = CHORD_QUALITY_BY_ID[chord.qualityId].intervals;
    const freqs = intervals.map((offset) => semitoneToFreq(rootSemi + offset));

    soundEngine.playChord(freqs, instrumentRef.current, 1.35);

    soundEngine.schedule(() => {
      setIsPlayingPrompt(false);
      setOwlMood('idle');
    }, 950);
  }, []);

  const setupRound = useCallback(
    (nextRoundNum: number, prevTarget?: NoteId, prevChord?: TargetChord) => {
      soundEngine.clearScheduled();
      setRoundResolved(false);
      setPlayerMelodyIdx(0);
      setRevealedPitch(false);
      setRevealedChord(false);
      setSelectedChordRoot(null);
      setSelectedChordQuality(null);
      setPlayingBeatIdx(null);
      setActivePitchCard(null);
      setRecentUnlockText(null);

      const cfg = LEVEL_CONFIGS[levelRef.current];
      const pool = cfg.notePool;

      if (mode === 'GUESS_NOTE') {
        const filtered = pool.filter((id) => id !== prevTarget);
        const candidates = filtered.length > 0 ? filtered : pool;
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        setTargetNote(picked);
        playGuessPrompt(picked);
      } else if (mode === 'COPY_MELODY') {
        const progress = (nextRoundNum - 1) / Math.max(1, TOTAL_ROUNDS - 1);
        const len = Math.round(
          cfg.melodyStartLen + progress * (cfg.melodyMaxLen - cfg.melodyStartLen)
        );
        const seq: NoteId[] = [];
        for (let i = 0; i < len; i++) {
          const candidates =
            i >= 2 && seq[i - 1] === seq[i - 2]
              ? pool.filter((id) => id !== seq[i - 1])
              : pool;
          seq.push(candidates[Math.floor(Math.random() * candidates.length)]);
        }
        setMelodySeq(seq);
        playMelodyPrompt(seq);
      } else if (mode === 'HIGH_LOW') {
        const firstPool =
          levelRef.current === 'beginner'
            ? EXTENDED_ORDER.filter((id) =>
                ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5'].includes(id)
              )
            : EXTENDED_ORDER;

        const firstNote = firstPool[Math.floor(Math.random() * firstPool.length)];
        const firstSemi = EXTENDED_NOTES[firstNote].semitone;

        const validSeconds = firstPool.filter((id) => {
          const dist = Math.abs(EXTENDED_NOTES[id].semitone - firstSemi);
          return dist >= cfg.highLowMinSemitones && dist <= cfg.highLowMaxSemitones;
        });

        const fallbackSeconds = firstPool.filter((id) => id !== firstNote);
        const candidates = validSeconds.length > 0 ? validSeconds : fallbackSeconds;
        const secondNote = candidates[Math.floor(Math.random() * candidates.length)];

        const pair: [ExtendedNoteId, ExtendedNoteId] = [firstNote, secondNote];
        setPitchPair(pair);
        playHighLowPrompt(pair);
      } else {
        const qualities = cfg.chordQualities;
        const rootPool = cfg.exactChordMode
          ? CHROMATIC_NOTES.map((n) => n.id)
          : pool;

        let nextChord: TargetChord = {
          rootId: rootPool[Math.floor(Math.random() * rootPool.length)],
          qualityId: qualities[Math.floor(Math.random() * qualities.length)],
        };

        if (
          prevChord &&
          nextChord.rootId === prevChord.rootId &&
          nextChord.qualityId === prevChord.qualityId
        ) {
          const otherQualities = qualities.filter((q) => q !== prevChord.qualityId);
          if (otherQualities.length > 0) {
            nextChord = {
              ...nextChord,
              qualityId: otherQualities[Math.floor(Math.random() * otherQualities.length)],
            };
          }
        }

        setTargetChord(nextChord);
        playChordPrompt(nextChord);
      }
    },
    [mode, playChordPrompt, playGuessPrompt, playHighLowPrompt, playMelodyPrompt]
  );

  useEffect(() => {
    setRound(1);
    setSetStars(0);
    setStreak(0);
    setIsVictory(false);
    setIsGameOver(false);
    setGameOverReason('');
    setIsPaused(false);
    setShowFlightReward(false);
    setPendingFinalVictory(false);
    pendingNextRoundRef.current = {};
    setupRound(1);

    return () => {
      soundEngine.clearScheduled();
    };
  }, [mode, level, setupRound]);

  const handleRoundSuccess = useCallback(
    (successMsg: string, nextPrevTarget?: NoteId, nextPrevChord?: TargetChord) => {
      setRoundResolved(true);
      setOwlMood('happy');
      setOwlMessage(successMsg);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setSetStars((s) => s + 1);

      const isFinalRound = round >= TOTAL_ROUNDS;
      const { newWardrobe, newRewards, earnedFlightTurn } = onRecordProgress({
        starsEarned: 1,
        completedCategory: isFinalRound ? 'music' : undefined,
        level,
        streak: nextStreak,
      });

      const unlockLabels = [
        ...newRewards.map(
          (r) => `${r.emoji} ${tRef.current.rewards.items[r.id]?.name ?? r.name}`
        ),
        ...(profile.mascot === 'fairy'
          ? newWardrobe.map(
              (w) => `✨ ${tRef.current.wardrobe.items[w.id] ?? w.name}`
            )
          : []),
      ];
      if (unlockLabels.length > 0) {
        setRecentUnlockText(`${tRef.current.common.unlockedPrefix} ${unlockLabels[0]}`);
      }

      onTriggerConfetti(isFinalRound || earnedFlightTurn ? 'big' : 'small');

      soundEngine.schedule(() => {
        if (unlockLabels.length > 0 || earnedFlightTurn) {
          soundEngine.playUnlockFanfare();
        } else if (isFinalRound) {
          soundEngine.playVictoryFanfare();
        } else {
          soundEngine.playCorrectChime();
        }
      }, 180);

      soundEngine.schedule(() => {
        if (earnedFlightTurn) {
          pendingNextRoundRef.current = { nextPrevTarget, nextPrevChord };
          setPendingFinalVictory(isFinalRound);
          setShowFlightReward(true);
        } else if (isFinalRound) {
          setOwlMood('celebrating');
          setIsVictory(true);
        } else {
          const nextR = round + 1;
          setRound(nextR);
          setupRound(nextR, nextPrevTarget, nextPrevChord);
        }
      }, earnedFlightTurn ? 950 : unlockLabels.length > 0 ? 1850 : isFinalRound ? 1550 : 1500);
    },
    [level, onRecordProgress, onTriggerConfetti, profile.mascot, round, setupRound, streak]
  );

  const triggerStrictGameOver = useCallback(
    (msg: string) => {
      soundEngine.clearScheduled();
      setIsPlayingPrompt(false);
      setPlayingBeatIdx(null);
      setActivePitchCard(null);
      setRoundResolved(true);
      setStreak(0);
      setOwlMood('confused');
      setOwlMessage(msg);
      setGameOverReason(msg);
      setIsGameOver(true);
      onResetFlightProgress();
      soundEngine.playGentleOops();
      soundEngine.playCollapseThud();
    },
    [onResetFlightProgress]
  );

  const handlePianoPress = useCallback(
    (note: ToyNote) => {
      if (isPlayingPrompt || roundResolved || isPaused || isVictory || isGameOver || showFlightReward) return;

      flashKey(note.id);
      soundEngine.playNote(note.freq, instrumentRef.current, 0.72);

      if (mode === 'GUESS_NOTE') {
        if (note.id === targetNote) {
          handleRoundSuccess(
            tRef.current.music.feedback.guessCorrect(note.western, note.sargam),
            note.id
          );
        } else {
          triggerStrictGameOver(
            tRef.current.music.feedback.guessWrong(note.western, note.sargam)
          );
        }
      } else if (mode === 'COPY_MELODY') {
        const expected = melodySeq[playerMelodyIdx];
        if (note.id === expected) {
          const nextIdx = playerMelodyIdx + 1;
          setPlayerMelodyIdx(nextIdx);
          if (nextIdx >= melodySeq.length) {
            handleRoundSuccess(tRef.current.music.feedback.melodyPerfect);
          } else {
            setOwlMood('listening');
            setOwlMessage(
              tRef.current.music.feedback.melodyProgress(melodySeq.length - nextIdx)
            );
          }
        } else {
          setPlayerMelodyIdx(0);
          triggerStrictGameOver(tRef.current.music.feedback.melodyOops);
        }
      }
    },
    [
      flashKey,
      handleRoundSuccess,
      isGameOver,
      isPaused,
      isPlayingPrompt,
      isVictory,
      melodySeq,
      mode,
      playerMelodyIdx,
      roundResolved,
      showFlightReward,
      targetNote,
      triggerStrictGameOver,
    ]
  );

  const handlePitchChoice = useCallback(
    (choice: 'higher' | 'lower') => {
      if (isPlayingPrompt || roundResolved || isPaused || isVictory || isGameOver || showFlightReward) return;

      soundEngine.playTapPop();
      const firstFreq = EXTENDED_NOTES[pitchPair[0]].freq;
      const secondFreq = EXTENDED_NOTES[pitchPair[1]].freq;
      const actual = secondFreq > firstFreq ? 'higher' : 'lower';

      if (choice === actual) {
        setRevealedPitch(true);
        handleRoundSuccess(
          tRef.current.music.feedback.highLowCorrect(
            EXTENDED_NOTES[pitchPair[1]].western,
            actual
          )
        );
      } else {
        triggerStrictGameOver(tRef.current.music.feedback.highLowWrong);
      }
    },
    [
      handleRoundSuccess,
      isGameOver,
      isPaused,
      isPlayingPrompt,
      isVictory,
      pitchPair,
      roundResolved,
      showFlightReward,
      triggerStrictGameOver,
    ]
  );

  const handleChordQualityClick = useCallback(
    (qualityId: ChordQualityId) => {
      if (isPlayingPrompt || roundResolved || isPaused || isVictory || isGameOver || showFlightReward) return;

      soundEngine.playTapPop();

      if (levelConfig.exactChordMode) {
        setSelectedChordQuality(qualityId);
        return;
      }

      if (qualityId === targetChord.qualityId) {
        setRevealedChord(true);
        const rootName = NOTE_BY_ID[targetChord.rootId].western;
        const qualName =
          tRef.current.music.chordQualities[targetChord.qualityId]?.label ??
          CHORD_QUALITY_BY_ID[targetChord.qualityId].label;
        handleRoundSuccess(
          tRef.current.music.feedback.chordCorrect(rootName, qualName),
          undefined,
          targetChord
        );
      } else {
        const pickedQualName =
          tRef.current.music.chordQualities[qualityId]?.label ??
          CHORD_QUALITY_BY_ID[qualityId].label;
        triggerStrictGameOver(tRef.current.music.feedback.chordWrong(pickedQualName));
      }
    },
    [
      handleRoundSuccess,
      isGameOver,
      isPaused,
      isPlayingPrompt,
      isVictory,
      levelConfig.exactChordMode,
      roundResolved,
      showFlightReward,
      targetChord,
      triggerStrictGameOver,
    ]
  );

  const handleCheckExactChord = useCallback(() => {
    if (
      isPlayingPrompt ||
      roundResolved ||
      isPaused ||
      isVictory ||
      isGameOver ||
      showFlightReward ||
      !selectedChordRoot ||
      !selectedChordQuality
    ) {
      return;
    }

    const rootMatch = selectedChordRoot === targetChord.rootId;
    const qualityMatch = selectedChordQuality === targetChord.qualityId;

    if (rootMatch && qualityMatch) {
      setRevealedChord(true);
      const rootName = NOTE_BY_ID[targetChord.rootId].western;
      const qualName =
        tRef.current.music.chordQualities[targetChord.qualityId]?.label ??
        CHORD_QUALITY_BY_ID[targetChord.qualityId].label;
      handleRoundSuccess(
        tRef.current.music.feedback.exactChordCorrect(rootName, qualName),
        undefined,
        targetChord
      );
    } else {
      if (rootMatch && !qualityMatch) {
        triggerStrictGameOver(
          tRef.current.music.feedback.exactChordRightRoot(
            NOTE_BY_ID[selectedChordRoot].western
          )
        );
      } else if (!rootMatch && qualityMatch) {
        const qualName =
          tRef.current.music.chordQualities[selectedChordQuality]?.label ??
          CHORD_QUALITY_BY_ID[selectedChordQuality].label;
        triggerStrictGameOver(
          tRef.current.music.feedback.exactChordRightType(qualName)
        );
      } else {
        triggerStrictGameOver(tRef.current.music.feedback.exactChordWrongBoth);
      }
    }
  }, [
    handleRoundSuccess,
    isGameOver,
    isPaused,
    isPlayingPrompt,
    isVictory,
    roundResolved,
    selectedChordQuality,
    selectedChordRoot,
    showFlightReward,
    targetChord,
    triggerStrictGameOver,
  ]);

  const handleListenAgain = useCallback(() => {
    if (isPlayingPrompt || roundResolved || isPaused || isVictory || isGameOver) return;

    if (mode === 'GUESS_NOTE') {
      playGuessPrompt(targetNote);
    } else if (mode === 'COPY_MELODY') {
      setPlayerMelodyIdx(0);
      playMelodyPrompt(melodySeq);
    } else if (mode === 'HIGH_LOW') {
      playHighLowPrompt(pitchPair);
    } else {
      playChordPrompt(targetChord);
    }
  }, [
    isGameOver,
    isPaused,
    isPlayingPrompt,
    isVictory,
    melodySeq,
    mode,
    pitchPair,
    playChordPrompt,
    playGuessPrompt,
    playHighLowPrompt,
    playMelodyPrompt,
    roundResolved,
    targetChord,
    targetNote,
  ]);

  const handleRestartSet = useCallback(() => {
    soundEngine.playTapPop();
    onResetFlightProgress();
    setIsVictory(false);
    setIsGameOver(false);
    setGameOverReason('');
    setIsPaused(false);
    setShowFlightReward(false);
    setPendingFinalVictory(false);
    pendingNextRoundRef.current = {};
    setRound(1);
    setSetStars(0);
    setStreak(0);
    setupRound(1);
  }, [onResetFlightProgress, setupRound]);

  const handleContinueAfterFlightReward = useCallback(() => {
    setShowFlightReward(false);
    if (pendingFinalVictory) {
      setPendingFinalVictory(false);
      pendingNextRoundRef.current = {};
      setOwlMood('celebrating');
      setIsVictory(true);
    } else {
      const { nextPrevTarget, nextPrevChord } = pendingNextRoundRef.current;
      pendingNextRoundRef.current = {};
      const nextR = round + 1;
      setRound(nextR);
      setupRound(nextR, nextPrevTarget, nextPrevChord);
    }
  }, [pendingFinalVictory, round, setupRound]);

  const openPause = useCallback(() => {
    soundEngine.clearScheduled();
    setIsPlayingPrompt(false);
    setPlayingBeatIdx(null);
    setActivePitchCard(null);
    setIsPaused(true);
  }, []);

  useEffect(() => {
    if (externalLocked) {
      soundEngine.clearScheduled();
      setIsPlayingPrompt(false);
      setPlayingBeatIdx(null);
      setActivePitchCard(null);
      if (!isVictory && !isGameOver) {
        setIsPaused(true);
      }
    }
  }, [externalLocked, isGameOver, isVictory]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (confirmExitTarget !== null || externalLocked || showFlightReward || isGameOver || e.repeat) return;
      if (e.key === 'Escape') {
        if (!isVictory) {
          if (isPaused) {
            setIsPaused(false);
          } else {
            openPause();
          }
        }
        return;
      }

      if (isPaused || isVictory) return;

      if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleListenAgain();
        return;
      }

      if (mode === 'GUESS_NOTE' || mode === 'COPY_MELODY') {
        const key = e.key.toLowerCase();
        const dawMap: Record<string, NoteId> = {
          a: 'C4',
          w: 'C#4',
          s: 'D4',
          e: 'D#4',
          d: 'E4',
          f: 'F4',
          t: 'F#4',
          g: 'G4',
          y: 'G#4',
          h: 'A4',
          u: 'A#4',
          j: 'B4',
          '1': 'C4',
          '2': 'D4',
          '3': 'E4',
          '4': 'F4',
          '5': 'G4',
          '6': 'A4',
          '7': 'B4',
        };
        const mappedId = dawMap[key];
        if (mappedId && LEVEL_CONFIGS[level].notePool.includes(mappedId)) {
          handlePianoPress(NOTE_BY_ID[mappedId]);
        }
      } else if (mode === 'HIGH_LOW') {
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          e.preventDefault();
          handlePitchChoice('higher');
        } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          handlePitchChoice('lower');
        }
      } else if (mode === 'GUESS_CHORD') {
        const num = parseInt(e.key, 10);
        const qualities = LEVEL_CONFIGS[level].chordQualities;
        if (num >= 1 && num <= qualities.length) {
          handleChordQualityClick(qualities[num - 1]);
        } else if (e.key === 'Enter' && LEVEL_CONFIGS[level].exactChordMode) {
          handleCheckExactChord();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    confirmExitTarget,
    externalLocked,
    handleCheckExactChord,
    handleChordQualityClick,
    handleListenAgain,
    handlePianoPress,
    handlePitchChoice,
    isGameOver,
    isPaused,
    isVictory,
    level,
    mode,
    openPause,
    showFlightReward,
  ]);

  return (
    <div className="safe-screen h-dvh max-h-dvh overflow-hidden w-full flex flex-col gap-1.5 max-w-5xl mx-auto relative">
      {/* Top HUD Bar */}
      <header className="app-header-bar">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              if (isVictory || isGameOver) {
                soundEngine.clearScheduled();
                onExitToMenu();
              } else {
                setConfirmExitTarget('menu');
              }
            }}
            aria-label="Back to mode menu"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="font-display text-base sm:text-2xl font-bold text-slate-900 leading-tight truncate">
              {t.music.modes[mode].title}
            </h1>
            <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-semibold text-slate-500 tabular-nums truncate">
              <span className="hidden sm:inline truncate">{profile.name}</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="truncate">{t.levels[level].label}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">
                {t.common.round} {round}/{TOTAL_ROUNDS}
              </span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="hidden sm:inline shrink-0">
                {t.common.streak} {streak}
              </span>
            </div>
          </div>
        </div>

        {/* Right HUD Cluster */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-1 text-slate-800 shrink-0">
            <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 fill-amber-400 shrink-0" />
            <span className="font-display text-sm sm:text-xl font-bold tabular-nums">
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
            className="toy-btn w-9 h-9 md:w-auto md:h-11 md:px-3 rounded-xl sm:rounded-2xl text-amber-950 font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-2 border-white/60 cursor-pointer shrink-0"
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{t.header.rewardsShort}</span>
          </button>

          {profile.mascot === 'fairy' && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playMagicWand();
                onOpenWardrobe();
              }}
              aria-label={t.common.fairyWardrobe}
              style={{
                background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
                boxShadow: '0 4px 0 0 #9D174D',
              }}
              className="toy-btn w-9 h-9 md:w-auto md:h-11 md:px-3 rounded-xl sm:rounded-2xl text-white font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border-2 border-white/50 cursor-pointer shrink-0"
            >
              <Shirt className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{t.home.wardrobeBtn}</span>
            </button>
          )}

          <div
            className="hidden lg:flex items-center p-1 rounded-2xl bg-white/90 shadow-sm border border-slate-200/80 shrink-0"
            role="group"
            aria-label={t.music.instrumentSound}
          >
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onSelectInstrument('marimba');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                instrument === 'piano'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.header.piano}
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.header.unmute : t.header.mute}
            style={{ boxShadow: muted ? '0 4px 0 0 #CBD5E1' : '0 4px 0 0 #0284C7' }}
            className={`toy-btn w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-white cursor-pointer shrink-0 ${
              muted ? 'bg-slate-200 text-slate-600' : 'bg-sky-400 text-white'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              openPause();
            }}
            aria-label="Pause game"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Round Progress Stars Strip + 3D Flight Turn Counter */}
      <div className="shrink-0 flex flex-col items-center gap-1.5 py-1">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const filled = i < setStars;
            const isCurrent = i === round - 1 && !filled;
            return (
              <div
                key={i}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform ${
                  filled
                    ? 'bg-amber-400 text-white shadow-[0_3px_0_0_#D97706] scale-105'
                    : isCurrent
                    ? 'bg-white border-2 border-indigo-400 text-indigo-400 shadow-sm'
                    : 'bg-white/70 border border-slate-200 text-slate-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${filled ? 'fill-white' : ''}`} />
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

      {/* Center Mascot + Interactive Play Area (Cleanly underneath header) */}
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <div className="w-full my-auto flex flex-col items-center gap-4 sm:gap-5 py-2">
          {/* New Reward / Wardrobe Unlock Celebration Banner */}
          {recentUnlockText && (
            <div className="clay-card rounded-2xl px-4 py-2 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-pink-50 text-amber-950 font-display text-sm sm:text-base font-bold flex items-center gap-2 shadow-md">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{recentUnlockText}</span>
            </div>
          )}

        <div className="flex flex-col items-center gap-3">
          <MascotStage
            mascot={profile.mascot}
            mood={owlMood}
            message={owlMessage}
            size="md"
            streak={streak}
            equipped={profile.equippedWardrobe}
            variant="gameplay"
          />

          {/* Big "Listen Again" 3D Clay Button */}
          <button
            type="button"
            disabled={isPlayingPrompt || roundResolved}
            onClick={handleListenAgain}
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow: isPlayingPrompt
                ? '0 2px 0 0 #B45309'
                : '0 7px 0 0 #B45309, 0 12px 22px -6px rgba(217, 119, 6, 0.35)',
              transform: isPlayingPrompt ? 'translateY(4px)' : undefined,
            }}
            className={`toy-btn min-h-[52px] px-7 sm:px-9 py-2.5 rounded-full text-amber-950 font-display text-lg sm:text-xl font-bold flex items-center gap-2.5 border-2 border-white/70 cursor-pointer ${
              isPlayingPrompt || roundResolved ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <Volume2 className={`w-6 h-6 ${isPlayingPrompt ? 'animate-pulse' : ''}`} />
            <span>{isPlayingPrompt ? t.music.listening : t.music.listenAgain}</span>
          </button>
        </div>

        {/* Copy the Melody Step Dots */}
        {mode === 'COPY_MELODY' && (
          <div className="flex items-center justify-center gap-2.5" aria-label="Melody step progress">
            {melodySeq.map((_, idx) => {
              const isHearingNow = isPlayingPrompt && playingBeatIdx === idx;
              const done = !isPlayingPrompt && idx < playerMelodyIdx;
              const nextUp = !isPlayingPrompt && idx === playerMelodyIdx;
              return (
                <div
                  key={idx}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all border-2 ${
                    isHearingNow
                      ? 'bg-amber-400 border-white shadow-[0_2px_0_0_#D97706] scale-125'
                      : done
                      ? 'bg-emerald-500 border-white shadow-[0_2px_0_0_#047857] scale-110'
                      : nextUp
                      ? 'bg-indigo-500 border-white shadow-[0_2px_0_0_#3730A3] scale-110'
                      : 'bg-white border-slate-300'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Rainbow Piano (Guess the Note & Copy the Melody) */}
        {(mode === 'GUESS_NOTE' || mode === 'COPY_MELODY') && (
          <RainbowPiano
            level={level}
            activeNote={activeKey}
            disabled={isPlayingPrompt || roundResolved}
            onPressNote={handlePianoPress}
          />
        )}

        {/* High or Low? Mode */}
        {mode === 'HIGH_LOW' && (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {[1, 2].map((num) => {
                const isActive = activePitchCard === num;
                const noteKey = num === 1 ? pitchPair[0] : pitchPair[1];
                const noteMeta = EXTENDED_NOTES[noteKey];

                return (
                  <div
                    key={num}
                    className={`clay-card rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 border-2 transition-transform ${
                      isActive
                        ? 'border-indigo-500 scale-105 bg-indigo-50'
                        : 'border-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-400">
                      {num === 1 ? t.music.firstSound : t.music.secondSound}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-2xl font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {num === 1 ? '♪' : '♫'}
                    </div>
                    <span className="font-display text-base sm:text-lg font-bold text-slate-800">
                      {revealedPitch ? `${noteMeta.western} · ${noteMeta.sargam}` : '???'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xl">
              <button
                type="button"
                disabled={isPlayingPrompt || roundResolved}
                onClick={() => handlePitchChoice('higher')}
                style={{
                  background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                  boxShadow: '0 9px 0 0 #065F46, 0 14px 24px -6px rgba(5, 150, 105, 0.35)',
                }}
                className={`toy-btn min-h-[112px] sm:min-h-[132px] rounded-[28px] p-4 flex flex-col items-center justify-center gap-1.5 text-white border-2 border-white/50 cursor-pointer ${
                  isPlayingPrompt || roundResolved ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <ArrowUp className="w-9 h-9 sm:w-11 sm:h-11 stroke-[3]" />
                <span className="font-display text-2xl sm:text-3xl font-bold">
                  {t.music.higher}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-100">
                  {t.music.goesUp}
                </span>
              </button>

              <button
                type="button"
                disabled={isPlayingPrompt || roundResolved}
                onClick={() => handlePitchChoice('lower')}
                style={{
                  background: 'linear-gradient(180deg, #FB7185 0%, #E11D48 100%)',
                  boxShadow: '0 9px 0 0 #9F1239, 0 14px 24px -6px rgba(225, 29, 72, 0.35)',
                }}
                className={`toy-btn min-h-[112px] sm:min-h-[132px] rounded-[28px] p-4 flex flex-col items-center justify-center gap-1.5 text-white border-2 border-white/50 cursor-pointer ${
                  isPlayingPrompt || roundResolved ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <ArrowDown className="w-9 h-9 sm:w-11 sm:h-11 stroke-[3]" />
                <span className="font-display text-2xl sm:text-3xl font-bold">
                  {t.music.lower}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-rose-100">
                  {t.music.goesDown}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Guess the Chord Mode */}
        {mode === 'GUESS_CHORD' && (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4">
            {revealedChord && (
              <div className="clay-card rounded-2xl px-5 py-2 border-2 border-emerald-300 bg-emerald-50 text-emerald-900 font-display text-lg sm:text-xl font-bold">
                {t.music.chordLabel} {NOTE_BY_ID[targetChord.rootId].western}{' '}
                {t.music.chordQualities[targetChord.qualityId]?.label ??
                  CHORD_QUALITY_BY_ID[targetChord.qualityId].label}
              </div>
            )}

            {levelConfig.exactChordMode ? (
              <div className="w-full clay-surface rounded-[28px] p-4 sm:p-5 border-2 border-white flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 text-center">
                    {t.music.pickRoot}
                  </span>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
                    {CHROMATIC_NOTES.map((note) => {
                      const isSelected = selectedChordRoot === note.id;
                      return (
                        <button
                          key={note.id}
                          type="button"
                          disabled={isPlayingPrompt || roundResolved}
                          onClick={() => {
                            soundEngine.playNote(note.freq, instrumentRef.current, 0.72);
                            setSelectedChordRoot(note.id);
                          }}
                          style={{
                            background: isSelected
                              ? 'linear-gradient(180deg, #4F46E5 0%, #3730A3 100%)'
                              : note.isSharp
                              ? 'linear-gradient(180deg, #334155 0%, #0F172A 100%)'
                              : 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
                            boxShadow: isSelected
                              ? '0 2px 0 0 #1E1B4B, 0 0 12px rgba(79,70,229,0.45)'
                              : note.isSharp
                              ? '0 4px 0 0 #020617'
                              : '0 4px 0 0 #CBD5E1',
                            transform: isSelected ? 'translateY(3px)' : undefined,
                          }}
                          className={`toy-btn min-h-[46px] rounded-xl font-display text-sm sm:text-base font-bold border cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'text-white border-indigo-300 ring-2 ring-indigo-400'
                              : note.isSharp
                              ? 'text-white border-slate-700'
                              : 'text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{note.western}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 text-center">
                    {t.music.pickType}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {levelConfig.chordQualities.map((qId, idx) => {
                      const def = CHORD_QUALITY_BY_ID[qId];
                      const qualText = t.music.chordQualities[qId] ?? def;
                      const isSelected = selectedChordQuality === qId;
                      return (
                        <button
                          key={qId}
                          type="button"
                          disabled={isPlayingPrompt || roundResolved}
                          onClick={() => handleChordQualityClick(qId)}
                          style={{
                            background: `linear-gradient(180deg, ${def.gradientTop} 0%, ${def.gradientBottom} 100%)`,
                            boxShadow: isSelected
                              ? `0 2px 0 0 ${def.bevelColor}, 0 0 18px rgba(15, 23, 42, 0.25)`
                              : `0 6px 0 0 ${def.bevelColor}`,
                            color: def.textColor,
                            transform: isSelected ? 'translateY(4px)' : undefined,
                          }}
                          className={`toy-btn min-h-[54px] px-2 py-2 rounded-2xl font-display font-bold border-2 cursor-pointer flex flex-col items-center justify-center ${
                            isSelected ? 'border-white ring-4 ring-indigo-500' : 'border-white/50'
                          }`}
                        >
                          <span className="text-sm sm:text-base leading-tight">
                            {qualText.label}
                          </span>
                          <span className="text-[10px] opacity-80 font-sans hidden sm:inline">
                            {t.music.keyLabel(idx + 1)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    isPlayingPrompt ||
                    roundResolved ||
                    !selectedChordRoot ||
                    !selectedChordQuality
                  }
                  onClick={handleCheckExactChord}
                  style={{
                    background:
                      selectedChordRoot && selectedChordQuality
                        ? 'linear-gradient(180deg, #4F46E5 0%, #3730A3 100%)'
                        : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)',
                    boxShadow:
                      selectedChordRoot && selectedChordQuality
                        ? '0 7px 0 0 #1E1B4B'
                        : '0 4px 0 0 #64748B',
                  }}
                  className={`toy-btn min-h-[52px] w-full sm:w-auto sm:mx-auto px-8 py-3 rounded-2xl text-white font-display text-lg sm:text-xl font-bold flex items-center justify-center gap-2 border-2 border-white/40 ${
                    !selectedChordRoot || !selectedChordQuality || isPlayingPrompt || roundResolved
                      ? 'opacity-75 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <Check className="w-6 h-6 stroke-[3]" />
                  <span>
                    {selectedChordRoot && selectedChordQuality
                      ? `${t.music.checkPrefix} ${NOTE_BY_ID[selectedChordRoot].western} ${
                          t.music.chordQualities[selectedChordQuality]?.label ??
                          CHORD_QUALITY_BY_ID[selectedChordQuality].label
                        }`
                      : t.music.selectRootAndType}
                  </span>
                </button>
              </div>
            ) : (
              <div
                className={`w-full grid gap-3 sm:gap-4 ${
                  levelConfig.chordQualities.length === 2
                    ? 'grid-cols-2 max-w-xl'
                    : levelConfig.chordQualities.length === 4
                    ? 'grid-cols-2 max-w-2xl'
                    : 'grid-cols-2 sm:grid-cols-3 max-w-3xl'
                }`}
              >
                {levelConfig.chordQualities.map((qId, idx) => {
                  const def = CHORD_QUALITY_BY_ID[qId];
                  const qualText = t.music.chordQualities[qId] ?? def;
                  return (
                    <button
                      key={qId}
                      type="button"
                      disabled={isPlayingPrompt || roundResolved}
                      onClick={() => handleChordQualityClick(qId)}
                      style={{
                        background: `linear-gradient(180deg, ${def.gradientTop} 0%, ${def.gradientBottom} 100%)`,
                        boxShadow: `0 8px 0 0 ${def.bevelColor}, 0 12px 20px -6px rgba(15, 23, 42, 0.22)`,
                        color: def.textColor,
                      }}
                      className={`toy-btn min-h-[96px] sm:min-h-[116px] rounded-[24px] p-4 flex flex-col items-center justify-center gap-1 border-2 border-white/50 cursor-pointer ${
                        isPlayingPrompt || roundResolved
                          ? 'opacity-75 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <span className="font-display text-xl sm:text-2xl font-bold leading-tight">
                        {qualText.label}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold opacity-90">
                        {qualText.moodHint}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] font-bold opacity-70 mt-0.5">
                        {t.music.keyLabel(idx + 1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* Quiet Bottom Keyboard Hint */}
      <footer className="shrink-0 text-center pt-1">
        <p className="text-xs font-medium text-slate-400">
          {mode === 'HIGH_LOW'
            ? t.music.footerHighLow
            : mode === 'GUESS_CHORD'
            ? levelConfig.exactChordMode
              ? t.music.footerExactChord
              : t.music.footerChord(levelConfig.chordQualities.length)
            : levelConfig.showSharps
            ? t.music.footerSharps
            : t.music.footerNaturals(levelConfig.naturalCount)}
        </p>
      </footer>

      {/* Pause Modal */}
      {isPaused && !isVictory && !isGameOver && (
        <div
          className="safe-modal-overlay fixed inset-0 z-40 bg-slate-900/45 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t.common.pausedTitle}
        >
          <div className="clay-surface rounded-[32px] p-6 sm:p-8 w-full max-w-sm border-2 border-white flex flex-col items-center gap-4 text-center my-auto max-h-[90dvh] overflow-y-auto">
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

            <div className="w-full flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">
                {t.music.instrumentSound}
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTapPop();
                    onSelectInstrument('marimba');
                  }}
                  className={`py-2 rounded-xl text-sm font-bold cursor-pointer ${
                    instrument === 'marimba'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  {t.header.marimba}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTapPop();
                    onSelectInstrument('piano');
                  }}
                  className={`py-2 rounded-xl text-sm font-bold cursor-pointer ${
                    instrument === 'piano'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  {t.header.piano}
                </button>
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

      {/* Round Set Victory Modal */}
      {isVictory && (
        <div
          className="safe-modal-overlay fixed inset-0 z-40 bg-slate-900/50 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t.music.victoryMascotMsg}
        >
          <div className="clay-surface rounded-[34px] p-6 sm:p-8 w-full max-w-md border-2 border-white flex flex-col items-center gap-4 text-center my-auto max-h-[90dvh] overflow-y-auto">
            <MascotStage
              mascot={profile.mascot}
              mood="celebrating"
              message={t.music.victoryMascotMsg}
              size="sm"
              streak={streak}
              equipped={profile.equippedWardrobe}
            />

            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                {t.music.victoryHeading(profile.name)}
              </h2>
              <p className="mt-1 text-base font-medium text-slate-600">
                {t.music.victorySubtitle(t.levels[level].label, t.music.modes[mode].title)}
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

            <p className="text-sm font-bold text-slate-500 tabular-nums">
              {t.common.totalStarsCollected}: {profile.totalStars}
            </p>

            {profile.mascot === 'fairy' && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playMagicWand();
                  onOpenWardrobe();
                }}
                style={{
                  background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
                  boxShadow: '0 6px 0 0 #9D174D',
                }}
                className="toy-btn w-full min-h-[48px] px-5 rounded-2xl text-white font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shirt className="w-5 h-5" />
                <span>{t.common.dressUpSparkle}</span>
              </button>
            )}

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
                  soundEngine.clearScheduled();
                  soundEngine.playTapPop();
                  onExitToMenu();
                }}
                style={{
                  background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                  boxShadow: '0 6px 0 0 #075985',
                }}
                className="toy-btn min-h-[50px] px-5 rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Home className="w-5 h-5" />
                <span>{t.common.allModes}</span>
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
          pendingNextRoundRef.current = {};
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
          onExitToMenu();
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
            onExitToMenu();
          }
        }}
        onCancel={() => setConfirmExitTarget(null)}
      />
    </div>
  );
}
