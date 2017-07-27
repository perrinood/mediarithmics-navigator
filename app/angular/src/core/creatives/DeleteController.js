define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/DeleteController', [
    '$scope', '$uibModalInstance', '$location', 'core/common/auth/Session', '$state', '$stateParams', "core/common/ErrorService",
    function ($scope, $uibModalInstance, $location, Session, $state, $stateParams, errorService) {

      $scope.done = function () {
        $scope.creative.remove().then(function () {
          $uibModalInstance.close();
          $location.path(Session.getWorkspacePrefixUrl()+  "/creatives");
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



