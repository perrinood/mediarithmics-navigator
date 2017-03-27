define(['./module'], function (module) {

  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
      .state('library/exports', {
        url:'/{organisation_id}/library/exports',
        templateUrl: 'angular/src/core/exports/view.all.html',
        data: {
          sidebar: {
            templateUrl: 'angular/src/core/library/library-sidebar.html',
            selected: 'exports'
          }
        }
      })
      .state('library/exports/id', {
        url:'/{organisation_id}/library/exports/:exportId',
        templateUrl: 'angular/src/core/exports/view.one.html',
        data: {
          sidebar: {
            templateUrl: 'angular/src/core/library/library-sidebar.html',
            selected: 'exports'
          }
        }
      })
      .state('library/exports/id/edit', {
        url:'/{organisation_id}/library/exports/:exportId/edit',
        templateUrl: 'angular/src/core/exports/edit.one.html',
        data: {
          navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'
        }
      });
    }
  ]);
});
