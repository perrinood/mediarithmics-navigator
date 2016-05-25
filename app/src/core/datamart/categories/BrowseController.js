define(['./module'], function (module) {

  'use strict';

  module.controller('core/datamart/categories/BrowseController', ['$scope', '$location', '$stateParams', 'Restangular', 'core/datamart/common/Common',
    'core/common/auth/Session', 'lodash', function ($scope, $location, $stateParams, Restangular, Common, Session, lodash) {

      $scope.catalogBase = '#' + Session.getWorkspacePrefixUrl() + 'datamart/categories/';
      $scope.baseUrl = '#' + Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $stateParams.catalogId;
      $scope.itemUrl = '#' + Session.getWorkspacePrefixUrl() + '/datamart/items';

      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.categoriesPerPage = 10;

      if ($stateParams.categoryId && $stateParams.catalogId) {
        // SINGLE CATEGORY VIEW

        $scope.refreshCategories = function () {
          // get parent categories
          Restangular.one('datamarts', $scope.datamartId).one('catalogs', $stateParams.catalogId).one('categories', $stateParams.categoryId).all('parent_categories').getList({
            sameMarket: true,
            sameLanguage: true
          }).then(function (result) {
            $scope.parents = result;
            if ($scope.parents.length === 0) {
              $scope.parents = [{id: '', name: 'Catalog'}];
            }
          });
          // get sub-categories
          Restangular.one('datamarts', $scope.datamartId).one('catalogs', $stateParams.catalogId).one('categories', $stateParams.categoryId).all('sub_categories').getList({
            sameMarket: true,
            sameLanguage: true
          }).then(function (result) {
            $scope.categories = result;
          });
        };

        $scope.refreshDatasheets = function (catalogId) {
          Restangular.one('datamarts', $scope.datamartId).one('catalogs', $stateParams.catalogId).one('categories', $stateParams.categoryId).all('catalog_items').getList({
            sameMarket: true,
            sameLanguage: true
          }).then(function (result) {
            $scope.datasheets = result;
          });
        };

        Restangular.one('datamarts', $scope.datamartId).one('catalogs', $stateParams.catalogId).one('categories', $stateParams.categoryId).get().then(function (result) {
          $scope.currentCategory = result;
          $scope.refreshCategories();
          $scope.refreshDatasheets();
        });

      } else if ($stateParams.catalogId) {
        // CATALOG VIEW

        $scope.currentCategory = null;

        $scope.refreshCategories = function (firstResult, maxResults) {
          // get all categories by query
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token=' + $stateParams.catalogId).all('categories').getList({
            first_result: firstResult,
            max_results: maxResults
          }).then(function (result) {
            $scope.categories = result;
          });
        };

        // in catalog view, show all items
        $scope.refreshDatasheets = function (firstResult, maxResults) {
          Restangular.one('datamarts', $scope.datamartId).one('catalogs/token='+ $stateParams.catalogId).all('items').getList({
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
        if ($stateParams.catalogId) {
          $scope.catalog = lodash.find(catalogs, {"$catalog_id": $stateParams.catalogId});
        } else if (catalogs.length > 0) {
          $scope.catalog = catalogs[0];
          $location.path(Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $scope.catalog.$catalog_id);
        }

//         $scope.refreshCategories(0, $scope.categoriesPerPage);
//         $scope.refreshDatasheets(0, 10);
      });

      $scope.changeCatalog = function () {
        if ($scope.catalog) {
          $location.path(Session.getWorkspacePrefixUrl() + '/datamart/categories/' + $scope.catalog.$catalog_id);
        }
      };


      // add languageMapping controls
      $scope.languageMapping = Common.languageMapping;
    }
  ]);

});
