import {Component, NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {GamePage} from "../game/game";
import {timer} from "rxjs/observable/timer";
import {AnalyticsProvider} from "../../providers/analytics/analytics";
/**
 * Generated class for the PregamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pregame',
  templateUrl: 'pregame.html',
})
export class PregamePage {

  zone = new NgZone({ enableLongStackTrace: false });

  CUBE_SKINS = {
    DEFAULT: 'spi-cube-skin-default',
    FROSTED_CUBE: 'spi-cube-skin-frosted-cube'
  };

  GAME_MODES = {
    TIME_ATTACK: 'TIME_ATTACK_GAME_MODE',
    PRACTICE: 'PRACTICE_GAME_MODE'
  };

  showCardShine = false;

  selectedGameMode = '';
  selectedCubeSkin = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public analyticsProvider: AnalyticsProvider) {
  }

  selectGameMode(gameMode) {
    this.selectedGameMode = gameMode;
    localStorage.setItem("selectedGameMode", this.selectedGameMode);
  }

  selectCubeSkin(skinClass) {
    this.selectedCubeSkin = skinClass;
    localStorage.setItem("selectedCubeSkin", this.selectedCubeSkin);
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad PregamePage');
  }

  ionViewDidEnter() {
    this.analyticsProvider.trackView("/PregamePage");
    this.selectGameMode(localStorage.getItem("selectedGameMode") ? localStorage.getItem("selectedGameMode") : this.GAME_MODES.TIME_ATTACK);
    this.selectCubeSkin(localStorage.getItem("selectedCubeSkin") ? localStorage.getItem("selectedCubeSkin") : this.CUBE_SKINS.DEFAULT);
    timer(250).subscribe(() => {
      this.zone.run(() => {
        this.showCardShine = true;
      });
    });
  }

  goBack(): void {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "pregamepage-back-btn");
    this.navCtrl.pop({animate:true,animation:'transition',duration:500,direction:'back'});
  }

  goToGameFromCard() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "pregamepage-card-start-btn");
    this.goToGame();
  }

  goToGameFromStartBtn() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "pregamepage-start-btn");
    this.goToGame();
  }

  goToGame(): void {
    this.analyticsProvider.trackEvent("game-start","selected_cube_skin", this.selectedCubeSkin);
    let gameOptions = {
      boosts:{
        extraLives: 0,
        extraTime_seconds: 0,
      },
      gameMode: this.selectedGameMode,
      cubeSkin: this.selectedCubeSkin
    };

    this.navCtrl.push(GamePage, gameOptions,{animate:true,animation:'transition',duration:500,direction:'forward'});
  }
}
