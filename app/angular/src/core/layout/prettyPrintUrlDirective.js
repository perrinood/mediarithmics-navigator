define(['./module'], function (module) {
  'use strict';

  module.directive("prettyPrintUrl", [
    "jquery",
    function ($) {
      return {
        restrict: 'EA',
        templateUrl: "angular/src/core/layout/prettyPrintUrl.html",
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function (url) {


              var splitSearch = function (search) {
                var fragments = (search||"").split(/\&|\?/);
                var result = [];
                for (var i = 0; i < fragments.length; i++) {
                  if(fragments[i]) {
                    result.push({
                      key: fragments[i].split("=")[0],
                      value: fragments[i].split("=")[1]
                    });
                  }
                }
                return result;
              };

              $scope.expand = false;

              $scope.toggleExpand = function () {
                $scope.expand = !$scope.expand;
              };
              $scope.getSeparator = function(index) {
                return index === 0 ? "?" : "&";
              };

              $scope.$watch(url, function (newValue, oldValue, scope) {
                if (!newValue) {
                  return;
                }
                // see https://gist.github.com/jlong/2428561
                var parser = document.createElement('a');
                parser.href = newValue;
                $scope.parser = parser;
                $scope.params = splitSearch(parser.search);
                $scope.url = newValue;
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.prettyPrintUrl);
        }
      };
    }
  ]);
});


