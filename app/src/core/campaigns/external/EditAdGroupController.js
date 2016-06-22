define(['./module'], function (module) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external-campaign-editor
   */

  module.controller('core/campaigns/external/EditAdGroupController', [
    '$scope', '$location', '$stateParams', '$log', 'core/campaigns/DisplayCampaignService', 'lodash','core/common/auth/Session',
    function($scope, $location, $stateParams, $log, DisplayCampaignService, _, Session) {
      var adGroupId = $stateParams.ad_group_id;
      var campaignId = $stateParams.campaign_id;
      if (!DisplayCampaignService.isInitialized() || DisplayCampaignService.getCampaignId() !== campaignId) {
        return $location.path(Session.getWorkspacePrefixUrl()+ "/campaigns/display/external/edit/" + campaignId);
      }

      $scope.campaignName = DisplayCampaignService.getCampaignValue().name;
      $scope.adGroup = DisplayCampaignService.getAdGroupValue(adGroupId);

      $scope.getAds = function (adGroupId) {
        return DisplayCampaignService.getAds(adGroupId);
      };

      $scope.deleteAd = function (adId) {
        return DisplayCampaignService.removeAd(adGroupId, adId);
      };

      $scope.$on("mics-creative:selected", function (event, params) {
        var ad = {creative_id: params.creative.id};
        DisplayCampaignService.addAd(adGroupId, ad);
      });

      $scope.canSave = function() {
        return $scope.adGroup.name && $scope.adGroup.technical_name;
      };

      $scope.done = function () {
        $log.debug("Editing Ad Group done! :", $scope.adGroup);
        DisplayCampaignService.setAdGroupValue(adGroupId, $scope.adGroup);
        $location.path(Session.getWorkspacePrefixUrl()+ '/campaigns/display/external/edit/' + DisplayCampaignService.getCampaignId());
      };

      $scope.cancel = function () {
        $log.debug("Reset Ad Group");
        DisplayCampaignService.resetAdGroup(adGroupId);
        $location.path(Session.getWorkspacePrefixUrl()+ '/campaigns/display/external/edit/' + DisplayCampaignService.getCampaignId());
      };
    }
  ]);
});
