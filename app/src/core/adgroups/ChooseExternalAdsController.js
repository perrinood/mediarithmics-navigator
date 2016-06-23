define(['./module'], function (module) {
  'use strict';

  module.controller("core/adgroups/ChooseExternalAdsController", [
    "$scope", "$uibModal", "$log", "$q", "core/common/ads/AdService",
    function ($scope, $uibModal, $log, $q, AdService) {
      $scope.ads = [];

      $scope.setAdTypeToDisplayAd = function () {
        AdService.setAdTypeToDisplayAd();
      };

      $scope.setAdTypeToVideoAd = function () {
        AdService.setAdTypeToVideoAd();
      };

      // We call add ad but we actually get an object with info for both a creative and an ad.
      $scope.addAd = function () {
        var uploadModal = $uibModal.open({
          templateUrl: 'src/core/adgroups/add-ad.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/adgroups/AddAdController'
        });

        uploadModal.result.then(function (creative) {
          if (creative) {
            $scope.$emit("mics-creative:add-creative", {creative: creative});
          }
        });
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

        uploadModal.result.then(function (creative) {
          if (creative) {
            $scope.$emit("mics-creative:add-creative", {creative: creative});
          }
        });
      };
    }
  ]);
});
