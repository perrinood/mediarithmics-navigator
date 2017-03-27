define(['./module'], function (module) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/expert/EditAdGroupController', [
    '$scope', '$location', '$stateParams', '$uibModal', '$log', 'core/campaigns/DisplayCampaignService', 'core/common/ConstantsService', 'lodash','core/common/auth/Session',
    function($scope, $location, $stateParams, $uibModal, $log, DisplayCampaignService, ConstantsService, _, Session) {

      var adGroupId = $stateParams.ad_group_id;
      var organisationId = $stateParams.organisation_id;
      var campaignId = $stateParams.campaign_id;
      if (!DisplayCampaignService.isInitialized() || DisplayCampaignService.getCampaignId() !== campaignId) {
        return $location.path(Session.getWorkspacePrefixUrl()+ "/campaigns/display/expert/edit/" + campaignId);
      }

      $scope.visibilityValues = ConstantsService.getValues("adgroup_visibility");

      $scope.campaignName = DisplayCampaignService.getCampaignValue().name;

      // get campaign
      $scope.adGroup = DisplayCampaignService.getAdGroupValue(adGroupId);

      // fo the keywords controller
      // $scope.keywordsList =
      $scope.getAds = function (adGroupId) {
        return DisplayCampaignService.getAds(adGroupId);
      };

      $scope.deleteAd = function (adId) {
        return DisplayCampaignService.removeAd(adGroupId, adId);
      };

      $scope.getAudienceSegments = function (adGroupId) {
        return DisplayCampaignService.getAudienceSegments(adGroupId);
      };

      $scope.getKeywordLists = function (adGroupId) {
        return DisplayCampaignService.getKeywordLists(adGroupId);
      };

      $scope.deleteKeywordList = function (keywordList) {
        return DisplayCampaignService.removeKeywordList(adGroupId, keywordList);
      };

      $scope.getPlacementLists = function (adGroupId) {
        return DisplayCampaignService.getPlacementLists(adGroupId);
      };

      $scope.deletePlacementList = function (placementList) {
        return DisplayCampaignService.removePlacementList(adGroupId, placementList);
      };

      $scope.deleteAudienceSegment = function (segment) {
        return DisplayCampaignService.removeAudienceSegment(adGroupId, segment);
      };

      $scope.getBidOptimizer = function (adGroupId) {
        return DisplayCampaignService.getBidOptimizer(adGroupId);
      };

      $scope.selectExistingAudienceSegments = function() {
        var newScope = $scope.$new(true);
        newScope.segmentSelectionType = "DISPLAY";
        // display pop-up
        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/segments/ChooseExistingAudienceSegmentsPopin.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/datamart/segments/ChooseExistingAudienceSegmentsPopinController',
          size: "lg"
        });
      };

      $scope.$on("mics-audience-segment:selected", function (event, params) {
        var existing = _.find(DisplayCampaignService.getAudienceSegments(adGroupId), function (selection) {
          return selection.audience_segment_id === params.audience_segment.id;
        });
        if (!existing) {
          var selection = {
            audience_segment_id: params.audience_segment.id,
            name: params.audience_segment.name,
            technical_name: params.audience_segment.technicalName,
            exclude: params.exclude
          };
          DisplayCampaignService.addAudienceSegment(adGroupId, selection);
        }
      });

      $scope.$on("mics-keyword-list:selected", function (event, params) {
        DisplayCampaignService.addKeywordList(adGroupId, {
          keyword_list_id: params.keywordList.id
        });
      });

      $scope.$on("mics-bid-optimizer:selected", function (event, params) {
        if (params.bidOptimizer === null) {
          $scope.adGroup.bid_optimization_objective_value = null;
          $scope.adGroup.bid_optimization_objective_type = null;
          $scope.adGroup.bid_optimizer_id = null;
        } else {
          $scope.adGroup.bid_optimizer_id = params.bidOptimizer.id;
          $scope.adGroup.bid_optimization_objective_type = $scope.adGroup.bid_optimization_objective_type || "CPC";
        }
      });

      $scope.$on("mics-placement-list:selected", function (event, params) {
        DisplayCampaignService.addPlacementList(adGroupId, {
          placement_list_id: params.placementList.id,
          exclude: params.exclude
        });
      });

      $scope.$on("mics-creative:selected", function (event, params) {
        var ad = {creative_id: params.creative.id};
        DisplayCampaignService.addAd(adGroupId, ad);
      });

      // save button
      $scope.done = function () {
        $log.debug("Editing Ad Group done! :", $scope.adGroup);
        DisplayCampaignService.setAdGroupValue(adGroupId, $scope.adGroup);
        $location.path(Session.getWorkspacePrefixUrl()+ '/campaigns/display/expert/edit/' + DisplayCampaignService.getCampaignId());
      };


      // back button
      $scope.cancel = function () {
        $log.debug("Reset Ad Group");
        DisplayCampaignService.resetAdGroup(adGroupId);
        $location.path(Session.getWorkspacePrefixUrl()+ '/campaigns/display/expert/edit/' + DisplayCampaignService.getCampaignId());
      };


      //$scope.uploader = new plupload.Uploader({
      //runtimes:'html5,flash,html4',
      //browse_button: 'browse',
      //container: 'uploadContainer',
      //url: "/upload/",
      //flash_swf_url: 'bower_components/plupload/Moxie.swf',
      //silverlight_xap_url: 'bower_components/js/external/plupload/Moxie.xap',
      //filters : {
      //max_file_size : '200kb',
      //mime_types: [
      //{title : "Image files", extensions : "jpg,png"},
      //{title : "Flash files", extensions : "swf"}
      //]
      //}
      //});
      //
      //$scope.uploader.bind('Error', function (up, args) {
      //$log.debug("Error", args);
      //});
      //
      //$scope.uploader.bind('PostInit', function (up, params) {
      //$log.debug('Init plupload, params = ' + params);
      //});
      //
      //$scope.uploader.init();
    }
  ]);
});
