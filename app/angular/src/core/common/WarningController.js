define(['./module'], function (module) {

  'use strict';

  module.controller('core/common/WarningController', [
    "$scope", "$uibModalInstance",
    function ($scope, $uibModalInstance) {
      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

      $scope.close = function() {
        $uibModalInstance.close();
      };
    }
  ]);
});



