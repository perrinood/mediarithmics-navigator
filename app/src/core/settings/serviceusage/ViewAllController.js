define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/serviceusage/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session) {
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPage = 0;
      $scope.usages = [];
    }
  ]);
});
