define(['./module'], function (module) {
  'use strict';

  module.controller('core/adgroups/ChooseExistingAdsController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', 'Restangular', 'core/common/auth/Session', 'core/common/ads/AdService',
    function ($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, AdService) {
      $scope.currentPageCreative = 1;
      $scope.itemsPerPage = 10;
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      let creativeType = "ALL";

      if (AdService.getSelectedAdType() === AdService.getAdTypes().DISPLAY_AD) {
        creativeType = "DISPLAY_AD";
      } else if (AdService.getSelectedAdType() === AdService.getAdTypes().VIDEO_AD) {
        creativeType = "VIDEO_AD";
      }

      Restangular.all("creatives").getList({
        max_results: 1000,
        creative_type: creativeType,
        archived: false,
        organisation_id: $scope.organisationId
      }).then((creatives) => {
        Restangular.one('reference_tables/formats').get({ organisation_id: $scope.organisationId })
          .then((formats) => {
            for (let i = 0; i < formats.length; ++i) {
              for (let j = 0; j < creatives.length; ++j) {
                if (creatives[j].ad_format_id === formats[i].id) {
                  creatives[j].format = formats[i].width + "x" + formats[i].height;
                }
              }
            }
            $scope.availableCreatives = creatives;
          });
      });

      $scope.selectedCreatives = [];

      $scope.done = function () {
        let creative;
        for (let i = 0; i < $scope.selectedCreatives.length; i++) {
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

