import { DifficultyLevel, MathMode } from '../types/game';

export interface MathProblem {
  expression: string;
  answer: number;
  choices: number[];
  hint: string;
  hintSi: string;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  const offsets = [-10, -4, -3, -2, -1, 1, 2, 3, 4, 10];

  let safety = 0;
  while (set.size < 4 && safety < 40) {
    safety++;
    const delta = offsets[Math.floor(Math.random() * offsets.length)];
    const candidate = answer + delta;
    if (candidate >= 0 && candidate !== answer) {
      set.add(candidate);
    }
  }

  let fallback = 1;
  while (set.size < 4) {
    if (!set.has(answer + fallback)) set.add(answer + fallback);
    fallback++;
  }

  return Array.from(set).sort((a, b) => a - b);
}

export function generateMathProblem(
  mode: MathMode,
  level: DifficultyLevel
): MathProblem {
  const resolvedOp: Exclude<MathMode, 'MIXED'> =
    mode === 'MIXED'
      ? (['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION'] as const)[
          randInt(0, 3)
        ]
      : mode;

  // EXTREME: Multi-step expressions with parentheses & order of operations
  if (level === 'extreme') {
    const pattern = randInt(0, 3);
    if (resolvedOp === 'ADDITION' || (mode === 'MIXED' && pattern === 0)) {
      const a = randInt(4, 9);
      const b = randInt(5, 12);
      const c = randInt(12, 35);
      const answer = a * b + c;
      return {
        expression: `${a} × ${b} + ${c}`,
        answer,
        choices: buildChoices(answer),
        hint: `Multiply ${a} × ${b} first, then add ${c}!`,
        hintSi: `පළමුව ${a} × ${b} ගුණ කර, පසුව ${c} එකතු කරන්න!`,
      };
    }

    if (resolvedOp === 'SUBTRACTION' || (mode === 'MIXED' && pattern === 1)) {
      const a = randInt(6, 12);
      const b = randInt(5, 11);
      const c = randInt(8, 28);
      const answer = a * b - c;
      return {
        expression: `${a} × ${b} - ${c}`,
        answer,
        choices: buildChoices(answer),
        hint: `Multiply ${a} × ${b} first, then subtract ${c}!`,
        hintSi: `පළමුව ${a} × ${b} ගුණ කර, පසුව ${c} අඩු කරන්න!`,
      };
    }

    if (resolvedOp === 'MULTIPLICATION' || (mode === 'MIXED' && pattern === 2)) {
      const a = randInt(7, 16);
      const b = randInt(4, 12);
      const mult = randInt(3, 8);
      const answer = (a + b) * mult;
      return {
        expression: `(${a} + ${b}) × ${mult}`,
        answer,
        choices: buildChoices(answer),
        hint: `Add (${a} + ${b}) inside parentheses first, then multiply by ${mult}!`,
        hintSi: `පළමුව වරහන් ඇතුළත (${a} + ${b}) එකතු කර, පසුව ${mult}න් ගුණ කරන්න!`,
      };
    }

    // Complex division + add/sub
    const divisor = randInt(4, 12);
    const quotient = randInt(5, 14);
    const dividend = divisor * quotient;
    const extra = randInt(12, 34);
    const answer = quotient + extra;
    return {
      expression: `(${dividend} ÷ ${divisor}) + ${extra}`,
      answer,
      choices: buildChoices(answer),
      hint: `Divide ${dividend} ÷ ${divisor} first, then add ${extra}!`,
      hintSi: `පළමුව ${dividend} ÷ ${divisor} බෙදා, පසුව ${extra} එකතු කරන්න!`,
    };
  }

  // BEGINNER, INTERMEDIATE, ADVANCED
  if (resolvedOp === 'ADDITION') {
    const [min, max] =
      level === 'beginner'
        ? [1, 9]
        : level === 'intermediate'
        ? [10, 49]
        : [35, 185];
    const a = randInt(min, max);
    const b = randInt(min, max);
    const answer = a + b;
    return {
      expression: `${a} + ${b}`,
      answer,
      choices: buildChoices(answer),
      hint: `Count up ${b} from ${a}!`,
      hintSi: `${a} සිට ඉදිරියට ${b}ක් ගණන් කරන්න!`,
    };
  }

  if (resolvedOp === 'SUBTRACTION') {
    const [min, max] =
      level === 'beginner'
        ? [1, 9]
        : level === 'intermediate'
        ? [12, 65]
        : [45, 220];
    const x = randInt(min, max);
    const y = randInt(min, max);
    const a = Math.max(x, y);
    const b = Math.min(x, y);
    const answer = a - b;
    return {
      expression: `${a} - ${b}`,
      answer,
      choices: buildChoices(answer),
      hint: `Take away ${b} from ${a}!`,
      hintSi: `${a}න් ${b}ක් අඩු කර ඉතිරිය සොයන්න!`,
    };
  }

  if (resolvedOp === 'MULTIPLICATION') {
    const [aMin, aMax, bMin, bMax] =
      level === 'beginner'
        ? [1, 5, 1, 5]
        : level === 'intermediate'
        ? [2, 10, 2, 10]
        : [6, 16, 4, 12];
    const a = randInt(aMin, aMax);
    const b = randInt(bMin, bMax);
    const answer = a * b;
    return {
      expression: `${a} × ${b}`,
      answer,
      choices: buildChoices(answer),
      hint: `Think of ${a} groups of ${b}!`,
      hintSi: `${b} බැගින් වූ කණ්ඩායම් ${a}ක් ගණන් කරන්න!`,
    };
  }

  // DIVISION (guaranteed clean whole-number quotient)
  const [dMin, dMax, qMin, qMax] =
    level === 'beginner'
      ? [2, 5, 1, 5]
      : level === 'intermediate'
      ? [2, 10, 2, 10]
      : [4, 14, 5, 16];
  const divisor = randInt(dMin, dMax);
  const quotient = randInt(qMin, qMax);
  const dividend = divisor * quotient;
  return {
    expression: `${dividend} ÷ ${divisor}`,
    answer: quotient,
    choices: buildChoices(quotient),
    hint: `How many ${divisor}s fit into ${dividend}?`,
    hintSi: `${dividend} ඇතුළත ${divisor} ඒවා කීයක් තිබේද?`,
  };
}
