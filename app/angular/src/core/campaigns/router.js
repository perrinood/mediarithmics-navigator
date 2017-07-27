define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('campaigns/select-campaign-template', {
          url: '/{organisation_id}/campaigns/select-campaign-template',
          templateUrl: 'angular/src/core/campaigns/create.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/expert/edit', {
          url: '/{organisation_id}/campaigns/display/expert/edit/{campaign_id}',
          templateUrl: 'angular/src/core/campaigns/expert/edit-campaign.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/expert/edit/campaign/edit-ad-group', {
          url: '/{organisation_id}/campaigns/display/expert/edit/:campaign_id/edit-ad-group/:ad_group_id',
          templateUrl: 'angular/src/core/campaigns/expert/edit-ad-group.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/external/edit', {
          url: '/{organisation_id}/campaigns/display/external/edit/{campaign_id}',
          templateUrl: 'angular/src/core/campaigns/external/edit-campaign.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/external/edit/campaign/edit-ad-group', {
          url: '/{organisation_id}/campaigns/display/external/edit/:campaign_id/edit-ad-group/:ad_group_id',
          templateUrl: 'angular/src/core/campaigns/external/edit-ad-group.html',
          data: {navbar: 'angular/src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display', {
          url: '/{organisation_id}/campaigns/display',
          templateUrl: 'angular/src/core/campaigns/list-display-campaigns.html',
          data: {
            sidebar: {
              templateUrl : 'angular/src/core/campaigns/campaigns-sidebar.html',
              selected: 'display_campaigns'
            }
          }
        })
        .state('campaigns/email', {
          url: '/{organisation_id}/campaigns/email',
          templateUrl: 'angular/src/core/campaigns/list-email-campaigns.html',
          data: {
            sidebar: {
              templateUrl : 'angular/src/core/campaigns/campaigns-sidebar.html',
              selected: 'email_campaigns'
            }
          }
        });
    }
  ]);
});
