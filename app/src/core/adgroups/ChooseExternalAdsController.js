define(['./module'], function (module) {
  'use strict';

  module.controller("core/adgroups/ChooseExternalAdsController", [
    "$scope", "$uibModal", "$log", "$q", "core/common/ads/AdService",
    function ($scope, $uibModal, $log, $q, AdService) {

      $scope.setAdTypeToDisplayAd = function () {
        AdService.setAdTypeToDisplayAd();
      };

      $scope.setAdTypeToVideoAd = function () {
        AdService.setAdTypeToVideoAd();
      };

      // Upload new Ad
      $scope.addAd = function () {
        // Display pop-up
        var uploadModal = $uibModal.open({
          templateUrl: 'src/core/adgroups/add-ad.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/adgroups/AddAdController'
        });

        uploadModal.result.then(function () {});
      };

      // Select existing Ads
      $scope.selectExistingAd = function () {
        // Display pop-up
        var uploadModal = $uibModal.open({
          templateUrl: 'src/core/adgroups/ChooseExistingAds.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/adgroups/ChooseExistingAdsController',
          size: 'lg'
        });

        uploadModal.result.then(function () {});
      };
    }
  ]);
});
