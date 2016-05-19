define(['./module'], function (module) {
  'use strict';

  module.factory("core/campaigns/AdGroupContainer", [
    "$q", "Restangular", "jquery", "core/common/IdGenerator", "async", "$log", 'core/common/auth/Session', 'lodash', 'core/common/promiseUtils',
    function ($q, Restangular, $, IdGenerator, async, $log, Session, _, promiseUtils) {
      /**
       * Ad Group Container
       */

      var AdGroupContainer = function AdGroupContainer(value) {
        if (typeof value === "string") {
          this.id = value;
          this.value = {
            id: value,
            visibility: 'ANY_POSITION'
          };
        } else {

          this.value = value;
          this.id = value.id;
        }

        this.ads = [];
        this.removedAds = [];

        this.audienceSegments = [];
        this.removedAudienceSegments = [];

        this.keywordLists = [];
        this.removedKeywordLists = [];

        this.placementLists = [];
        this.removedPlacementLists = [];

        this.bidOptimizer = null;
      };

      AdGroupContainer.prototype.load = function load() {
        var pValue = this.value.get();
        var pAds = this.value.getList('ads');
        var pAudienceSegments = this.value.getList('audience_segments');
        var pKeywords = this.value.getList('keyword_lists');
        var pPlacements = this.value.getList('placement_lists');

        var self = this;

        var deferred = $q.defer();
        var list = [pValue, pAds, pAudienceSegments, pKeywords, pPlacements];

        $q.all(list)
          .then(function (result) {
            self.value = result[0];
            self.id = self.value.id;
            self.ads = result[1];
            self.audienceSegments = result[2];
            self.keywordLists = result[3];
            self.placementLists = result[4];
            // return the loaded container
            deferred.resolve(self);
          }, function (reason) {
            deferred.reject(reason);
          });
        // return the promise
        return deferred.promise;
      };

      AdGroupContainer.prototype.addAd = function addAd(ad) {
        ad.id = IdGenerator.getId();
        this.ads.push(ad);
        return ad.id;
      };

      AdGroupContainer.prototype.removeAd = function removeAd(adId) {
        for (var i = 0; i < this.ads.length; i++) {
          if (this.ads[i].id === adId) {
            if (adId.indexOf("T") === -1) {
              this.removedAds.push(this.ads[i]);
            }
            this.ads.splice(i, 1);
            return;
          }
        }
      };

      AdGroupContainer.prototype.getAd = function getAd(adId) {
        for (var i = 0; i < this.ads.length; i++) {
          if (this.ads[i].id === adId) {
            return this.ads[i];
          }
        }
      };

      AdGroupContainer.prototype.setAdValue = function setAdValue(ad) {
        var copiedValue = $.extend({}, ad);
        this.getAd(ad.id).value = copiedValue;
        this.getAd(ad.id).modified = true;
      };

      AdGroupContainer.prototype.addKeywordList = function addKeywordList(keywordListSelection) {
        var found = _.find(this.keywordLists, function (kw) {
          return kw.keyword_list_id === keywordListSelection.keyword_list_id;
        });
        if (!found) {
          keywordListSelection.id = IdGenerator.getId();
          this.keywordLists.push(keywordListSelection);
        }
        return keywordListSelection.id || found.id;
      };

      AdGroupContainer.prototype.removeKeywordList = function removeKeywordList(keywordList) {
        for (var i = 0; i < this.keywordLists.length; i++) {
          if (this.keywordLists[i].keyword_list_id === keywordList.keyword_list_id) {
            this.keywordLists.splice(i, 1);
            if (keywordList.id && keywordList.id.indexOf("T") === -1) {
              this.removedKeywordLists.push(keywordList);
            }
            return;
          }
        }
      };


      AdGroupContainer.prototype.addPlacementList = function addPlacementList(placementListSelection) {
        var found = _.find(this.placementLists, function (kw) {
          return kw.placement_list_id === placementListSelection.placement_list_id;
        });
        if (!found) {
          placementListSelection.id = IdGenerator.getId();
          this.placementLists.push(placementListSelection);
        }
        return placementListSelection.id || found.id;
      };

      AdGroupContainer.prototype.removePlacementList = function removePlacementList(placementList) {
        for (var i = 0; i < this.placementLists.length; i++) {
          if (this.placementLists[i].placement_list_id === placementList.placement_list_id) {
            this.placementLists.splice(i, 1);
            if (placementList.id && placementList.id.indexOf("T") === -1) {
              this.removedPlacementLists.push(placementList);
            }
            return;
          }
        }
      };

      AdGroupContainer.prototype.addAudienceSegment = function addAudienceSegment(selection) {
        selection.id = IdGenerator.getId();
        this.audienceSegments.push(selection);
        return selection.id;
      };

      AdGroupContainer.prototype.removeAudienceSegment = function removeAudienceSegment(segment) {
        for (var i = 0; i < this.audienceSegments.length; i++) {
          if (this.audienceSegments[i].audience_segment_id === segment.audience_segment_id) {
            this.audienceSegments.splice(i, 1);
            if (segment.id && segment.id.indexOf("T") === -1) {
              this.removedAudienceSegments.push(segment);
            }
            return;
          }
        }
      };

      /**
       * Create a task (to be used by async.series) to save the given ad.
       * @param {Object} ad the ad to save.
       * @param {String} campaignId the id of the current campaign.
       * @param {String} adGroupId the id of the current ad group.
       * @param {String} adGroupName the name of the current ad group.
       * @return {Function} the task.
       */
      function saveAdTask(ad, campaignId, adGroupId, adGroupName) {
        return function (callback) {
          $log.info("saving ad", ad.id);
          var promise;
          if ((ad.id.indexOf('T') === -1) || (typeof(ad.modified) !== "undefined")) {
            // update the ad
            promise = ad.put();
          } else {
            // create the ad
            promise = Restangular.one('display_campaigns', campaignId)
              .one('ad_groups', adGroupId)
              .post('ads', ad);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to delete the given ad.
       * @param {Object} ad the ad to delete.
       * @return {Function} the task.
       */
      function deleteAdTask(ad) {
        return function (callback) {
          $log.info("deleting ad", ad.id);
          var promise;
          if (ad.id && ad.id.indexOf('T') === -1) {
            // delete the ad
            promise = ad.remove();
          } else {
            // the ad was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to save the given audience segment.
       * @param {Object} segment the audience segment to save.
       * @param {String} campaignId the id of the current campaign.
       * @param {String} adGroupId the id of the current ad group.
       * @param {String} adGroupName the name of the current ad group.
       * @return {Function} the task.
       */
      function saveAudienceSegmentTask(segment, campaignId, adGroupId, adGroupName) {
        return function (callback) {
          $log.info("saving audience segment", segment.id);
          var promise;
          if ((segment.id && segment.id.indexOf('T') === -1) || (typeof(segment.modified) !== "undefined")) {
            // update the audience segment
            promise = segment.put();

          } else {
            // create the audience segment selection
            promise = Restangular.one('display_campaigns', campaignId)
              .one('ad_groups', adGroupId)
              .post('audience_segments', segment);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to delete the given audience segment.
       * @param {Object} segment the audience segment to delete.
       * @return {Function} the task.
       */
      function deleteAudienceSegmentTask(segment) {
        return function (callback) {
          $log.info("deleting audience segment", segment.id);
          var promise;
          if (segment.id && segment.id.indexOf('T') === -1) {
            // delete the audience segment selection
            promise = segment.remove();
          } else {
            // the audience segment selection was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to save the given keywords list.
       * @param {Object} keywordList the keywords list to save.
       * @param {String} campaignId the id of the current campaign.
       * @param {String} adGroupId the id of the current ad group.
       * @param {String} adGroupName the name of the current ad group.
       * @return {Function} the task.
       */
      function saveKeywordsTask(keywordList, campaignId, adGroupId, adGroupName) {
        return function (callback) {
          $log.info("saving keyword list", keywordList.id);
          var promise;
          if ((keywordList.id && keywordList.id.indexOf('T') === -1) || (typeof(keywordList.modified) !== "undefined")) {
            // update the keyword list
            promise = keywordList.put();
          } else {
            // create the keyword list
            promise = Restangular.one('display_campaigns', campaignId)
              .one('ad_groups', adGroupId)
              .post('keyword_lists', keywordList);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to delete the given keywords list.
       * @param {Object} keywordList the keywords list to delete.
       * @return {Function} the task.
       */
      function deleteKeywordsTask(keywordList) {
        return function (callback) {
          $log.info("deleting keyword list", keywordList.id);
          var promise;
          if (keywordList.id && keywordList.id.indexOf('T') === -1) {
            // delete the keyword list
            promise = keywordList.remove();
          } else {
            // the keyword list selection was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to save the given placements list.
       * @param {Object} placementList the placements list to save.
       * @param {String} campaignId the id of the current campaign.
       * @param {String} adGroupId the id of the current ad group.
       * @param {String} adGroupName the name of the current ad group.
       * @return {Function} the task.
       */
      function savePlacementTask(placementList, campaignId, adGroupId, adGroupName) {
        return function (callback) {
          $log.info("saving placement list", placementList.id);
          var promise;
          if ((placementList.id && placementList.id.indexOf('T') === -1) || (typeof(placementList.modified) !== "undefined")) {
            // update the placement list
            promise = placementList.put();

          } else {
            // create the placement list
            promise = Restangular.one('display_campaigns', campaignId)
              .one('ad_groups', adGroupId)
              .post('placement_lists', placementList);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      /**
       * Create a task (to be used by async.series) to delete the given placements list.
       * @param {Object} placementList the placements list to delete.
       * @return {Function} the task.
       */
      function deletePlacementTask(placementList) {
        return function (callback) {
          $log.info("deleting placement list", placementList.id);
          var promise;
          if (placementList.id && placementList.id.indexOf('T') === -1) {
            // delete the placement list
            promise = placementList.remove();
          } else {
            // the placement list selection was not persisted, nothing to do
            var deferred = $q.defer();
            promise = deferred.promise;
            deferred.resolve();
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }


      function persistDependencies(campaignId, adGroupContainer, adGroup, deferred) {
        var i;
        // update/persist ads
        var pAds = [];
        for (i = 0; i < adGroupContainer.ads.length; i++) {
          pAds.push(saveAdTask(adGroupContainer.ads[i], campaignId, adGroup.id, adGroup.name));
        }
        for (i = 0; i < adGroupContainer.removedAds.length; i++) {
          pAds.push(deleteAdTask(adGroupContainer.removedAds[i]));
        }

        // update/persist audience segments
        var pAudienceSegments = [];
        for (i = 0; i < adGroupContainer.audienceSegments.length; i++) {
          pAudienceSegments.push(saveAudienceSegmentTask(adGroupContainer.audienceSegments[i], campaignId, adGroup.id, adGroup.name));
        }
        for (i = 0; i < adGroupContainer.removedAudienceSegments.length; i++) {
          pAudienceSegments.push(deleteAudienceSegmentTask(adGroupContainer.removedAudienceSegments[i]));
        }

        // update/persist keyword lists
        var pKeywordLists = [];
        for (i = 0; i < adGroupContainer.keywordLists.length; i++) {
          pKeywordLists.push(saveKeywordsTask(adGroupContainer.keywordLists[i], campaignId, adGroup.id, adGroup.name));
        }
        for (i = 0; i < adGroupContainer.removedKeywordLists.length; i++) {
          pKeywordLists.push(deleteKeywordsTask(adGroupContainer.removedKeywordLists[i]));
        }

        // update/persist keyword lists
        var pPlacementLists = [];
        for (i = 0; i < adGroupContainer.placementLists.length; i++) {
          pPlacementLists.push(savePlacementTask(adGroupContainer.placementLists[i], campaignId, adGroup.id, adGroup.name));
        }
        for (i = 0; i < adGroupContainer.removedPlacementLists.length; i++) {
          pPlacementLists.push(deletePlacementTask(adGroupContainer.removedPlacementLists[i]));
        }

        var pList = [];
        pList = pList.concat(pAds);
        pList = pList.concat(pAudienceSegments);
        pList = pList.concat(pKeywordLists);
        pList = pList.concat(pPlacementLists);

        async.series(pList, function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            $log.info(res.length + " ad group dependencies saved");
            // return the ad group container as the promise results
            deferred.resolve(adGroupContainer);
          }
        });

        return deferred.promise;
      }

      AdGroupContainer.prototype.persist = function persist(campaignId) {

        var deferred = $q.defer();

        var self = this;

        Restangular.one('display_campaigns', campaignId).post('ad_groups', this.value)
          .then(function (adGroup) {

            self.id = adGroup.id;

            persistDependencies(campaignId, self, adGroup, deferred);

          }, function (reason) {
            deferred.reject(reason);
          });

        return deferred.promise;
      };
      AdGroupContainer.prototype.update = function update(campaignId) {

        var deferred = $q.defer();

        var self = this;

        this.value.put()
          .then(function (adGroup) {

            self.id = adGroup.id;

            persistDependencies(campaignId, self, adGroup, deferred);
          }, function (reason) {
            deferred.reject(reason);
          });

        return deferred.promise;
      };

      AdGroupContainer.prototype.remove = function remove(campaignId) {

        var deferred = $q.defer();

        if (!this.value.id || this.value.id.indexOf("T") !== -1) {
          // the ad group doesn't exist server side, no need to do anything
          deferred.resolve(null);
          return deferred.promise;
        }

        this.removedAds = this.removedAds.concat(this.ads);
        this.ads = [];

        this.removedAudienceSegments = this.removedAudienceSegments.concat(this.audienceSegments);
        this.audienceSegments = [];

        this.removedKeywordLists = this.removedKeywordLists.concat(this.keywordLists);
        this.keywordLists = [];

        this.removedPlacementLists = this.removedPlacementLists.concat(this.placementLists);
        this.placementLists = [];


        var self = this;
        return persistDependencies(campaignId, self, self.value, deferred).then(function () {
          return self.value.remove();
        });

      };

      return AdGroupContainer;
    }
  ]);
});
