define(['./module'], function (module) {

  'use strict';

  module.controller('core/scenarios/EditAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal',
    function ($scope, Restangular, Session, $location, $uibModal) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      Restangular.all('scenarios').getList({organisation_id: organisationId}).then(function (scenarios) {
        $scope.scenarios = scenarios;
      });

      $scope.createScenario = function (type) {
        $location.path(Session.getWorkspacePrefixUrl() + "/library/scenarios/");
      };

      $scope.getEditScenarioUrl = function (scenario) {
        return Session.getWorkspacePrefixUrl() + "/library/scenarios/" + scenario.id;
      };

      $scope.deleteScenario = function (scenario, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        var newScope = $scope.$new(true);
        newScope.scenario = scenario;
        $uibModal.open({
          templateUrl: 'angular/src/core/scenarios/delete.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/scenarios/DeleteController'
        });

        return false;
      };
    }
  ]);

});


