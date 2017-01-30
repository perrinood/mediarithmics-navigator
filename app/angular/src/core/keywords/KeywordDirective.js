define(['./module'], function (module) {
  'use strict';


  module.directive('fetchKeywordList', [
    "Restangular",
    function (Restangular) {
      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function(fetchKeywordList) {
              var asString = fetchKeywordList;
              var match = asString.match(/^\s*(.+)\s+as\s+(.*?)\s*(with\s*(.*))?$/);
              var keywordListIdExpr = match[1];
              var exposedVar = match[2];
              var withExpressions = match[4] === "expressions";
              $scope.$watch(keywordListIdExpr, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                var keywordList = Restangular.one("keyword_lists", newValue);
                $scope[exposedVar] = keywordList.get().$object;
                if (withExpressions) {
                  Restangular.one("keyword_lists", newValue).all("keyword_expressions").getList()
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
          myCtrl.setup(attrs.fetchKeywordList);
        }
      };
    }
  ]);

});


