import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Moon, ShieldCheck } from 'lucide-react';
import { ParentalSettings, PlayerProfile } from '../types/game';
import { MascotStage } from './MascotStage';
import { ParentGateForm } from './ParentGateForm';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';

interface ParentalLockOverlayProps {
  profile: PlayerProfile;
  settings: ParentalSettings;
  language?: AppLanguage;
  onUnlock: () => void;
}

export function ParentalLockOverlay({
  profile,
  settings,
  language = 'en',
  onUnlock,
}: ParentalLockOverlayProps) {
  const [showGate, setShowGate] = useState(false);

  const reachedTimeLimit =
    settings.elapsedSeconds >= settings.timeLimitMinutes * 60;
  const t = TEXT[language].parental;

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#17153B] via-[#262364] to-[#1E293B] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.breakTitle}
    >
      {/* Subtle Starry Night Sky Accents */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.span
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity }}
          className="absolute top-[10%] left-[12%] text-amber-200 text-2xl select-none"
        >
          ✦
        </motion.span>
        <motion.span
          animate={{ opacity: [0.4, 0.95, 0.4] }}
          transition={{ duration: 2.8, delay: 0.7, repeat: Infinity }}
          className="absolute top-[16%] right-[14%] text-sky-200 text-xl select-none"
        >
          ★
        </motion.span>
        <motion.span
          animate={{ opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: 3.6, delay: 1.2, repeat: Infinity }}
          className="absolute bottom-[14%] left-[18%] text-indigo-200 text-lg select-none"
        >
          ✦
        </motion.span>
        <motion.span
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 3.0, delay: 0.4, repeat: Infinity }}
          className="absolute bottom-[18%] right-[16%] text-amber-100 text-2xl select-none"
        >
          ★
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-[34px] p-6 sm:p-8 bg-[#252259]/95 border-2 border-indigo-300/35 shadow-[0_24px_60px_rgba(0,0,0,0.45)] flex flex-col items-center gap-4 text-center my-auto"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-300/40 text-amber-200 flex items-center justify-center">
          <Moon className="w-6 h-6 fill-amber-200/30" />
        </div>

        {/* Sleeping Mascot */}
        <MascotStage
          mascot={profile.mascot}
          mood="sleeping"
          size="lg"
          equipped={profile.equippedWardrobe}
          interactive={false}
          variant="menu"
        />

        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.breakTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-indigo-100/90 leading-relaxed">
            {reachedTimeLimit
              ? t.breakTimeLimitMsg(profile.name, settings.timeLimitMinutes)
              : t.breakManualMsg(profile.name)}
          </p>
        </div>

        {!showGate ? (
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              setShowGate(true);
            }}
            style={{
              background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
              boxShadow: '0 6px 0 0 #312E81',
            }}
            className="toy-btn mt-1 min-h-[48px] px-6 py-2.5 rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-indigo-200/40 cursor-pointer"
          >
            <Lock className="w-5 h-5" />
            <span>{t.parentUnlock}</span>
          </button>
        ) : (
          <div className="w-full pt-2 border-t border-indigo-300/20 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{t.parentVerification}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  setShowGate(false);
                }}
                className="text-indigo-300 hover:text-white cursor-pointer"
              >
                {t.hide}
              </button>
            </div>

            <ParentGateForm
              expectedPin={settings.pin}
              showDefaultPinHint={false}
              submitLabel={t.unlockAndReset}
              darkSurface={true}
              language={language}
              onSuccess={onUnlock}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
