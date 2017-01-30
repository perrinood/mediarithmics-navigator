define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/items/ViewAllController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'core/common/auth/Session', 'lodash', '$location', '$log',
    function ($scope, $stateParams, Restangular, Common, Session, _, $location, $log) {
      $scope.baseUrl = $location.path();
      $scope.datamartId = Session.getCurrentDatamartId();

      $scope.refreshDatasheets = function refreshDatasheets(firstResult, maxResults) {
        $log.debug("REFRESHING DS", $scope.searchTerms);
        Restangular.one('datamarts', $scope.datamartId).one('catalogs', $scope.catalog.id).all('items').getList({
          keyword: $scope.searchTerms,
          first_result: firstResult,
          max_results: maxResults
        }).then(function (result) {
          $scope.datasheets = result;
          $log.debug("REFRESHING DONE: ", result);

        });
      };

      Restangular.one('datamarts', $scope.datamartId).all('catalogs').getList().then(function (catalogs) {
        $scope.catalogs = catalogs;
        if ($stateParams.catalogToken) {
          $scope.catalog = _.find(catalogs, {"token": $stateParams.catalogToken});
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).getList("items").then(function (items) {
            $scope.datasheets = items;
          });
        } else if (catalogs.length > 0) {
          $scope.catalog = catalogs[0];
          $location.path(Session.getWorkspacePrefixUrl() + '/datamart/items/' + $scope.catalog.token);
        }
      }, function (response) {
        $log.debug("Error with status code", response.status);
      });

      // add languageMapping controls
      $scope.languageMapping = Common.languageMapping;
    }
  ]);
});