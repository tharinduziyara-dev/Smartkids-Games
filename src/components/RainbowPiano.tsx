import {
  BEGINNER_NOTES,
  DifficultyLevel,
  LEVEL_CONFIGS,
  NATURAL_NOTES,
  NoteId,
  SHARP_NOTES,
  ToyNote,
} from '../types/game';

interface RainbowPianoProps {
  level: DifficultyLevel;
  activeNote: NoteId | null;
  disabled?: boolean;
  onPressNote: (note: ToyNote) => void;
  showShortcuts?: boolean;
}

const SHARP_LEFT_PERCENT: Record<string, string> = {
  'C#4': '14.2857%',
  'D#4': '28.5714%',
  'F#4': '57.1429%',
  'G#4': '71.4286%',
  'A#4': '85.7143%',
};

export function RainbowPiano({
  level,
  activeNote,
  disabled = false,
  onPressNote,
  showShortcuts = true,
}: RainbowPianoProps) {
  const config = LEVEL_CONFIGS[level];
  const naturals = config.naturalCount === 5 ? BEGINNER_NOTES : NATURAL_NOTES;
  const showSharps = config.showSharps;

  return (
    <div
      className="w-full max-w-4xl mx-auto clay-surface rounded-[26px] sm:rounded-[34px] p-2.5 sm:p-5 border-2 border-white/90"
      role="group"
      aria-label={
        showSharps
          ? 'Chromatic Rainbow Piano Keys C to B'
          : config.naturalCount === 7
          ? 'Rainbow Piano Keys C to B'
          : 'Rainbow Piano Keys C to G'
      }
    >
      {/* Piano Wrapper with explicit position: relative */}
      <div className="relative w-full pb-2.5">
        {/* Natural White / Rainbow Keys Row */}
        <div
          className={`grid gap-1 sm:gap-2 ${
            config.naturalCount === 5 ? 'grid-cols-5' : 'grid-cols-7'
          }`}
        >
          {naturals.map((note, idx) => {
            const isPressed = activeNote === note.id;

            return (
              <button
                key={note.id}
                type="button"
                disabled={disabled}
                onClick={() => onPressNote(note)}
                aria-label={`Note ${note.western} or ${note.sargam}`}
                style={{
                  background: `linear-gradient(180deg, ${note.gradientTop} 0%, ${note.gradientBottom} 100%)`,
                  boxShadow: isPressed
                    ? `0 2px 0 0 ${note.bevelColor}, 0 0 22px 4px ${note.glowColor}, inset 0 3px 6px rgba(255,255,255,0.65)`
                    : `0 9px 0 0 ${note.bevelColor}, 0 12px 18px -6px rgba(15, 23, 42, 0.2), inset 0 3px 6px rgba(255,255,255,0.55)`,
                  transform: isPressed ? 'translateY(6px) scale(0.98)' : 'translateY(0px)',
                }}
                className={`relative piano-key-3d flex flex-col items-center justify-end ${
                  showSharps
                    ? 'h-[168px] sm:h-[212px] pb-3 sm:pb-4 pt-24'
                    : 'min-h-[128px] sm:min-h-[176px] py-3 sm:py-4'
                } px-1 sm:px-2 rounded-xl sm:rounded-[20px] border-2 border-white/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${
                  disabled ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer hover:brightness-105'
                } ${isPressed ? 'ring-4 ring-white' : ''}`}
              >
                {!showSharps && showShortcuts && (
                  <span
                    style={{ color: note.subTextColor }}
                    className="hidden sm:inline-block text-[11px] font-bold opacity-75 mb-auto"
                  >
                    {idx + 1} / {note.shortcut}
                  </span>
                )}

                <div className="flex flex-col items-center justify-center gap-0.5 mt-auto">
                  <span
                    style={{ color: note.textColor }}
                    className={`font-display font-bold leading-none drop-shadow-sm ${
                      config.naturalCount === 7
                        ? 'text-lg sm:text-3xl'
                        : 'text-2xl sm:text-4xl'
                    }`}
                  >
                    {note.western}
                  </span>
                  <span
                    style={{ color: note.subTextColor }}
                    className={`font-extrabold tracking-tight leading-tight ${
                      config.naturalCount === 7
                        ? 'text-[10px] sm:text-sm'
                        : 'text-xs sm:text-base'
                    }`}
                  >
                    {note.sargam}
                  </span>
                  {showSharps && showShortcuts && (
                    <span
                      style={{ color: note.subTextColor }}
                      className="hidden sm:inline-block text-[10px] font-bold opacity-70 mt-0.5"
                    >
                      {note.shortcut}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Raised 3D Black Sharp Keys: position: absolute; top: 0; with percentage left offsets */}
        {showSharps &&
          SHARP_NOTES.map((note) => {
            const isPressed = activeNote === note.id;

            return (
              <button
                key={note.id}
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onPressNote(note);
                }}
                aria-label={`Note ${note.western} or ${note.sargam}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: SHARP_LEFT_PERCENT[note.id],
                  height: '54%',
                  background: `linear-gradient(180deg, ${note.gradientTop} 0%, ${note.gradientBottom} 100%)`,
                  boxShadow: isPressed
                    ? `0 2px 0 0 ${note.bevelColor}, 0 0 18px 3px ${note.glowColor}, inset 0 2px 4px rgba(255,255,255,0.35)`
                    : `0 7px 0 0 ${note.bevelColor}, 0 10px 14px -4px rgba(2, 6, 23, 0.45), inset 0 2px 4px rgba(255,255,255,0.28)`,
                  transform: isPressed
                    ? 'translate(-50%, 5px) scale(0.97)'
                    : 'translate(-50%, 0px)',
                }}
                className={`piano-key-3d z-20 w-[10.5%] sm:w-[9.2%] rounded-b-xl sm:rounded-b-2xl rounded-t-lg border-2 border-slate-600/80 flex flex-col items-center justify-end pb-1.5 sm:pb-2.5 px-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
                  disabled ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'
                } ${isPressed ? 'ring-2 ring-amber-300' : ''}`}
              >
                {showShortcuts && (
                  <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 mb-auto pt-1.5">
                    {note.shortcut}
                  </span>
                )}
                <span
                  style={{ color: note.textColor }}
                  className="font-display text-[11px] sm:text-base font-bold leading-none"
                >
                  {note.western}
                </span>
                <span
                  style={{ color: note.subTextColor }}
                  className="text-[9px] sm:text-xs font-bold leading-tight mt-0.5"
                >
                  {note.sargam}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
