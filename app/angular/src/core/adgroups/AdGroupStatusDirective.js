define(['./module'], function (module) {
  'use strict';

  module.directive("micsAdGroupStatus", [
    function () {
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: "angular/src/core/adgroups/adGroupStatusTemplate.html",
        scope: {
          "adGroup": "=micsAdGroupStatus",
          "campaign": "="
        },
        controller: [
          "$scope", "Restangular", "core/common/ErrorService",
          function ($scope, Restangular, errorService) {

            var updateAdGroupStatus = function (adGroup, status) {
              Restangular.one("display_campaigns", $scope.campaign.id).one('ad_groups', adGroup.id).customPUT({
                status: status
              }).then(function (returnedAdGroup) {
                adGroup.status = returnedAdGroup.status;
              }, function failure(response) {
                errorService.showErrorModal({
                  error: response,
                  messageType: "simple"
                });
              });
            };

            $scope.activateAdGroup = function (adGroup) {
              updateAdGroupStatus(adGroup, "ACTIVE");
            };

            $scope.pauseAdGroup = function (adGroup) {
              updateAdGroupStatus(adGroup, "PAUSED");
            };
          }
        ]
      };
    }
  ]);
});



