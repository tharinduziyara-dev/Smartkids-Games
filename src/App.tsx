import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppCategory,
  DifficultyLevel,
  EnglishMode,
  GameMode,
  GameState,
  InstrumentType,
  MascotId,
  MathMode,
  ParentalSettings,
  RewardItem,
  WardrobeCategory,
  WardrobeItem,
} from './types/game';
import {
  ProfilesStore,
  createPlayerProfile,
  findNewlyUnlockedItems,
  findNewlyUnlockedRewards,
  getUnlockedIdsForStars,
  getUnlockedRewardIds,
  loadProfilesStore,
  saveProfilesStore,
} from './utils/profileStorage';
import {
  loadParentalSettings,
  saveParentalSettings,
} from './utils/parentalStorage';
import { soundEngine } from './audio/soundEngine';
import { stopSpeaking } from './utils/speech';
import { TitleScreen } from './components/TitleScreen';
import { GameStage } from './components/GameStage';
import { MathStage } from './components/MathStage';
import { EnglishStage } from './components/EnglishStage';
import { FairyFlightStage } from './components/FairyFlightStage';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { WardrobeModal } from './components/WardrobeModal';
import { ProfileModal } from './components/ProfileModal';
import { RewardsModal } from './components/RewardsModal';
import { ParentalLockOverlay } from './components/ParentalLockOverlay';
import { ParentalSettingsModal } from './components/ParentalSettingsModal';
import { DictionaryModal } from './components/DictionaryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AppLanguage, loadLanguage, saveLanguage } from './i18n/translations';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
  const [activeMusicMode, setActiveMusicMode] = useState<GameMode>('GUESS_NOTE');
  const [activeMathMode, setActiveMathMode] = useState<MathMode>('ADDITION');
  const [activeEnglishMode, setActiveEnglishMode] = useState<EnglishMode>('DICTATION');
  const [isSkyRun, setIsSkyRun] = useState<boolean>(false);

  const [level, setLevel] = useState<DifficultyLevel>('beginner');
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [muted, setMuted] = useState<boolean>(false);
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage());

  const [store, setStore] = useState<ProfilesStore>(() => loadProfilesStore());
  const [parental, setParental] = useState<ParentalSettings>(() =>
    loadParentalSettings()
  );
  const [showWardrobe, setShowWardrobe] = useState<boolean>(false);
  const [showProfiles, setShowProfiles] = useState<boolean>(false);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [showDictionary, setShowDictionary] = useState<boolean>(false);
  const [showParentalSettings, setShowParentalSettings] = useState<boolean>(false);

  const [confettiState, setConfettiState] = useState<{
    trigger: number;
    intensity: 'small' | 'big';
  }>({ trigger: 0, intensity: 'small' });

  const activeProfile = useMemo(() => {
    return (
      store.profiles.find((p) => p.id === store.activeProfileId) ??
      store.profiles[0]
    );
  }, [store]);

  useEffect(() => {
    saveProfilesStore(store);
  }, [store]);

  useEffect(() => {
    saveParentalSettings(parental);
  }, [parental]);

  useEffect(() => {
    saveLanguage(language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'si' ? 'si' : 'en';
    }
  }, [language]);

  // Ask confirmation before closing browser tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Active play time tracker (counts seconds while tab is visible & unlocked)
  useEffect(() => {
    if (parental.isLocked) return;

    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      setParental((prev) => {
        if (prev.isLocked) return prev;
        const nextElapsed = prev.elapsedSeconds + 1;
        const limitSeconds = prev.timeLimitMinutes * 60;
        if (nextElapsed >= limitSeconds) {
          soundEngine.clearScheduled();
          stopSpeaking();
          return {
            ...prev,
            elapsedSeconds: limitSeconds,
            isLocked: true,
          };
        }
        return {
          ...prev,
          elapsedSeconds: nextElapsed,
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [parental.isLocked]);

  const handleUpdateParentalSettings = useCallback(
    (patch: Partial<ParentalSettings>) => {
      setParental((prev) => ({
        ...prev,
        ...patch,
      }));
    },
    []
  );

  const handleLockNow = useCallback(() => {
    soundEngine.clearScheduled();
    stopSpeaking();
    setParental((prev) => ({
      ...prev,
      isLocked: true,
    }));
  }, []);

  const handleUnlockScreen = useCallback(() => {
    setParental((prev) => ({
      ...prev,
      elapsedSeconds: 0,
      isLocked: false,
    }));
  }, []);

  const handleResetTimer = useCallback(() => {
    setParental((prev) => ({
      ...prev,
      elapsedSeconds: 0,
    }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      if (!next) {
        soundEngine.playTapPop();
      } else {
        soundEngine.clearScheduled();
        stopSpeaking();
      }
      return next;
    });
  }, []);

  const handleStartMusicMode = useCallback((mode: GameMode) => {
    setSelectedCategory('music');
    setActiveMusicMode(mode);
    setIsSkyRun(false);
    setGameState('PLAYING');
  }, []);

  const handleStartMathMode = useCallback((mode: MathMode) => {
    setSelectedCategory('math');
    setActiveMathMode(mode);
    setIsSkyRun(false);
    setGameState('PLAYING');
  }, []);

  const handleStartEnglishMode = useCallback((mode: EnglishMode) => {
    setSelectedCategory('english');
    setActiveEnglishMode(mode);
    setIsSkyRun(false);
    setGameState('PLAYING');
  }, []);

  const handleConsumeFlightTurn = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === activeProfile.id
          ? {
              ...p,
              flightTurns: Math.max(0, p.flightTurns - 1),
            }
          : p
      ),
    }));
  }, [activeProfile.id]);

  const handleStartSkyRun = useCallback(
    (category: AppCategory) => {
      if (activeProfile.flightTurns <= 0) return;
      handleConsumeFlightTurn();
      setSelectedCategory(category);
      setIsSkyRun(true);
      setGameState('PLAYING');
    },
    [activeProfile.flightTurns, handleConsumeFlightTurn]
  );

  const handleRecordProgress = useCallback(
    (opts: {
      starsEarned: number;
      completedCategory?: AppCategory;
      level?: DifficultyLevel;
      streak?: number;
      skipFlightProgress?: boolean;
    }): {
      newWardrobe: WardrobeItem[];
      newRewards: RewardItem[];
      earnedFlightTurn: boolean;
    } => {
      const newTotal = activeProfile.totalStars + opts.starsEarned;
      const newWardrobe = findNewlyUnlockedItems(
        activeProfile.unlockedItems,
        newTotal
      );
      const nextWardrobeIds = getUnlockedIdsForStars(
        newTotal,
        activeProfile.unlockedItems
      );

      const nextRewardIds = getUnlockedRewardIds(
        newTotal,
        activeProfile.unlockedRewards,
        {
          completedCategory: opts.completedCategory,
          level: opts.level,
          streak: opts.streak,
        }
      );
      const newRewards = findNewlyUnlockedRewards(
        activeProfile.unlockedRewards,
        nextRewardIds
      );

      const nextProgressRaw = opts.skipFlightProgress
        ? activeProfile.flightTurnProgress
        : activeProfile.flightTurnProgress + 1;
      const earnedFlightTurn = !opts.skipFlightProgress && nextProgressRaw >= 5;
      const nextProgress = earnedFlightTurn ? 0 : nextProgressRaw;
      const nextTurns = activeProfile.flightTurns + (earnedFlightTurn ? 1 : 0);

      setStore((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === activeProfile.id
            ? {
                ...p,
                totalStars: p.totalStars + opts.starsEarned,
                unlockedItems: nextWardrobeIds,
                unlockedRewards: nextRewardIds,
                flightTurnProgress: nextProgress,
                flightTurns: nextTurns,
              }
            : p
        ),
      }));

      return { newWardrobe, newRewards, earnedFlightTurn };
    },
    [
      activeProfile.flightTurnProgress,
      activeProfile.flightTurns,
      activeProfile.id,
      activeProfile.totalStars,
      activeProfile.unlockedItems,
      activeProfile.unlockedRewards,
    ]
  );

  const handleSelectMascot = useCallback((mascot: MascotId) => {
    setStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === prev.activeProfileId
          ? {
              ...p,
              mascot,
              unlockedItems: getUnlockedIdsForStars(p.totalStars, p.unlockedItems),
            }
          : p
      ),
    }));
  }, []);

  const handleEquipItem = useCallback(
    (category: WardrobeCategory, itemId: string) => {
      setStore((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === prev.activeProfileId
            ? {
                ...p,
                equippedWardrobe: {
                  ...p.equippedWardrobe,
                  [category]: itemId,
                },
              }
            : p
        ),
      }));
    },
    []
  );

  const handleSelectProfile = useCallback((profileId: string) => {
    setStore((prev) => ({
      ...prev,
      activeProfileId: profileId,
    }));
  }, []);

  const handleCreateProfile = useCallback((name: string, mascot: MascotId) => {
    const created = createPlayerProfile(name, mascot, 0);
    setStore((prev) => ({
      profiles: [...prev.profiles, created],
      activeProfileId: created.id,
    }));
  }, []);

  const handleDeleteProfile = useCallback((profileId: string) => {
    setStore((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const remaining = prev.profiles.filter((p) => p.id !== profileId);
      const nextActive =
        prev.activeProfileId === profileId
          ? remaining[0].id
          : prev.activeProfileId;
      return {
        profiles: remaining,
        activeProfileId: nextActive,
      };
    });
  }, []);

  const handleTriggerConfetti = useCallback((intensity: 'small' | 'big') => {
    setConfettiState((prev) => ({
      trigger: prev.trigger + 1,
      intensity,
    }));
  }, []);

  const handleBackToCategory = useCallback(() => {
    soundEngine.clearScheduled();
    stopSpeaking();
    setIsSkyRun(false);
    setGameState('TITLE_MENU');
  }, []);

  const handleBackToHome = useCallback(() => {
    soundEngine.clearScheduled();
    stopSpeaking();
    setIsSkyRun(false);
    setSelectedCategory(null);
    setGameState('TITLE_MENU');
  }, []);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#EAF3FF] via-[#F2F7FF] to-[#E3EEFF] text-slate-900 relative overflow-x-hidden">
      {/* Subtle Playroom Background Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sky-200/35 blur-2xl" />
        <div className="absolute top-1/3 -right-28 w-80 h-80 rounded-full bg-amber-200/25 blur-2xl" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-indigo-200/25 blur-2xl" />
      </div>

      <div className="relative z-10 min-h-dvh">
        {gameState === 'TITLE_MENU' ? (
          <TitleScreen
            profile={activeProfile}
            selectedCategory={selectedCategory}
            instrument={instrument}
            level={level}
            muted={muted}
            language={language}
            onChangeLanguage={setLanguage}
            onSelectCategory={setSelectedCategory}
            onSelectInstrument={setInstrument}
            onSelectLevel={setLevel}
            onSelectMascot={handleSelectMascot}
            onOpenProfiles={() => setShowProfiles(true)}
            onOpenWardrobe={() => setShowWardrobe(true)}
            onOpenRewards={() => setShowRewards(true)}
            onOpenDictionary={() => setShowDictionary(true)}
            onOpenParentalSettings={() => setShowParentalSettings(true)}
            onToggleMute={handleToggleMute}
            onStartMusicMode={handleStartMusicMode}
            onStartMathMode={handleStartMathMode}
            onStartEnglishMode={handleStartEnglishMode}
            onStartSkyRun={handleStartSkyRun}
          />
        ) : isSkyRun && selectedCategory ? (
          <FairyFlightStage
            profile={activeProfile}
            category={selectedCategory}
            level={level}
            instrument={instrument}
            muted={muted}
            language={language}
            externalLocked={parental.isLocked}
            onToggleMute={handleToggleMute}
            onConsumeFlightTurn={handleConsumeFlightTurn}
            onRecordProgress={handleRecordProgress}
            onTriggerConfetti={handleTriggerConfetti}
            onExit={handleBackToCategory}
          />
        ) : selectedCategory === 'math' ? (
          <MathStage
            profile={activeProfile}
            mode={activeMathMode}
            level={level}
            muted={muted}
            language={language}
            onSelectLevel={setLevel}
            onOpenWardrobe={() => setShowWardrobe(true)}
            onOpenRewards={() => setShowRewards(true)}
            onToggleMute={handleToggleMute}
            onRecordProgress={handleRecordProgress}
            onTriggerConfetti={handleTriggerConfetti}
            onLaunchSkyRun={() => handleStartSkyRun('math')}
            onBackToCategory={handleBackToCategory}
            onBackToHome={handleBackToHome}
            externalLocked={parental.isLocked}
          />
        ) : selectedCategory === 'english' ? (
          <EnglishStage
            profile={activeProfile}
            mode={activeEnglishMode}
            level={level}
            muted={muted}
            language={language}
            onSelectLevel={setLevel}
            onOpenWardrobe={() => setShowWardrobe(true)}
            onOpenRewards={() => setShowRewards(true)}
            onToggleMute={handleToggleMute}
            onRecordProgress={handleRecordProgress}
            onTriggerConfetti={handleTriggerConfetti}
            onLaunchSkyRun={() => handleStartSkyRun('english')}
            onBackToCategory={handleBackToCategory}
            onBackToHome={handleBackToHome}
            externalLocked={parental.isLocked}
          />
        ) : (
          <GameStage
            profile={activeProfile}
            mode={activeMusicMode}
            level={level}
            instrument={instrument}
            muted={muted}
            language={language}
            onSelectInstrument={setInstrument}
            onSelectLevel={setLevel}
            onOpenWardrobe={() => setShowWardrobe(true)}
            onOpenRewards={() => setShowRewards(true)}
            onToggleMute={handleToggleMute}
            onRecordProgress={handleRecordProgress}
            onTriggerConfetti={handleTriggerConfetti}
            onLaunchSkyRun={() => handleStartSkyRun('music')}
            onExitToMenu={handleBackToCategory}
            onBackToHome={handleBackToHome}
            externalLocked={parental.isLocked}
          />
        )}
      </div>

      {showProfiles && !parental.isLocked && (
        <ProfileModal
          profiles={store.profiles}
          activeProfileId={activeProfile.id}
          language={language}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfiles(false)}
        />
      )}

      {showWardrobe && !parental.isLocked && (
        <WardrobeModal
          profile={activeProfile}
          language={language}
          onEquipItem={handleEquipItem}
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {showRewards && !parental.isLocked && (
        <RewardsModal
          profile={activeProfile}
          language={language}
          onClose={() => setShowRewards(false)}
        />
      )}

      {showDictionary && !parental.isLocked && (
        <DictionaryModal
          muted={muted}
          language={language}
          onClose={() => setShowDictionary(false)}
        />
      )}

      {showParentalSettings && !parental.isLocked && (
        <ParentalSettingsModal
          settings={parental}
          language={language}
          onUpdateSettings={handleUpdateParentalSettings}
          onLockNow={handleLockNow}
          onResetTimer={handleResetTimer}
          onClose={() => setShowParentalSettings(false)}
        />
      )}

      {parental.isLocked && (
        <ParentalLockOverlay
          profile={activeProfile}
          settings={parental}
          language={language}
          onUnlock={handleUnlockScreen}
        />
      )}

      <OfflineIndicator language={language} />

      <ConfettiCanvas
        burstTrigger={confettiState.trigger}
        intensity={confettiState.intensity}
      />
    </div>
  );
}
