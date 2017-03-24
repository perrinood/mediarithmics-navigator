define(['./module'], function (module) {
  'use strict';

  module.directive("micsScenarioStatus", [
    function () {
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: "angular/src/core/scenarios/scenarioStatusTemplate.html",
        scope : {
          "scenario" : "=micsScenarioStatus"
        },
        controller : [
          "$scope", "Restangular", "core/common/ErrorService",
          function ($scope, Restangular, errorService) {

            var updateScenarioStatus = function (scenario, status) {
              Restangular.one("scenarios", scenario.id).customPUT({
                status : status
              }).then(function(returnedScenario) {
                scenario.status = returnedScenario.status;
              }, function failure(response) {
                errorService.showErrorModal({
                  error: response,
                  messageType:"simple"
                });
              });
            };

            $scope.activateScenario = function (scenario) {
              updateScenarioStatus(scenario, "ACTIVE");
            };

            $scope.pauseScenario = function (scenario) {
              updateScenarioStatus(scenario, "PAUSED");
            };

          }
        ]
      };
    }
  ]);
});



