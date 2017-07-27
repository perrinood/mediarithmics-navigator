define(['./module'], function (module) {
  'use strict';

  module.controller('core/stylesheets/WarningModalController', function ($scope, $uibModalInstance) {
    $scope.done = function () {
      $uibModalInstance.close(true);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss(false);
    };
  });
});