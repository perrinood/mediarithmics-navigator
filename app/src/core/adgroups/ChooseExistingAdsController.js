define(['./module'], function (module) {
  'use strict';

  module.controller('core/adgroups/ChooseExistingAdsController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', 'Restangular', 'core/common/auth/Session', 'core/common/ads/AdService',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, AdService) {
      $scope.currentPageCreative = 1;
      $scope.itemsPerPage = 10;
      var creativeType = "ALL";

      if (AdService.getSelectedAdType() === AdService.getAdTypes().DISPLAY_AD) {
        creativeType = "DISPLAY_AD";
      } else if (AdService.getSelectedAdType() === AdService.getAdTypes().VIDEO_AD) {
        creativeType = "VIDEO_AD";
      }

      $scope.availableCreatives = Restangular.all("creatives").getList({
        max_results : 200,
        creative_type : creativeType,
        archived : false,
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedCreatives = [];

      $scope.done = function () {
        var creative;
        for (var i = 0; i < $scope.selectedCreatives.length; i++) {
          creative = $scope.selectedCreatives[i];
          $scope.$emit("mics-creative:selected", {
            creative: creative
          });
        }
        $uibModalInstance.close(creative);
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };

    }
  ]);
});

