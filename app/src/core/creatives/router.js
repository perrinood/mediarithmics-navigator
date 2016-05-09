define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('display_creatives', {
          url: '/{organisation_id}/creatives/display-ad',
          templateUrl: 'src/core/creatives/display-ads-list.html',
          data: {
            category: 'creatives',
            sidebar: {
              templateUrl : 'src/core/creatives/creatives-sidebar.html',
              selected: 'display_ads'
            }
          }
        }).state('email_creatives', {
          url: '/{organisation_id}/creatives/email-template',
          templateUrl: 'src/core/creatives/email-templates-list.html',
          data: {
            category: 'creatives',
            sidebar: {
              templateUrl : 'src/core/creatives/creatives-sidebar.html',
              selected: 'email_templates'
            }
          }
        });
    }
  ]);
});
