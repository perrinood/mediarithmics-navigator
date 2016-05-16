define(['./module'], function (module) {
  'use strict';

  module.controller('core/campaigns/emails/ChooseExistingEmailRoutersController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', 'Restangular', 'core/common/auth/Session', 'core/common/ads/AdService','lodash',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, AdService, _) {
      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      Restangular.all("email_routers").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).then(function(result){
        $scope.emailRouters = result;

        if ($scope.selectedRouters && $scope.selectedRouters.length > 0){
          var selectedIds = _.map($scope.selectedRouters, function(r){
            return r.email_router_id;
          });
          var selectedRouters = _.filter($scope.emailRouters, function(r){
            return selectedIds.indexOf(r.id) !== -1;
          });
          $scope.selectedRouters = selectedRouters;
        }else{
          $scope.selectedRouters = [];
        }

      });


      $scope.done = function () {
        $scope.$emit("mics-email-router:selected", {
          routers: $scope.selectedRouters
        });        
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };

    }
  ]);
});
