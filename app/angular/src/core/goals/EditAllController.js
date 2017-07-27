define(['./module'], function (module) {
  'use strict';

  module.controller('core/goals/EditAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal',
    function($scope, Restangular, Session, $location, $uibModal) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      Restangular.all('goals').getList({organisation_id: organisationId, archived: false}).then(function (goals) {
        $scope.goals = goals;
      });

      $scope.createGoal = function (type) {
        $location.path(Session.getWorkspacePrefixUrl() + "/goals/");
      };

      $scope.editGoal = function (goal) {
        $location.path(Session.getWorkspacePrefixUrl() + "/goals/"+ goal.id);
      };

      $scope.getGoalReportUrl = function(goal) {
        return Session.getWorkspacePrefixUrl() + "/goals/" + goal.id + "/report";
      };

      $scope.archiveGoal = function (goal) {
        var newScope = $scope.$new(true);
        newScope.goal = goal;
        $uibModal.open({
          templateUrl: 'angular/src/core/goals/archive.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/goals/ArchiveController'
        });

        return false;
      };
    }
  ]);

});
