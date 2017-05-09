define(['./module'], function (module) {
  "use strict";

  module.factory('core/common/IabService', ['$log',
    function ($log) {
      var service = {};
      service.getAdSizes = function (creativeSubtype) {
        // see http://www.iab.net/guidelines/508676/508767/displayguidelines
        switch (creativeSubtype) {
          case "FACEBOOK_NEWS_FEED":
            return [{
              name: "Facebook News Feed Recommended Size",
              format: "600x315"
            }, {
              name: "Facebook News Feed Recommended Size, Square",
              format: "200x200"
            }];
          case "FACEBOOK_RIGHT_HAND_SIDE":
            return [{
              name: "Facebook Right Hand Side Recommended Size",
              format: "600x315"
            }];
          case "VIDEO":
            return [{
              name: "Linear",
              format: "600x315"
            }, {
              name: "Overlay 1",
              format: "300x50"
            }, {
              name: "Overlay 2",
              format: "450x50"
            }, {
              name: "Companion Ad 1",
              format: "300x250"
            }, {
              name: "Companion Ad 2",
              format: "300x100"
            }, {
              name: "Companion Ad 3",
              format: "468x60"
            }, {
              name: "Companion Ad 4",
              format: "728x90"
            }, {
              name: "Companion Ad 5",
              format: "300x60"
            }];
          default:
            return [{
              name: "Universal Ad Package, Medium Rectangle",
              format: "300x250"
            }, {
              name: "Universal Ad Package, Rectangle",
              format: "180x150"
            }, {
              name: "Universal Ad Package, Wide Skyscraper",
              format: "160x600"
            }, {
              name: "Universal Ad Package, Leaderboard",
              format: "728x90"
            }, {
              name: "Billboard",
              format: "970x250"
            }, {
              name: "Display Rising Stars, Filmstrip",
              format: "300x600"
            }, {
              name: "App Banner 320x50",
              format: "320x50"
            }, {
              name: "Mobile Interstitial Horizontal",
              format: "480x320"
            }, {
              name: "Mobile Interstitial Vertical",
              format: "320x480"
            }, {
              name: "Tablet Interstitial Horizontal",
              format: "1024x768"
            }, {
              name: "Tablet Interstitial Vertical",
              format: "768x1024"
            }, {
              name: "Delisted (Deprecated) Ad Unit, Square Pop-Up",
              format: "250x250"
            }, {
              name: "Delisted (Deprecated) Ad Unit, Full Banner",
              format: "468x60"
            }, {
              name: "Delisted (Deprecated) Ad Unit, Half Banner",
              format: "234x60"
            }, {
              name: "Delisted (Deprecated) Ad Unit, Skyscraper",
              format: "120x600"
            }, {
              name: "Delisted (Deprecated) Ad Unit, Large Rectangle",
              format: "336x280"
            }, {
              name: "Skin",
              format: "1800x1000"
            }, {
              name: "Native Ad",
              format: "600x600"
            }];
        }
      };
      return service;
    }
  ]);
});
