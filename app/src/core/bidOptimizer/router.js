define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
      // List bid optimizers
        .state('bid-optimizers/list', {
          url: '/{organisation_id}/library/bidOptimizers',
          templateUrl: 'src/core/bidOptimizer/view.all.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl: 'src/core/library/library-sidebar.html',
              selected: 'bid_optimizers'
            }
          }
        })
        // Create a bid optimizer
        .state('bid-optimizer/edit', {
          url: '/{organisation_id}/library/bidOptimizers/:id',
          templateUrl: 'src/core/bidOptimizer/edit.one.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })

        .state('bid-optimizer/reports', {
          url: '/{organisation_id}/library/bidOptimizers/:bidOptimizerId/models/:modelId/report',
          templateUrl: 'src/core/bidOptimizer/reports/reports.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl: 'src/core/library/library-sidebar.html',
              selected: 'bid_optimizers'
            }
          }
        });
    }
  ]);
});

