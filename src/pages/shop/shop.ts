import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html',
})
export class ShopPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
  }

  goToMods(): void {
    //this.navCtrl.push(ModsPage, {});
  }

  goToBuffs(): void {
    //this.navCtrl.push(buffsPage, {});
  }

  goToBackgrounds(): void {
   // this.navCtrl.push(BackgroundsPage, {});
  }

  goToSkins(): void {
    //this.navCtrl.push(SkinsPage, {});
  }
  goToHome(): void {
    this.navCtrl.pop();
  }

}
