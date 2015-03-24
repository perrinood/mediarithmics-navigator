define(['./module'], function (module) {
  'use strict';

  module.controller('core/scenarios/QuickCreateDisplayCampaignController', [
    '$scope', '$modalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session','core/campaigns/CampaignPluginService',
    function($scope, $modalInstance, $document, $log, DisplayCampaignService, Restangular, Session, CampaignPluginService) {
        CampaignPluginService.getCampaignTemplate("com.mediarithmics.campaign.display", "default-template").then(function (template) {
            DisplayCampaignService.initCreateCampaign(template).then(function () {
                $scope.campaign = DisplayCampaignService.getCampaignValue();
            });
        });
      $scope.type = "DISPLAY";

      $scope.create = function() {
          DisplayCampaignService.save().then(function (campaignContainer) {
              $scope.$emit("mics-campaign:selected", campaignContainer);
              $modalInstance.close();
          });

      };

      $scope.cancel = function() {
        $modalInstance.close();
      };

    }
  ]);
});

