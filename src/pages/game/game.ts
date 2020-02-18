import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {timer} from "rxjs/observable/timer";
import {AdmobProvider} from "../../providers/admob/admob";
import {CurrentUserProvider} from "../../providers/current-user/current-user";
import {Player, SignedInResponse} from "@ionic-native/google-play-games-services";
import {SplashScreen} from "@ionic-native/splash-screen";
import {AnalyticsProvider} from "../../providers/analytics/analytics";

/**
 * Generated class for the GamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GamePage {

  zone = new NgZone({ enableLongStackTrace: false });

  MODE_READY = 0;
  MODE_STARTING = 1;
  MODE_PLAYING = 2;
  MODE_FINISHED = 3;

  COMBO_BONUS_THRESHHOLD = 3;

  showStartTimerCountdown = false;
  startTimerCountdownSeconds = 3;

  mode = 0;
  points = 0;
  lives = 0;
  lives_base = 3;
  livesArr = [];
  actions = [1,2,3,4];
  conversion = {1: {name:"up", arrowDeg:0}, 2:{name:"left", arrowDeg:270}, 3:{name:"down", arrowDeg:180}, 4:{name:"right", arrowDeg:90}};
  currentAction = 0;
  currentActionRound = 0;
  actionFail = false;
  actionSuccess = false;

  previousPoints = 0;
  countUpStartVal = 0;
  countUpEndVal = 0;
  gameTime_seconds = 0;
  gameTime_base_seconds = 15;
  gameTimeAnimDuration_seconds = '0s';

  gameTimerInterval = null;

  cube;
  currentRotationDegVertical = -30;
  currentRotationDegHorizontal = -30;
  isFinishingTransition = false;

  comboSwipesNum = 0;

  finishGameReason = '';
  isCubeUpright = true;
  gameMode;
  cubeSkin;

  GAME_MODES = {
    TIME_ATTACK: 'TIME_ATTACK_GAME_MODE',
    PRACTICE: 'PRACTICE_GAME_MODE'
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, public analyticsProvider: AnalyticsProvider, private admobService: AdmobProvider, private currentUserProvider: CurrentUserProvider) {

  }

  selectAction(): void {
    this.zone.run(() => {
      this.currentAction = this.actions[Math.floor(Math.random() * this.actions.length)];
      // document.getElementById('swipeDirInstructionDiv').innerText = 'Swipe ' + this.conversion[this.currentAction].name;
      document.getElementById('swipeDirImage').style.transform = 'rotate(' + this.conversion[this.currentAction].arrowDeg + 'deg)';
    });
  }

  swipeEvent(e): void {
    // console.log(e);

    if (this.isFinishingTransition || this.mode !== this.MODE_PLAYING) {
      return;
    }
    this.zone.run(() => {

      let modulu = this.currentRotationDegVertical % 360;

      this.isCubeUpright = ((modulu < 90 && modulu > -90) || modulu == -330 || modulu == 330);

      switch(e.direction) {
        case 1: {
          this.currentRotationDegVertical += 90;
          break;
        }
        case 2: {
          if (this.isCubeUpright) {
            this.currentRotationDegHorizontal -= 90;
          } else {
            this.currentRotationDegHorizontal += 90;
          }
          break;
        }
        case 3: {
          this.currentRotationDegVertical -= 90;
          break;
        }
        case 4: {
          if (this.isCubeUpright) {
            this.currentRotationDegHorizontal += 90;
          } else {
            this.currentRotationDegHorizontal -= 90;
          }

          break;
        }
      }

      this.setCubeDegrees(this.currentRotationDegVertical, this.currentRotationDegHorizontal);

      this.previousPoints = this.points;

      if (e.direction == this.currentAction) {

          this.actionSuccess = true;
          this.points+= 10;

          this.comboSwipesNum++;
          if (this.comboSwipesNum >= this.COMBO_BONUS_THRESHHOLD) {
              let calculatedSingleStepComboPoints = Math.floor((8.5 * (this.comboSwipesNum - 1)) / 3); // enter calculations for single swipe combo bonus points here.
              this.points+= calculatedSingleStepComboPoints;
              this.countUpEndVal+= calculatedSingleStepComboPoints;

              // https://github.com/inorganik/countUp.js-angular2
              // https://github.com/inorganik/countUp.js
          }

          timer(150).subscribe(() => {
            this.actionSuccess = false;
          });
      } else {

          if (this.countUpEndVal) {
            timer(200).subscribe(() => {
              this.countUpEndVal = 0;
            });
          }

          this.actionFail = true;
          document.getElementById('swipeContainer').classList.add('animated','jello','faster');

          this.points-= 5;

          if (this.gameMode !== this.GAME_MODES.PRACTICE) {
            this.lives--;
            this.livesArr[this.lives].iconName = 'heart-outline';
          }

          if(this.points < 0){
            this.points = 0;
          }

          this.comboSwipesNum = 0;

          timer(600).subscribe(() => {
            this.actionFail = false;
            document.getElementById('swipeContainer').classList.remove('animated','jello','faster');
          });

          if (this.lives == 0) {
            this.finishGame("Out of lives!");
            return;
          }

      }

      this.currentActionRound++;
     /* if (this.currentActionRound == 11) {
        this.currentActionRound--;
        timer(150).subscribe(() => {
          this.finishGame("max rounds reached");
        });
        return;
      }*/

      this.selectAction();
    });
  }

  finishGame(reason) {

    if (this.gameTimerInterval) {
      clearInterval(this.gameTimerInterval);
    }

    this.zone.run(() => {
      this.finishGameReason = reason;
      this.isFinishingTransition = true;
    });

    if (this.gameMode !== this.GAME_MODES.PRACTICE) {
      this.setLeaderboardScores();
      this.checkForUnlockableAcheivements();
    }

    timer(1000).subscribe(() => {
      this.zone.run(() => {
        this.mode = this.MODE_FINISHED;
        this.isFinishingTransition = false;
        timer(1000).subscribe(() => {
          if (localStorage.getItem("showAdmobInterstitialVideo") === "y") {
            this.admobService.showAdmobInterstitialVideo(this.admobService.ADS_IDS.GAME_FINISH_INTERSTITIAL_VIDEO).then(() => {}, (err) => {console.log(err)});
            localStorage.setItem("showAdmobInterstitialVideo", "n");
          } else {
            localStorage.setItem("showAdmobInterstitialVideo", "y");
          }

        })
      })
    });
  }

  checkForUnlockableAcheivements() {
    if (localStorage.getItem("achievement_CgkI6Pqd1akEEAIQAg") !== "unlocked") {
      this.currentUserProvider.GPG_unlockAchievement('CgkI6Pqd1akEEAIQAg').then(() => console.log('achievement unlocked'));
      localStorage.setItem("achievement_CgkI6Pqd1akEEAIQAg", "unlocked");
    }
  }

  setLeaderboardScores() {
    this.currentUserProvider.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        this.currentUserProvider.submitUserScore(this.currentActionRound, this.currentUserProvider.LEADERBOARD_IDS.SWIPES_HIGH_SCORE, false);
        this.currentUserProvider.submitUserScore(this.points, this.currentUserProvider.LEADERBOARD_IDS.POINTS_HIGH_SCORE, false);
        this.currentUserProvider.submitUserScore(this.points, this.currentUserProvider.LEADERBOARD_IDS.TOTAL_POINTS, true);
        this.zone.run(() => {
          this.currentUserProvider.playerData.totalPoints+= this.points;
        });
      }
    });
  }

  startGameTimer() {
    this.zone.run(() => {
      let ctx = this;
      this.gameTimeAnimDuration_seconds = this.gameTime_base_seconds + this.navParams.data.boosts.extraTime_seconds + 's';
      this.gameTime_seconds = this.gameTime_base_seconds + this.navParams.data.boosts.extraTime_seconds;

      this.gameTimerInterval = setInterval(function() {
        ctx.gameTime_seconds--;
        if (ctx.gameTime_seconds <= 0) {
          ctx.finishGame("Round Time Over!");
          clearInterval(ctx.gameTimerInterval);
          return;
        }
      }, 1000);
    });
  }

  initStartTimer() {
    return new Promise((resolve, reject) => {
      this.zone.run(() => {
        this.mode = this.MODE_STARTING;

        this.startTimerCountdownSeconds = 3;

        let ctx = this;

        let interval = setInterval(function() {
          ctx.startTimerCountdownSeconds--;
          if (ctx.startTimerCountdownSeconds <= 0) {
            resolve('done');
            clearInterval(interval);
            ctx.showStartTimerCountdown = false;
            return;
          }
        }, 1000);

      });
    });
  }

  start(): void {

    this.zone.run(() => {
      this.mode = this.MODE_STARTING;
    });

    timer(0).subscribe(() => {
      this.showStartTimerCountdown = true;
      this.cube = document.getElementById('cube');
      this.setCubeDegrees(this.currentRotationDegVertical, this.currentRotationDegHorizontal);

      this.setGameLives(this.lives_base + this.navParams.data.boosts.extraLives);
      timer(1000).subscribe(() => {
        this.initStartTimer().then(() => {
          this.zone.run(() => {
            this.mode = this.MODE_PLAYING;
            timer(0).subscribe(() => {
              if (this.gameMode !== this.GAME_MODES.PRACTICE) {
                this.startGameTimer();
              }
              this.selectAction();
            });
          });
        });
      })
    });
  }

  setGameLives(lives): void {
    this.lives = lives;
    this.livesArr = this.generateLivesArr(this.lives);//[{iconName:'heart'},{iconName:'heart'}, {iconName:'heart'}, {iconName:'heart'}];
  }

  generateLivesArr(lives): any {
    let livesArr = [];

    for (let i = 0; i < lives; i++) {
      livesArr.push({iconName:'heart'});
    }
    return livesArr;
  }

  reset(): void {
    this.analyticsProvider.trackEvent('user-interaction',"tap", "gamepage-play-again-btn");
    this.zone.run(() => {
      this.mode = this.MODE_READY;
      this.currentActionRound = 0;
      this.points = 0;
      this.currentRotationDegVertical = -30;
      this.currentRotationDegHorizontal = -30;
      this.currentAction = null;
      this.startTimerCountdownSeconds = 3;
      this.comboSwipesNum = 0;
      this.countUpEndVal = 0;
      this.previousPoints = 0;
      this.gameTime_seconds = 0;
      this.lives = 0;
      this.isCubeUpright = true;
    });
    this.start();
    //this.goBack();
  }

  setCubeDegrees(vertical, horizontal): void {
    this.cube.style.transform = 'translateZ(-125px) rotateX(' + vertical + 'deg) rotateY(' + horizontal + 'deg)';
  }

  showLeaderboards() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "gamepage-leaderboards-btn");
    this.currentUserProvider.GPG_showAllLeaderBoards().then(() => console.log('showing all leaderboards'));
  }

  goBack(): void {
    this.navCtrl.pop({animate:true,animation:'transition',duration:500,direction:'back'});
  }

  goHome() {
    this.analyticsProvider.trackEvent('user-interaction', "tap", "gamepage-home-btn");
    this.navCtrl.popToRoot({animate:true,animation:'transition',duration:500,direction:'back'});
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad GamePage');
    console.log(this.navParams);
    this.cubeSkin = this.navParams.data.cubeSkin;
    this.gameMode = this.navParams.data.gameMode;
    this.start();
  }

  ionViewDidEnter() {
    this.analyticsProvider.trackView("/GamePage");
    timer(1000).subscribe(() => {
      this.admobService.showAdmobBanner(this.admobService.ADS_IDS.GAME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
    });
  }

  ionViewWillLeave() {
    this.admobService.hideAdmobBanner(this.admobService.ADS_IDS.GAME_BOTTOM_BANNER).then(() => {}, (err) => {console.log(err)});
  }

}


