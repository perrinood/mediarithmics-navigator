define(['./module'], function (module) {

  'use strict';

  module.controller('core/bidOptimizer/reports/BidOptimizerReportsController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$stateParams',
    'core/bidOptimizer/PropertyContainer', '$uibModal', '$resource', 'core/configuration', 'core/common/auth/AuthenticationService',
    function ($scope, Restangular, Session, $stateParams, PropertyContainer, $uibModal, $resource, configuration, AuthenticationService) {

      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      $scope.bidOptimizerId = $stateParams.bidOptimizerId;

      $scope.showModelId = $stateParams.modelId;
      $scope.modelIdx = 0;
      $scope.statsLoading = true;

      Restangular.one('bid_optimizers', $scope.bidOptimizerId).get().then(function (bidOptimizer) {
        $scope.bidOptimizer = bidOptimizer;
      });
      $scope.properties = [];

      $scope.selectModel = function () {
        $uibModal.open({
          animation: true,
          templateUrl: 'angular/src/core/bidOptimizer/reports/selectModel.html',
          controller: 'core/bidOptimizer/reports/SelectModelController',
          scope: $scope,
          backdrop: true,
          backdropClick: true,
          resolve: {}
        });

      };


      Restangular.one('bid_optimizers', $scope.bidOptimizerId).all("properties").getList().then(function (properties) {

        var latest = properties.filter(function (prop) {
          return prop.technical_name === "latest_model_id" && prop.value.value;
        })[0];
        var overriding = properties.filter(function (prop) {
          return prop.technical_name === "overriding_model_id" && prop.value.value;
        })[0];

        $scope.usedModel = (overriding || latest).value.value;

      });


      var modelCall = $resource(configuration.WS_URL + '/bid_optimizers/:bidOptimizerId/models/:modelId/files/technical_name=report', {}, {
          get: {
            method: 'GET',
            headers: {'Authorization': AuthenticationService.getAccessToken()}
          }
        }
      );

      modelCall.get({bidOptimizerId: $scope.bidOptimizerId, modelId: $scope.showModelId}, function (res) {

        $scope.report = res.$categorical_model_report || res.$dynamic_allocation_model_report;
        $scope.modelDate = $scope.report.$date;
        $scope.statsLoading = false;

      });

    }
  ]);


});



