define(['./module'], function (module) {

  'use strict';

  module.controller('core/datamart/queries/NewQueryExportController', [
    '$scope', '$uibModalInstance', 'Restangular', '$location', 'core/common/auth/Session',

    function ($scope, $uibModalInstance, Restangular, $location, Session) {

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

      $scope.queryExport = {
        name: "",
        outputFormat: "CSV"
      };

      $scope.submit = function() {

        $scope.queryContainer.saveOrUpdate().then(function sucess(queryContainerUpdate){
          var queryId = queryContainerUpdate.id;
          var queryExport = {
            name : $scope.queryExport.name,
            type : "QUERY",
            query_id : queryId,
            output_format: $scope.queryExport.outputFormat
          };

          Restangular.all('exports').post(queryExport, {organisation_id: Session.getCurrentWorkspace().organisation_id}).then(function success(exportObj){
            return $uibModalInstance.close({
              queryExportId: exportObj.id
            });
          }, function failure(){
            $scope.error = "There was an error saving a new query export";
          });
        });
      };
    }
  ]);

});

