define(['./module'], function (module) {

  'use strict';

  module.controller('core/attributionmodels/CreateController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$uibModalInstance',
    function($scope, $log, Restangular, Session, _, $stateParams, $location, $uibModalInstance) {
      $scope.availableAttributionModels = Restangular.all("attribution_models").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedAttributionModelProcessor = null;
      $scope.attributionModel = {
        name : "",
        mode: "DISCOVERY",
        attributionModelProcessor : null
      };

      $scope.attributionModelIsOk = function () {
        return !!($scope.attributionModel.name && $scope.attributionModel.attributionModelProcessor);
      };

      $scope.availableAttributionModelProcessors = Restangular.all("plugins").getList({
        plugin_type : "ATTRIBUTION_PROCESSOR"
      }).$object;


      $scope.cancel = function() {
        $uibModalInstance.close();
      };

      $scope.done = function() {

        var promise = Restangular.all('attribution_models').post({
          name : $scope.attributionModel.name,
          mode: $scope.attributionModel.mode,
          group_id : $scope.attributionModel.attributionModelProcessor.split('/')[0],
          artifact_id : $scope.attributionModel.attributionModelProcessor.split('/')[1]
        }, {
          organisation_id: Session.getCurrentWorkspace().organisation_id
        });

        promise.then(function success(createdAttributionModel){
          $scope.$emit("mics-attribution-model:selected", {
            attributionModel : createdAttributionModel
          });
          $uibModalInstance.close();
        }, function failure(){
          $log.info("failure");
        });
      };
    }
  ]);
});
