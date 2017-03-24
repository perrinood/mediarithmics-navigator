define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('/settings/sites/viewAll', {
          url: '/{organisation_id}/settings/sites',
          templateUrl: 'angular/src/core/settings/sites/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'sites'
            }
          }
        })
        .state('/settings/sites/edit', {
          url: '/{organisation_id}/settings/sites/edit/:siteId',
          templateUrl: 'angular/src/core/settings/sites/edit.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'sites'
            }
          }
        })
        .state('/settings/sites/new', {
          url: '/{organisation_id}/settings/sites/new',
          templateUrl: 'angular/src/core/settings/sites/edit.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'sites'
            }
          }
        });
    }
  ]);
});
