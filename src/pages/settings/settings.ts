import { Component } from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {AdmobProvider} from "../../providers/admob/admob";
import {CurrentUserProvider} from "../../providers/current-user/current-user";
import {InAppPurchaseProvider} from "../../providers/in-app-purchase/in-app-purchase";
import {timer} from "rxjs/observable/timer";
import {AnalyticsProvider} from "../../providers/analytics/analytics";

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  loadingIndicator = this.loadingController.create({
        cssClass: 'spi-loading-indicator',
        content: 'Logging out...'
      });

  constructor(public navCtrl: NavController, public navParams: NavParams, private admobService: AdmobProvider, public analyticsProvider: AnalyticsProvider, private currentUserProvider : CurrentUserProvider, private inAppPurchaseService: InAppPurchaseProvider, private loadingController: LoadingController, private alertCtrl: AlertController) {

  }

  showLeaderboards(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "settingspage-leaderboards-btn");
    this.currentUserProvider.GPG_showAllLeaderBoards().then(() => console.log('showing all leaderboards'));
  }

  showAllAchievements(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "settingspage-achievements-btn");
    this.currentUserProvider.GPG_showAllAchievements().then(() => console.log('showGplayAchievements'));
  }

  removeAds() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "settingspage-remove-ads-btn");
    this.inAppPurchaseService.orderProduct(this.inAppPurchaseService.PRODUCTS.REMOVE_ADS.productAlias);
  }

  logout() {
    this.loadingIndicator.present();
    this.currentUserProvider.GPG_signOut().then(() => {
      console.log('Signed out of Play Games Services');
      this.analyticsProvider.trackEvent("user","logged-out", "settingspage-user-logged-out");
      this.loadingIndicator.dismissAll();
      this.goBack();
    });
  }

  confirmLogout() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "settingspage-logout-btn");
    let alert = this.alertCtrl.create({
      cssClass: 'spi-popup',
      title: 'Confirm logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Logout',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    alert.present();
  }




  showAdBanner(): void {
    this.admobService.showAdmobBanner(this.admobService.ADS_IDS.HOME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
  }

  hideAdBanner(): void {
    this.admobService.hideAdmobBanner(this.admobService.ADS_IDS.HOME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
  }

  testInterstitial(): void {
    this.admobService.showAdmobInterstitial(this.admobService.ADS_IDS.TEST_HOME_INTERSTITIAL).then(() => {}, (err) => {console.log(err)});
  }

  testInterstitialVideo(): void {
    this.admobService.showAdmobInterstitialVideo(this.admobService.ADS_IDS.TEST_HOME_INTERSTITIAL_VIDEO).then(() => {}, (err) => {console.log(err)});
  }

  testAdmobRewardVideo(): void {
    this.admobService.showAdmobRewardVideo(this.admobService.ADS_IDS.TEST_HOME_REWARD_VIDEO).then(() => {}, (err) => {console.log(err)});
  }

  testGPlayLogin(): void {
    this.currentUserProvider.GPG_auth().then(() => console.log('Logged in to Play Games Services'));
  }

  test_GPG_fetchPlayerData(): void {
    this.currentUserProvider.GPG_fetchPlayerData();
  }

  testGPlaySignOut(): void {
    this.currentUserProvider.GPG_signOut().then(() => console.log('Signed out of Play Games Services'));
  }

  testShowLeaderboards(): void {
    this.currentUserProvider.GPG_showAllLeaderBoards().then(() => console.log('showing all leaderboards'));
  }
  testUnlockAchievement(): void {
    this.currentUserProvider.GPG_unlockAchievement('CgkI6Pqd1akEEAIQAg').then(() => console.log('achievement unlocked'));
  }

  testShowAchievements(): void {
    this.currentUserProvider.GPG_showAllAchievements().then(() => console.log('showGplayAchievements'));
  }





  goBack(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "settingspage-back-btn");
    this.navCtrl.pop({animate:true,animation:'transition',duration:500,direction:'back'});
  }

  ionViewDidLoad() {
    this.currentUserProvider.setPlayerScores();
  }

  ionViewDidEnter() {
    this.analyticsProvider.trackView("/ProfilePage");
    timer(150).subscribe(() => {
      this.admobService.showAdmobBanner(this.admobService.ADS_IDS.SETTINGS_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
    });
  }

  ionViewWillLeave() {
    this.admobService.hideAdmobBanner(this.admobService.ADS_IDS.SETTINGS_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
  }

}
