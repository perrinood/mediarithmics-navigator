define(['./module'], function (module) {

  'use strict';



  module.controller('core/datamart/partitions/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', '$stateParams', '$location', 'core/common/ErrorService', 'core/common/WaitingService',
    function ($scope, $log, Restangular, Session, $stateParams, $location, ErrorService, WaitingService) {
      var partitionId = $stateParams.partition_id;
      var type = $stateParams.type;

      var datamartId = Session.getCurrentDatamartId();
      var organisationId = Session.getCurrentWorkspace().organisation_id;

      var isCreationMode = !partitionId;

      $scope.isCreationMode = isCreationMode;

      if (!partitionId) {
        $scope.audiencePartition = {
          type : type          
        };

      } else {
        Restangular.one('audience_partitions', partitionId).get().then(function (partition) {
          $scope.audiencePartition = partition;          
        });
      }

      $scope.publish = function ($event){
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        WaitingService.showWaitingModal();
        saveOrUpdate($scope.audiencePartition).then(function success(updatedPartition) {
          return updatedPartition.customPUT('{}', 'publish');
        }).then(function success() {
          WaitingService.hideWaitingModal();
          $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions/" + $scope.audiencePartition.type + "/" + $scope.audiencePartition.id + "/report");
        }, function failure(reason) {
          WaitingService.hideWaitingModal();
          ErrorService.showErrorModal({
            error: reason
          });
        });

      };      

      $scope.cancel = function () {
        if (isCreationMode){
          $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions");        
        } else {
          $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions/" + $scope.audiencePartition.type + "/" + $scope.audiencePartition.id + "/report");
        }
      };

      $scope.next = function () {
        WaitingService.showWaitingModal();
        saveOrUpdate($scope.audiencePartition).then(function success(updatedPartition) {
            WaitingService.hideWaitingModal();                        
            $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions/" + updatedPartition.type + "/" + updatedPartition.id + "/report");
        }, function failure(reason) {
            WaitingService.hideWaitingModal();
            ErrorService.showErrorModal({
              error: reason
            });
        });        
      };

      function saveOrUpdate(audiencePartition){
        if (audiencePartition.id){
          return audiencePartition.put();
        } else {
          return Restangular.all('audience_partitions').post($scope.audiencePartition, { organisation_id: organisationId, datamart_id: datamartId });          
        }
      }
    }
  ]);
});
