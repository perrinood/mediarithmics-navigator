define(['./module', 'jquery'], function (module, $) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : external
   */

  module.controller('core/campaigns/external/EditCampaignController', [
    '$scope', '$log', '$uibModal', '$location', '$stateParams', 'lodash', 'core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',
    'core/common/WaitingService', 'core/common/ErrorService', 'core/common/auth/Session', 'core/campaigns/goals/GoalsService',
    function ($scope, $log, $uibModal, $location, $stateParams, _, DisplayCampaignService, CampaignPluginService, WaitingService, ErrorService, Session, GoalsService) {
      var campaignId = $stateParams.campaign_id;
      $scope.organisationId = $stateParams.organisation_id;
      $scope.goalTypes = GoalsService.getGoalTypesList();
      $scope.isConversionType = GoalsService.isConversionType;
      $scope.getConversionType = GoalsService.getConversionType;
      $scope.checkedGoalTypes = [];
      $scope.conversionGoals = [];
      $scope.campaignScopeHelper = {};

      function updateSelectedGoals() {
        $scope.selectedGoals = DisplayCampaignService.getGoalSelections();
      }

      function updateUserActivationSegments() {
        $scope.userActivationSegments = DisplayCampaignService.getUserActivationSegments();
        $scope.checkedUserActivationSegments = [];
        for(var i = 0; i < $scope.userActivationSegments.length ; i++) {
          $scope.checkedUserActivationSegments[$scope.userActivationSegments[i].clickers ? "clickers" : "exposed"] = true;
        }
        $scope.disabledUserActivationSegments = [];
        for(var j = 0; j < $scope.userActivationSegments.length ; j++) {
          $scope.disabledUserActivationSegments[$scope.userActivationSegments[j].clickers ? "clickers" : "exposed"] = ($scope.userActivationSegments[j].id !== undefined && $scope.userActivationSegments[j].id.indexOf('T') === -1);
        }
      }

      function initView() {
        $scope.moreGoals = false;
        $scope.campaign = DisplayCampaignService.getCampaignValue();
        $scope.adGroups = DisplayCampaignService.getAdGroupValues();
        $scope.goalSelections = DisplayCampaignService.getGoalSelections();
        $scope.campaignScopeHelper.defaultGoalSelection = _.find(DisplayCampaignService.getGoalSelections(), {"default": true});
        // Init selected goals
        updateSelectedGoals();
        updateUserActivationSegments();
        for (var i = 0; i < $scope.selectedGoals.length; ++i) {
          $scope.checkedGoalTypes[$scope.selectedGoals[i].goal_selection_type] = true;
          if (GoalsService.isConversionType($scope.selectedGoals[i].goal_selection_type)) {
            $scope.conversionGoals.push($scope.selectedGoals[i]);
          }
        }
        $scope.locations = DisplayCampaignService.getLocations();

        $scope.campaign.subtype = "TRACKING";
      }

      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.display", "external-campaign-editor").then(function (template) {
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
          initView();
        }

        $scope.getAudienceSegments = function (adGroupId) {
          return DisplayCampaignService.getAudienceSegments(adGroupId);
        };

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

        $scope.getAds = function (adGroupId) {
          return DisplayCampaignService.getAds(adGroupId);
        };

        $scope.addUserActivationSegment = function (type) {
          if(!$scope.checkedUserActivationSegments[type]) {
            DisplayCampaignService.removeUserActivationSegment(type);
          } else {
            DisplayCampaignService.addUserActivationSegment(type);
          }
          updateUserActivationSegments();
        };

        /**
         * Goals Management
         */

        $scope.selectConversion = function (goalType) {
          var self = this;
          var type = goalType.key;

          if ($scope.checkedGoalTypes[type]) {
            // If checkbox has just been checked

            if (GoalsService.isConversionType(type)) {
              var modalInstance = $uibModal.open({
                templateUrl: 'src/core/goals/ChooseExistingGoal.html',
                scope: $scope,
                backdrop: 'static',
                controller: 'core/goals/ChooseExistingGoalController',
                size: 'lg',
                resolve: {
                  goals: function () {
                    return $scope.conversionGoals;
                  }
                }
              });

              // TODO Right now we only consider the first selected goal. This will be changed later.
              modalInstance.result.then(function (conversionGoals) {
                $scope.conversionGoals = conversionGoals;
                if (!conversionGoals.length) {
                  $scope.checkedGoalTypes[type] = false;
                }
                for (var i = 0; i < conversionGoals.length; ++i) {
                  self.addGoalSelection({
                    'goal_selection_type': type,
                    'goal_id': conversionGoals[i].id,
                    'goal_name': conversionGoals[i].name
                  });
                }
              });
            } else {
              this.addGoalSelection({
                'goal_selection_type': type,
                'goal_name': goalType.name
              });
            }
          } else {
            // If checkbox has been unchecked we remove all the corresponding goals

            if (GoalsService.isConversionType(type)) {
              $scope.conversionGoals = [];
            }
            var goalsToRemove = $.grep($scope.selectedGoals, function (g) {
              return g.goal_selection_type === type;
            });
            self.removeGoals(goalsToRemove);
          }
        };

        $scope.updateDefaultGoalSelection = function () {
          _.forEach(DisplayCampaignService.getGoalSelections(), function (gs) {
            gs.default = false;
          });
          $scope.campaignScopeHelper.defaultGoalSelection.default = true;
        };

        $scope.addGoalSelection = function (goalSelection) {
          DisplayCampaignService.addGoalSelection(goalSelection);
          updateSelectedGoals();
        };

        $scope.removeGoalSelection = function (goalSelection) {
          DisplayCampaignService.removeGoalSelection(goalSelection);
          updateSelectedGoals();

          // Uncheck conversion checkbox if we have no more conversion goals
          for (var i = 0; i < $scope.selectedGoals.length; ++i) {
            if (GoalsService.isConversionType($scope.selectedGoals[i].goal_selection_type)) {
              return;
            }
          }
          $scope.conversionGoals = [];
          $scope.checkedGoalTypes[this.getConversionType()] = false;
        };

        $scope.removeGoals = function (goalsList) {
          for (var i = 0; i < goalsList.length; ++i) {
            DisplayCampaignService.removeGoalSelection(goalsList[i]);
          }
          updateSelectedGoals();
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

