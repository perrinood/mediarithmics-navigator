define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        // create
        .state('creatives/com_mediarithmics_creative_display/facebook/create', {
          url: '/{organisation_id}/creatives/display-ad/facebook/create',
          templateUrl: 'angular/src/core/creatives/plugins/display-ad/facebook/create.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);

});

