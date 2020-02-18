import { Injectable } from '@angular/core';
import {InAppPurchase2} from "@ionic-native/in-app-purchase-2";
import { Events } from 'ionic-angular';

/*
  Generated class for the InAppPurchaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class InAppPurchaseProvider {

  public remove_ads_ProductObj = null;
  PRODUCTS = {
    REMOVE_ADS: {
      productId: "remove_ads",
      productAlias: "Remove Ads"
    }
  };


  static get parameters() {
    return [[InAppPurchase2], [InAppPurchase2]];
  }

  constructor(private inAppPurchase2: InAppPurchase2, private events1: Events) {
    console.log('Hello InAppPurchaseProvider Provider');
  }

  initStore() {

    if (!this.inAppPurchase2) {
      console.log('Store not available');
      return;
    }

    console.log("INIT STORE");

    let ctx = this;

    this.initLog();
    this.inAppPurchase2.verbosity = this.inAppPurchase2.DEBUG;

    console.log('registerProducts');
    this.inAppPurchase2.register({
      id: ctx.PRODUCTS.REMOVE_ADS.productId,
      alias: ctx.PRODUCTS.REMOVE_ADS.productAlias,
      type: ctx.inAppPurchase2.NON_CONSUMABLE
    });

    this.inAppPurchase2.when("Remove Ads").approved(function (order) {
      console.log('You just unlocked the FULL VERSION!');
      ctx.disableAds();
      order.finish();
    });

    this.inAppPurchase2.when("Remove Ads").updated(function (product) {
      ctx.remove_ads_ProductObj = product;
      if (product.owned) {
        ctx.disableAds();
      } else {
        ctx.enableAds();
      }
    });

    this.inAppPurchase2.ready(function() {
      console.log("\\o/ STORE READY \\o/");
      ctx.inAppPurchase2.refresh();
    });

    console.log('refresh');
    this.inAppPurchase2.refresh();
  }

  get(productIdOrAlias) {
    return this.inAppPurchase2.get(productIdOrAlias);
  }

  enableAds() {
    let myCustomEvent = new Event('enable-ads');
    document.dispatchEvent(myCustomEvent);
  }

  disableAds() {
    let myCustomEvent = new Event('disable-ads');
    document.dispatchEvent(myCustomEvent);
  }

  initLog() {
    this.inAppPurchase2.error(function(error) {
      console.log('ERROR ' + error.code + ': ' + error.message);
    });
  }

  orderProduct(productAlias) {
    this.inAppPurchase2.order(productAlias);
  }

}
