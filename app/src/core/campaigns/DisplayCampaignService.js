define(['./module'], function (module) {
  'use strict';

  /**
   * DISPLAY CAMPAIGN SERVICE
   */
  /* define the Authentication service */
  module.factory('core/campaigns/DisplayCampaignService', [
    '$q', 'lodash', 'Restangular', 'core/common/IdGenerator', 'core/campaigns/AdGroupContainer', 'core/campaigns/DisplayCampaignContainer', '$log', 'core/common/auth/Session',
    function ($q, _, Restangular, IdGenerator, AdGroupContainer, DisplayCampaignContainer, $log, Session) {

      var idCounter = 1;
      var service = {};

      /**
       *  Init methods
       */
      service.getDisplayNetworkAccess = function () {
        return this.getDisplayNetworkAccessPromise().$object;
      };

      service.getDisplayNetworkAccessPromise = function () {
        var params = {organisation_id: Session.getCurrentWorkspace().organisation_id};
        return Restangular.all('display_network_accesses').getList(params);
      };

      service.getDeepCampaignView = function (campaignId) {
        var root = Restangular.one('display_campaigns', campaignId);
        // Send request to get the value and the list of ad group ids
        return root.get({view: "deep"});
      };

      service.initCreateCampaign = function (template) {
        var campaignCtn = new DisplayCampaignContainer(template.editor_version_id, Session.getCurrentWorkspace());
        campaignCtn.id = IdGenerator.getId();
        campaignCtn.organisationId = Session.getCurrentWorkspace().organisation_id;

        // set currency ...
        this.campaignCtn = campaignCtn;

        var deferred = $q.defer();
        deferred.resolve(campaignCtn.id);
        return deferred.promise;
      };

      service.initEditCampaign = function (campaignId, template) {
        var campaignCtn = new DisplayCampaignContainer(template.editor_version_id, Session.getCurrentWorkspace());
        this.campaignCtn = campaignCtn;
        return campaignCtn.load(campaignId);
      };

      /**
       * Campaign methods
       */
      service.getCampaignValue = function () {

        $log.debug("> getCampaignValue, campaignCtn=", this.campaignCtn);
        return this.campaignCtn.value;

      };

      service.getCampaign = function () {

        $log.debug("> getCampaignValue, campaignCtn=", this.campaignCtn);
        return this.campaignCtn;

      };

      service.setCampaignValue = function (campaign) {
        this.campaignCtn.value = campaign;
      };

      service.isCreationMode = function () {
        return this.getCampaignId().indexOf('T') === 0;
      };

      service.isTemporaryId = function (id) {
        return id.indexOf('T') === 0;
      };

      service.getCampaignId = function () {
        return this.campaignCtn.id;
      };

      /**
       * Ad Group methods
       */
      service.addAdGroup = function () {

        return this.campaignCtn.addAdGroup();
      };

      service.getAdGroup = function (id) {

        return this.campaignCtn.getAdGroup(id);
      };

      service.getAdGroupValue = function (id) {

        return Restangular.copy(this.campaignCtn.getAdGroup(id).value);
      };

      service.setAdGroupValue = function (id, adGroup) {
        var adGroupContainer = this.campaignCtn.getAdGroup(id);
        adGroupContainer.value = adGroup;
      };

      service.removeAdGroup = function (id) {
        this.campaignCtn.removeAdGroup(id);
      };

      service.getAdGroupValues = function () {
        var values = [];
        for (var i = 0; i < this.campaignCtn.adGroups.length; i++) {
          values.push(this.campaignCtn.adGroups[i].value);
        }
        return values;
      };

      service.loadAdGroups = function () {
        var list = _.map(this.campaignCtn.adGroups, function (elem) {
          return elem.load();
        });
        return $q.all(list);
      };

      service.resetAdGroup = function (id) {
        if (id.indexOf('T') !== -1) {
          this.campaignCtn.removeAdGroup(id);
        }
      };

      /**
       * Ad methods
       */
      service.addAd = function (adGroupId, ad) {
        return this.campaignCtn.getAdGroup(adGroupId).addAd(ad);
      };

      service.getAdValue = function (adGroupId, adId) {
        var ad = this.campaignCtn.getAdGroup(adGroupId).getAd(adId);
        if (ad) {
          return ad.value;
        } else {
          return null;
        }
      };

      service.getAds = function (adGroupId) {
        return this.campaignCtn.getAdGroup(adGroupId).ads;
      };

      service.setAdValue = function (adGroupId, ad) {
        var adContainer = this.campaignCtn.getAdGroup(adGroupId).getAd(ad.id);
        adContainer.value = ad;
      };

      service.removeAd = function (adGroupId, adId) {
        this.campaignCtn.getAdGroup(adGroupId).removeAd(adId);
      };

      /**
       * Audience Segment methods
       */
      service.getAudienceSegments = function (adGroupId) {
        return this.campaignCtn.getAdGroup(adGroupId).audienceSegments;
      };

      service.addAudienceSegment = function (adGroupId, segment) {
        return this.campaignCtn.getAdGroup(adGroupId).addAudienceSegment(segment);
      };

      service.removeAudienceSegment = function (adGroupId, segment) {
        this.campaignCtn.getAdGroup(adGroupId).removeAudienceSegment(segment);
      };


      /**
       * Keyword list methods
       */
      service.getKeywordLists = function (adGroupId) {
        return this.campaignCtn.getAdGroup(adGroupId).keywordLists;
      };

      service.addKeywordList = function (adGroupId, keywordList) {
        return this.campaignCtn.getAdGroup(adGroupId).addKeywordList(keywordList);
      };

      service.removeKeywordList = function (adGroupId, keywordList) {
        this.campaignCtn.getAdGroup(adGroupId).removeKeywordList(keywordList);
      };

      /**
       * Placement list methods
       */
      service.getPlacementLists = function (adGroupId) {
        return this.campaignCtn.getAdGroup(adGroupId).placementLists;
      };

      service.addPlacementList = function (adGroupId, placementList) {
        return this.campaignCtn.getAdGroup(adGroupId).addPlacementList(placementList);
      };

      service.removePlacementList = function (adGroupId, placementList) {
        this.campaignCtn.getAdGroup(adGroupId).removePlacementList(placementList);
      };


      /**
       * GoalSelections methods
       */
      service.hasCpa = function () {
        return this.campaignCtn.hasCpa();
      };

      service.getGoalSelections = function () {
        return this.campaignCtn.getGoalSelections();
      };

      service.addGoalSelection = function (goalSelection) {
        return this.campaignCtn.addGoalSelection(goalSelection);
      };

      service.removeGoalSelection = function (goalSelection) {
        return this.campaignCtn.removeGoalSelection(goalSelection);
      };

      service.removeAllGoalsByType = function (goalType) {
        return this.campaignCtn.removeAllGoalsByType(goalType);
      };

      service.addUserActivationSegment = function (type) {
        return this.campaignCtn.addUserActivationSegment(type);
      };

      service.removeUserActivationSegment = function (type) {
        return this.campaignCtn.removeUserActivationSegment(type);
      };

      service.getUserActivationSegments = function () {
        return this.campaignCtn.getUserActivationSegments();
      };

      /**
       * Bid Optimizer methods
       */
      service.getBidOptimizer = function (adGroupId) {
        return this.campaignCtn.getAdGroup(adGroupId).bidOptimizer;
      };


      service.getInventorySources = function () {
        return this.campaignCtn.getInventorySources();
      };

      service.addInventorySource = function (inventorySource) {
        return this.campaignCtn.addInventorySource(inventorySource);
      };

      service.removeInventorySource = function (inventorySource) {
        return this.campaignCtn.removeInventorySource(inventorySource);
      };

      service.getLocations = function () {
        return this.campaignCtn.getLocations();
      };


      service.addPostalCodeLocation = function (location) {

        $log.debug("> add location to ", this.campaignCtn, location);
        return this.campaignCtn.addPostalCodeLocation(location);
      };

      service.removeLocation = function (location) {

        $log.debug("> add location to ", this.campaignCtn, location);
        return this.campaignCtn.removeLocation(location);
      };

      // save the campaign
      service.save = function () {
        if (this.campaignCtn.id.indexOf('T') === -1) {
          return this.campaignCtn.update();
        } else {
          return this.campaignCtn.persist();
        }
      };

      // reset method
      service.reset = function () {
        this.campaignCtn = null;
      };

      service.isInitialized = function () {
        return !!this.campaignCtn;
      };

      return service;
    }
  ]);
});
