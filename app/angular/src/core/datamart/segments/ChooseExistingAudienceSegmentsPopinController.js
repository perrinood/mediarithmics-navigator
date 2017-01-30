define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/segments/ChooseExistingAudienceSegmentsPopinController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function ($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;

      $scope.segments = Restangular.all("audience_segments").getList({organisation_id: organisationId}).$object;
      $scope.selectedSegments = [];

      $scope.done = function () {
        var segment;
        for (var i = 0; i < $scope.selectedSegments.length; i++) {
          segment = $scope.selectedSegments[i];
          $scope.$emit("mics-audience-segment:selected", {
            audience_segment: segment,
            exclude: segment.exclude // TODO use a wrapper ?
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };
    }
  ]);
});
