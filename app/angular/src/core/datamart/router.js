define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('datamart/overview', {
          url: '/:organisation_id/datamart/overview',
          templateUrl: 'angular/src/core/datamart/index.html'
        })
        .state('datamart/items', {
          url: '/:organisation_id/datamart/items',
          templateUrl: 'angular/src/core/datamart/items/view.all.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'angular/src/core/datamart/catalog-sidebar.html',
              selected: 'items'
            }
          }
        })
        .state('datamart/items/:catalogToken', {
          url: '/:organisation_id/datamart/items/:catalogToken',
          templateUrl: 'angular/src/core/datamart/items/view.all.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'angular/src/core/datamart/catalog-sidebar.html',
              selected: 'items'
            }
          }
        })
        .state('datamart/items/:catalogToken/:itemId', {
          url: '/:organisation_id/datamart/items/:catalogToken/:itemId',
          templateUrl: 'angular/src/core/datamart/items/view.one.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'angular/src/core/datamart/catalog-sidebar.html',
              selected: 'items'
            }
          }
        })
        .state('datamart/categories/:catalogToken', {
          url: '/:organisation_id/datamart/categories/:catalogToken',
          templateUrl: 'angular/src/core/datamart/categories/browse.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'angular/src/core/datamart/catalog-sidebar.html',
              selected: 'categories'
            }
          }
        })
        .state('datamart/categories/:catalogToken/:categoryId', {
          url: '/:organisation_id/datamart/categories/:catalogToken/:categoryId',
          templateUrl: 'angular/src/core/datamart/categories/browse.html',
          data: {
            category: 'catalog',
            sidebar: {
              templateUrl: 'angular/src/core/datamart/catalog-sidebar.html',
              selected: 'categories'
            }
          }
        })
        .state('datamart/segments', {
          url: '/:organisation_id/datamart/segments',
          templateUrl: 'angular/src/core/datamart/segments/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'segments'
            }
          }
        })
        .state('datamart/segments/edit', {
          url: '/{organisation_id}/datamart/segments/:type/:segment_id',
          templateUrl: 'angular/src/core/datamart/segments/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('datamart/segments/report', {
          url: '/{organisation_id}/datamart/segments/:type/:segment_id/report',
          templateUrl: 'angular/src/core/datamart/segments/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'segments'
            }
          }
        })
        .state('datamart/segments/create', {
          url: '/{organisation_id}/datamart/segments/:type',
          templateUrl: 'angular/src/core/datamart/segments/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('datamart/partitions', {
          url: '/:organisation_id/datamart/partitions',
          templateUrl: 'angular/src/core/datamart/partitions/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'partitions'
            }
          }
        })
        .state('datamart/partitions/report', {
          url: '/{organisation_id}/datamart/partitions/:type/:partition_id/report',
          templateUrl: 'angular/src/core/datamart/partitions/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'partitions'
            }
          }
        })
        .state('datamart/partitions/edit', {
          url: '/{organisation_id}/datamart/partitions/:type/:partition_id',
          templateUrl: 'angular/src/core/datamart/partitions/edit.one.html',
          data: { navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html' }
        })
        .state('datamart/partitions/create', {
          url: '/{organisation_id}/datamart/partitions/:type',
          templateUrl: 'angular/src/core/datamart/partitions/edit.one.html',
          data: { navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html' }
        })      
        .state('datamart/monitoring', {
          url: '/:organisation_id/datamart/monitoring',
          templateUrl: 'angular/src/core/datamart/monitoring/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'monitoring'
            }
          }
        })
        .state('datamart/users/:userPointId', {
          url: '/:organisation_id/datamart/users/:userPointId?live&debug&activity_type',
          templateUrl: 'angular/src/core/datamart/users/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'search'
            }
          }
        })
        .state('datamart/users/:property/:value', {
          url: '/:organisation_id/datamart/users/:property/:value?live&debug&activity_type',
          templateUrl: 'angular/src/core/datamart/users/view.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'search'
            }
          }
        })
        .state('datamart/queries', {
          url: '/:organisation_id/datamart/queries',
          templateUrl: 'angular/src/core/datamart/queries/index.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'query'
            }
          }
        })
        .state('datamart/queries/id', {
          url: '/:organisation_id/datamart/queries/:queryId',
          templateUrl: 'angular/src/core/datamart/queries/index.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/datamart/datamart-sidebar.html',
              selected: 'query'
            }
          }
        });
    }
  ]);
});
