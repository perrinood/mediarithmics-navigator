define(['./module'], function (module) {
  'use strict';

  module.controller('core/scenarios/QuickCreateEmailCampaignController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/emails/EmailCampaignContainer', "Restangular", 'core/common/auth/Session', 'core/campaigns/CampaignPluginService',
    function ($scope, $uibModalInstance, $document, $log, EmailCampaignContainer, Restangular, Session, CampaignPluginService) {

      var campaignCtn = null;
      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.email", "default-editor").then(function (template) {
        campaignCtn = new EmailCampaignContainer(template.editor_version_id);
        $scope.campaign = campaignCtn.value;
      });

      $scope.type = "EMAIL";

      $scope.create = function () {
        campaignCtn.persist().then(function (campaign) {
          $scope.$emit("mics-campaign:selected", campaign);
          $uibModalInstance.close();
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };

    }
  ]);
});
