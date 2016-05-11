define(['./module'], function (module) {
  'use strict';

  module.directive("micsSegmentExternalFeedStatus", [
    function () {
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: "src/core/datamart/segments/segmentExternalFeedStatusTemplate.html",
        scope: {
          "externalFeed": "=micsSegmentExternalFeedStatus"
        },
        controller: [
          "$scope", "Restangular", "core/common/ErrorService",
          function ($scope, errorService) {

            var updateExternalFeedStatus = function (externalFeed, status) {
              externalFeed.status = status;
            };

            $scope.activateExternalFeed = function (externalFeed) {
              updateExternalFeedStatus(externalFeed, "ACTIVE");
            };

            $scope.pauseExternalFeed = function (externalFeed) {
              updateExternalFeedStatus(externalFeed, "PAUSED");
            };
          }
        ]
      };
    }
  ]);
});



