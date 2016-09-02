define(['./module'], function (module) {

  'use strict';

  module.controller("core/bidOptimizer/ChooseBidOptimizerController", [
    "$scope", "$uibModal", "$log",
    function ($scope, $uibModal, $log) {

      $scope.bidOptimizerChooseFromLibrary = function (adGroup) {
        var uploadModal = $uibModal.open({
          templateUrl: 'src/core/bidOptimizer/ChooseExistingBidOptimizer.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/bidOptimizer/ChooseExistingBidOptimizerController',
          size: "lg"
        });
      };
      $scope.bidOptimizerCreateNew = function (adGroup) {
        var uploadModal = $uibModal.open({
          templateUrl: 'src/core/bidOptimizer/create.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/bidOptimizer/CreateController',
          size: "lg"
        });
      };
      $scope.bidOptimizerSetToDefault = function (adGroup) {
        $scope.$emit("mics-bid-optimizer:selected", {
          bidOptimizer: null
        });
      };

    }
  ]);
});

