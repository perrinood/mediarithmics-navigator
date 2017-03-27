define(['./module'], function (module) {

  'use strict';

  module.controller("core/placementlists/ChoosePlacementListController", [
    "$scope", "$uibModal", "$log",
    function($scope, $uibModal, $log) {

      $scope.selectExistingPlacementList = function() {
        // display pop-up
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/placementlists/ChooseExistingPlacementList.html',
          scope : $scope,
          backdrop : 'static',
          controller: 'core/placementlists/ChooseExistingPlacementListController',
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

