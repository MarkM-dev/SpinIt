import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { CountUpModule } from 'countup.js-angular2';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {GamePage} from "../pages/game/game";
import {SwipeManager} from "../pages/game/swipe-manager";
import {SettingsPage} from "../pages/settings/settings";
import {ShopPage} from "../pages/shop/shop";
import {PregamePage} from "../pages/pregame/pregame";

import { AdMob } from "ionic-admob";
import { AdmobProvider } from '../providers/admob/admob';
import {GooglePlayGamesServices} from "@ionic-native/google-play-games-services";
import { CurrentUserProvider } from '../providers/current-user/current-user';
import { InAppPurchaseProvider } from '../providers/in-app-purchase/in-app-purchase';
import {InAppPurchase2} from "@ionic-native/in-app-purchase-2";
import {SocialSharing} from "@ionic-native/social-sharing/ngx";
import { AnalyticsProvider } from '../providers/analytics/analytics';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PregamePage,
    GamePage,
    SettingsPage,
    ShopPage,
    SwipeManager
  ],
  imports: [
    BrowserModule,
    CountUpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GamePage,
    PregamePage,
    SettingsPage,
    ShopPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AndroidFullScreen,
    AdMob,
    GooglePlayGamesServices,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AdmobProvider,
    CurrentUserProvider,
    InAppPurchase2,
    InAppPurchaseProvider,
    SocialSharing,
    AnalyticsProvider
  ]
})
export class AppModule {}
