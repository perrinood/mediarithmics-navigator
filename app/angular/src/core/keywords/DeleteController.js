define(['./module'], function (module) {
  'use strict';

  module.controller('core/keywords/DeleteController', [
    '$scope', '$uibModalInstance', '$location', 'core/common/auth/Session','$state', '$stateParams', "core/common/ErrorService",
    function($scope, $uibModalInstance, $location, Session, $state, $stateParams, errorService) {

      $scope.done = function() {
        $scope.keywordsList.remove().then(function (){
          $uibModalInstance.close();
          $location.path(Session.getWorkspacePrefixUrl() + "/library/keywordslists");

          // $state.reload();
          // see https://github.com/angular-ui/ui-router/issues/582
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        }, function failure(response) {
          $uibModalInstance.close();
          errorService.showErrorModal({
            error: response,
            messageType:"simple"
          });
        });
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});



