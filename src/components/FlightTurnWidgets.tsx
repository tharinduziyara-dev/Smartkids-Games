import { Play, Sparkles, Wand2 } from 'lucide-react';
import { EquippedWardrobe } from '../types/game';
import { AppLanguage, TEXT } from '../i18n/translations';
import { MascotStage } from './MascotStage';
import { soundEngine } from '../audio/soundEngine';

interface FlightTurnProgressStripProps {
  progress: number; // 0..4 (or 5 during 5/5 celebration)
  turnsAvailable: number;
  language?: AppLanguage;
}

export function FlightTurnProgressStrip({
  progress,
  turnsAvailable,
  language = 'en',
}: FlightTurnProgressStripProps) {
  const st = TEXT[language].skyRun;
  const clamped = Math.max(0, Math.min(5, progress));

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-bold text-slate-600"
      aria-label={`${st.turnProgressLabel}: ${clamped}/5`}
    >
      <div className="flex items-center gap-1.5 text-pink-600">
        <Wand2 className="w-4 h-4 shrink-0" />
        <span>{st.turnProgressLabel}:</span>
        <span className="font-display text-sm sm:text-base font-bold text-slate-900 tabular-nums">
          {clamped}/5
        </span>
      </div>

      {/* 5 Clean Progress Segments */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, idx) => {
          const filled = idx < clamped;
          return (
            <span
              key={idx}
              className={`h-2 w-4 sm:w-5 rounded-full transition-all duration-200 ${
                filled
                  ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-[0_2px_0_0_#9D174D]'
                  : 'bg-white/80 border border-slate-200'
              }`}
            />
          );
        })}
      </div>

      {turnsAvailable > 0 && (
        <>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="text-indigo-700 tabular-nums">
            {st.earnedTurnsLabel(turnsAvailable)}
          </span>
        </>
      )}
    </div>
  );
}

interface FlightTurnRewardModalProps {
  open: boolean;
  equippedWardrobe: EquippedWardrobe;
  turnsAvailable: number;
  language?: AppLanguage;
  onPlaySkyRun: () => void;
  onContinue: () => void;
}

export function FlightTurnRewardModal({
  open,
  equippedWardrobe,
  turnsAvailable,
  language = 'en',
  onPlaySkyRun,
  onContinue,
}: FlightTurnRewardModalProps) {
  if (!open) return null;

  const st = TEXT[language].skyRun;

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/55 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={st.rewardPopupTitle}
    >
      <div className="clay-surface rounded-[34px] p-6 sm:p-8 w-full max-w-md border-2 border-white flex flex-col items-center gap-4 text-center shadow-2xl bg-gradient-to-b from-pink-50 via-white to-sky-50">
        <div className="flex items-center gap-1.5 text-pink-600 font-display text-sm font-bold">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>5 / 5</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{st.earnedTurnsLabel(turnsAvailable)}</span>
        </div>

        <MascotStage
          mascot="fairy"
          mood="celebrating"
          size="sm"
          equipped={equippedWardrobe}
          interactive={false}
          variant="menu"
        />

        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {st.rewardPopupTitle}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            {st.rewardPopupSubtitle}
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playMagicWand();
              onPlaySkyRun();
            }}
            style={{
              background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
              boxShadow: '0 6px 0 0 #9D174D, 0 10px 18px -4px rgba(219, 39, 119, 0.35)',
            }}
            className="toy-btn w-full min-h-[52px] px-5 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/50 cursor-pointer whitespace-nowrap"
          >
            <Wand2 className="w-5 h-5 shrink-0" />
            <span>{st.rewardPopupPlayBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onContinue();
            }}
            style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
            className="toy-btn w-full min-h-[46px] px-5 py-2 rounded-2xl bg-white text-slate-700 font-display text-base font-bold flex items-center justify-center gap-2 border-2 border-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{st.rewardPopupContinueBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
