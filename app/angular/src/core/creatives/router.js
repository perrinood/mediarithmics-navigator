define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('display_creatives', {
          url: '/{organisation_id}/creatives/display-ad',
          templateUrl: 'angular/src/core/creatives/display-ads-list.html',
          data: {
            category: 'creatives',
            sidebar: {
              templateUrl : 'angular/src/core/creatives/creatives-sidebar.html',
              selected: 'display_ads'
            }
          }
        }).state('email_creatives', {
          url: '/{organisation_id}/creatives/email-template',
          templateUrl: 'angular/src/core/creatives/email-templates-list.html',
          data: {
            category: 'creatives',
            sidebar: {
              templateUrl : 'angular/src/core/creatives/creatives-sidebar.html',
              selected: 'email_templates'
            }
          }
        });
    }
  ]);
});
