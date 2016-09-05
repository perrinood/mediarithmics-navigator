define(['./module'], function (module) {
  'use strict';

  module.directive('mcsBidOptimizerDataSet', [
    'Restangular', 'moment', '$stateParams', 'lodash',
    function (Restangular, moment, $stateParams, _) {
      return {
        restrict: 'E',
        scope: {
          report: '='

        },
        link: function link(scope, element, attrs) {

          scope.$watch('report', function (newVal) {
            if (newVal) {

              Restangular.one('bid_optimizers', $stateParams.bidOptimizerId).get().then(function (bidOptimizer) {
                scope.bidOptimizer = bidOptimizer;

              });

              scope.summary = scope.report.$learning_summary;
              scope.learningDataSet = scope.report.$learning_stats.$categories;
              scope.validationDataSet = scope.report.$test_stats.$categories;

              scope.learningDataSetSize = 0;
              scope.validationDataSetSize = 0;

              scope.learningDataSetSize = _.reduce(scope.learningDataSet, function (sum, elem) {
                return sum + elem.$instance_count;
              }, 0);

              scope.validationDataSetSize = _.reduce(scope.validationDataSet, function (sum, elem) {
                return sum + elem.$instance_count;
              }, 0);

            }
          }, true);

        },

        templateUrl: 'src/core/bidOptimizer/reports/view.data-set.html'
      };

    }]);

});
