import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  MaxAdContentRating,
  RewardAdOptions,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

/**
 * Google AdMob official Test Rewarded Ad Unit ID.
 * No banner ads are configured or displayed anywhere in the app.
 */
export const TEST_REWARDED_AD_ID = 'ca-app-pub-3940256099942544/5224354917';

let initializePromise: Promise<boolean> | null = null;
let rewardedAdPrepared = false;
let preparePromise: Promise<boolean> | null = null;

export function isNativeAdMobSupported(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

/**
 * Initializes AdMob strictly following Google Play Kids / Families policy:
 * - initializeForTesting: true
 * - tagForChildDirectedTreatment: true (COPPA child-directed treatment)
 * - maxAdContentRating: MaxAdContentRating.General (maps to Google Ads rating 'G' on Android & iOS)
 */
export async function initializeAdMob(): Promise<boolean> {
  if (!isNativeAdMobSupported()) {
    return false;
  }

  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: true,
        tagForChildDirectedTreatment: true,
        maxAdContentRating: MaxAdContentRating.General,
      });
      return true;
    } catch {
      initializePromise = null;
      return false;
    }
  })();

  return initializePromise;
}

/**
 * Preloads a Google Test Rewarded Ad (`isTesting: true`).
 */
export async function prepareRewardedAd(): Promise<boolean> {
  if (!isNativeAdMobSupported()) {
    return false;
  }

  if (rewardedAdPrepared) {
    return true;
  }

  if (preparePromise) {
    return preparePromise;
  }

  preparePromise = (async () => {
    try {
      const initialized = await initializeAdMob();
      if (!initialized) return false;

      const options: RewardAdOptions = {
        adId: TEST_REWARDED_AD_ID,
        isTesting: true,
        npa: true,
      };

      await AdMob.prepareRewardVideoAd(options);
      rewardedAdPrepared = true;
      return true;
    } catch {
      rewardedAdPrepared = false;
      return false;
    } finally {
      preparePromise = null;
    }
  })();

  return preparePromise;
}

export interface RewardedAdShowResult {
  rewarded: boolean;
  /** True when running in a web browser or when native AdMob is unavailable so the UI can show its kid-safe fallback video. */
  useWebFallback: boolean;
}

/**
 * Shows a native AdMob Rewarded Ad on Android/iOS Capacitor builds.
 * On web browsers / previews, signals `useWebFallback: true` so the existing
 * interactive kid-safe reward video modal handles character & wardrobe unlocks.
 */
export async function showRewardedAd(): Promise<RewardedAdShowResult> {
  if (!isNativeAdMobSupported()) {
    return { rewarded: false, useWebFallback: true };
  }

  const listenerHandles: PluginListenerHandle[] = [];
  let earnedReward = false;

  try {
    const initialized = await initializeAdMob();
    if (!initialized) {
      return { rewarded: false, useWebFallback: true };
    }

    const prepared = await prepareRewardedAd();
    if (!prepared) {
      return { rewarded: false, useWebFallback: true };
    }

    listenerHandles.push(
      await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        earnedReward = true;
      })
    );

    const dismissPromise = new Promise<void>((resolve) => {
      void AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        resolve();
      }).then((handle) => listenerHandles.push(handle));

      void AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
        resolve();
      }).then((handle) => listenerHandles.push(handle));
    });

    rewardedAdPrepared = false;

    const rewardResult = await AdMob.showRewardVideoAd();
    if (rewardResult && (rewardResult.amount > 0 || Boolean(rewardResult.type))) {
      earnedReward = true;
    }

    // Wait briefly for Dismissed if Rewarded resolved right before ad dismissal
    await Promise.race([
      dismissPromise,
      new Promise<void>((resolve) => window.setTimeout(resolve, 400)),
    ]);

    // Preload next rewarded ad in the background
    void prepareRewardedAd();

    return {
      rewarded: earnedReward,
      useWebFallback: false,
    };
  } catch {
    rewardedAdPrepared = false;
    return { rewarded: false, useWebFallback: true };
  } finally {
    await Promise.allSettled(listenerHandles.map((handle) => handle.remove()));
  }
}
