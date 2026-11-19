import {
  AppCategory,
  CHORD_QUALITY_BY_ID,
  ChordQualityId,
  DifficultyLevel,
  LEVEL_CONFIGS,
  NOTE_BY_ID,
  NoteId,
  semitoneToFreq,
} from '../types/game';
import { ENGLISH_WORDS, EnglishWordItem } from './englishWords';
import { generateMathProblem } from './mathProblems';

export type SkyRunChallenge =
  | {
      kind: 'math';
      expression: string;
      answer: number;
      choices: number[];
      hint: string;
      hintSi: string;
    }
  | {
      kind: 'english';
      target: EnglishWordItem;
      correctSpelling: string;
      choices: string[];
    }
  | {
      kind: 'music_note';
      noteId: NoteId;
      freq: number;
      label: string;
      choices: Array<{ id: NoteId; label: string }>;
    }
  | {
      kind: 'music_chord';
      qualityId: ChordQualityId;
      rootNoteId: NoteId;
      freqs: number[];
      label: string;
      choices: Array<{ id: ChordQualityId; label: string }>;
    };

function buildSpellingDistractors(word: string): string[] {
  const candidates = new Set<string>();
  const lower = word.toLowerCase();

  // 1. Swap two adjacent letters
  for (let i = 0; i < lower.length - 1; i++) {
    if (lower[i] !== lower[i + 1]) {
      const swapped =
        lower.slice(0, i) + lower[i + 1] + lower[i] + lower.slice(i + 2);
      if (swapped !== lower) candidates.add(swapped);
    }
  }

  // 2. Replace a vowel with another vowel
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  for (let i = 0; i < lower.length; i++) {
    if (vowels.includes(lower[i])) {
      for (const v of vowels) {
        if (v !== lower[i]) {
          candidates.add(lower.slice(0, i) + v + lower.slice(i + 1));
        }
      }
    }
  }

  // 3. Drop or double a middle letter
  if (lower.length >= 4) {
    const mid = Math.floor(lower.length / 2);
    candidates.add(lower.slice(0, mid) + lower.slice(mid + 1));
    candidates.add(lower.slice(0, mid) + lower[mid] + lower.slice(mid));
  }

  const picked = Array.from(candidates)
    .filter((w) => w !== lower)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  while (picked.length < 3) {
    const fallback = `${lower}${picked.length === 0 ? 'e' : picked.length === 1 ? 's' : 'y'}`;
    if (!picked.includes(fallback)) picked.push(fallback);
  }

  return [lower, ...picked].sort(() => Math.random() - 0.5);
}

export function generateSkyRunChallenge(
  category: AppCategory,
  level: DifficultyLevel,
  roundIndex: number
): SkyRunChallenge {
  if (category === 'math') {
    const math = generateMathProblem('MIXED', level);
    return {
      kind: 'math',
      ...math,
    };
  }

  if (category === 'english') {
    const pool = ENGLISH_WORDS[level];
    const target = pool[Math.floor(Math.random() * pool.length)];
    return {
      kind: 'english',
      target,
      correctSpelling: target.word.toLowerCase(),
      choices: buildSpellingDistractors(target.word),
    };
  }

  // Music category: alternate between Note Identification & Chord Identification
  const config = LEVEL_CONFIGS[level];
  const askChord = roundIndex % 2 === 1;

  if (askChord && config.chordQualities.length >= 2) {
    const qualities = config.chordQualities;
    const targetQual = qualities[Math.floor(Math.random() * qualities.length)];
    const rootPool = config.notePool;
    const rootId = rootPool[Math.floor(Math.random() * rootPool.length)];
    const rootNote = NOTE_BY_ID[rootId];
    const qDef = CHORD_QUALITY_BY_ID[targetQual];
    const freqs = qDef.intervals.map((semi) => semitoneToFreq(rootNote.semitone + semi));

    const distractors = qualities
      .filter((q) => q !== targetQual)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choiceIds = [targetQual, ...distractors].sort(() => Math.random() - 0.5);

    return {
      kind: 'music_chord',
      qualityId: targetQual,
      rootNoteId: rootId,
      freqs,
      label: qDef.label,
      choices: choiceIds.map((id) => ({
        id,
        label: CHORD_QUALITY_BY_ID[id].label,
      })),
    };
  }

  const pool = config.notePool;
  const targetId = pool[Math.floor(Math.random() * pool.length)];
  const targetNote = NOTE_BY_ID[targetId];
  const distractors = pool
    .filter((id) => id !== targetId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choiceIds = [targetId, ...distractors].sort(() => Math.random() - 0.5);

  return {
    kind: 'music_note',
    noteId: targetId,
    freq: targetNote.freq,
    label: `${targetNote.western} (${targetNote.sargam})`,
    choices: choiceIds.map((id) => {
      const n = NOTE_BY_ID[id];
      return {
        id,
        label: `${n.western} (${n.sargam})`,
      };
    }),
  };
}
