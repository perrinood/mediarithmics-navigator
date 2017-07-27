define(['./module'], function (module) {
  'use strict';

  module.controller('core/scenarios/DeleteController', [
    '$scope', '$uibModalInstance', '$location', '$state', '$stateParams', "core/common/ErrorService",
    function($scope, $uibModalInstance, $location, $state, $stateParams, errorService) {

      $scope.done = function() {
        $scope.scenario.remove().then(function (){
          $uibModalInstance.close();
          $location.path("/library/scenarios");

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



