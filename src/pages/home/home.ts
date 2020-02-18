import { Component } from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {PregamePage} from "../pregame/pregame";
import {SettingsPage} from "../settings/settings";
import {ShopPage} from "../shop/shop";
import {AdmobProvider} from "../../providers/admob/admob";

import {timer} from "rxjs/observable/timer";
import {CurrentUserProvider} from "../../providers/current-user/current-user";
import {InAppPurchaseProvider} from "../../providers/in-app-purchase/in-app-purchase";
import {SocialSharing} from "@ionic-native/social-sharing/ngx";
import {Player, SignedInResponse} from "@ionic-native/google-play-games-services";
import {AnalyticsProvider} from "../../providers/analytics/analytics";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  pageTransitionAnimOpts = {animate:true,animation:'transition',duration:500,direction:'forward'};
  isFirstPageVisit = true;
  showUserSection = false;

  constructor(public navCtrl: NavController, private admobService: AdmobProvider, public analyticsProvider: AnalyticsProvider, private currentUserProvider : CurrentUserProvider, private inAppPurchaseService: InAppPurchaseProvider, private socialSharing: SocialSharing, private alertCtrl: AlertController) {

  }

  play(): void {
    this.analyticsProvider.trackEvent('user-interaction',"tap", "homepage-play-btn");
    this.navCtrl.push(PregamePage, {}, this.pageTransitionAnimOpts);
   /* let countdownNumberEl = document.getElementById('countdown-number');
    let countdown = 3;

    countdownNumberEl.innerText = countdown + '';

    setInterval(function() {
      countdown = --countdown <= 0 ? 3 : countdown;

      countdownNumberEl.innerText = countdown + '';
    }, 1000);*/
  }

  goToSettings(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "homepage-settings-btn");
    this.goToProfile();
  }

  goToSettingsFromProfileBanner(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "homepage-profile-banner-settings-btn");
    this.goToProfile();
  }

  goToProfile():void {
    this.currentUserProvider.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        this.navCtrl.push(SettingsPage, {}, this.pageTransitionAnimOpts);
      } else {
        this.mustLoginErr("You must be logged in to see player stats");
      }
    });
  }

  mustLoginErr(message) {
    this.analyticsProvider.trackEvent("event","error-popup", "homepage-must-login-err-popup");
    let alert = this.alertCtrl.create({
      cssClass: 'spi-popup',
      title: 'Login required',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Login',
          handler: () => {
            this.userLogin();
          }
        }
      ]
    });
    alert.present();
  }

  goToLeaderboards(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "homepage-leaderboards-btn");
    this.currentUserProvider.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        this.currentUserProvider.GPG_showAllLeaderBoards().then(() => console.log('showing all leaderboards'));
      } else {
        this.mustLoginErr("You must be logged in to participate in the leader boards");
      }
    });

    //this.navCtrl.push(LeaderboardsPage, this.pageTransitionAnimOpts);
  }

  goToShop(): void {
    this.navCtrl.push(ShopPage, {}, this.pageTransitionAnimOpts);
  }

  goToAbout(): void {
     //this.navCtrl.push(AboutPage, this.pageTransitionAnimOpts);
  }

  shareToSocial() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "homepage-shareToSocial-btn");
    let options = {
      message: 'Hey! get Spin It! and try to beat my high score :)', // not supported on some apps (Facebook, Instagram)
      subject: 'Try Spin It!', // fi. for email
      url: 'https://play.google.com/store/apps/details?id=markm.spinit',
    };
    try {
      window['plugins'].socialsharing.shareWithOptions(options, null, null);
    } catch (e) {

    }

    //this.socialSharing.shareWithOptions("Try Spin It!", "Hey! get this game and try to beat my high score :)", null, "https://play.google.com/store/apps/details?id=markm.spinit").then(() => {})
  }

  userLogin() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "homepage-userlogin");
    this.currentUserProvider.GPG_auth().then(() => {
      console.log('Logged in to Play Games Services')
    }, (err) => {
      this.currentUserProvider.GPG_auth().then(() => {
        console.log('Logged in to Play Games Services')
      })
    });
  }

  removeAds() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "homepage-remove-ads-btn");
    this.inAppPurchaseService.orderProduct(this.inAppPurchaseService.PRODUCTS.REMOVE_ADS.productAlias);
  }

  ionViewDidEnter() {
    console.log("entered");

    if (this.isFirstPageVisit) {
      timer(6500).subscribe(() => {
        this.analyticsProvider.trackView("/HomePage_first_open");
        this.showUserSection = true;
        this.admobService.showAdmobBanner(this.admobService.ADS_IDS.HOME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
      });
      this.isFirstPageVisit = false;
    } else {
        this.analyticsProvider.trackView("/HomePage_consecutive_open");
        this.showUserSection = true;
        this.admobService.showAdmobBanner(this.admobService.ADS_IDS.HOME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
    }
  }

  ionViewWillLeave() {
    this.admobService.hideAdmobBanner(this.admobService.ADS_IDS.HOME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
  }

}
