import {
  AppCategory,
  DEFAULT_EQUIPPED_WARDROBE,
  DifficultyLevel,
  MascotId,
  PlayerProfile,
  REWARDS_CATALOG,
  RewardItem,
  STARTER_UNLOCKED_ITEMS,
  WARDROBE_CATALOG,
  WardrobeItem,
} from '../types/game';

const PROFILES_STORAGE_KEY = 'melody_owl_profiles_v2';
const LEGACY_STARS_KEY = 'melody_owl_total_stars_v1';

export interface ProfilesStore {
  profiles: PlayerProfile[];
  activeProfileId: string;
}

export function getUnlockedIdsForStars(
  stars: number,
  existingUnlocked: string[] = []
): string[] {
  const unlockedSet = new Set<string>([
    ...STARTER_UNLOCKED_ITEMS,
    ...existingUnlocked,
  ]);
  for (const item of WARDROBE_CATALOG) {
    if (stars >= item.unlockStars) {
      unlockedSet.add(item.id);
    }
  }
  return Array.from(unlockedSet);
}

export function getUnlockedRewardIds(
  stars: number,
  existingRewards: string[] = [],
  context?: {
    completedCategory?: AppCategory;
    level?: DifficultyLevel;
    streak?: number;
  }
): string[] {
  const rewardSet = new Set<string>(existingRewards);
  for (const reward of REWARDS_CATALOG) {
    if (reward.unlockStars !== undefined && stars >= reward.unlockStars) {
      rewardSet.add(reward.id);
    }
    if (
      reward.categoryTrigger &&
      context?.completedCategory === reward.categoryTrigger
    ) {
      rewardSet.add(reward.id);
    }
    if (reward.extremeTrigger && context?.level === 'extreme') {
      rewardSet.add(reward.id);
    }
    if (
      reward.streakTrigger !== undefined &&
      (context?.streak ?? 0) >= reward.streakTrigger
    ) {
      rewardSet.add(reward.id);
    }
  }
  return Array.from(rewardSet);
}

export function findNewlyUnlockedItems(
  prevUnlocked: string[],
  newTotalStars: number
): WardrobeItem[] {
  const prevSet = new Set(prevUnlocked);
  return WARDROBE_CATALOG.filter(
    (item) => newTotalStars >= item.unlockStars && !prevSet.has(item.id)
  );
}

export function findNewlyUnlockedRewards(
  prevRewards: string[],
  nextRewards: string[]
): RewardItem[] {
  const prevSet = new Set(prevRewards);
  return REWARDS_CATALOG.filter(
    (r) => nextRewards.includes(r.id) && !prevSet.has(r.id)
  );
}

export function createPlayerProfile(
  name: string,
  mascot: MascotId = 'owl',
  initialStars = 0
): PlayerProfile {
  const cleanName = name.trim().slice(0, 20) || 'Player';
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    totalStars: initialStars,
    mascot,
    unlockedItems: getUnlockedIdsForStars(initialStars),
    unlockedRewards: getUnlockedRewardIds(initialStars),
    equippedWardrobe: { ...DEFAULT_EQUIPPED_WARDROBE },
    flightTurns: 0,
    flightTurnProgress: 0,
    createdAt: Date.now(),
  };
}

export function loadProfilesStore(): ProfilesStore {
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfilesStore>;
      if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        const sanitized = parsed.profiles.map((p) => {
          const safeStars = Number.isFinite(p.totalStars) ? Math.max(0, p.totalStars!) : 0;
          const safeTurns = Number.isFinite(p.flightTurns)
            ? Math.max(0, Math.floor(p.flightTurns!))
            : 0;
          const safeProgress = Number.isFinite(p.flightTurnProgress)
            ? Math.min(4, Math.max(0, Math.floor(p.flightTurnProgress!)))
            : 0;
          return {
            ...p,
            id: String(p.id),
            name: String(p.name || 'Player').slice(0, 20),
            totalStars: safeStars,
            mascot:
              p.mascot === 'fairy' ||
              p.mascot === 'runner_boy' ||
              p.mascot === 'runner_girl' ||
              p.mascot === 'owl'
                ? p.mascot
                : ('owl' as const),
            unlockedItems: getUnlockedIdsForStars(
              safeStars,
              Array.isArray(p.unlockedItems) ? p.unlockedItems : []
            ),
            unlockedRewards: getUnlockedRewardIds(
              safeStars,
              Array.isArray(p.unlockedRewards) ? p.unlockedRewards : []
            ),
            equippedWardrobe: {
              ...DEFAULT_EQUIPPED_WARDROBE,
              ...(p.equippedWardrobe ?? {}),
            },
            flightTurns: safeTurns,
            flightTurnProgress: safeProgress,
            createdAt: p.createdAt || Date.now(),
          };
        });
        const activeId = sanitized.some((p) => p.id === parsed.activeProfileId)
          ? String(parsed.activeProfileId)
          : sanitized[0].id;
        return { profiles: sanitized, activeProfileId: activeId };
      }
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_STARS_KEY);
    const legacyStars = legacyRaw ? Math.max(0, parseInt(legacyRaw, 10) || 0) : 0;
    const starter = createPlayerProfile('Melody Kid', 'owl', legacyStars);
    return { profiles: [starter], activeProfileId: starter.id };
  } catch {
    const fallback = createPlayerProfile('Melody Kid', 'owl', 0);
    return { profiles: [fallback], activeProfileId: fallback.id };
  }
}

export function saveProfilesStore(store: ProfilesStore): void {
  try {
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors
  }
}
