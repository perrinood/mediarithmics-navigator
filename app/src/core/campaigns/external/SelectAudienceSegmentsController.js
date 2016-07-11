define(['./module'], function (module) {
  'use strict';

  module.controller('core/campaigns/external/SelectAudienceSegmentsController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session', '$filter',
    function ($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, $filter) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.currentSegmentsPage = 1;
      $scope.segmentsPerPage = 10;
      $scope.segments = Restangular.all("audience_segments").getList({organisation_id: organisationId}).$object;
      $scope.selectedSegments = [];

      $scope.filteredSegments = function () {
        var list1 = $filter('filter')($scope.segments, $scope.segmentName);
        return $filter('filter')(list1, $scope.segmentName);
      };

      $scope.done = function () {
        var segment;
        for (var i = 0; i < $scope.selectedSegments.length; i++) {
          segment = $scope.selectedSegments[i];
          $scope.$emit("mics-audience-segment:selected", {
            audience_segment: segment,
            exclude: segment.exclude
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
