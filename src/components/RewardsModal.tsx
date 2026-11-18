import { Award, Lock, Star, Trophy, X } from 'lucide-react';
import { motion } from 'motion/react';
import { PlayerProfile, REWARDS_CATALOG } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';

interface RewardsModalProps {
  profile: PlayerProfile;
  language?: AppLanguage;
  onClose: () => void;
}

export function RewardsModal({
  profile,
  language = 'en',
  onClose,
}: RewardsModalProps) {
  const unlockedSet = new Set(profile.unlockedRewards);
  const unlockedCount = REWARDS_CATALOG.filter((r) => unlockedSet.has(r.id)).length;
  const t = TEXT[language];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.rewards.title}
    >
      <div className="clay-surface rounded-[32px] p-5 sm:p-7 w-full max-w-2xl border-2 border-white flex flex-col gap-5 my-auto max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
                {t.rewards.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 tabular-nums">
                {t.rewards.subtitle(
                  profile.name,
                  unlockedCount,
                  REWARDS_CATALOG.length,
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
            aria-label="Close rewards"
            style={{ boxShadow: '0 4px 0 0 #CBD5E1' }}
            className="toy-btn w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center border-2 border-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trophies, Badges & Stickers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REWARDS_CATALOG.map((reward, idx) => {
            const unlocked = unlockedSet.has(reward.id);
            const localized = t.rewards.items[reward.id] ?? {
              name: reward.name,
              description: reward.description,
            };
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={`rounded-3xl p-3.5 border-2 flex items-center gap-3.5 transition-all ${
                  unlocked
                    ? 'bg-white border-amber-200 shadow-sm'
                    : 'bg-slate-100/80 border-slate-200 opacity-75'
                }`}
              >
                <div
                  style={
                    unlocked
                      ? {
                          background: `linear-gradient(135deg, ${reward.gradientTop} 0%, ${reward.gradientBottom} 100%)`,
                        }
                      : undefined
                  }
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 border-white shadow-sm ${
                    unlocked ? '' : 'bg-slate-200 grayscale'
                  }`}
                >
                  {unlocked ? (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1], rotate: [-4, 4, -4] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {reward.emoji}
                    </motion.span>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                    <Award className="w-3.5 h-3.5" />
                    <span>{t.rewards.kinds[reward.kind]}</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                    {localized.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {localized.description}
                  </p>
                  {unlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      {t.rewards.earned}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTapPop();
              onClose();
            }}
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              boxShadow: '0 6px 0 0 #B45309',
            }}
            className="toy-btn min-h-[46px] px-7 rounded-2xl text-amber-950 font-display text-base font-bold border-2 border-white/60 cursor-pointer"
          >
            {t.common.backToGames}
          </button>
        </div>
      </div>
    </div>
  );
}
