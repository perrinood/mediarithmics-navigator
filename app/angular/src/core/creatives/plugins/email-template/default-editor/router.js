define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        // create
        .state('creatives/com_mediarithmics_template_email/default-editor/create', {
          url: '/{organisation_id}/creatives/email-template/default-editor/create',
          templateUrl: 'angular/src/core/creatives/plugins/email-template/default-editor/create.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        // edit
        .state('creatives/com_mediarithmics_template_email/default-editor/edit', {
          url: '/{organisation_id}/creatives/email-template/default-editor/edit/:creative_id',
          templateUrl: 'angular/src/core/creatives/plugins/email-template/default-editor/edit.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        });
    }
  ]);
});
