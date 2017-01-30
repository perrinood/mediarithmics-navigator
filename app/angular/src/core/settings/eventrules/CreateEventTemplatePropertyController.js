define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/eventrules/CreateEventTemplatePropertyController', function ($scope, $uibModalInstance, properties) {
    $scope.done = function () {
      if (properties[$scope.key] !== undefined) {
        $scope.error = "This property has already been defined. Please use a different key.";
      } else if ($scope.key && $scope.value) {
        $uibModalInstance.close({key: $scope.key, value: $scope.value});
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss(false);
    };
  });
});