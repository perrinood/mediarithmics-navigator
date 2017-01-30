define(['./module'], function (module) {
  'use strict';

  module.factory('core/common/ads/AdService', function () {
    var service = {};
    var adTypes = {
      ALL: "ALL",
      DISPLAY_AD: "DISPLAY_AD",
      VIDEO_AD: "VIDEO_AD",
      EMAIL_TEMPLATE: "EMAIL_TEMPLATE"
    };
    var selectedAdType = adTypes.ALL;

    service.setAdTypeToVideoAd = function () {
      selectedAdType = adTypes.VIDEO_AD;
    };

    service.setAdTypeToDisplayAd = function () {
      selectedAdType = adTypes.DISPLAY_AD;
    };

    service.setAdTypeToAll = function () {
      selectedAdType = adTypes.ALL;
    };

    service.getSelectedAdType = function () {
      return selectedAdType;
    };

    service.getAdTypes = function () {
      return adTypes;
    };

    return service;
  });
});
