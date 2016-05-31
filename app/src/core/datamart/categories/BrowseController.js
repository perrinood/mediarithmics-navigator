define(['./module'], function (module) {

  'use strict';

  module.controller('core/datamart/categories/BrowseController', ['$scope', '$location', '$stateParams', '$log', 'Restangular', 'core/datamart/common/Common',
    'core/common/auth/Session', 'lodash', function ($scope, $location, $stateParams, $log, Restangular, Common, Session, lodash) {

      $scope.catalogBase = '#' + Session.getWorkspacePrefixUrl() + 'datamart/categories/';
      $scope.baseUrl = '#' + Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $stateParams.catalogToken;
      $scope.itemUrl = Session.getWorkspacePrefixUrl() + '/datamart/items/' + $stateParams.catalogToken;

      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.categoriesPerPage = 10;

      if ($stateParams.categoryId && $stateParams.catalogToken) {
        // SINGLE CATEGORY VIEW

        $scope.refreshCategories = function () {
          // get parent categories
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).one('categories', $stateParams.categoryId).all('parent_categories').getList({
            sameMarket: true,
            sameLanguage: true
          }).then(function (result) {
            $scope.parents = result;
            if ($scope.parents.length === 0) {
              $scope.parents = [{id: '', name: 'Catalog'}];
            }
          });
          // get sub-categories
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).one('categories', $stateParams.categoryId).all('sub_categories').getList({
            sameMarket: true,
            sameLanguage: true
          }).then(function (result) {
            $scope.categories = result;
          });
        };

        $scope.refreshDatasheets = function () {
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).one('categories', $stateParams.categoryId).all('catalog_items').getList({
            sameMarket: true,
            sameLanguage: true
          }).then(function (result) {
            $scope.datasheets = result;
          });
        };

        Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).one('categories', $stateParams.categoryId).get().then(function (result) {
          $scope.currentCategory = result;
          $scope.refreshCategories();
          $scope.refreshDatasheets();
        });

      } else if ($stateParams.catalogToken) {
        // CATALOG VIEW

        $scope.currentCategory = null;

        $scope.refreshCategories = function (firstResult, maxResults) {
          // get all categories by query
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).all('categories').getList({
            first_result: firstResult,
            max_results: maxResults
          }).then(function (result) {
            $scope.categories = result;
          });
        };

        // in catalog view, show all items
        $scope.refreshDatasheets = function (firstResult, maxResults) {
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogToken).all('items').getList({
            first_result: firstResult,
            max_results: maxResults
          }).then(function (result) {
            $scope.datasheets = result;
          });
        };

        // fetch market definitions
        $scope.refreshCategories(0, $scope.categoriesPerPage);
        $scope.refreshDatasheets(0, 10);

      } else {

        $scope.currentCategory = null;
      }

      Restangular.one('datamarts', $scope.datamartId).all('catalogs').getList().then(function (catalogs) {
        $scope.catalogs = catalogs;
        if ($stateParams.catalogToken) {
          $scope.catalog = lodash.find(catalogs, {"token": $stateParams.catalogToken});
        } else if (catalogs.length > 0) {
          $scope.catalog = catalogs[0];
          $location.path(Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $scope.catalog.token);
        }
      });

      $scope.changeCatalog = function () {
        if ($scope.catalog) {
          $location.path(Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $scope.catalog.token);
        }
      };


      // add languageMapping controls
      $scope.languageMapping = Common.languageMapping;
    }
  ]);

});
