define(['./module'], function (module) {
  'use strict';

  module.controller('core/adlayouts/WarningModalController', function ($scope, $uibModalInstance) {
    $scope.done = function () {
      $uibModalInstance.close(true);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss(false);
    };
  });
});