define(['./module'], function (module) {
  'use strict';

  module.controller('core/scenarios/ChooseExistingScenariosController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {

      $scope.availableScenarios = Restangular.all("scenarios").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedScenarios = [];

      $scope.done = function() {
        var scenario;
        for (var i = 0; i < $scope.selectedScenarios.length; i++) {
          scenario = $scope.selectedScenarios[i];
          $scope.$emit("mics-scenario:selected", {
            scenario : scenario,
            exclude : scenario.exclude // TODO use a wrapper ?
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});

