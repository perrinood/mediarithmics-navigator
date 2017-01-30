define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('campaigns/display/report', {
          url: '/{organisation_id}/campaigns/display/report/:campaign_id/:template',
          templateUrl: 'angular/src/core/campaigns/report/show-report.html',
          data: {
            category: 'campaigns',
            sidebar: {
              templateUrl : 'angular/src/core/campaigns/campaigns-sidebar.html',
              selected: 'display_campaigns'
            }
          }
        });
    }
  ]);
});
