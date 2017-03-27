define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        // List attribution models
        .state('visitanalysers/list', {
          url:'/{organisation_id}/library/visitanalysers',
          templateUrl: 'angular/src/core/visitanalysers/view.all.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl : 'angular/src/core/library/library-sidebar.html',
              selected: 'visit_analysers'
            }
          }
        })
        // Create a attribution model
        .state('visitanalysers/edit', {
          url:'/{organisation_id}/library/visitanalysers/:id',
          templateUrl: 'angular/src/core/visitanalysers/edit.one.html',
          data: { navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html' }
        });
    }
  ]);
});

