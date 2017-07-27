define(['./module'], function (module) {

  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('library/placementlists', {
          url: '/{organisation_id}/library/placementlists',
          templateUrl: 'angular/src/core/placementlists/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/library/library-sidebar.html',
              selected: 'placement_lists'
            }
          }
        })
        .state('library/placementlists/new', {
          url: '/{organisation_id}/library/placementlists/new',
          templateUrl: 'angular/src/core/placementlists/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('library/placementlists/edit', {
          url: '/{organisation_id}/library/placementlists/:placementlist_id',
          templateUrl: 'angular/src/core/placementlists/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('library/placementdescriptor/edit', {
          url: '/{organisation_id}/library/placementlists/:placementlist_id/descriptor/:descriptor_id',
          templateUrl: 'angular/src/core/placementlists/edit.descriptor.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('library/placementdescriptor/new', {
          url: '/{organisation_id}/library/placementlists/:placementlist_id/descriptor',
          templateUrl: 'angular/src/core/placementlists/edit.descriptor.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);
});
