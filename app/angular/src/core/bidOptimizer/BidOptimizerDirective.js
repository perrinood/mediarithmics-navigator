define(['./module'], function (module) {
  'use strict';

  module.directive('fetchBidOptimizer', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller: [
          "$scope",
          function ($scope) {
            this.setup = function (fetchBidOptimizer) {
              var asString = fetchBidOptimizer;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var bidOptimizerIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(bidOptimizerIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var bidOptimizer = Restangular.one("bid_optimizers", newValue);
                $scope[exposedVar] = bidOptimizer.get().$object;
              });
            };
          }
        ],
        link: function (scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchBidOptimizer);
        }
      };
    }
  ]);

});



