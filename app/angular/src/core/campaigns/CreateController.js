define(['./module'], function (module) {
  'use strict';

  /**
   * Campaign
   */
  module.controller('core/campaigns/CreateController', [
    '$scope', '$location', '$log', 'core/common/auth/Session', 'core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',
    function ($scope, $location, $log, Session, DisplayCampaignService, CampaignPluginService) {

      CampaignPluginService.getAllCampaignEditors().then(function (editors) {
        $scope.campaignEditors = editors;
      });

      // create button
      $scope.create = function (template) {
        var organisationId = Session.getCurrentWorkspace().organisation_id;
        var datamartId = Session.getCurrentWorkspace().datamart_id;
        DisplayCampaignService.reset();
        DisplayCampaignService.initCreateCampaign(template, organisationId).then(function (campaignId) {
          var location = template.editor.create_path.replace(/{id}/g, campaignId).replace(/{organisation_id}/, organisationId).replace(/{datamart_id}/, datamartId);
          $log.debug("campaign init , campaign_id = ", campaignId);
          $location.path(location);
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl());
      };
    }
  ]);
});
