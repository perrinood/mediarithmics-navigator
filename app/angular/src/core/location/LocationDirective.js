define(['./module'], function (module) {
  'use strict';

  module.directive('mcsLocation', ["Restangular", "lodash",
    function (Restangular, _) {

      return {
        restrict: 'EA',
        controller : [
          "$scope",
          function ($scope) {
            this.setup = function (location) {

              $scope.$watch(location, function (newValue, oldValue, scope) {
                if (!newValue || !newValue.postal_code) {
                  return;
                }
                // TODO handle more than postal_code
                var locationList = Restangular.one("geoname", newValue.country).all(newValue.postal_code);
                $scope.locationList = locationList.getList().$object;
              });
            };
          }
        ],
        link: function(scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.mcsLocation);
        }
      };
    }
  ]);
});
