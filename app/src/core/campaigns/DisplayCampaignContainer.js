define(['./module'], function (module) {
  'use strict';

  /**
   * Campaign Container
   */

  module.factory('core/campaigns/DisplayCampaignContainer', [
    '$q', 'Restangular', 'core/common/IdGenerator', 'async', 'core/campaigns/AdGroupContainer', '$log', 'core/common/promiseUtils', 'lodash',  'core/campaigns/goals/GoalsService',
    function ($q, Restangular, IdGenerator, async, AdGroupContainer, $log, promiseUtils, _, GoalsService) {
      var DisplayCampaignContainer = function DisplayCampaignContainer(editorVersionId, workspace) {
        this.creationMode = true;
        this.adGroups = [];
        this.removedAdGroups = [];
        this.inventorySources = [];
        this.removedInventorySources = [];
        this.goalSelections = [];
        this.removedGoalSelections = [];
        this.locations = [];
        this.userActivationSegments = [];
        this.removedLocations = [];
        this.workspace = workspace;

        this.value = {type: "DISPLAY", editor_version_id: editorVersionId
        };//, datamart_id: workspace.datamart_id};
        $log.info("DisplayCampaignContainer", this.value);
      };

      DisplayCampaignContainer.prototype.load = function (campaignId) {
        var root = Restangular.one('display_campaigns', campaignId);
        var meta = Restangular.one('campaigns', campaignId);
        // send requests to get the value and the list of
        // ad group ids
        var campaignResourceP = root.get();
        var AdGroupsListP = root.getList('ad_groups');
        var inventorySourcesP = root.getList('inventory_sources');
        var locationsP = root.getList('locations');
        var goalSelectionsP = meta.getList('goal_selections');
        var userActivationSegmentsP = Restangular.all('audience_segments').getList({organisation_id: this.workspace.organisation_id, datamart_id: this.workspace.datamart_id, campaign_id: campaignId});
        var self = this;
        var defered = $q.defer();

        $q.all([campaignResourceP, AdGroupsListP, inventorySourcesP, locationsP, goalSelectionsP, userActivationSegmentsP])
          .then(function (result) {
            self.creationMode = false;
            self.value = result[0];
//          self.value.ad_groups = function () {
//            return _.map(self.ad_groups(), "value");
//          }
            self.id = self.value.id;
            var adGroups = result[1];
            self.inventorySources = result[2];
            self.locations = result[3];
            self.goalSelections = result[4];
            self.userActivationSegments = result[5];

            var adGroupsP = [];
            if (adGroups.length > 0) {

              for (var i = 0; i < adGroups.length; i++) {
                // load the ad group container corresponding to the id list in ad groups
                var adGroupCtn = new AdGroupContainer(adGroups[i]);

                self.adGroups.push(adGroupCtn);
              }

              defered.resolve(self);

//            $q.all(adGroupsP).then(function(result) {
//
//              for(var i=0; i < result.length; i++) {
//
//              }
//
//              defered.resolve(self);
//
//            }, function(reason) {
//              defered.reject(reason);
//            });

            } else {
              // return the loaded container
              defered.resolve(self);
            }
          }, function (reason) {
            defered.reject(reason);
          });
        // return the promise
        return defered.promise;
      };

      DisplayCampaignContainer.prototype.getInventorySources = function () {
        return this.inventorySources;
      };

      DisplayCampaignContainer.prototype.addInventorySource = function (inventorySource) {
        var found = _.find(this.inventorySources, function (source) {
          return source.display_network_access_id === inventorySource.display_network_access_id;
        });
        if (!found) {
          inventorySource.id = IdGenerator.getId();
          this.inventorySources.push(inventorySource);
        }
        return inventorySource.id || found.id;
      };

      DisplayCampaignContainer.prototype.removeInventorySource = function (inventorySource) {
        for (var i = 0; i < this.inventorySources.length; i++) {
          if (this.inventorySources[i].display_network_access_id === inventorySource.display_network_access_id) {
            this.inventorySources.splice(i, 1);
            if (inventorySource.id && inventorySource.id.indexOf("T") === -1) {
              this.removedInventorySources.push(inventorySource);
            }
            return;
          }
        }
      };

      DisplayCampaignContainer.prototype.getGoalSelections = function () {
        return this.goalSelections;
      };
      

      DisplayCampaignContainer.prototype.hasCpa = function () {
        for (var i = 0; i < this.goalSelections.length; ++i) {
          if (GoalsService.isConversionType(this.goalSelections[i].goal_selection_type)) {
            return true;
          }
        }
        return false;
      };

      DisplayCampaignContainer.prototype.getUserActivationSegments = function (status) {
        return this.userActivationSegments;
      };

      DisplayCampaignContainer.prototype.addUserActivationSegment = function (status) {
        var userActivationSegment = {};
        var found = _.find(this.userActivationSegments, function (s) {
          return s.clickers === (status === "clickers") || s.exposed === (status === "exposed");
        });
        if (!found) {
           
          userActivationSegment.id = IdGenerator.getId();
          if(status === "clickers" || status === "exposed") {
            userActivationSegment.clickers = status === "clickers";
            userActivationSegment.exposed = status === "exposed";
          }
          this.userActivationSegments.push(userActivationSegment);
          
        }
        return userActivationSegment.id || found.id;
      };


     DisplayCampaignContainer.prototype.removeUserActivationSegment = function (status) {
        for (var i = 0; i < this.userActivationSegments.length; i++) {
          if (this.userActivationSegments[i].clickers === (status === "clickers") || this.userActivationSegments[i].exposed === (status === "exposed")) {
            this.userActivationSegments.splice(i, 1);
            return;
          }
        }
      };



      DisplayCampaignContainer.prototype.addGoalSelection = function (goalSelection) {
        var found = _.find(this.goalSelections, function (source) {
          return (source.goal_id === goalSelection.goal_id) && (source.goal_selection_type === goalSelection.goal_selection_type);
        });
        if (!found) {
          goalSelection.id = IdGenerator.getId();
          goalSelection.default = this.goalSelections.length === 0;
          this.goalSelections.push(goalSelection);
        }
        return goalSelection.id || found.id;
      };

      DisplayCampaignContainer.prototype.removeGoalSelection = function (goalSelection) {
        for (var i = 0; i < this.goalSelections.length; ++i) {
          if (this.goalSelections[i].id === goalSelection.id) {
            this.goalSelections.splice(i, 1);
            if (goalSelection.id && goalSelection.id.indexOf("T") === -1) {
              this.removedGoalSelections.push(goalSelection);
            }
            return;
          }
        }
      };

      DisplayCampaignContainer.prototype.addPostalCodeLocation = function (location) {
        this.locations.push(location);
      };

      DisplayCampaignContainer.prototype.getLocations = function () {
        return this.locations;
      };

      DisplayCampaignContainer.prototype.removeLocation = function (locationId) {
        for (var i = 0; i < this.locations.length; i++) {
          if (this.locations[i].id === locationId) {
            if (locationId.indexOf("T") === -1) {
              this.removedLocations.push(this.locations[i]);
            }
            this.locations.splice(i, 1);
            return;
          }
        }
      };


      DisplayCampaignContainer.prototype.addAdGroup = function addAdGroup() {
        var adGroupCtn = new AdGroupContainer(IdGenerator.getId());

        this.adGroups.push(adGroupCtn);
        return adGroupCtn.id;
      };

      DisplayCampaignContainer.prototype.getAdGroup = function getAdGroup(id) {

        for (var i = 0; i < this.adGroups.length; i++) {
          if (this.adGroups[i].id === id) {
            return this.adGroups[i];
          }
        }
        return null;
      };

      DisplayCampaignContainer.prototype.removeAdGroup = function removeAdGroup(id) {

        for (var i = 0; i < this.adGroups.length; i++) {
          if (this.adGroups[i].id === id) {
            if (id.indexOf("T") === -1) {
              this.removedAdGroups.push(this.adGroups[i]);
            }
            this.adGroups.splice(i, 1);
            return;
          }
        }
      };

      /**
       * Create a task (to be used by async.series) to save the given ad group container.
       * @param {Object} campaignContainer the campaign container binded to the ad group container.
       * @param {Object} adGroupContainer the ad group container to save.
       * @return {Function} the task.
       */
      function saveAdGroupTask(campaignContainer, adGroupContainer) {
        return function (callback) {
          $log.info("saving adGroup", adGroupContainer.id);
          var promise;
          var action;

          if (adGroupContainer.id.indexOf('T') === -1) {
            action = "update";
          } else {
            action = "persist";
            // reuse the name of the campaign for the ad group
            if (!adGroupContainer.value.name) {
              adGroupContainer.value.name = campaignContainer.value.name;
            }
          }
          promise = adGroupContainer[action](campaignContainer.id);
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to delete the given ad group container.
       * @param {Object} adGroupContainer the ad group container to delete.
       * @return {Function} the task.
       */
      function deleteAdGroupTask(adGroupContainer) {
        return function (callback) {
          $log.info("deleting adGroup", adGroupContainer.id);
          // the container does everything
          var promise = adGroupContainer.remove();
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      var saveAdGroups = function (self, adGroups) {
        var deferred = $q.defer(), tasks = [], i;
        for (i = 0; i < self.adGroups.length; i++) {
          tasks.push(saveAdGroupTask(self, self.adGroups[i]));
        }
        for (i = 0; i < self.removedAdGroups.length; i++) {
          tasks.push(deleteAdGroupTask(self.removedAdGroups[i]));
        }
        async.series(tasks, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " ad groups saved");
            // return the campaign container as the promise results
            deferred.resolve(self);
          }

        });
        return deferred.promise;
      };

      /**
       * Create a task (to be used by async.series) to delete the given inventory source.
       * @param {Object} inventorySource the inventory source to delete.
       * @return {Function} the task.
       */
      function deleteInventorySourceTask(inventorySource) {
        return function (callback) {
          $log.info("deleting inventorySource", inventorySource.id);
          var promise;
          if (inventorySource.id && inventorySource.id.indexOf('T') === -1) {
            // delete the inventorySource
            promise = inventorySource.remove();
          } else {
            // the inventorySource was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to save the given inventory source.
       * @param {Object} inventorySource the inventory source to save.
       * @param {String} campaignId the id of the current campaign.
       * @return {Function} the task.
       */
      function saveInventorySourceTask(inventorySource, campaignId) {
        return function (callback) {
          $log.info("saving inventorySource", inventorySource.id);
          var promise;
          if ((inventorySource.id && inventorySource.id.indexOf('T') === -1) || (typeof(inventorySource.modified) !== "undefined")) {
            // update the inventory source
            // TODO 501 Not Implemented
            // promise = inventorySource.put();

            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();

          } else {
            promise = Restangular
              .one('display_campaigns', campaignId)
              .post('inventory_sources', inventorySource);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }


      var saveInventorySources = function (self, campaignId) {
        var deferred = $q.defer(), tasks = [], i;
        for (i = 0; i < self.inventorySources.length; i++) {
          tasks.push(saveInventorySourceTask(self.inventorySources[i], campaignId));
        }
        for (i = 0; i < self.removedInventorySources.length; i++) {
          tasks.push(deleteInventorySourceTask(self.removedInventorySources[i]));
        }

        async.series(tasks, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " inventory sources saved");
            // return the ad group container as the promise results
            deferred.resolve(self);
          }

        });
        return deferred.promise;
      };



      /**
       * Create a task (to be used by async.series) to save the given userActivationSegment.
       * @param {Object} userActivationSegment the user activation segment to save.
       * @param {String} campaign the current campaign.
       * @return {Function} the task.
       */
      function saveUserActivationSegmentTask(self, userActivationSegment) {
        return function (callback) {
          $log.info("saving userActivationSegment", userActivationSegment.id);
          var promise;
          if ((userActivationSegment.id && userActivationSegment.id.indexOf('T') === -1) || (typeof(userActivationSegment.modified) !== "undefined")) {
            // update the inventory source
            // TODO 501 Not Implemented
            // promise = userActivationSegment.put();

            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();

          } else {
            var userActivationSegmentResource = { 
              "type":"USER_ACTIVATION",
              "datamart_id":self.workspace.datamart_id,
              "campaign_id":self.id,
              "clickers": userActivationSegment.clickers,
               "exposed":userActivationSegment.exposed,
                "name":self.name
              };
            promise = Restangular
              .all('audience_segments').post(userActivationSegmentResource, {organisation_id: self.workspace.organisation_id});
              
              
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

       var saveUserActivationSegments = function (self, campaignId) {
        var deferred = $q.defer(), tasks = [], i;
        for (i = 0; i < self.userActivationSegments.length; i++) {
          tasks.push(saveUserActivationSegmentTask(self, self.userActivationSegments[i]));
        }
//        for (i = 0; i < self.userActivationSegments.length; i++) {
//          tasks.push(deleteInventorySourceTask(self.userActivationSegments[i]));
//        }

        async.series(tasks, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " inventory sources saved");
            // return the ad group container as the promise results
            deferred.resolve(self);
          }

        });
        return deferred.promise;
      };



      /**
       * Create a task (to be used by async.series) to delete the given goal selection source.
       * @param {Object} goalSelection the goal selection to delete.
       * @return {Function} the task.
       */
      function deleteGoalSelectionTask(goalSelection) {
        return function (callback) {
          $log.info("deleting goalSelection", goalSelection.id);
          var promise;
          if (goalSelection.id && goalSelection.id.indexOf('T') === -1) {
            // delete the goalSelection
            promise = goalSelection.remove();
          } else {
            // the goalSelection was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to save the given goal selection.
       * @param {Object} goalSelection the goal selection to save.
       * @param {String} campaignId the id of the current campaign.
       * @return {Function} the task.
       */
      function saveGoalSelectionTask(goalSelection, campaignId) {
        return function (callback) {
          $log.info("saving goalSelection", goalSelection.id);
          var promise;
          if ((goalSelection.id && goalSelection.id.indexOf('T') === -1) || (typeof(goalSelection.modified) !== "undefined")) {
            //  promise = goalSelection.put();
            // we don't handle updates on goal selections for the moment
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();

          } else {
            promise = Restangular
              .one('campaigns', campaignId)
              .post('goal_selections', goalSelection);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }


      var saveGoalSelections = function (self, campaignId) {
        var deferred = $q.defer(), tasks = [], i;
        for (i = 0; i < self.goalSelections.length; i++) {
          tasks.push(saveGoalSelectionTask(self.goalSelections[i], campaignId));
        }
        for (i = 0; i < self.removedGoalSelections.length; i++) {
          tasks.push(deleteGoalSelectionTask(self.removedGoalSelections[i]));
        }

        async.series(tasks, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " goal selections saved");
            // return the ad group container as the promise results
            deferred.resolve(self);
          }

        });
        return deferred.promise;
      };


      /**
       * Create a task (to be used by async.series) to delete the given inventory source.
       * @param {Object} location the location to delete.
       * @return {Function} the task.
       */
      function deleteLocationTask(location) {
        return function (callback) {
          $log.info("deleting location", location.id);
          var promise;
          if (location.id && location.id.indexOf('T') === -1) {
            // delete the location
            promise = location.remove();
          } else {
            // the location was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to save the given inventory source.
       * @param {Object} location the inventory source to save.
       * @param {String} campaignId the id of the current campaign.
       * @return {Function} the task.
       */
      function saveLocationTask(location, campaignId) {
        return function (callback) {
          $log.info("saving location", location.id);
          var promise;
          if ((location.id && location.id.indexOf('T') === -1) || (typeof(location.modified) !== "undefined")) {
            // update the location
            // TODO 501 Not Implemented
            // promise = location.put();

            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();

          } else {
            promise = Restangular
              .one('display_campaigns', campaignId)
              .post('locations', location);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }


      var saveLocations = function (self, campaignId) {
        var deferred = $q.defer(), tasks = [], i;
        for (i = 0; i < self.locations.length; i++) {
          tasks.push(saveLocationTask(self.locations[i], campaignId));
        }
        for (i = 0; i < self.removedLocations.length; i++) {
          tasks.push(deleteLocationTask(self.removedLocations[i]));
        }

        async.series(tasks, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " locations saved");
            // return the ad group container as the promise results
            deferred.resolve(self);
          }

        });
        return deferred.promise;
      };


      function persistDependencies(self, campaignId, adGroups, userActivationSegments) {
        return saveGoalSelections(self, campaignId).then(function () {
          return saveInventorySources(self, campaignId).then(function () {
            return saveLocations(self, campaignId).then(function () {
              return saveAdGroups(self, adGroups).then(function(){
                return saveUserActivationSegments(self, userActivationSegments);
              });
            });
          });
        });
      }

      DisplayCampaignContainer.prototype.persist = function persist() {
        var deferred = $q.defer();
        var self = this;

        Restangular.all('display_campaigns').post(this.value, {organisation_id: this.organisationId})
          .then(angular.bind(this, function (campaign) {
            self.id = campaign.id;
            persistDependencies.call(null, self, campaign.id, self.adGroups, self.userActivationSegments).then(function () {
              deferred.resolve(campaign);
            }, deferred.reject);
          }), function (reason) {
            deferred.reject(reason);
          });
        return deferred.promise;
      };

      DisplayCampaignContainer.prototype.update = function update() {
        var deferred = $q.defer();
        var self = this;

        this.value.put().then(function (campaign) {
          persistDependencies.call(null, self, campaign.id, self.adGroups).then(function () {
            deferred.resolve(campaign);
          }, deferred.reject);
        }, function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };
      return DisplayCampaignContainer;
    }
  ]);
});
