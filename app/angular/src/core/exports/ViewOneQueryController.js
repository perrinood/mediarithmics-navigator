define(['./module'], function (module) {

  'use strict';

  module.controller('core/exports/ViewOneQueryController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService",
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService) {
      var exportId = $stateParams.exportId;

      Restangular.one('exports', exportId).get().then(function (exportObj) {
        $scope['export'] = exportObj;
      });

      $scope.tableParams = new NgTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        total: 0,           // length of data
        getData: function($defer, params) {
          Restangular.one('exports', exportId).all('executions').getList({
            first_result: (params.page() - 1) * params.count(),
            max_results: params.count()
          }).then(function (descriptors) {
            // update table params
            params.total(descriptors.metadata.paging.count);
            // set new data
            $defer.resolve(descriptors);
          });
        }
      });

      $scope.executeExport = function () {
        Restangular.one('exports', exportId).all('executions').post({})
        .then(function () {
         $scope.tableParams.reload();
        });
      };

      $scope.reload = function () {
         $scope.tableParams.reload();
      };

      $scope.downloadResult = function(execution) {
         var dlUrl = Restangular.one('exports', exportId).one('executions', execution.id).one("files").one("technical_name=" + execution.result.output_files[0]).getRestangularUrl() + "?access_token=" + encodeURIComponent(AuthenticationService.getAccessToken());
         $window.location = dlUrl;
      };
    }
  ]);
});


