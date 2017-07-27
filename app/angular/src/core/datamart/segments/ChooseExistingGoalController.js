define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/segments/ChooseExistingGoalController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'Restangular','core/common/auth/Session',
    function ($scope, $uibModalInstance, $document, $log, Restangular, Session) {
      $scope.availableGoals = Restangular.all('goals').getList({'organisation_id': Session.getCurrentWorkspace().organisation_id}).$object;
      $scope.selectedGoals = [];

      $scope.done = function () {
        var selectedGoal;
        for (var i = 0; i < $scope.selectedGoals.length; i++) {
          selectedGoal = $scope.selectedGoals[i];
          $scope.$emit("mics-audience-segment:goal-selected", selectedGoal);
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };
    }
  ]);
});
