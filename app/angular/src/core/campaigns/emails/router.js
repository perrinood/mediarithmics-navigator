define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('campaigns/email/edit', {
          url: '/{organisation_id}/campaigns/email/edit/:campaign_id',
          templateUrl: 'angular/src/core/campaigns/emails/edit-campaign.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/email/create', {
          url: '/{organisation_id}/campaigns/email/edit',
          templateUrl: 'angular/src/core/campaigns/emails/edit-campaign.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/email/report', {
          url: '/{organisation_id}/campaigns/email/report/:campaign_id/:template',
          templateUrl: 'angular/src/core/campaigns/emails/show-report.html',
          data: {
            category: 'campaigns',
            sidebar: {
              templateUrl: 'angular/src/core/campaigns/campaigns-sidebar.html',
              selected: 'email_campaigns'
            }
          }
        });
    }
  ]);

});
