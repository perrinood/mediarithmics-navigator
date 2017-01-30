define(['./module'], function (module) {

  'use strict';

  module.controller('core/datamart/queries/QueryExportCreatedController', [
    '$scope', '$uibModalInstance', 'Restangular', '$location', 'core/common/auth/Session',

    function ($scope, $uibModalInstance, Restangular, $location, Session) {

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

      $scope.exportPageUrl = Session.getWorkspacePrefixUrl() + "/library/exports/" + $scope.queryExportId;

      $scope.stayHere = function () {
        $uibModalInstance.dismiss();
      };

      $scope.triggerExecution = function () {
        Restangular.one('exports', $scope.queryExportId).all('executions').post({})
        .then(function () {
          $location.path($scope.exportPageUrl);
        });
      };

    }
  ]);

});


