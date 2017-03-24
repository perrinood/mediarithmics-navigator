define(['./module'], function (module) {

  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('library/scenarios', {
          url:'/{organisation_id}/library/scenarios',
          templateUrl: 'angular/src/core/scenarios/view.all.html',
          data: {
            category: 'campaigns',
            sidebar: {
              templateUrl : 'angular/src/core/campaigns/campaigns-sidebar.html',
              selected: 'scenarios'
            }
          }
        })
        .state('library/scenarios/edit', {
          url:'/{organisation_id}/library/scenarios/:scenario_id',
          templateUrl: 'angular/src/core/scenarios/edit.one.html',
          data: { navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html' }
        })
        .state('library/scenarios/create', {
          url:'/{organisation_id}/library/scenarios/',
          templateUrl: 'angular/src/core/scenarios/edit.one.html',
          data: { navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html' }
        });
    }
  ]);

});
