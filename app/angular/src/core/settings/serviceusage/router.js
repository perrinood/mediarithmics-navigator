define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('/settings/serviceusage', {
          url: '/{organisation_id}/settings/serviceusage',
          templateUrl: 'angular/src/core/settings/serviceusage/view.all.html',
          data: {
            sidebar: {
              templateUrl: 'angular/src/core/settings/settings-sidebar.html',
              selected: 'service_usage_report'
            }
          }
        });
    }
  ]);
});
