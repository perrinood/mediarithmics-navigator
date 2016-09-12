define(['./module', 'moment'], function (module, moment) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/expert/EditCampaignController', [
    'jquery', '$scope', '$uibModal', '$log', '$location', '$stateParams', 'lodash', 'core/campaigns/DisplayCampaignService', 'core/campaigns/CampaignPluginService',
    'core/common/WaitingService', 'core/common/ErrorService', 'core/campaigns/goals/GoalsService', 'core/common/auth/Session',
    function (jQuery, $scope, $uibModal, $log, $location, $stateParams, _, DisplayCampaignService, CampaignPluginService, WaitingService, ErrorService, GoalsService, Session) {
      var campaignId = $stateParams.campaign_id;
      $scope.organisationId = $stateParams.organisation_id;
      $scope.goalTypes = GoalsService.getGoalTypesList();
      $scope.isConversionType = GoalsService.isConversionType;
      $scope.getConversionType = GoalsService.getConversionType;
      $scope.checkedGoalTypes = [];
      $scope.conversionGoals = [];
      $scope.campaignScopeHelper = {
        campaignDateRange: {startDate: moment(), endDate: moment().add(20, 'days')},
        schedule: ''
      };

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
        $scope.inventorySources = DisplayCampaignService.getInventorySources();
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

        $scope.campaignScopeHelper.locationSelector = $scope.locations.length ? "custom" : "";
        $scope.campaignScopeHelper.schedule = $scope.campaign.start_date !== null ? "custom" : "";
        if ($scope.campaign.start_date !== null && $scope.campaign.end_date !== null) {
          $scope.campaignScopeHelper.campaignDateRange = {
            startDate: moment($scope.campaign.start_date),
            endDate: moment($scope.campaign.end_date)
          };
        }
      }

      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.display", "default-editor").then(function (template) {
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

        $scope.getAds = function (adGroupId) {
          return DisplayCampaignService.getAds(adGroupId);
        };

        $scope.getAudienceSegments = function (adGroupId) {
          return DisplayCampaignService.getAudienceSegments(adGroupId);
        };

        $scope.getKeywordLists = function (adGroupId) {
          return DisplayCampaignService.getKeywordLists(adGroupId);
        };

        $scope.getPlacementLists = function (adGroupId) {
          return DisplayCampaignService.getPlacementLists(adGroupId);
        };

        $scope.chooseDisplayNetworks = function () {
          $uibModal.open({
            templateUrl: 'src/core/campaigns/ChooseExistingDisplayNetwork.html',
            scope: $scope,
            backdrop: 'static',
            controller: 'core/campaigns/ChooseExistingDisplayNetworkController',
            size: 'lg'
          });
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
            var goalsToRemove = jQuery.grep($scope.selectedGoals, function (g) {
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
         * Inventory Source
         */

        $scope.removeInventorySource = function (source) {
          DisplayCampaignService.removeInventorySource(source);
        };


        $scope.$on("mics-inventory-source:selected", function (event, inventorySource) {
          DisplayCampaignService.addInventorySource({
            display_network_access_id: inventorySource.id,
            display_network_name: inventorySource.display_network_name,
            display_network_access_name: inventorySource.name,
            display_network_access_deal_id: inventorySource.deal_id
          });
        });

        $scope.$on("mics-location:postal-code-added", function (event, params) {
          DisplayCampaignService.addPostalCodeLocation(params);
        });

        $scope.deleteLocation = function (elem) {
          if (elem === undefined) {
            return;
          }
          DisplayCampaignService.removeLocation(elem.id);
          if (!$scope.locations.length) {
            $scope.campaignScopeHelper.locationSelector = "";
          }
        };

        $scope.getLocationDescriptor = function (locationList) {
          var descriptor = _.reduce(locationList, function (str, location) {
            if (str === "") {
              return location.name;
            }
            return str + ", " + location.name;
          }, "");
          if (descriptor.length > 100) {
            return descriptor.slice(0, 100) + "...";
          } else {
            return descriptor;
          }
        };

        /**
         * Ad Group Management
         */

        $scope.newAdGroup = function () {
          var adGroupId = DisplayCampaignService.addAdGroup();
          $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/expert/edit/' + campaignId + '/edit-ad-group/' + adGroupId);
        };

        $scope.editAdGroup = function (adGroup) {
          $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/display/expert/edit/' + campaignId + '/edit-ad-group/' + adGroup.id);
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
          if ($scope.campaignScopeHelper.schedule === 'custom') {
            $scope.campaign.start_date = $scope.campaignScopeHelper.campaignDateRange.startDate.valueOf();
            $scope.campaign.end_date = $scope.campaignScopeHelper.campaignDateRange.endDate.valueOf();
          } else {
            $scope.campaign.start_date = null;
            $scope.campaign.end_date = null;
          }
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

