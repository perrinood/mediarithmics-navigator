define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
      // List bid optimizers
        .state('bid-optimizers/list', {
          url: '/{organisation_id}/library/bidOptimizers',
          templateUrl: 'angular/src/core/bidOptimizer/view.all.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl: 'angular/src/core/library/library-sidebar.html',
              selected: 'bid_optimizers'
            }
          }
        })
        // Create a bid optimizer
        .state('bid-optimizer/edit', {
          url: '/{organisation_id}/library/bidOptimizers/:id',
          templateUrl: 'angular/src/core/bidOptimizer/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })

        .state('bid-optimizer/reports', {
          url: '/{organisation_id}/library/bidOptimizers/:bidOptimizerId/models/:modelId/report',
          templateUrl: 'angular/src/core/bidOptimizer/reports/reports.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl: 'angular/src/core/library/library-sidebar.html',
              selected: 'bid_optimizers'
            }
          }
        });
    }
  ]);
});

