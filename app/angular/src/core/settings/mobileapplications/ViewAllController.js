define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/mobileapplications/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'lodash', '$filter',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, _, $filter) {
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPageCreative = 0;

      $scope.$watchGroup(["datamartId", "organisationId"], function (values) {
        if (values) {
          Restangular
            .all("datamarts/" + $scope.datamartId + "/mobile_applications")
            .getList({"organisation_id": $scope.organisationId, max_results: 200})
            .then(function (apps) {
              $scope.apps = apps;
            });
        }
      });

      $scope.filteredApps = function () {
        return $filter('filter')($scope.apps, $scope.searchInput);
      };

      $scope.edit = function (app) {
        $location.path(Session.getWorkspacePrefixUrl() + "/settings/mobileapplications/edit/" + app.id);
      };

      $scope.new = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/settings/mobileapplications/new");
      };

      $scope.archive = function (app) {
        Restangular.all("datamarts/" + $scope.datamartId + "/mobile_applications/" + app.id).remove({"organisation_id": $scope.organisationId}).then(function () {
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        });
      };
    }
  ]);
});
