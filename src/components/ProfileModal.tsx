import { FormEvent, useState } from 'react';
import { Check, Plus, Star, Trash2, User, X } from 'lucide-react';
import {
  MASCOT_BY_ID,
  MASCOT_LIST,
  MascotId,
  PlayerProfile,
  WARDROBE_CATALOG,
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';

interface ProfileModalProps {
  profiles: PlayerProfile[];
  activeProfileId: string;
  language?: AppLanguage;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (name: string, mascot: MascotId) => void;
  onDeleteProfile: (profileId: string) => void;
  onClose: () => void;
}

export function ProfileModal({
  profiles,
  activeProfileId,
  language = 'en',
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onClose,
}: ProfileModalProps) {
  const [newName, setNewName] = useState('');
  const [starterMascot, setStarterMascot] = useState<MascotId>('fairy');
  const [confirmClose, setConfirmClose] = useState(false);

  const t = TEXT[language];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    soundEngine.playCorrectChime();
    onCreateProfile(trimmed, starterMascot);
    setNewName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.profiles.title}
    >
      <div className="clay-surface rounded-[32px] p-5 sm:p-7 w-full max-w-lg border-2 border-white flex flex-col gap-5 my-auto max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
                {t.profiles.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                {t.profiles.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              setConfirmClose(true);
            }}
            aria-label="Close players modal"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Player Form */}
        <form
          onSubmit={handleSubmit}
          className="clay-card rounded-2xl p-4 border-2 border-indigo-100 flex flex-col gap-3"
        >
          <label
            htmlFor="new-player-name"
            className="font-display text-sm sm:text-base font-bold text-slate-800"
          >
            {t.profiles.addNew}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="new-player-name"
              type="text"
              maxLength={20}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.profiles.placeholder}
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              style={{
                background: newName.trim()
                  ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                  : 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 100%)',
                boxShadow: newName.trim() ? '0 5px 0 0 #065F46' : '0 3px 0 0 #64748B',
              }}
              className="toy-btn min-h-[44px] px-4 py-2 rounded-xl text-white font-display font-bold text-sm flex items-center justify-center gap-1.5 border border-white/40 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.profiles.create}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>{t.profiles.starterFriend}</span>
            {MASCOT_LIST.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setStarterMascot(m.id)}
                className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                  starterMascot === m.id
                    ? `${m.badgeColor} text-white`
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.mascots[m.id].shortLabel}
              </button>
            ))}
          </div>
        </form>

        {/* Saved Profiles List */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-500">
            {t.profiles.savedProfiles(profiles.length)}
          </span>
          <div className="flex flex-col gap-2">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-3 border-2 flex items-center justify-between gap-3 transition-all ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      onSelectProfile(p.id);
                      onClose();
                    }}
                    className="flex-1 flex items-center gap-3 text-left cursor-pointer min-w-0"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white shrink-0 ${MASCOT_BY_ID[p.mascot].badgeColor}`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base font-bold text-slate-900 truncate flex items-center gap-2">
                        <span>{p.name}</span>
                        {isActive && (
                          <Check className="w-4 h-4 text-indigo-600 stroke-[3] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tabular-nums">
                        <span>{t.mascots[p.mascot].shortLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          {p.totalStars}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {t.profiles.outfitsCount(
                            p.unlockedItems.length,
                            WARDROBE_CATALOG.length
                          )}
                        </span>
                      </div>
                    </div>
                  </button>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTapPop();
                        onDeleteProfile(p.id);
                      }}
                      aria-label={`Delete profile ${p.name}`}
                      className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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
