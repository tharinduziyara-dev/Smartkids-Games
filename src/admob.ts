import { AdMob, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';

export async function initKidsAdMob() {
  try {
    await AdMob.initialize({
      initializeForTesting: true,
      tagForChildDirectedTreatment: true,
      maxAdContentRating: 'G',
    });
  } catch (e) {
    console.log('AdMob init web mode or error:', e);
  }
}

export async function showCharacterRewardAd(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      let rewarded = false;

      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        () => {
          rewarded = true;
        }
      );

      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          rewardListener.remove();
          dismissListener.remove();
          resolve(rewarded);
        }
      );

      const options: RewardAdOptions = {
        // Google Official Test Rewarded Ad ID (Replace with your real Rewarded Ad ID for Production):
        adId: 'ca-app-pub-3940256099942544/5224354917',
        isTesting: true,
      };

      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.log('Reward Ad error or web fallback:', e);
      resolve(false);
    }
  });
}
