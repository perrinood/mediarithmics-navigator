define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        // create
        .state('creatives/com_mediarithmics_creative_video/default-editor/create', {
          url: '/{organisation_id}/creatives/video-ad/default-editor/create',
          templateUrl: 'angular/src/core/creatives/plugins/video-ad/default-editor/create.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        // edit
        .state('creatives/com_mediarithmics_creative_video/default-editor/edit', {
          url: '/{organisation_id}/creatives/video-ad/default-editor/edit/:creative_id',
          templateUrl: 'angular/src/core/creatives/plugins/video-ad/default-editor/edit.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);

});

