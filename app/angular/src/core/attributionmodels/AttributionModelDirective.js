define(['./module'], function (module) {
  'use strict';

  module.directive('fetchAttributionModel', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchAttributionModel) {
              var asString = fetchAttributionModel;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)$/);
              var attributionModelIdExpr = match[1];
              var exposedVar = match[2];
              $scope.$watch(attributionModelIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var attributionModel = Restangular.one("attribution_models", newValue);
                $scope[exposedVar] = attributionModel.get().$object;
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchAttributionModel);
        }
      };
    }
  ]);

});



