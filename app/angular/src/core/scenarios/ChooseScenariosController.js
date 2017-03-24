define(['./module'], function (module) {

  'use strict';

  module.controller("core/scenarios/ChooseScenariosController", [
    "$scope", "$uibModal", "$log",
    function($scope, $uibModal, $log) {

      $scope.selectExistingScenarios = function() {
        // display pop-up
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/scenarios/ChooseExistingScenarios.html',
          scope : $scope,
          backdrop : 'static',
          controller: 'core/scenarios/ChooseExistingScenariosController',
          size: "lg"
        });

        uploadModal.result.then(function () {

        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

    }
  ]);
});
