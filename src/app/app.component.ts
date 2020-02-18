import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

import { timer } from 'rxjs/observable/timer';

import { HomePage } from '../pages/home/home';
import {InAppPurchaseProvider} from "../providers/in-app-purchase/in-app-purchase";
import {AdmobProvider} from "../providers/admob/admob";
import {CurrentUserProvider} from "../providers/current-user/current-user";
import {AnalyticsProvider} from "../providers/analytics/analytics";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = HomePage;
  showSplashBg = true;
  showSplash = false;
  splashFadeOut = false;

  constructor(platform: Platform, statusBar: StatusBar, private splashScreen: SplashScreen, public analyticsProvider: AnalyticsProvider, private androidFullScreen: AndroidFullScreen, private currentUserProvider : CurrentUserProvider, private admobService: AdmobProvider, private inAppPurchaseService: InAppPurchaseProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      this.showSplashBg = true;
      this.initializeGoogleAnalyticsTracker();
      this.androidFullScreen.isImmersiveModeSupported()
        .then(() => this.androidFullScreen.immersiveMode().then(() => {
          this.inAppPurchaseService.initStore();
          this.hideSplash();
        }))
        .catch((err) => {
          console.log(err);
          this.hideSplash();
        });
    });
  }

  initializeGoogleAnalyticsTracker() {
    this.analyticsProvider.startTrackerWithId('//REMOVED//');
    /*this.nav.viewDidEnter.subscribe(
      (view) => {
        this.analyticsProvider.trackView(view.instance.constructor.name);
      }
    );*/
  }

  gplayGamesLogin() {
    this.currentUserProvider.GPG_auth().then(() => {
      //console.log('Logged in to Play Games Services')
    }, (err) => {
      this.currentUserProvider.GPG_auth().then(() => {
        //console.log('Logged in to Play Games Services')
      })
    });
  }

  hideSplash() {
    timer(700).subscribe(() => {
      this.splashScreen.hide();
      this.showSplash = true;
      if (localStorage.getItem("hasSignedInToGPG") == "y") {
        timer(2000).subscribe(() => {
          this.gplayGamesLogin();
        });
      }
      timer(4000).subscribe(() => {
        this.splashFadeOut = true;
        timer(1000).subscribe(() => {
          this.showSplash = false;
          this.showSplashBg = false;
          this.splashFadeOut = false;
        });
      });
    });
  }
}

