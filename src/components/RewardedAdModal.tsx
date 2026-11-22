import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Film, Play, Sparkles, Unlock, X } from 'lucide-react';
import { MascotId, WardrobeItem } from '../types/game';
import { MascotStage } from './MascotStage';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';
import { isNativeAdMobSupported, showRewardedAd } from '../admob';

export type RewardedUnlockTarget =
  | { kind: 'character'; mascotId: MascotId; title: string }
  | { kind: 'wardrobe'; item: WardrobeItem; title: string };

interface RewardedAdModalProps {
  target: RewardedUnlockTarget | null;
  language?: AppLanguage;
  onRewardGranted: (target: RewardedUnlockTarget) => void;
  onClose: () => void;
}

const AD_DURATION_SECONDS = 5;

export function RewardedAdModal({
  target,
  language = 'en',
  onRewardGranted,
  onClose,
}: RewardedAdModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [loadingNativeAd, setLoadingNativeAd] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);

  const onRewardGrantedRef = useRef(onRewardGranted);
  const onCloseRef = useRef(onClose);
  onRewardGrantedRef.current = onRewardGranted;
  onCloseRef.current = onClose;

  const t = TEXT[language].rewardedAd;

  useEffect(() => {
    if (!target) {
      setLoadingNativeAd(false);
      setFallbackActive(false);
      return;
    }

    setSecondsLeft(AD_DURATION_SECONDS);
    setConfirmSkip(false);

    if (!isNativeAdMobSupported()) {
      setLoadingNativeAd(false);
      setFallbackActive(true);
      return;
    }

    let cancelled = false;
    setLoadingNativeAd(true);
    setFallbackActive(false);

    void showRewardedAd().then((result) => {
      if (cancelled) return;
      setLoadingNativeAd(false);

      if (result.rewarded) {
        soundEngine.playUnlockFanfare();
        onRewardGrantedRef.current(target);
        onCloseRef.current();
        return;
      }

      if (result.useWebFallback) {
        setFallbackActive(true);
        return;
      }

      // User closed the native rewarded ad before finishing
      onCloseRef.current();
    });

    return () => {
      cancelled = true;
    };
  }, [target]);

  useEffect(() => {
    if (!target || !fallbackActive) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [target, fallbackActive]);

  useEffect(() => {
    if (target && fallbackActive && secondsLeft === 0) {
      soundEngine.playUnlockFanfare();
    }
  }, [target, fallbackActive, secondsLeft]);

  if (!target) return null;

  const isReady = fallbackActive && secondsLeft === 0;
  const progressPct = loadingNativeAd
    ? 20
    : Math.round(
        ((AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS) * 100
      );

  const handleCloseAttempt = () => {
    soundEngine.playTapPop();
    if (isReady) {
      onRewardGranted(target);
      onClose();
      return;
    }
    setConfirmSkip(true);
  };

  const handleClaim = () => {
    if (!isReady) return;
    soundEngine.playMagicWand();
    onRewardGranted(target);
    onClose();
  };

  return (
    <div
      className="safe-modal-overlay fixed inset-0 z-[70] bg-slate-950/75 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t.unlockingTitle(target.title)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="clay-surface rounded-[30px] p-5 sm:p-6 w-full max-w-md border-2 border-white flex flex-col gap-4 shadow-2xl"
      >
        {/* Top Bar */}
        <div className="app-header-bar">
          <div className="flex items-center gap-2 text-indigo-700 font-display font-bold text-sm min-w-0 flex-1">
            <Film className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.badge}</span>
          </div>

          <button
            type="button"
            onClick={handleCloseAttempt}
            aria-label={t.skipBtn}
            style={{ boxShadow: '0 3px 0 0 #CBD5E1' }}
            className="toy-btn w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simulated Kid-Safe Video Player Card */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white relative overflow-hidden border-2 border-white/40 flex flex-col items-center text-center gap-3">
          {/* Animated Background Notes & Sparkles */}
          <motion.span
            aria-hidden="true"
            animate={{ y: [-4, 6, -4], rotate: [-8, 8, -8] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="absolute top-3 left-4 text-2xl opacity-60 select-none"
          >
            ♫
          </motion.span>
          <motion.span
            aria-hidden="true"
            animate={{ y: [5, -5, 5], rotate: [10, -10, 10] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute bottom-4 right-5 text-2xl opacity-60 select-none"
          >
            ✨
          </motion.span>

          {/* Prize Preview */}
          <div className="w-28 h-28 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            {target.kind === 'character' ? (
              <MascotStage
                mascot={target.mascotId}
                mood={isReady ? 'celebrating' : 'happy'}
                size="sm"
                interactive={false}
              />
            ) : (
              <div
                style={{
                  background: `linear-gradient(135deg, ${target.item.primaryColor} 0%, ${target.item.secondaryColor} 100%)`,
                }}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center"
              >
                <Sparkles className="w-9 h-9 text-white drop-shadow" />
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              {t.unlockingTitle(target.title)}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-white/90 mt-1">
              {isReady ? t.readyToUnlock : t.adBody}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex flex-col gap-1.5 pt-1">
            <div className="w-full h-3 rounded-full bg-white/25 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-white/90 tabular-nums">
              <span className="inline-flex items-center gap-1">
                {isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                {isReady
                  ? t.readyToUnlock
                  : loadingNativeAd
                  ? t.loadingAd
                  : t.watchingHint}
              </span>
              <span>
                {isReady ? '100%' : loadingNativeAd ? '...' : `${secondsLeft}s`}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {isReady ? (
          <button
            type="button"
            onClick={handleClaim}
            style={{
              background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
              boxShadow: '0 6px 0 0 #065F46',
            }}
            className="toy-btn min-h-[52px] w-full px-5 rounded-2xl text-white font-display text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer"
          >
            <Unlock className="w-5 h-5" />
            <span>{t.claimBtn}</span>
          </button>
        ) : (
          <div className="min-h-[52px] w-full rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-600 font-display text-base font-bold tabular-nums">
            {loadingNativeAd ? t.loadingAd : t.secondsRemaining(secondsLeft)}
          </div>
        )}
      </motion.div>

      <ConfirmCloseDialog
        open={confirmSkip}
        language={language}
        message={t.skipWarning}
        onConfirm={() => {
          setConfirmSkip(false);
          onClose();
        }}
        onCancel={() => setConfirmSkip(false)}
      />
    </div>
  );
}
