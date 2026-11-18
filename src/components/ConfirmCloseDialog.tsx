import { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';

interface ConfirmCloseDialogProps {
  open: boolean;
  language?: AppLanguage;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmCloseDialog({
  open,
  language = 'en',
  message,
  onConfirm,
  onCancel,
}: ConfirmCloseDialogProps) {
  const t = TEXT[language].common;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        soundEngine.playTapPop();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-close-title"
      aria-describedby="confirm-close-desc"
    >
      <div className="clay-surface rounded-[32px] p-6 sm:p-7 w-full max-w-sm border-2 border-white flex flex-col items-center gap-4 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center border-2 border-amber-200 shadow-inner">
          <HelpCircle className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <h3
            id="confirm-close-title"
            className="font-display text-2xl sm:text-3xl font-bold text-slate-900"
          >
            {t.confirmCloseTitle}
          </h3>
          <p
            id="confirm-close-desc"
            className="mt-1.5 text-sm sm:text-base font-semibold text-slate-600"
          >
            {message ?? t.confirmCloseMessage}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onCancel();
            }}
            style={{ boxShadow: '0 5px 0 0 #CBD5E1' }}
            className="toy-btn min-h-[48px] px-4 rounded-2xl bg-slate-100 text-slate-700 font-display text-lg font-bold border-2 border-slate-200 cursor-pointer"
          >
            {t.no}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onConfirm();
            }}
            style={{
              background: 'linear-gradient(180deg, #FB7185 0%, #E11D48 100%)',
              boxShadow: '0 6px 0 0 #9F1239',
            }}
            className="toy-btn min-h-[48px] px-4 rounded-2xl text-white font-display text-lg font-bold border-2 border-white/40 cursor-pointer"
          >
            {t.yes}
          </button>
        </div>
      </div>
    </div>
  );
}
