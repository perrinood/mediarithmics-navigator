define(['./module'], function (module) {
  'use strict';

  module.controller('core/scenarios/QuickCreateDisplayCampaignController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', 'Restangular', 'core/common/auth/Session',
    'core/campaigns/CampaignPluginService',
    function ($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, CampaignPluginService) {
      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.display", "default-editor").then(function (template) {
        DisplayCampaignService.initCreateCampaign(template).then(function () {
          $scope.campaign = DisplayCampaignService.getCampaignValue();
        });
      });
      $scope.type = "DISPLAY";

      $scope.create = function () {
        DisplayCampaignService.save().then(function (campaignContainer) {
          $scope.$emit("mics-campaign:selected", campaignContainer);
          $uibModalInstance.close();
        });

      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };
    }
  ]);
});


