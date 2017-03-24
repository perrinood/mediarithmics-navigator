define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('library/goals/edit', {
          url: '/{organisation_id}/goals/{goal_id}',
          templateUrl: 'angular/src/core/goals/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        }).state('library/goals', {
          url: '/{organisation_id}/library/goals',
          templateUrl: 'angular/src/core/goals/view.all.html',
          data: {
            category: 'campaigns',
            sidebar: {
              templateUrl : 'angular/src/core/campaigns/campaigns-sidebar.html',
              selected: 'goals'
            }
          }
        });
    }
  ]);
});
