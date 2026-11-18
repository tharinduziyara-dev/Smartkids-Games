import { FormEvent, useEffect, useState } from 'react';
import { Calculator, Check, Delete, KeyRound, RefreshCw } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import {
  AdultMathChallenge,
  generateAdultMathChallenge,
} from '../utils/parentalStorage';
import { AppLanguage, TEXT } from '../i18n/translations';

interface ParentGateFormProps {
  expectedPin: string;
  showDefaultPinHint?: boolean;
  submitLabel: string;
  darkSurface?: boolean;
  language?: AppLanguage;
  onSuccess: () => void;
}

type GateMethod = 'pin' | 'math';

export function ParentGateForm({
  expectedPin,
  showDefaultPinHint = false,
  submitLabel,
  darkSurface = false,
  language = 'en',
  onSuccess,
}: ParentGateFormProps) {
  const [method, setMethod] = useState<GateMethod>('pin');
  const [pinInput, setPinInput] = useState('');
  const [mathChallenge, setMathChallenge] = useState<AdultMathChallenge>(() =>
    generateAdultMathChallenge()
  );
  const [mathInput, setMathInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = TEXT[language].parental;

  const handlePinDigit = (digit: string) => {
    soundEngine.playTapPop();
    setErrorMsg(null);
    setPinInput((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        if (next === expectedPin) {
          window.setTimeout(() => {
            soundEngine.playCorrectChime();
            onSuccess();
          }, 90);
        } else {
          window.setTimeout(() => {
            soundEngine.playGentleOops();
            setErrorMsg(t.errWrongPin);
            setPinInput('');
          }, 160);
        }
      }
      return next;
    });
  };

  const handlePinBackspace = () => {
    soundEngine.playTapPop();
    setErrorMsg(null);
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handlePinSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (pinInput.length < 4) {
      setErrorMsg(t.errNeed4Digits);
      return;
    }
    if (pinInput === expectedPin) {
      soundEngine.playCorrectChime();
      onSuccess();
    } else {
      soundEngine.playGentleOops();
      setErrorMsg(t.errWrongPin);
      setPinInput('');
    }
  };

  const handleMathSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(mathInput.trim(), 10);
    if (Number.isNaN(parsed)) {
      setErrorMsg(t.errEnterNumber);
      return;
    }
    if (parsed === mathChallenge.answer) {
      soundEngine.playCorrectChime();
      onSuccess();
    } else {
      soundEngine.playGentleOops();
      setErrorMsg(t.errWrongMath);
      setMathInput('');
      setMathChallenge(generateAdultMathChallenge());
    }
  };

  useEffect(() => {
    if (method !== 'pin') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      } else if (e.key === 'Enter' && pinInput.length === 4) {
        handlePinSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Method Switcher */}
      <div
        className={`grid grid-cols-2 gap-1.5 p-1 rounded-2xl ${
          darkSurface ? 'bg-slate-900/50 border border-white/15' : 'bg-slate-100'
        }`}
        role="tablist"
        aria-label="Parent Verification Method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={method === 'pin'}
          onClick={() => {
            soundEngine.playTapPop();
            setErrorMsg(null);
            setMethod('pin');
          }}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            method === 'pin'
              ? 'bg-indigo-600 text-white shadow-sm'
              : darkSurface
              ? 'text-indigo-200 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{t.tabPin}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={method === 'math'}
          onClick={() => {
            soundEngine.playTapPop();
            setErrorMsg(null);
            setMethod('math');
          }}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            method === 'math'
              ? 'bg-indigo-600 text-white shadow-sm'
              : darkSurface
              ? 'text-indigo-200 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t.tabMath}</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-3 py-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs sm:text-sm font-bold text-center"
        >
          {errorMsg}
        </div>
      )}

      {method === 'pin' ? (
        <div className="flex flex-col items-center gap-3">
          {showDefaultPinHint && (
            <p
              className={`text-xs font-semibold text-center ${
                darkSurface ? 'text-indigo-200' : 'text-slate-500'
              }`}
            >
              {t.defaultPinHintPrefix}{' '}
              <span className="font-bold tabular-nums">1234</span>{' '}
              {t.defaultPinHintSuffix}
            </p>
          )}

          {/* 4 PIN Dots */}
          <div className="flex items-center justify-center gap-3 py-1" aria-label="PIN progress">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < pinInput.length;
              return (
                <div
                  key={idx}
                  className={`w-10 h-11 rounded-2xl border-2 flex items-center justify-center font-display text-xl font-bold transition-all ${
                    filled
                      ? 'bg-indigo-600 border-indigo-300 text-white scale-105 shadow-sm'
                      : darkSurface
                      ? 'bg-slate-900/50 border-white/25 text-white/30'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                >
                  {filled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Numeric PIN Pad */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[260px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
                className="toy-btn min-h-[44px] rounded-2xl bg-white text-slate-900 font-display text-xl font-bold border-2 border-slate-200 cursor-pointer"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handlePinBackspace}
              aria-label="Backspace"
              style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
              className="toy-btn min-h-[44px] rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
              className="toy-btn min-h-[44px] rounded-2xl bg-white text-slate-900 font-display text-xl font-bold border-2 border-slate-200 cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={() => handlePinSubmit()}
              aria-label={submitLabel}
              style={{
                background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                boxShadow: '0 4px 0 0 #065F46',
              }}
              className="toy-btn min-h-[44px] rounded-2xl text-white flex items-center justify-center border border-white/40 cursor-pointer"
            >
              <Check className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleMathSubmit} className="flex flex-col gap-3">
          <div
            className={`rounded-2xl p-4 border-2 flex items-center justify-between gap-2 ${
              darkSurface
                ? 'bg-slate-900/55 border-white/20 text-white'
                : 'bg-sky-50 border-sky-200 text-slate-900'
            }`}
          >
            <div className="font-display text-2xl sm:text-3xl font-bold tabular-nums">
              {mathChallenge.question} = ?
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapPop();
                setErrorMsg(null);
                setMathInput('');
                setMathChallenge(generateAdultMathChallenge());
              }}
              aria-label="New math question"
              className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                darkSurface
                  ? 'bg-white/10 text-indigo-100 hover:bg-white/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <input
            type="number"
            inputMode="numeric"
            value={mathInput}
            onChange={(e) => {
              setErrorMsg(null);
              setMathInput(e.target.value);
            }}
            placeholder={t.enterAnswerPlaceholder}
            className="w-full min-h-[46px] px-4 py-2 rounded-2xl bg-white border-2 border-slate-200 text-center font-display text-xl font-bold text-slate-900 tabular-nums focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!mathInput.trim()}
            style={{
              background: mathInput.trim()
                ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)',
              boxShadow: mathInput.trim() ? '0 5px 0 0 #065F46' : '0 3px 0 0 #64748B',
            }}
            className="toy-btn min-h-[46px] w-full rounded-2xl text-white font-display text-base font-bold flex items-center justify-center gap-2 border border-white/40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{submitLabel}</span>
          </button>
        </form>
      )}
    </div>
  );
}
