define(['./module'], function (module) {

  'use strict';

  module.controller('core/campaigns/keywords/Step3Controller', [
    "$scope", "$log", "Restangular", "lodash", 'core/campaigns/DisplayCampaignService',
    function ($scope, $log, Restangular, _, DisplayCampaignService) {

      var adGroupId = $scope.adGroupId;

      $scope.getAds = function (adGroupId) {
        return DisplayCampaignService.getAds(adGroupId);
      };

      $scope.deleteAd = function (adId) {
        return DisplayCampaignService.removeAd(adGroupId, adId);
      };

      $scope.deleteCreative = function (creativeToDelete) {
        var existingAd = _.find(DisplayCampaignService.getAdGroup(adGroupId).ads, function (ad) {
          return ad.creative_id === creativeToDelete.id;
        });
        if (existingAd) {
          DisplayCampaignService.removeAd(adGroupId, existingAd.id);
        }
      };


      $scope.$on("mics-creative:selected", function (event, params) {
        // dedup on creative id
        var existing = _.find(DisplayCampaignService.getAdGroup(adGroupId).ads, function (ad) {
          return ad.creative_id === params.creative.id;
        });

        if (!existing) {
          var ad = {creative_id: params.creative.id};
          DisplayCampaignService.addAd(adGroupId, ad);
        }
      });

      $scope.previous = function () {
        $scope.container.step = "step2";
      };

      $scope.next = function () {
        $scope.container.step = "step4";
      };
    }
  ]);
});


