define(['./module'], function (module) {
  'use strict';

  module.controller('core/goals/report/ChooseChartsController', [
    '$scope', '$uibModalInstance', 'charts', 'core/goals/report/ChartsService',
    function ($scope, $uibModalInstance, charts, ChartsService) {
      $scope.selectedCharts = [charts[0], charts[1]];
      $scope.chartsList = ChartsService.getChartsList();
      $scope.getChartName = ChartsService.getChartName;

      $scope.save = function () {
        $uibModalInstance.close($scope.selectedCharts);
      };

      $scope.cancel = function () {
        $uibModalInstance.close(charts);
      };

      $scope.swap = function() {
        var tmp = $scope.selectedCharts[0];
        $scope.selectedCharts[0] = $scope.selectedCharts[1];
        $scope.selectedCharts[1]= tmp;
      };
    }
  ]);
});


