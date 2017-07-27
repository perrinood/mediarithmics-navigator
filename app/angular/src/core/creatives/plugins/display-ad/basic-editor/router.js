define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        // create
        .state('creatives/com_mediarithmics_creative_display/basic-editor/create', {
          url: '/{organisation_id}/creatives/display-ad/basic-editor/create',
          templateUrl: 'angular/src/core/creatives/plugins/display-ad/basic-editor/create.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        // edit
        .state('creatives/com_mediarithmics_creative_display/basic-editor/edit', {
          url: '/{organisation_id}/creatives/display-ad/basic-editor/edit/:creative_id',
          templateUrl: 'angular/src/core/creatives/plugins/display-ad/basic-editor/edit.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);

});

