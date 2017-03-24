define(['./module'], function (module) {

  'use strict';

  module.controller('core/campaigns/keywords/MainController', [
    '$scope', 'core/campaigns/DisplayCampaignContainer', 'core/campaigns/DisplayCampaignService', '$stateParams', 'core/campaigns/CampaignPluginService', 'lodash', 'Restangular', 'core/keywords/KeywordListContainer',
    function ($scope, DisplayCampaignContainer, DisplayCampaignService, $stateParams, CampaignPluginService, _, Restangular, KeywordListContainer) {
      var campaignId = $stateParams.campaign_id;

      function initView(displayNetworkAccesses) {
        $scope.campaign = DisplayCampaignService.getCampaignValue();

        $scope.isCreationMode = DisplayCampaignService.isCreationMode();

        var adgroups = DisplayCampaignService.getAdGroupValues();
        if (adgroups.length !== 0) {
          $scope.adGroup = adgroups[0];
          $scope.adGroupId = $scope.adGroup.id;
        } else {
          $scope.adGroupId = DisplayCampaignService.addAdGroup();
          $scope.adGroup = DisplayCampaignService.getAdGroupValue($scope.adGroupId);
        }

        if ($scope.isCreationMode) {
          for (var i = 0; i < displayNetworkAccesses.length; i++) {
            var displayNetworkAccess = displayNetworkAccesses[i];
            var newInventorySource = {
              display_network_access_id: displayNetworkAccess.id,
              display_network_name: displayNetworkAccess.display_network_name
            };
            DisplayCampaignService.addInventorySource(newInventorySource);
          }
        }

        $scope.keywordsList = new KeywordListContainer();
        var keywordListSelections = DisplayCampaignService.getKeywordLists($scope.adGroupId);
        // In this channel, we don't update keyword list selections but directly keyword list expressions and keyword lists.
        // See the last step for the details.
        if (keywordListSelections.length !== 0) {
          $scope.keywordsListId = keywordListSelections[0].keyword_list_id;
          $scope.keywordsList.load($scope.keywordsListId);
        }

        // TODO
        $scope.campaign.currency_code = "EUR";
        $scope.campaign.max_budget_period = "WEEK";
        $scope.campaign.max_bid_price = 1;
        $scope.campaign.total_impression_capping = 10;
        $scope.campaign.per_day_impression_capping = 10;
      }

      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.display", "keywords-targeting-editor").then(function (template) {
        // TODO load the campaign (no effect if already in cache or if this is a temporary id)
        if (!DisplayCampaignService.isInitialized() || DisplayCampaignService.getCampaignId() !== campaignId) {
          if (!campaignId || DisplayCampaignService.isTemporaryId(campaignId)) {
            DisplayCampaignService.initCreateCampaign(template)
              .then(_.bind(DisplayCampaignService.getDisplayNetworkAccessPromise, DisplayCampaignService))
              .then(initView);
          } else {
            DisplayCampaignService
              .initEditCampaign(campaignId, template)
              .then(_.bind(DisplayCampaignService.loadAdGroups, DisplayCampaignService))
              .then(_.bind(DisplayCampaignService.getDisplayNetworkAccessPromise, DisplayCampaignService))
              .then(initView);
          }
        }
      });

      $scope.container = {
        step: "step1"
      };
    }
  ]);
});


