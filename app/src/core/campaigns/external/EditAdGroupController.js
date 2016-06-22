define(['./module', 'angular', 'jquery'], function (module, angular, jquery) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external-campaign-editor
   */

  module.controller('core/campaigns/external/EditAdGroupController', [
    '$scope', '$location', '$stateParams', '$log', 'core/campaigns/DisplayCampaignService', 'lodash', 'core/common/auth/Session', "core/creatives/plugins/display-ad/DisplayAdService",
    function ($scope, $location, $stateParams, $log, DisplayCampaignService, _, Session, DisplayAdService) {
      var adGroupId = $stateParams.ad_group_id;
      var campaignId = $stateParams.campaign_id;
      if (!DisplayCampaignService.isInitialized() || DisplayCampaignService.getCampaignId() !== campaignId) {
        return $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display/external/edit/" + campaignId);
      }

      $scope.campaignName = DisplayCampaignService.getCampaignValue().name;
      $scope.adGroup = DisplayCampaignService.getAdGroupValue(adGroupId);

      $scope.getAds = function (adGroupId) {
        return DisplayCampaignService.getAds(adGroupId);
      };

      $scope.ads = $scope.getAds($scope.adGroup.id);
      console.log("Ad group: ", $scope.adGroup);
      console.log("Ads: ", $scope.ads);

      $scope.deleteAd = function (ad) {
        if (angular.isDefined(ad.id)) {
          DisplayCampaignService.removeAd(adGroupId, ad.id);
        }
        var index = $scope.ads.indexOf(ad);
        $scope.ads.splice(index, 1);
      };


      $scope.$on("mics-creative:add-ad", function (event, params) {
        $scope.ads.push(params.ad);
      });

      $scope.canSave = function () {
        return $scope.adGroup.name && $scope.adGroup.technical_name;
      };

      function createCreative(name, technicalName, format) {
        var options = {
          renderer: {
            groupId: "com.mediarithmics.creative.display",
            artifactId: "image-iframe"
          },
          editor: {
            groupId: "com.mediarithmics.creative.display",
            artifactId: "default-editor"
          },
          subtype: "BANNER"
        };
        var creativeContainer = DisplayAdService.initCreateDisplayAd(options);
        creativeContainer.value.name = name;
        creativeContainer.value.technical_name = technicalName;
        creativeContainer.value.format = format;
        return creativeContainer.persist();
      }

      $scope.done = function () {
        var ads = jquery.extend(true, {}, $scope.ads);
        for (var i = 0; i < ads.length; ++i) {
          var ad = ads[i];
          createCreative(ad.name, ad.technical_name, ad.format);
          DisplayCampaignService.addAd(adGroupId, ad);
        }

        $log.debug("Editing Ad Group done! :", $scope.adGroup);
        DisplayCampaignService.setAdGroupValue(adGroupId, $scope.adGroup);
        $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/external/edit/' + DisplayCampaignService.getCampaignId());
      };

      $scope.cancel = function () {
        $log.debug("Reset Ad Group");
        DisplayCampaignService.resetAdGroup(adGroupId);
        $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/external/edit/' + DisplayCampaignService.getCampaignId());
      };
    }
  ]);
});
