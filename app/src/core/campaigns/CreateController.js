(function () {
  'use strict';

  var module = angular.module('core/campaigns');

  /*
   * Campaign
   */
  module.controller('core/campaigns/CreateController', [
    '$scope', '$location', '$log', 'core/common/auth/Session','core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',

    function($scope, $location, $log, Session, DisplayCampaignService, CampaignPluginService) {

      CampaignPluginService.getAllCampaignTemplates().then(function (templates) {
        $scope.campaignTemplates = templates;
      });

      // create button
      $scope.create = function(template) {
        var organisationId = Session.getCurrentWorkspace().organisation_id;
        DisplayCampaignService.reset();
        DisplayCampaignService.initCreateCampaign(template, organisationId).then(function(campaignId){
          var location = template.editor.create_path.replace(/{id}/g, campaignId);
          $log.debug("campaign init , campaign_id = ", campaignId);
          $location.path(location);
        });



      };

      $scope.cancel = function() {
        $location.path('/campaigns');
      };

    }
  ]);

})();
