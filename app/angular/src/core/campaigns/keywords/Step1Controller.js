define(['./module', 'moment'], function (module, moment) {
  'use strict';

  module.controller('core/campaigns/keywords/Step1Controller', [
    "$scope", "$location",
    function ($scope, $location) {

      if ($scope.campaign) {
        $scope.schedule = $scope.campaign.start_date !== null ? "custom" : "";
        if ($scope.campaign.start_date !== null && $scope.campaign.end_date !== null) {
          $scope.campaignDateRange = {
            startDate: moment($scope.campaign.start_date),
            endDate: moment($scope.campaign.end_date)
          };
        }
      } else {
        $scope.campaignDateRange = {startDate: moment(), endDate: moment().add(20, 'days')};
        $scope.schedule = "";
      }

      $scope.cancel = function () {
        $location.path("/");
      };

      $scope.next = function () {
        if ($scope.schedule === 'custom') {
          $scope.campaign.start_date = $scope.campaignDateRange.startDate.valueOf();
          $scope.campaign.end_date = $scope.campaignDateRange.endDate.valueOf();
        } else {
          $scope.campaign.start_date = null;
          $scope.campaign.end_date = null;
        }
        $scope.container.step = "step2";
      };
    }
  ]);
});


