define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('/settings/mobileapplications/viewAll', {
          url: '/{organisation_id}/settings/mobileapplications',
          templateUrl: 'angular/src/core/settings/mobileapplications/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'mobile_applications'
            }
          }
        })
        .state('/settings/mobileapplications/edit', {
          url: '/{organisation_id}/settings/mobileapplications/edit/:appId',
          templateUrl: 'angular/src/core/settings/mobileapplications/edit.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'mobile_applications'
            }
          }
        })
        .state('/settings/mobileapplications/new', {
          url: '/{organisation_id}/settings/mobileapplications/new',
          templateUrl: 'angular/src/core/settings/mobileapplications/edit.one.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'mobile_applications'
            }
          }
        });
    }
  ]);
});
