define(['./module'], function (module) {
  'use strict';

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('campaigns/select-campaign-template', {
          url: '/{organisation_id}/campaigns/select-campaign-template',
          templateUrl: 'src/core/campaigns/create.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/expert/edit', {
          url: '/{organisation_id}/campaigns/display/expert/edit/{campaign_id}',
          templateUrl: 'src/core/campaigns/expert/edit-campaign.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/expert/edit/campaign/edit-ad-group', {
          url: '/{organisation_id}/campaigns/display/expert/edit/:campaign_id/edit-ad-group/:ad_group_id',
          templateUrl: 'src/core/campaigns/expert/edit-ad-group.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/external/edit', {
          url: '/{organisation_id}/campaigns/display/external/edit/{campaign_id}',
          templateUrl: 'src/core/campaigns/external/edit-campaign.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display/external/edit/campaign/edit-ad-group', {
          url: '/{organisation_id}/campaigns/display/external/edit/:campaign_id/edit-ad-group/:ad_group_id',
          templateUrl: 'src/core/campaigns/external/edit-ad-group.html',
          data: {navbar: 'src/core/layout/header/navbar/empty-navbar/empty-navbar.html'}
        })
        .state('campaigns/display', {
          url: '/{organisation_id}/campaigns/display',
          templateUrl: 'src/core/campaigns/list-display-campaigns.html',
          data: {
            sidebar: {
              templateUrl : 'src/core/campaigns/campaigns-sidebar.html',
              selected: 'display_campaigns'
            }
          }
        })
        .state('campaigns/email', {
          url: '/{organisation_id}/campaigns/email',
          templateUrl: 'src/core/campaigns/list-email-campaigns.html',
          data: {
            sidebar: {
              templateUrl : 'src/core/campaigns/campaigns-sidebar.html',
              selected: 'email_campaigns'
            }
          }
        });
    }
  ]);
});
