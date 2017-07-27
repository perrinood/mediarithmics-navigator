define(['./module'], function (module) {
  'use strict';

  module.controller('core/placementlists/ChooseExistingPlacementListController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {

      $scope.availablePlacementLists = Restangular.all("placement_lists").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedPlacementLists = [];

      $scope.done = function() {
        var placementList;
        for (var i = 0; i < $scope.selectedPlacementLists.length; i++) {
          placementList = $scope.selectedPlacementLists[i];
          $scope.$emit("mics-placement-list:selected", {
            placementList : placementList,
            exclude : placementList.exclude
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});


