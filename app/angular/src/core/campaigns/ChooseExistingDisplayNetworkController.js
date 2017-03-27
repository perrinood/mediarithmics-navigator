define(['./module'], function (module) {
  'use strict';

  module.controller('core/campaigns/ChooseExistingDisplayNetworkController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function ($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {
      $scope.availableInventorySources = DisplayCampaignService.getDisplayNetworkAccess();
      $scope.selectedInventorySources = [];

      $scope.done = function () {
        var inventorySource;
        for (var i = 0; i < $scope.selectedInventorySources.length; i++) {
          inventorySource = $scope.selectedInventorySources[i];
          $scope.$emit("mics-inventory-source:selected", inventorySource);
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };
    }
  ]);
});


