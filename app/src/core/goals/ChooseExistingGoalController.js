define(['./module'], function (module) {
  'use strict';

  module.controller('core/goals/ChooseExistingGoalController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'goals', 'Restangular',
    function ($scope, $uibModalInstance, $document, $log, goals, Restangular) {
      $scope.availableGoals = Restangular.all('goals').getList({'organisation_id': $scope.organisationId, archived: false}).$object;
      $scope.selectedGoals = goals.slice() || [];

      $scope.done = function () {
        $uibModalInstance.close($scope.selectedGoals);
      };

      $scope.cancel = function () {
        $uibModalInstance.close(goals);
      };
    }
  ]);
});
