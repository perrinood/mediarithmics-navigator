define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        // List attribution models
        .state('attributionmodels/list', {
          url:'/{organisation_id}/library/attributionmodels',
          templateUrl: 'angular/src/core/attributionmodels/view.all.html',
          data: {
            category: 'library',
            sidebar: {
              templateUrl : 'angular/src/core/library/library-sidebar.html',
              selected: 'attribution_models'
            }
          }
        })
        // Create a attribution model
        .state('attributionmodels/edit', {
          url:'/{organisation_id}/library/attributionmodels/:id',
          templateUrl: 'angular/src/core/attributionmodels/edit.one.html',
          data: { navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html' }
        });
    }
  ]);
});

