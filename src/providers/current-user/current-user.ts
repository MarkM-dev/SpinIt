import {Injectable, NgZone} from '@angular/core';
import {GooglePlayGamesServices, Player, SignedInResponse} from "@ionic-native/google-play-games-services";
import {AlertController, Platform} from "ionic-angular";


@Injectable()
export class CurrentUserProvider {

  zone = new NgZone({ enableLongStackTrace: false });

  LEADERBOARD_IDS = {
    TOTAL_POINTS: "CgkI6Pqd1akEEAIQCg", // accumulative
    POINTS_HIGH_SCORE: "CgkI6Pqd1akEEAIQCQ", // per game
    SWIPES_HIGH_SCORE: "CgkI6Pqd1akEEAIQCA", // per game
  };

  playerData = null;
//  playerData = {displayName:'PlayerOne', totalPoints:27650, pointsHighScore: 1250, swipesHighScore: 26};

  timesTriedToGPGauth = 0;

  constructor(private googlePlayGamesServices: GooglePlayGamesServices, private platform: Platform, private alertCtrl: AlertController) {

  }

  // https://ionicframework.com/docs/native/google-play-games-services/

  getleaderBoardIds() {
    return this.LEADERBOARD_IDS;
  }

  showCantLoginErr() {
    let alert = this.alertCtrl.create({
      cssClass: 'spi-popup',
      title: 'Login error',
      subTitle: "If you're having trouble logging in, please restart the game and log in when it starts again.",
      buttons: ['Okay']
    });
    alert.present();
  }

  GPG_auth() {
    this.timesTriedToGPGauth++;
    if (this.timesTriedToGPGauth > 3) {
      this.showCantLoginErr();
      this.timesTriedToGPGauth = 0;
    }
    return new Promise((resolve, reject) => {
      return this.googlePlayGamesServices.auth().then(() => {
        this.GPG_setPlayerData();
          localStorage.setItem("hasSignedInToGPG", 'y');
        resolve();
      },
        (err) => {
          this.GPG_setPlayerData();
        reject(err);
      });
    });
  }

  GPG_signOut() {
    return new Promise((resolve, reject) => {
      return this.googlePlayGamesServices.signOut().then(() => {
          this.GPG_setPlayerData();
          localStorage.setItem("hasSignedInToGPG", 'n');
          resolve();
        },
        (err) => {
          this.GPG_setPlayerData();
          reject(err);
        });
    });
  }

  GPG_isSignedIn() {
    return this.googlePlayGamesServices.isSignedIn();
  }

  GPG_fetchPlayerData() {
    // Fetch currently authenticated user's data.
   // return this.googlePlayGamesServices.showPlayer();

    this.googlePlayGamesServices.showPlayer().then((data: Player) => {
      alert(JSON.stringify(data));
    });
  }

  GPG_setPlayerData() {
    // Fetch currently authenticated user's data.
    // return this.googlePlayGamesServices.showPlayer();

    this.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        this.googlePlayGamesServices.showPlayer().then((data: Player) => {
          this.zone.run(() => {
            this.playerData = data;
            this.setPlayerScores();
          });
        });

      } else {
        this.zone.run(() => {
          this.playerData = null;
        });
      }
    });
  }

  setPlayerTotalScoreData() {
    this.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        this.setPlayerScoreForLeaderboard(this.LEADERBOARD_IDS.TOTAL_POINTS, 'totalPoints');
      }
    });
  }

  setPlayerScores() {
    this.setPlayerScoreForLeaderboard(this.LEADERBOARD_IDS.TOTAL_POINTS, 'totalPoints');
    this.setPlayerScoreForLeaderboard(this.LEADERBOARD_IDS.POINTS_HIGH_SCORE, 'pointsHighScore');
    this.setPlayerScoreForLeaderboard(this.LEADERBOARD_IDS.SWIPES_HIGH_SCORE, 'swipesHighScore');
  }

  setPlayerScoreForLeaderboard(leaderboardId, keyName) {
    this.GPG_getPlayerScoreForLeaderboardId(leaderboardId).then((score) => {
      this.zone.run(() => {
        this.playerData[keyName] = score;
      });
    }, (err) => {
      if (err.indexOf('score record for this player') > -1) {
        this.zone.run(() => {
          this.playerData[keyName] = null;
        });
      }
    });
  }

  GPG_getPlayerScoreForLeaderboardId(leaderboardId) {
    return new Promise((resolve, reject) => {
      return window['plugins'].playGamesServices.getPlayerScore({leaderboardId:leaderboardId},
        function(res){
          console.log(res);
          resolve(res.playerScore);
        },
        function(err) {
          console.log(err);
          reject(err);
        });
    });
  }

  submitUserScore(score, lederboardID, isAccumilative) {
    let ctx = this;
      window['plugins'].playGamesServices.getPlayerScore({leaderboardId:lederboardID},
        function(res){

          let newScore = 0;

          if (isAccumilative){
            newScore = res.playerScore + score;
          } else {
            if (score > res.playerScore) {
              newScore = score;
            }
          }

          if (newScore > 0) {
            ctx.GPG_submitScore(newScore, lederboardID).then((res) => {},(err) => {});
          }
        },
        function(err) {
          console.log(err);
          if (err.indexOf('score record for this player') > -1) {
            if (score > 0) {
              ctx.GPG_submitScore(score, lederboardID).then((res) => {},(err) => {});
            }
          }
        });
  }

  GPG_submitScore(score, leaderboardId) {
    return new Promise((resolve, reject) => {
      return window['plugins'].playGamesServices.submitScoreNow(
        {
          score: score,
          leaderboardId: leaderboardId
        },
        function(res){
          console.log(res);
          resolve(res.playerScore);
        },
        function(err) {
          console.log(err);
          reject(err);
        });
    });
  }

  GPG_showLeaderBoardForId(leaderboardId) {
    return this.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        return this.googlePlayGamesServices.showLeaderboard({
          leaderboardId: leaderboardId
        });
      } else {
        return this.GPG_auth().then(() => {
          return this.googlePlayGamesServices.showLeaderboard({
            leaderboardId: leaderboardId
          });
        });
      }
    });
  }

  GPG_showAllLeaderBoards() {
    return this.GPG_isSignedIn().then((signedIn: SignedInResponse) => {
      if (signedIn.isSignedIn) {
        return this.googlePlayGamesServices.showAllLeaderboards();
      } else {
        return this.GPG_auth().then(() => {return this.googlePlayGamesServices.showAllLeaderboards()});
      }
    });
  }

  GPG_incrementAchievement() {
    return this.googlePlayGamesServices.incrementAchievement({
      numSteps: 1,
      achievementId: 'SomeAchievementId'
    });
  }

  GPG_unlockAchievement(achievementId) {
    return this.googlePlayGamesServices.unlockAchievement({
      achievementId: achievementId
    });
  }

  GPG_showAllAchievements() {
    return this.googlePlayGamesServices.showAchievements();
  }

}
