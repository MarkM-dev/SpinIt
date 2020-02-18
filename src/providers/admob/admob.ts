import { Injectable } from '@angular/core';
import { AdMob } from "ionic-admob";
import {Platform} from "ionic-angular";

/*
  Generated class for the AdmobProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

// https://admob-plus.github.io/docs/installation.html

@Injectable()
export class AdmobProvider {

  NOT_CORDOVA_ERR = 'AdmobProvider: Not on cordova device.';
  ADS_NOT_ALLOWED_ERR = 'AdmobProvider: Ads are disabled.';

  ADS_IDS = {
    TEST_HOME_BOTTOM_BANNER: {
      id: {
        android: '//REMOVED//',
        ios: '//REMOVED//',
      }
    },
    TEST_HOME_INTERSTITIAL: {
      id: {
        android: '//REMOVED//',
        ios: '//REMOVED//',
      }
    },
    TEST_HOME_INTERSTITIAL_VIDEO: {
      id: {
        android: '//REMOVED//',
        ios: '//REMOVED//',
      }
    },
    TEST_HOME_REWARD_VIDEO: {
      id: {
        android: '//REMOVED//',
        ios: '//REMOVED//',
      }
    },
    HOME_BOTTOM_BANNER: {
      id: {
        android: '//REMOVED//', // test
        ios: '//REMOVED//', // test
        // android: '//REMOVED//', // prod
        // ios: '//REMOVED//', // prod
      }
    },
    SETTINGS_BOTTOM_BANNER: {
      id: {
        android: '//REMOVED//', // test
        ios: '//REMOVED//', // test
        // android: '//REMOVED//', // prod
        // ios: '//REMOVED//', // prod
      }
    },
    GAME_BOTTOM_BANNER: {
      id: {
         android: '//REMOVED//', // test
         ios: '//REMOVED//', // test
        // android: '//REMOVED//', // prod
        // ios: '//REMOVED//', // prod
      }
    },
    GAME_FINISH_INTERSTITIAL_VIDEO: {
      id: {
        android: '//REMOVED//', // test
        ios: '//REMOVED//', // test
        // android: '//REMOVED//', // prod
        // ios: '//REMOVED//', // prod
      }
    },
  };

  currentlyShownAdBannerObj = null;
  bADS_ENABLED = true;

  constructor(private admob: AdMob, private platform: Platform) {
    let ctx = this;
    console.log('Hello AdmobProvider Provider');
    document.addEventListener('disable-ads', function () {
      ctx.disableAds()
    }, false);
    document.addEventListener('enable-ads', function () {
      ctx.enableAds()
    }, false);
  }

  disableAds() {
    this.bADS_ENABLED = false;
    this.hideAdmobBanner(this.currentlyShownAdBannerObj).then(() => {this.currentlyShownAdBannerObj = null;}, (err) => {console.log(err)});
  }

  enableAds() {
    this.bADS_ENABLED = true;
  }

  showAdmobBanner(adIdOptsObj) {
    if (!this.canShowAds()) {
      return Promise.reject(this.ADS_NOT_ALLOWED_ERR)
    }
    this.currentlyShownAdBannerObj = adIdOptsObj;
    return this.platform.is('cordova') ? this.admob.banner.show(adIdOptsObj): Promise.reject(this.NOT_CORDOVA_ERR);
  }

  hideAdmobBanner(adIdOptsObj) {
    return adIdOptsObj ? this.platform.is('cordova') ? this.admob.banner.hide(adIdOptsObj.id): Promise.reject(this.NOT_CORDOVA_ERR) : Promise.reject("no adIdOptsObj");
  }

  showAdmobInterstitial(adIdOptsObj) {
    if (!this.canShowAds()) {
      return Promise.reject(this.ADS_NOT_ALLOWED_ERR)
    }
    return this.platform.is('cordova') ? this.admob.interstitial.load(adIdOptsObj).then(() => this.admob.interstitial.show()): Promise.reject(this.NOT_CORDOVA_ERR);
  }

  showAdmobInterstitialVideo(adIdOptsObj) {
    if (!this.canShowAds()) {
      return Promise.reject(this.ADS_NOT_ALLOWED_ERR)
    }
    return this.platform.is('cordova') ? this.admob.interstitial.load(adIdOptsObj).then(() => this.admob.interstitial.show()): Promise.reject(this.NOT_CORDOVA_ERR);
  }

  showAdmobRewardVideo(adIdOptsObj) {
    if (!this.canShowAds()) {
      return Promise.reject(this.ADS_NOT_ALLOWED_ERR)
    }
    return this.platform.is('cordova') ? this.admob.rewardVideo.load(adIdOptsObj).then(() => this.admob.rewardVideo.show()): Promise.reject(this.NOT_CORDOVA_ERR);
  }

  canShowAds() {
    return this.bADS_ENABLED;
  }

}
