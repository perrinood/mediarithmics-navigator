define(['./module'], function (module) {

  'use strict';

  module.controller("core/location/AddLocationController", [
    "$scope", "$uibModal", "$log",
    function($scope, $uibModal, $log) {

      $scope.addPostalCodeList = function () {
        // display pop-up
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/location/AddPostalCodeList.html',
          scope : $scope,
          backdrop : 'static',
          controller: 'core/location/AddPostalCodeListController'
        });

        uploadModal.result.then(function () {

        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

    }
  ]);
});

