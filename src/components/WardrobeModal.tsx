import { useState } from 'react';
import { Check, Lock, Sparkles, Star, X } from 'lucide-react';
import {
  EquippedWardrobe,
  PlayerProfile,
  WARDROBE_CATALOG,
  WardrobeCategory,
} from '../types/game';
import { MusicalFairy } from './MusicalFairy';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';

interface WardrobeModalProps {
  profile: PlayerProfile;
  language?: AppLanguage;
  onEquipItem: (category: WardrobeCategory, itemId: string) => void;
  onClose: () => void;
}

const CATEGORY_IDS: WardrobeCategory[] = ['dress', 'shoes', 'crown', 'wings'];

export function WardrobeModal({
  profile,
  language = 'en',
  onEquipItem,
  onClose,
}: WardrobeModalProps) {
  const [activeCat, setActiveCat] = useState<WardrobeCategory>('dress');

  const items = WARDROBE_CATALOG.filter((item) => item.category === activeCat);
  const unlockedSet = new Set(profile.unlockedItems);
  const equipped: EquippedWardrobe = profile.equippedWardrobe;
  const t = TEXT[language].wardrobe;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="clay-surface rounded-[32px] p-5 sm:p-7 w-full max-w-2xl border-2 border-white flex flex-col gap-4 my-auto max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 tabular-nums">
                {t.subtitle(
                  profile.name,
                  profile.unlockedItems.length,
                  WARDROBE_CATALOG.length,
                  profile.totalStars
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onClose();
            }}
            aria-label="Close wardrobe"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Fairy Preview + Category Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Preview Stage */}
          <div className="md:col-span-2 clay-card rounded-3xl p-4 border-2 border-pink-100 flex flex-col items-center justify-center bg-gradient-to-b from-pink-50/70 to-sky-50/70">
            <MusicalFairy
              mood="happy"
              size="lg"
              equipped={equipped}
              message={t.tapMeMsg}
            />
          </div>

          {/* Wardrobe Picker */}
          <div className="md:col-span-3 flex flex-col gap-3">
            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100">
              {CATEGORY_IDS.map((catId) => {
                const active = activeCat === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => {
                      soundEngine.playTapPop();
                      setActiveCat(catId);
                    }}
                    className={`min-h-[40px] py-1.5 px-2 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.categories[catId]}
                  </button>
                );
              })}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {items.map((item) => {
                const isUnlocked = unlockedSet.has(item.id);
                const isEquipped = equipped[item.category] === item.id;
                const itemName = t.items[item.id] ?? item.name;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      soundEngine.playMagicWand();
                      onEquipItem(item.category, item.id);
                    }}
                    className={`rounded-2xl p-3 border-2 text-left flex items-center gap-3 transition-all ${
                      isEquipped
                        ? 'bg-emerald-50 border-emerald-400 shadow-sm cursor-pointer'
                        : isUnlocked
                        ? 'bg-white border-slate-200 hover:border-pink-300 cursor-pointer active:translate-y-0.5'
                        : 'bg-slate-100/80 border-slate-200 opacity-75 cursor-not-allowed'
                    }`}
                  >
                    {/* Color Swatch Preview */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${item.primaryColor} 0%, ${item.secondaryColor} 100%)`,
                      }}
                      className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center shrink-0"
                    >
                      {isEquipped ? (
                        <Check className="w-5 h-5 text-white stroke-[3] drop-shadow" />
                      ) : !isUnlocked ? (
                        <Lock className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <span
                          style={{ backgroundColor: item.accentColor }}
                          className="w-3.5 h-3.5 rounded-full border border-white/80"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
                        {itemName}
                      </div>
                      {isEquipped ? (
                        <div className="text-xs font-bold text-emerald-700">
                          {t.equipped}
                        </div>
                      ) : isUnlocked ? (
                        <div className="text-xs font-semibold text-slate-500 truncate">
                          {t.tapToWear}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 tabular-nums">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{t.unlockAtStars(item.unlockStars)}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Done CTA */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onClose();
            }}
            style={{
              background: 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)',
              boxShadow: '0 6px 0 0 #9D174D',
            }}
            className="toy-btn min-h-[46px] px-7 rounded-2xl text-white font-display text-base font-bold border-2 border-white/40 cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
}
