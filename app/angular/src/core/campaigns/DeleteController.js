define(['./module'], function (module) {
  'use strict';

  module.controller('core/campaigns/DeleteController', [
    '$scope', '$uibModalInstance', '$location', "core/common/ErrorService",
    function ($scope, $uibModalInstance, $location, errorService) {

      $scope.done = function () {
        $scope.campaign.remove().then(function () {
          $uibModalInstance.close();
          $location.path("/");
        }, function failure(response) {
          $uibModalInstance.close();
          errorService.showErrorModal({
            error: response,
            messageType: "simple"
          });
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };
    }
  ]);
});



