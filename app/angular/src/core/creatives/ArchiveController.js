define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/ArchiveController', [
    '$scope', '$uibModalInstance', '$location', 'core/common/auth/Session', '$state', '$stateParams', "core/common/ErrorService",
    function ($scope, $uibModalInstance, $location, Session, $state, $stateParams, errorService) {

      $scope.done = function () {
        $scope.creative.archived = true;
        $scope.creative.put().then(function () {
          $uibModalInstance.close();
          // $state.reload();
          // see https://github.com/angular-ui/ui-router/issues/582
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
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



