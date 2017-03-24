define(['./module'], function (module) {
  "use strict";

    module.filter('formFactorLabel', function () {

      var formFactorLabelsMap = {
        "PERSONAL_COMPUTER":"Personal computer",
        "SMART_TV":"Smart TV",
        "GAME_CONSOLE":"Game console",
        "SMARTPHONE":"Smartphone",
        "TABLET":"Tablet",
        "WEARABLE_COMPUTER":"Wearable computer",
        "OTHER":"Other"
      };

      return function (formFactor) {
        return formFactorLabelsMap[formFactor] || formFactor;
      };
    });

    module.filter('browserFamilyLabel', function () {

      var browserFamilyLabelsMap = {
        "CHROME":"Chrome",
        "IE":"IE",
        "FIREFOX":"Firefox",
        "SAFARI":"Safari",
        "OPERA":"Opera",
        "STOCK_ANDROID":"Stock Android",
        "OTHER":"Other",
        "BOT":"Bot",
        "EMAIL_CLIENT":"Email client"
      };

      return function (browserFamily) {
        return browserFamilyLabelsMap[browserFamily] || browserFamily;
      };
    });

    module.filter('operatingSystemFamilyLabel', function () {

      var operatingSystemFamilyLabelsMap = {
        "ANDROID":"Android",
        "LINUX":"Linux",
        "MAC_OS":"Mac OS",
        "WINDOWS":"Windows",
        "IOS":"IOS",
        "OTHER":"Other"
      };

      return function (operatingSystem) {
        return operatingSystemFamilyLabelsMap[operatingSystem] || operatingSystem;
      };
    });
});
