(function () {
  'use strict';


  var module = angular.module('core/placementlists');
  module.directive('fetchPlacementList', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchPlacementList) {
              var asString = fetchPlacementList;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)\s*(with\s*(.*))?$/);
              var placementListIdExpr = match[1];
              var exposedVar = match[2];
              var withExpressions = match[4] === "expressions";
              $scope.$watch(placementListIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var placementList = Restangular.one("placement_lists", newValue);
                $scope[exposedVar] = placementList.get().$object;
                if (withExpressions) {
                  Restangular.one("placement_lists", newValue).all("placement_expressions").getList()
                  .then(function (properties) {
                    $scope[exposedVar + "Expressions"] = properties;
                  }
                  );
                }
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchPlacementList);
        }
      };
    }
  ]);

}());


