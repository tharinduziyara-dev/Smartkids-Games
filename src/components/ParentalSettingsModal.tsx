import { FormEvent, useState } from 'react';
import { Check, Clock, KeyRound, Lock, RotateCcw, Shield, X } from 'lucide-react';
import { ParentalSettings, ParentalTimeLimitMinutes } from '../types/game';
import { ParentGateForm } from './ParentGateForm';
import { VALID_TIME_LIMITS, formatRemainingTime } from '../utils/parentalStorage';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';

interface ParentalSettingsModalProps {
  settings: ParentalSettings;
  language?: AppLanguage;
  onUpdateSettings: (patch: Partial<ParentalSettings>) => void;
  onLockNow: () => void;
  onResetTimer: () => void;
  onClose: () => void;
}

export function ParentalSettingsModal({
  settings,
  language = 'en',
  onUpdateSettings,
  onLockNow,
  onResetTimer,
  onClose,
}: ParentalSettingsModalProps) {
  const [verified, setVerified] = useState(false);
  const [newPin, setNewPin] = useState(settings.pin);
  const [pinSavedNotice, setPinSavedNotice] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const t = TEXT[language].parental;

  const totalLimitSeconds = settings.timeLimitMinutes * 60;
  const remainingSeconds = Math.max(0, totalLimitSeconds - settings.elapsedSeconds);

  const handleSavePin = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newPin.trim();
    if (!/^\d{4}$/.test(trimmed)) {
      soundEngine.playGentleOops();
      setPinError(t.pinError);
      setPinSavedNotice(null);
      return;
    }
    soundEngine.playCorrectChime();
    onUpdateSettings({ pin: trimmed, pinConfigured: true });
    setPinError(null);
    setPinSavedNotice(t.pinSaved);
    window.setTimeout(() => setPinSavedNotice(null), 2200);
  };

  return (
    <div
      className="safe-modal-overlay fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.settingsTitle}
    >
      <div className="clay-surface rounded-[32px] p-4 sm:p-7 w-full max-w-md border-2 border-white flex flex-col gap-4 my-auto max-h-[88dvh] overflow-hidden">
        {/* Header */}
        <div className="app-header-bar">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-none truncate">
                {t.settingsTitle}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 truncate">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              setConfirmClose(true);
            }}
            aria-label="Close parent settings"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pr-0.5">

        {!verified ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-slate-600 text-center">
              {t.verifyPrompt}
            </p>
            <ParentGateForm
              expectedPin={settings.pin}
              showDefaultPinHint={!settings.pinConfigured}
              submitLabel={t.openSettingsBtn}
              language={language}
              onSuccess={() => setVerified(true)}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Active Timer Status */}
            <div className="clay-card rounded-2xl p-4 border-2 border-sky-100 bg-sky-50/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-500">
                    {t.timeRemaining}
                  </div>
                  <div className="font-display text-xl font-bold text-slate-900 tabular-nums">
                    {formatRemainingTime(remainingSeconds)}{' '}
                    <span className="text-xs font-sans font-semibold text-slate-500">
                      / {t.minutesUnit(settings.timeLimitMinutes)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playTapPop();
                  onResetTimer();
                }}
                style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
                className="toy-btn min-h-[40px] px-3 py-1.5 rounded-xl bg-white text-slate-700 font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.reset}</span>
              </button>
            </div>

            {/* Time Limit Picker (15, 30, 45, 60 mins) */}
            <div className="flex flex-col gap-2">
              <span className="font-display text-sm font-bold text-slate-800">
                {t.playTimeLimit}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {VALID_TIME_LIMITS.map((mins: ParentalTimeLimitMinutes) => {
                  const selected = settings.timeLimitMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        soundEngine.playTapPop();
                        onUpdateSettings({ timeLimitMinutes: mins });
                      }}
                      style={
                        selected
                          ? {
                              background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                              boxShadow: '0 4px 0 0 #075985',
                            }
                          : { boxShadow: '0 4px 0 0 #CBD5E1' }
                      }
                      className={`toy-btn min-h-[44px] rounded-2xl font-display text-xs sm:text-sm font-bold border-2 cursor-pointer tabular-nums ${
                        selected
                          ? 'text-white border-white/50'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.minutesUnit(mins)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Set / Change 4-Digit Parent PIN */}
            <form
              onSubmit={handleSavePin}
              className="clay-card rounded-2xl p-4 border-2 border-slate-200 flex flex-col gap-2.5"
            >
              <label
                htmlFor="parent-pin-input"
                className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>{t.changePinLabel}</span>
              </label>

              <div className="flex gap-2">
                <input
                  id="parent-pin-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setNewPin(digitsOnly);
                    setPinError(null);
                  }}
                  placeholder={t.pinPlaceholder}
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-white border-2 border-slate-200 font-display text-lg font-bold tracking-widest text-slate-900 text-center tabular-nums focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                    boxShadow: '0 5px 0 0 #065F46',
                  }}
                  className="toy-btn min-h-[44px] px-4 py-2 rounded-xl text-white font-display text-sm font-bold flex items-center gap-1.5 border border-white/40 cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t.savePin}</span>
                </button>
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-600">{pinError}</p>
              )}
              {pinSavedNotice && (
                <p className="text-xs font-bold text-emerald-600">{pinSavedNotice}</p>
              )}
            </form>

            {/* Manual Lock Screen Anytime */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                onLockNow();
                onClose();
              }}
              style={{
                background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
                boxShadow: '0 6px 0 0 #312E81',
              }}
              className="toy-btn w-full min-h-[50px] rounded-2xl text-white font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 border-2 border-white/40 cursor-pointer"
            >
              <Lock className="w-5 h-5" />
              <span>{t.lockNow}</span>
            </button>
          </div>
        )}
        </div>
      </div>

      <ConfirmCloseDialog
        open={confirmClose}
        language={language}
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      />
    </div>
  );
}
