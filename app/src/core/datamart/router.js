define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('datamart/overview', {
          url: '/:organisation_id/datamart/overview',
          templateUrl: 'src/core/datamart/index.html'
        })
        .state('datamart/items', {
          url: '/:organisation_id/datamart/items',
          templateUrl: 'src/core/datamart/items/view.all.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'src/core/datamart/catalog-sidebar.html',
              selected: 'items'
            }
          }
        })
        .state('datamart/items/:catalogToken', {
          url: '/:organisation_id/datamart/items/:catalogToken',
          templateUrl: 'src/core/datamart/items/view.all.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'src/core/datamart/catalog-sidebar.html',
              selected: 'items'
            }
          }
        })
        .state('datamart/items/:catalogToken/:itemId', {
          url: '/:organisation_id/datamart/items/:catalogToken/:itemId',
          templateUrl: 'src/core/datamart/items/view.one.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'src/core/datamart/catalog-sidebar.html',
              selected: 'items'
            }
          }
        })
        .state('datamart/categories/:catalogToken', {
          url: '/:organisation_id/datamart/categories/:catalogToken',
          templateUrl: 'src/core/datamart/categories/browse.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'src/core/datamart/catalog-sidebar.html',
              selected: 'categories'
            }
          }
        })
        .state('datamart/categories/:catalogToken/:categoryId', {
          url: '/:organisation_id/datamart/categories/:catalogToken/:categoryId',
          templateUrl: 'src/core/datamart/categories/browse.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'src/core/datamart/catalog-sidebar.html',
              selected: 'categories'
            }
          }
        })
        .state('datamart/segments', {
          url: '/:organisation_id/datamart/segments',
          templateUrl: 'src/core/datamart/segments/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'segments'
            }
          }
        })
        .state('datamart/segments/edit', {
          url: '/{organisation_id}/datamart/segments/:type/:segment_id',
          templateUrl: 'src/core/datamart/segments/edit.one.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('datamart/segments/report', {
          url: '/{organisation_id}/datamart/segments/:type/:segment_id/report',
          templateUrl: 'src/core/datamart/segments/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'segments'
            }
          }
        })
        .state('datamart/segments/create', {
          url: '/{organisation_id}/datamart/segments/:type',
          templateUrl: 'src/core/datamart/segments/edit.one.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('datamart/users', {
          url: '/:organisation_id/datamart/users',
          templateUrl: 'src/core/datamart/users/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'search'
            }
          }
        })
        .state('datamart/users/:userPointId', {
          url: '/:organisation_id/datamart/users/:userPointId?live&debug&activity_type',
          templateUrl: 'src/core/datamart/users/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'search'
            }
          }
        })
        .state('datamart/users/:property/:value', {
          url: '/:organisation_id/datamart/users/:property/:value?live&debug&activity_type',
          templateUrl: 'src/core/datamart/users/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'search'
            }
          }
        })
        .state('datamart/queries', {
          url: '/:organisation_id/datamart/queries',
          templateUrl: 'src/core/datamart/queries/index.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'query'
            }
          }
        })
        .state('datamart/queries/id', {
          url: '/:organisation_id/datamart/queries/:queryId',
          templateUrl: 'src/core/datamart/queries/index.html',
          data: {
            sidebar: {
              templateUrl: 'src/core/datamart/datamart-sidebar.html',
              selected: 'query'
            }
          }
        });
    }
  ]);
});
