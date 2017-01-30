define(['./module'], function (module) {
  'use strict';

  module.controller('core/bidOptimizer/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', '$state', '$stateParams', "core/bidOptimizer/PropertyContainer", "$q",
    function ($scope, Restangular, Session, $location, $uibModal, $state, $stateParams, PropertyContainer, $q) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;


      function updateUsedModelId(bidOptimizerId, bidOptimizersUsedModel) {

        $q.all([
          Restangular.one('bid_optimizers', bidOptimizerId).all("models").getList(),
          Restangular.one('bid_optimizers', bidOptimizerId).all("properties").getList()
        ]).then(function (res) {
          var models = res[0];
          var properties = res[1];

          var latest = properties.filter(function (prop) {
            return prop.technical_name === "latest_model_id" && prop.value.value;
          })[0];
          var overriding = properties.filter(function (prop) {
            return prop.technical_name === "overriding_model_id" && prop.value.value;
          })[0];

          var modelId = (overriding || latest).value.value;
          var modelExists = models.filter(function (model) {
            return model.id === modelId;
          })[0];

          if (modelExists) {
            bidOptimizersUsedModel[bidOptimizerId] = modelId;
          }
        });

      }

      $scope.bidOptimizersUsedModel = {};

      Restangular.all("bid_optimizers").getList({
        organisation_id: $scope.organisationId
      }).then(function (bidOptimizers) {
        $scope.bidOptimizers = bidOptimizers;

        for (var j = 0; j < $scope.bidOptimizers.length; j++) {
          updateUsedModelId($scope.bidOptimizers[j].id, $scope.bidOptimizersUsedModel);

        }
      });

      $scope.createBidOptimizer = function () {
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/bidOptimizer/create.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/bidOptimizer/CreateController',
          size: "lg"
        });
        uploadModal.result.then(function () {
          // $state.reload();
          // see https://github.com/angular-ui/ui-router/issues/582
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        });
      };
    }
  ]);
});


