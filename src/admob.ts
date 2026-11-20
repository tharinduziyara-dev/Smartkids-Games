import { AdMob, BannerAdSize, BannerAdPosition, BannerAdOptions } from '@capacitor-community/admob';

export async function initKidsAdMob() {
  try {
    await AdMob.initialize({
      initializeForTesting: false,
      tagForChildDirectedTreatment: true,
      maxAdContentRating: 'G',
    });

    const options: BannerAdOptions = {
      adId: 'ca-app-pub-7219225410567354/1650686995',
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false,
    };

    await AdMob.showBanner(options);
  } catch (e) {
    console.log('AdMob web mode or error:', e);
  }
}
