define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
      // List ad layouts
        .state('adlayouts/list', {
          url: '/{organisation_id}/library/adlayouts',
          templateUrl: 'angular/src/core/adlayouts/view.all.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl: 'angular/src/core/library/library-sidebar.html',
              selected: 'ad_layouts'
            }
          }
        })
        .state('adlayouts/newAdLayout', {
          url: '/{organisation_id}/library/adlayouts/new',
          templateUrl: 'angular/src/core/adlayouts/create.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('adlayouts/newVersion', {
          url: '/{organisation_id}/library/adlayouts/:ad_layout_id/new-version',
          templateUrl: 'angular/src/core/adlayouts/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('adlayouts/duplicateVersion', {
          url: '/{organisation_id}/library/adlayouts/:ad_layout_id/new-version/:version_id',
          templateUrl: 'angular/src/core/adlayouts/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('adlayouts/editVersion', {
          url: '/{organisation_id}/library/adlayouts/:ad_layout_id/version/:version_id',
          templateUrl: 'angular/src/core/adlayouts/edit.one.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);
});

