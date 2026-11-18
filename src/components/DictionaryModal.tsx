import { useMemo, useRef, useState } from 'react';
import { BookOpen, Volume2, X } from 'lucide-react';
import {
  DICTIONARY_CATEGORIES,
  DictionaryCategory,
  DictionaryEntry,
  SINHALA_DICTIONARY,
} from '../data/sinhalaDictionary';
import {
  speakBothPronunciations,
  speakSinhalaWord,
  speakWord,
  stopSpeaking,
} from '../utils/speech';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';

interface DictionaryModalProps {
  muted: boolean;
  language?: AppLanguage;
  onClose: () => void;
}

export function DictionaryModal({
  muted,
  language = 'en',
  onClose,
}: DictionaryModalProps) {
  const [category, setCategory] = useState<DictionaryCategory>('All');
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry>(
    SINHALA_DICTIONARY[0]
  );
  const [confirmClose, setConfirmClose] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const t = TEXT[language].dictionary;

  const filteredWords = useMemo(() => {
    if (category === 'All') return SINHALA_DICTIONARY;
    return SINHALA_DICTIONARY.filter((item) => item.category === category);
  }, [category]);

  const handleSelectCategory = (cat: DictionaryCategory) => {
    soundEngine.playTapPop();
    setCategory(cat);
    const matching =
      cat === 'All'
        ? SINHALA_DICTIONARY
        : SINHALA_DICTIONARY.filter((item) => item.category === cat);
    if (
      matching.length > 0 &&
      !matching.some((item) => item.word === selectedWord.word)
    ) {
      setSelectedWord(matching[0]);
    }
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  };

  const handleSelectWord = (entry: DictionaryEntry) => {
    soundEngine.playTapPop();
    setSelectedWord(entry);
    speakWord(entry.word, muted, 0.88);
    spotlightRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  };

  const handleRequestClose = () => {
    soundEngine.playTapPop();
    setConfirmClose(true);
  };

  const handleConfirmClose = () => {
    stopSpeaking();
    setConfirmClose(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="clay-surface rounded-[32px] p-4 sm:p-7 w-full max-w-3xl border-2 border-white flex flex-col gap-3 sm:gap-4 my-auto max-h-[94dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-none">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            aria-label="Close dictionary"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Word Spotlight */}
        <div
          ref={spotlightRef}
          className="clay-card rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/50 to-sky-50/70 flex flex-col gap-3 sm:gap-4 shrink-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white border-2 border-emerald-100 shadow-sm flex items-center justify-center text-3xl sm:text-5xl shrink-0 select-none">
                {selectedWord.emoji}
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-display text-xl sm:text-3xl font-bold text-slate-900 capitalize">
                    {selectedWord.word}
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    {t.categories[selectedWord.category]}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                  {selectedWord.meaningNote}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                speakBothPronunciations(
                  selectedWord.word,
                  selectedWord.sinhala,
                  selectedWord.sinhalaPhonetic,
                  muted
                )
              }
              style={{
                background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
                boxShadow: '0 5px 0 0 #B45309',
              }}
              className="toy-btn min-h-[42px] sm:min-h-[44px] px-4 py-2 rounded-2xl text-amber-950 font-display text-sm font-bold flex items-center justify-center gap-2 border-2 border-white/70 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.hearBoth}</span>
            </button>
          </div>

          {/* Side-by-Side English & Sinhala Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* English Pronunciation */}
            <div className="rounded-2xl p-3 sm:p-3.5 bg-white border-2 border-sky-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wide text-sky-600">
                  {t.englishHeader}
                </span>
                <div className="font-display text-lg sm:text-xl font-bold text-slate-900 capitalize truncate">
                  {selectedWord.word}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500">
                  {t.sayLabel}{' '}
                  <span className="text-sky-700">“{selectedWord.englishPhonetic}”</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => speakWord(selectedWord.word, muted, 0.85)}
                aria-label={`Hear English pronunciation of ${selectedWord.word}`}
                style={{
                  background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
                  boxShadow: '0 4px 0 0 #075985',
                }}
                className="toy-btn min-h-[42px] px-3.5 rounded-2xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-white/40 cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>EN</span>
              </button>
            </div>

            {/* Sinhala Meaning & Pronunciation */}
            <div className="rounded-2xl p-3 sm:p-3.5 bg-white border-2 border-emerald-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                  {t.sinhalaHeader}
                </span>
                <div
                  style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}
                  className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug truncate"
                >
                  {selectedWord.sinhala}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500">
                  {t.sayLabel}{' '}
                  <span className="text-emerald-700">“{selectedWord.sinhalaPhonetic}”</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  speakSinhalaWord(
                    selectedWord.sinhala,
                    selectedWord.sinhalaPhonetic,
                    muted,
                    0.82
                  )
                }
                aria-label={`Hear Sinhala pronunciation of ${selectedWord.sinhala}`}
                style={{
                  background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                  boxShadow: '0 4px 0 0 #065F46',
                }}
                className="toy-btn min-h-[42px] px-3.5 rounded-2xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-white/40 cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>සිං</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons & Word Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Dictionary Categories"
          >
            {DICTIONARY_CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelectCategory(cat)}
                  className={`min-h-[36px] sm:min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {t.categories[cat]}
                </button>
              );
            })}
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl tabular-nums shrink-0">
            {t.wordsCount(filteredWords.length)}
          </span>
        </div>

        {/* Word Grid */}
        {filteredWords.length === 0 ? (
          <div className="rounded-2xl p-6 bg-white/80 border border-slate-200 text-center text-sm font-semibold text-slate-500 shrink-0">
            {t.emptyText}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 flex-1 min-h-[220px] sm:min-h-[260px] max-h-[340px] overflow-y-auto pr-1"
          >
            {filteredWords.map((entry) => {
              const isSelected = selectedWord.word === entry.word;
              return (
                <button
                  key={entry.word}
                  type="button"
                  onClick={() => handleSelectWord(entry)}
                  className={`rounded-2xl p-2.5 border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-2xl shrink-0 select-none">{entry.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-slate-900 capitalize truncate">
                      {entry.word}
                    </div>
                    <div
                      style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}
                      className="text-xs font-bold text-emerald-700 truncate"
                    >
                      {entry.sinhala}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmCloseDialog
        open={confirmClose}
        language={language}
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmClose(false)}
      />
    </div>
  );
}
