define(['./module', 'lodash'], function (module, _) {
  'use strict';

  module.controller('core/campaigns/ChooseExistingCampaignController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function ($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {

      var params = {organisation_id: Session.getCurrentWorkspace().organisation_id};
      $log.log("display ChooseExistingCampaignController");
      Restangular.all('campaigns').getList(params).then(function (campaigns) {
        $scope.availableCampaigns = campaigns;
        $log.debug("loaded campaigns ",campaigns);
        $scope.adGroupsForCampaign = {};

        _.forEach(campaigns, function(campaign){
          if(campaign.type === 'DISPLAY') {
            $scope.adGroupsForCampaign[campaign.id] = Restangular.one('display_campaigns', campaign.id).getList('ad_groups').$object;
          }
        });

      });

      $scope.choose = function (campaign, adGroup) {
        $scope.$emit("mics-campaign:selected", campaign, adGroup);

        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };

    }
  ]);
});
