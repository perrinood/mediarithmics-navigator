define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('campaigns/display/keywords/edit', {
          url: '/{organisation_id}/campaigns/display/keywords/:campaign_id',
          templateUrl: 'angular/src/core/campaigns/keywords/index.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
      $stateProvider
        .state('campaigns/display/keywords/create', {
          url: '/{organisation_id}/campaigns/display/keywords',
          templateUrl: 'angular/src/core/campaigns/keywords/index.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);

});

