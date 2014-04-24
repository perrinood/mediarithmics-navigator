(function () {
  'use strict';

  var module = angular.module('core/campaigns');
  /*
   * Campaign Container
   */

  module.factory("core/campaigns/CampaignContainer", [
    "$q", "Restangular", "core/common/IdGenerator", "async", "core/campaigns/AdGroupContainer",
    function($q, Restangular, IdGenerator, async, AdGroupContainer) {

      var CampaignContainer = function CampaignContainer() {

        this.adGroups = [];
        this.removedAdGroups = [];

        this.keywordsLists = [];

        this.value = {type:"DISPLAY"};
      };

      CampaignContainer.prototype.load = function (campaignId) {

        var root = Restangular.one('display_campaigns', campaignId);
        // send requests to get the value and the list of
        // ad group ids
        var pValue = root.get();
        var pAdGroups = root.getList('ad_groups');

        var self = this;

        var defered = $q.defer();


        $q.all([pValue, pAdGroups])
        .then( function (result) {
          self.value = result[0];
          self.id = self.value.id;
          var adGroups = result[1];

          var pArray = [];
          if (adGroups.length > 0) {

            for(var i=0; i < adGroups.length; i++) {
              // load the ad group container corresponding to the id list in ad groups
              var adGroupCtn = new AdGroupContainer();
              pArray.push(adGroupCtn.load(self.id, adGroups[i].id));
            }

            $q.all(pArray).then(function(result) {

              for(var i=0; i < result.length; i++) {
                self.adGroups.push(result[i]);
              }

              defered.resolve(self);

            }, function(reason) {
              defered.reject(reason);
            });

          } else {
            // return the loaded container
            defered.resolve(self);
          }




        }, function(reason) {

          defered.reject(reason);
        });

        // return the promise
        return defered.promise;
      };

      CampaignContainer.prototype.addAdGroup = function addAdGroup() {
        var adGroupCtn = new AdGroupContainer();
        adGroupCtn.id = IdGenerator.getId();
        this.adGroups.push(adGroupCtn);
        return adGroupCtn.id;
      };


      CampaignContainer.prototype.getAdGroup = function getAdGroup(id) {

        for(var i=0; i < this.adGroups.length; i++){
          if (this.adGroups[i].id === id) {
            return this.adGroups[i];
          }
        }
        return null;
      };


      CampaignContainer.prototype.removeAdGroup = function removeAdGroup(id) {

        for(var i=0; i < this.adGroups.length; i++){
          if (this.adGroups[i].id === id) {
            this.adGroups.splice(i, 1);
            if (id.indexOf("T") === -1) {
              this.removedAdGroups.push(id);
            }
            return;
          }
        }

      };

      CampaignContainer.prototype.persist = function persist() {

        var defered = $q.defer();

        var self = this;

        Restangular.all('campaigns').post(this.value, {organisation_id: this.organisationId})
        .then(angular.bind(this, function(campaign) {

          self.id = campaign.id;

          var pArray = [];

          if (self.adGroups.length > 0) {

            for(var i=0; i < this.adGroups.length; i++) {
              // persist the ad group container
              pArray.push(this.adGroups[i].persist(self.id));
            }

            $q.all(pArray).then(function(result) {

              defered.resolve(self);

            }, function(reason) {
              defered.reject(reason);
            });

          } else {
            // return the loaded container
            defered.resolve(self);
          }

        }), function(reason) {
          defered.reject(reason);
        });

        return defered.promise;
      };

      CampaignContainer.prototype.update = function update() {

        var defered = $q.defer();

        var self = this;

        this.value.put().then(function(campaign) {

          var adGroups = self.adGroups;

          async.mapSeries(adGroups, function(adGroup, callback) {

            if (adGroup.id.indexOf('T') === -1) {
              // update the ad group
              adGroup.update(self.id).then(function(result) {
                callback(null, result);
              }, function(reason) {
                callback(new Error(reason));
              });

            } else {
              // persist the ad group container
              adGroup.persist(self.id).then(function(result) {
                callback(null, result);
              }, function(reason) {
                callback(new Error(reason));
              });
            }

          }, function(err, results){

            if (err) {
              defered.reject(err);
            } else {
              defered.resolve(results);
            }
          });


        }, function(reason) {
          defered.reject(reason);
        });

        return defered.promise;
      };

      return CampaignContainer;
    }
  ]);
})();
