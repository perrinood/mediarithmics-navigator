define(['./module'], function (module) {

  'use strict';

  module.controller("core/attributionmodels/ChooseAttributionModelController", [
    "$scope", "$uibModal", "$log",
    function($scope, $uibModal, $log) {

      $scope.attributionModelChooseFromLibrary = function (adGroup) {
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/attributionmodels/ChooseExistingAttributionModel.html',
          scope : $scope,
          backdrop : 'static',
          controller: 'core/attributionmodels/ChooseExistingAttributionModelController',
          size: "lg"
        });
      };
      $scope.attributionModelCreateNew = function (adGroup) {
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/attributionmodels/create.html',
          scope : $scope,
          backdrop : 'static',
          controller: 'core/attributionmodels/CreateController',
          size: "lg"
        });
      };
      $scope.attributionModelSetToDefault = function (adGroup) {
        $scope.$emit("mics-attribution-model:selected", {
          attributionModel : null
        });
      };

    }
  ]);
});

