import { ParentalSettings, ParentalTimeLimitMinutes } from '../types/game';

const PARENTAL_STORAGE_KEY = 'melody_owl_parental_v1';

export const VALID_TIME_LIMITS: ParentalTimeLimitMinutes[] = [15, 30, 45, 60];

export const DEFAULT_PARENTAL_SETTINGS: ParentalSettings = {
  pin: '1234',
  pinConfigured: false,
  timeLimitMinutes: 30,
  elapsedSeconds: 0,
  isLocked: false,
};

export function loadParentalSettings(): ParentalSettings {
  try {
    const raw = window.localStorage.getItem(PARENTAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PARENTAL_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ParentalSettings>;
    const validPin =
      typeof parsed.pin === 'string' && /^\d{4}$/.test(parsed.pin)
        ? parsed.pin
        : '1234';
    const validLimit = VALID_TIME_LIMITS.includes(
      parsed.timeLimitMinutes as ParentalTimeLimitMinutes
    )
      ? (parsed.timeLimitMinutes as ParentalTimeLimitMinutes)
      : 30;
    const safeElapsed =
      typeof parsed.elapsedSeconds === 'number' &&
      Number.isFinite(parsed.elapsedSeconds) &&
      parsed.elapsedSeconds >= 0
        ? Math.floor(parsed.elapsedSeconds)
        : 0;

    return {
      pin: validPin,
      pinConfigured: Boolean(parsed.pinConfigured),
      timeLimitMinutes: validLimit,
      elapsedSeconds: safeElapsed,
      isLocked: Boolean(parsed.isLocked),
    };
  } catch {
    return { ...DEFAULT_PARENTAL_SETTINGS };
  }
}

export function saveParentalSettings(settings: ParentalSettings): void {
  try {
    window.localStorage.setItem(PARENTAL_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export interface AdultMathChallenge {
  question: string;
  answer: number;
}

export function generateAdultMathChallenge(): AdultMathChallenge {
  const kind = Math.floor(Math.random() * 3);
  if (kind === 0) {
    // e.g. 24 × 3 + 15
    const a = 16 + Math.floor(Math.random() * 21); // 16..36
    const b = 3 + Math.floor(Math.random() * 6); // 3..8
    const c = 11 + Math.floor(Math.random() * 24); // 11..34
    return {
      question: `${a} × ${b} + ${c}`,
      answer: a * b + c,
    };
  }
  if (kind === 1) {
    // e.g. 28 × 4 − 17
    const a = 15 + Math.floor(Math.random() * 22); // 15..36
    const b = 3 + Math.floor(Math.random() * 5); // 3..7
    const c = 12 + Math.floor(Math.random() * 25); // 12..36
    return {
      question: `${a} × ${b} − ${c}`,
      answer: a * b - c,
    };
  }
  // e.g. 14 × 6 + 29
  const a = 12 + Math.floor(Math.random() * 14); // 12..25
  const b = 4 + Math.floor(Math.random() * 6); // 4..9
  const c = 15 + Math.floor(Math.random() * 30); // 15..44
  return {
    question: `${a} × ${b} + ${c}`,
    answer: a * b + c,
  };
}

export function formatRemainingTime(remainingSeconds: number): string {
  const clamped = Math.max(0, Math.floor(remainingSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
