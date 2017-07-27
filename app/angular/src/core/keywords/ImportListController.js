define(['./module'], function (module) {

  'use strict';


  module.controller('core/keywords/ImportListController', [
    '$scope', '$uibModalInstance', '$document', '$log', "Restangular",
    function($scope, $uibModalInstance, $document, $log, Restangular) {

      $scope.done = function(deleteExisting, keywords) {
        $scope.$emit("mics-keywords-list:import", {
          keywords : (keywords||"").replace("\r", "").split("\n"),
          deleteExisting : deleteExisting,
          type : $scope.type
        });
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});

