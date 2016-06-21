define(['./module'], function (module) {

    'use strict';

    module.controller('core/datamart/queries/NewSegmentController', [
        '$scope', '$uibModalInstance', 'Restangular', '$location', 'core/common/auth/Session',

        function ($scope, $uibModalInstance, Restangular, $location, Session) {

            $scope.cancel = function() {
                $uibModalInstance.close();
            };

            $scope.$on("mics-new-segment-popup:query-save-complete", function (event, params) {
                var queryId = params.queryId;
                var segment = {
                    name : $scope.segment.name,
                    type : "USER_QUERY",
                    query_id : queryId,
                    evaluation_mode : 'LIVE',
                    datamart_id: Session.getCurrentDatamartId()
                };

                Restangular.all('audience_segments').post(segment, {organisation_id: Session.getCurrentWorkspace().organisation_id}).then(function success(){
                    $uibModalInstance.close();
                    $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments");
                }, function failure(){
                    $scope.error = "There was an error saving new segment";
                });
            });


            $scope.submit = function() {
              $scope.queryContainer.saveOrUpdate().then(function sucess(queryContainerUpdate){
                var queryId = queryContainerUpdate.id;
                var segment = {
                    name : $scope.segment.name,
                    type : "USER_QUERY",
                    query_id : queryId,
                    evaluation_mode : 'LIVE',
                    datamart_id: Session.getCurrentDatamartId()
                };

                Restangular.all('audience_segments').post(segment, {organisation_id: Session.getCurrentWorkspace().organisation_id}).then(function success(){
                    $uibModalInstance.close();
                    $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments");
                }, function failure(reason){
                  if (reason.data && reason.data.error_id){
                    $scope.error = "An error occured while saving segment , errorId: " + reason.data.error_id;
                  } else {
                    $scope.error = "An error occured while saving segment";
                  }
                });
              }, function error(reason){
                if (reason.data && reason.data.error_id){
                  $scope.error = "An error occured while saving query , errorId: " + reason.data.error_id;
                } else {
                  $scope.error = "An error occured while saving query";
                }


              });
            };
        }
    ]);

});
