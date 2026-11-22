import {
  AppCategory,
  DEFAULT_EQUIPPED_WARDROBE,
  DEFAULT_UNLOCKED_CHARACTERS,
  DifficultyLevel,
  MASCOT_BY_ID,
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

const VALID_WARDROBE_IDS = new Set(WARDROBE_CATALOG.map((item) => item.id));

/**
 * Wardrobe now keeps the 4 starter items unlocked by default and unlocks the
 * remaining 10 items permanently via Rewarded Ads (never auto-unlocked by stars).
 */
export function getUnlockedIdsForStars(
  _stars: number,
  existingUnlocked: string[] = []
): string[] {
  const unlockedSet = new Set<string>(STARTER_UNLOCKED_ITEMS);
  for (const id of existingUnlocked) {
    if (VALID_WARDROBE_IDS.has(id)) {
      unlockedSet.add(id);
    }
  }
  return Array.from(unlockedSet);
}

const DEFAULT_CHAR_SET = new Set<MascotId>(DEFAULT_UNLOCKED_CHARACTERS);

/**
 * Only the 2 default free starter characters (Ollie Owl & Sparkle Fairy)
 * are persisted as unlocked in localStorage. Extra characters unlocked via
 * Rewarded Ads live exclusively in React session memory.
 */
export function sanitizeUnlockedCharacters(
  _existingCharacters: unknown = []
): MascotId[] {
  return [...DEFAULT_UNLOCKED_CHARACTERS];
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
  _prevUnlocked: string[],
  _newTotalStars: number
): WardrobeItem[] {
  // Wardrobe unlocks happen exclusively through Rewarded Ads
  return [];
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

function normalizePersistedMascotId(raw: unknown): MascotId {
  if (typeof raw === 'string' && DEFAULT_CHAR_SET.has(raw as MascotId)) {
    return raw as MascotId;
  }
  if (raw === 'runner_girl') return 'fairy';
  return 'owl';
}

export function createPlayerProfile(
  name: string,
  mascot: MascotId = 'owl',
  initialStars = 0
): PlayerProfile {
  const cleanName = name.trim().slice(0, 20) || 'Player';
  const safeMascot = normalizePersistedMascotId(mascot);
  const unlockedChars = [...DEFAULT_UNLOCKED_CHARACTERS];
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    totalStars: initialStars,
    mascot: safeMascot,
    unlockedCharacters: unlockedChars,
    unlockedItems: [...STARTER_UNLOCKED_ITEMS],
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
          const safeMascot = normalizePersistedMascotId(p.mascot);
          const unlockedChars = sanitizeUnlockedCharacters(p.unlockedCharacters);
          const activeMascot = unlockedChars.includes(safeMascot) ? safeMascot : 'owl';

          return {
            ...p,
            id: String(p.id),
            name: String(p.name || 'Player').slice(0, 20),
            totalStars: safeStars,
            mascot: activeMascot,
            unlockedCharacters: unlockedChars,
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
    const starter = createPlayerProfile('Smart Kid', 'owl', legacyStars);
    return { profiles: [starter], activeProfileId: starter.id };
  } catch {
    const fallback = createPlayerProfile('Smart Kid', 'owl', 0);
    return { profiles: [fallback], activeProfileId: fallback.id };
  }
}

export function saveProfilesStore(store: ProfilesStore): void {
  try {
    // Never persist Rewarded-Ad character unlocks or session-only characters to localStorage
    const persistedStore: ProfilesStore = {
      activeProfileId: store.activeProfileId,
      profiles: store.profiles.map((p) => ({
        ...p,
        mascot: normalizePersistedMascotId(p.mascot),
        unlockedCharacters: [...DEFAULT_UNLOCKED_CHARACTERS],
      })),
    };
    window.localStorage.setItem(
      PROFILES_STORAGE_KEY,
      JSON.stringify(persistedStore)
    );
  } catch {
    // Ignore storage quota errors
  }
}
