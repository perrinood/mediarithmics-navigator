define(['./module'], function (module) {

  'use strict';

  module.controller('core/common/ErrorController', [
    "$scope", "$uibModalInstance", "core/common/auth/Session", "$location", "$q",
    function ($scope, $uibModalInstance, Session, $location, $q) {
      $scope.close = function () {
        $uibModalInstance.close();
      };

      $scope.abort = function() {
        $uibModalInstance.dismiss();
        $location.path('/');
      };
    }
  ]);
});



