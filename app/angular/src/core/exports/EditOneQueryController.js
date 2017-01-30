define(['./module'], function (module) {

  'use strict';

  module.controller('core/exports/EditOneQueryController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", 'core/common/ErrorService', '$uibModal',
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, ErrorService, $uibModal) {
      var exportId = $stateParams.exportId;

      Restangular.one('exports', exportId).get().then(function (exportObj) {
        $scope['export'] = exportObj;
      });

      $scope.editQuery = function () {
        var newScope = $scope.$new(true);
        newScope.queryContainer = $scope.queryContainer.copy();
        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/segments/edit-query.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/datamart/segments/EditQueryController',
          windowClass: 'edit-query-popin'
        }).result.then(function ok(queryContainerUpdate){
          $scope.queryContainer = queryContainerUpdate;
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/library/exports/" + exportId);
      };

      $scope.done = function () {
        waitingService.showWaitingModal();
        $scope.queryContainer.saveOrUpdate().then(function (updateQueryContainer){
          return $scope['export'].put();
        }).then(function ok() {
          waitingService.hideWaitingModal();
          $location.path(Session.getWorkspacePrefixUrl() + "/library/exports/" + exportId);
        }, function error(response){
          waitingService.hideWaitingModal();
          ErrorService.showErrorModal({
            error: response
          });
        });
      };
    }
  ]);
});


