define(['./module'], function (module) {
  'use strict';

  module.directive('mcsBidOptimizerRocReport', [
    'Restangular', 'moment',
    function (Restangular, moment) {
      return {
        restrict: 'E',
        scope: {
          report: '='

        },
        link: function link(scope, element, attrs) {

          function lines(rocPoints) {
            var randomModel = [];
            var model = [];

            //at point 0, we need to have 0 in all curves
            model.push({x: 0, y: 0});
            randomModel.push({x: 0, y: 0});

            for (var i = 0; i < rocPoints.length; i++) {
              model.push({x: rocPoints[i].$fp_ratio, y: rocPoints[i].$tp_ratio});
              randomModel.push({x: rocPoints[i].$fp_ratio, y: rocPoints[i].$fp_ratio});
            }

            //at point 1, we need to have 1 in all curves
            model.push({x: 1, y: 1});
            randomModel.push({x: 1, y: 1});

            //Line chart data should be sent as an array of series objects.
            return [
              {
                values: randomModel,
                key: 'Random',
                color: '#FE5858'
              },
              {
                values: model,
                key: 'Validation',
                color: '#092f56'
              }
            ];
          }

          scope.$watch('report', function (newVal) {
            if (newVal) {

              scope.roc = scope.report.$test_stats.$roc.$roc_points;
              scope.auc = scope.report.$test_stats.$roc.$area_under_curve;
              scope.options = {
                chart: {
                  type: 'lineChart',
                  height: 600,
                  width: 700,
                  margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 100
                  },
                  x: function (d) {
                    return d.x;
                  },
                  y: function (d) {
                    return d.y;
                  },
                  useInteractiveGuideline: true,
                  xAxis: {
                    axisLabel: '1-Specificity'
                  },
                  yAxis: {
                    axisLabel: 'Sensitivity',
                    tickFormat: function (d) {
                      return d.toFixed(3);
                    },
                    axisLabelDistance: -0.01
                  }

                }
              };

              scope.data = lines(scope.roc);

            }
          }, true);

        },

        templateUrl: 'angular/src/core/bidOptimizer/reports/view.report.roc.html'
      };

    }]);

});
