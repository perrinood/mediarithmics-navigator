define(['./module', 'angular', 'jquery'], function (module, angular, $) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external-campaign-editor
   */

  module.controller('core/campaigns/external/EditAdGroupController', [
    '$scope', '$q', '$location', '$stateParams', '$log', 'Restangular', 'core/campaigns/DisplayCampaignService', 'lodash', 'core/common/auth/Session', "core/creatives/plugins/display-ad/DisplayAdService",
    function ($scope, $q, $location, $stateParams, $log, Restangular, DisplayCampaignService, _, Session, DisplayAdService) {
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

      $scope.getCreative = function (creativeId) {
        Restangular.one("display_ads", creativeId).get().then(function (creative) {
          $scope.creatives.push(creative);
        });
      };

      $scope.ads = $scope.getAds($scope.adGroup.id);
      $scope.creatives = [];
      for (var i = 0; i < $scope.ads.length; ++i) {
        if (angular.isDefined($scope.ads[i].creative_id)) {
          $scope.getCreative($scope.ads[i].creative_id);
        }
      }

      $scope.deleteAd = function (ad) {
        if (angular.isDefined(ad.id)) {
          $scope.creatives.slice($scope.creatives.indexOf(ad.id), 1);
          DisplayCampaignService.removeAd(adGroupId, ad.id);
        }
      };

      $scope.$on("mics-creative:add-creative", function (event, params) {
        $scope.creatives.push(params.creative);
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

      function adsContain(creativeId) {
        for (var i = 0; i < $scope.ads.length; ++i) {
          if ($scope.ads[i].creative_id === "" + creativeId) {
            return true;
          }
        }
        return false;
      }

      function createCreatives() {
        var promises = $scope.creatives.map(function (creative) {
          if (creative.id === undefined) {
            return createCreative(creative.name, creative.technical_name, creative.format).then(function (createdCreative) {
              var ad = {creative_id: createdCreative.id};
              ad.creative_id = createdCreative.id;
              DisplayCampaignService.addAd(adGroupId, ad);
            });
          } else if (!adsContain(creative.id)) {
            var ad = {creative_id: creative.id};
            ad.creative_id = creative.id;
            DisplayCampaignService.addAd(adGroupId, ad);
            $q.resolve(ad);
          } else {
            $q.resolve();
          }
        });

        return $q.all(promises);
      }

      $scope.done = function () {
        createCreatives().then(function () {
          DisplayCampaignService.setAdGroupValue(adGroupId, $scope.adGroup);
          $log.debug("Editing Ad Group done! :", $scope.adGroup);
          $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/external/edit/' + DisplayCampaignService.getCampaignId());
        });
      };

      $scope.cancel = function () {
        $log.debug("Reset Ad Group");
        DisplayCampaignService.resetAdGroup(adGroupId);
        $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/external/edit/' + DisplayCampaignService.getCampaignId());
      };
    }
  ]);
});
