define(['./module'], function (module) {

  'use strict';

  module.controller('core/exports/ViewOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", 'core/datamart/queries/QueryContainer',
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, QueryContainer) {
      var exportId = $stateParams.exportId;
      var organisationId = $stateParams.organisation_id;

      $scope.exportId = exportId;
      $scope.organisationId = organisationId;

      Restangular.one('exports', exportId).get().then(function (exportObj) {
        $scope['export'] = exportObj;
        var queryContainer = new QueryContainer(exportObj.datamart_id, exportObj.query_id);
        queryContainer.load().then(function sucess(loadedQueryContainer){
          $scope.queryContainer = loadedQueryContainer;
        });
      });
    }
  ]);
});

