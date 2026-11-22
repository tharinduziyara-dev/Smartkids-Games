import { useState } from 'react';
import { Check, Lock, Play, Sparkles, X } from 'lucide-react';
import {
  EquippedWardrobe,
  PlayerProfile,
  WARDROBE_CATALOG,
  WardrobeCategory,
  WardrobeItem,
} from '../types/game';
import { MusicalFairy } from './MusicalFairy';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';
import { ConfirmCloseDialog } from './ConfirmCloseDialog';
import { RewardedAdModal, RewardedUnlockTarget } from './RewardedAdModal';

interface WardrobeModalProps {
  profile: PlayerProfile;
  language?: AppLanguage;
  onEquipItem: (category: WardrobeCategory, itemId: string) => void;
  onUnlockItem: (item: WardrobeItem) => void;
  onClose: () => void;
}

const CATEGORY_IDS: WardrobeCategory[] = ['dress', 'shoes', 'crown', 'wings'];

export function WardrobeModal({
  profile,
  language = 'en',
  onEquipItem,
  onUnlockItem,
  onClose,
}: WardrobeModalProps) {
  const [activeCat, setActiveCat] = useState<WardrobeCategory>('dress');
  const [confirmClose, setConfirmClose] = useState(false);
  const [adTarget, setAdTarget] = useState<RewardedUnlockTarget | null>(null);

  const items = WARDROBE_CATALOG.filter((item) => item.category === activeCat);
  const unlockedSet = new Set(profile.unlockedItems);
  const equipped: EquippedWardrobe = profile.equippedWardrobe;
  const t = TEXT[language].wardrobe;

  return (
    <div
      className="safe-modal-overlay fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="clay-surface rounded-[32px] p-4 sm:p-7 w-full max-w-2xl border-2 border-white flex flex-col gap-3.5 sm:gap-4 my-auto max-h-[88dvh] overflow-hidden">
        {/* Header */}
        <div className="app-header-bar">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-none truncate">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 tabular-nums truncate">
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
              setConfirmClose(true);
            }}
            aria-label="Close wardrobe"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pr-0.5">

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
                    onClick={() => {
                      if (isUnlocked) {
                        soundEngine.playMagicWand();
                        onEquipItem(item.category, item.id);
                      } else {
                        soundEngine.playTapPop();
                        setAdTarget({
                          kind: 'wardrobe',
                          item,
                          title: itemName,
                        });
                      }
                    }}
                    className={`rounded-2xl p-3 border-2 text-left flex items-center gap-3 transition-all cursor-pointer active:translate-y-0.5 ${
                      isEquipped
                        ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                        : isUnlocked
                        ? 'bg-white border-slate-200 hover:border-pink-300'
                        : 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
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
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                          <Play className="w-3 h-3 fill-amber-600 text-amber-600 shrink-0" />
                          <span className="truncate">{t.watchVideoUnlock}</span>
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

      <RewardedAdModal
        target={adTarget}
        language={language}
        onRewardGranted={(granted) => {
          if (granted.kind === 'wardrobe') {
            onUnlockItem(granted.item);
          }
        }}
        onClose={() => setAdTarget(null)}
      />

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
