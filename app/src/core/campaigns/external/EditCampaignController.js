define(['./module', 'moment'], function (module, moment) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external
   */

  module.controller('core/campaigns/external/EditCampaignController', [
    '$scope', '$log', '$location', '$stateParams', 'core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',
    'core/common/WaitingService', 'core/common/ErrorService', 'core/common/auth/Session',
    function ($scope, $log, $location, $stateParams, DisplayCampaignService, CampaignPluginService, WaitingService, ErrorService, Session) {
      var campaignId = $stateParams.campaign_id;

      function initView() {
        $scope.campaign = DisplayCampaignService.getCampaignValue();
        $scope.adGroups = DisplayCampaignService.getAdGroupValues();
        $scope.locations = DisplayCampaignService.getLocations();
      }

      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.display", "external-campaign-editor").then(function (template) {
        console.log("template " + template);

        // TODO load the campaign (no effect if already in cache or if this is a temporary id)
        if (!DisplayCampaignService.isInitialized() || DisplayCampaignService.getCampaignId() !== campaignId) {
          if (!campaignId || DisplayCampaignService.isTemporaryId(campaignId)) {
            DisplayCampaignService.initCreateCampaign(template).then(function () {
              initView();
            });
          } else {
            DisplayCampaignService.initEditCampaign(campaignId, template).then(function () {
              initView();
              DisplayCampaignService.loadAdGroups();
            });
          }
        } else {
          console.log("here2");
          initView();
        }

        /**
         * Ad Group Management
         */

        $scope.newAdGroup = function () {
          var adGroupId = DisplayCampaignService.addAdGroup();
          $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/external/edit/' + campaignId + '/edit-ad-group/' + adGroupId);
        };

        $scope.editAdGroup = function (adGroup) {
          $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/external/edit/' + campaignId + '/edit-ad-group/' + adGroup.id);
        };

        $scope.removeAdGroup = function (adGroup) {
          DisplayCampaignService.removeAdGroup(adGroup.id);
          // TODO find a way to let angular handle that automatically.
          $scope.adGroups = DisplayCampaignService.getAdGroupValues();
        };


        /**
         * Confirm or cancel campaign editing
         */

        $scope.save = function () {
          $scope.campaign.start_date = null;
          $scope.campaign.end_date = null;
          WaitingService.showWaitingModal();
          DisplayCampaignService.save().then(function (campaignContainer) {
            WaitingService.hideWaitingModal();
            DisplayCampaignService.reset();
            $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/report/' + campaignContainer.id + '/basic');
          }, function failure(response) {
            WaitingService.hideWaitingModal();
            ErrorService.showErrorModal({
              error: response
            }).then(null, function () {
              DisplayCampaignService.reset();
            });
          });
        };

        $scope.cancel = function () {
          DisplayCampaignService.reset();
          if ($scope.campaign && $scope.campaign.id) {
            $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/report/' + $scope.campaign.id + '/basic');
          } else {
            $location.path(Session.getWorkspacePrefixUrl());
          }
        };
      });
    }
  ])
  ;
})
;

