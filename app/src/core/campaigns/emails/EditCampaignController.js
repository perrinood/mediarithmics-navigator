define(['./module', 'moment'], function (module, moment) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/emails/EditCampaignController', [
    'jquery', '$scope', '$uibModal', '$log', '$location', '$stateParams', 'lodash', 'core/campaigns/CampaignPluginService',
    'core/common/WaitingService', 'core/common/ErrorService', 'core/campaigns/goals/GoalsService', 'Restangular', 'core/campaigns/emails/EmailCampaignContainer',
    function (jQuery, $scope, $uibModal, $log, $location, $stateParams, _, CampaignPluginService, WaitingService, ErrorService, GoalsService, Restangular, EmailCampaignContainer) {

      var campaignId = $stateParams.campaign_id;
      var campaignCtn = {};

      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.email", "default-editor").then(function (template) {
        campaignCtn = new EmailCampaignContainer(template.editor_version_id);
        if (!campaignId) {
          $scope.campaignCtn = campaignCtn;
        } else {
            campaignCtn.load(campaignId).then(function(){
              $scope.campaignCtn = campaignCtn;
            });
        }
      });

      $scope.selectExistingAudienceSegments = function() {
        var newScope = $scope.$new(true);
        newScope.segmentSelectionType = "EMAIL";
        $uibModal.open({
          templateUrl: 'src/core/datamart/segments/ChooseExistingAudienceSegmentsPopin.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/datamart/segments/ChooseExistingAudienceSegmentsPopinController',
          size: "lg"
        });
      };

      $scope.selectExistingEmailTemplates = function() {
        var newScope = $scope.$new(true);
        $uibModal.open({
          templateUrl: 'src/core/campaigns/emails/chooseExistingEmailTemplates.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/campaigns/emails/ChooseExistingEmailTemplatesController',
          size: "lg"
        });
      };

      $scope.addEmailRouters = function() {
        var newScope = $scope.$new(true);
        $uibModal.open({
          templateUrl: 'src/core/campaigns/emails/chooseExistingEmailRouters.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/campaigns/emails/ChooseExistingEmailRoutersController',
          size: "lg"
        });
      };

      $scope.$on("mics-audience-segment:selected", function (event, params) {
        var existing = _.find(campaignCtn.audienceSegments, function (segmentSelection) {
          return segmentSelection.audience_segment_id === params.audience_segment.id;
        });
        if (!existing) {
          var segmentSelection = {
            audience_segment_id: params.audience_segment.id,
            name: params.audience_segment.name
          };
          campaignCtn.addAudienceSegment(segmentSelection);
        }
      });

      $scope.$on("mics-email-template:selected", function (event, params) {
        var templateSelection = {email_template_id: params.template.id};
        campaignCtn.addEmailTemplate(templateSelection);
      });

      $scope.$on("mics-email-router:selected", function (event, params) {
        var routerSelection = {email_router_id: params.router.id, email_router_version_id: params.router.version_id};
        campaignCtn.addEmailRouter(routerSelection);
      });

      $scope.removeRouter = function(router) {
        campaignCtn.removeEmailRouter(router);
      };

      $scope.removeTemplate = function(template) {
        campaignCtn.removeEmailTemplate(template);
      };

      $scope.removeSegment = function(segment) {
        campaignCtn.removeAudienceSegment(segment);
      };


      $scope.save = function () {
        WaitingService.showWaitingModal();
        var promise = null;
        if (campaignCtn.id){
          promise = campaignCtn.update();
        } else {
          promise = campaignCtn.persist();
        }

        promise.then(function success(){
          WaitingService.hideWaitingModal();
          $location.path('/' + $scope.campaignCtn.value.organisation_id + '/campaigns/email');
        }, function failure(reason){
          WaitingService.hideWaitingModal();
          ErrorService.showErrorModal({
            error: reason
          });
        });
      };

      $scope.cancel = function () {
        // if ($scope.campaign && $scope.campaign.id) {
        //   $location.path('/' + $scope.campaign.organisation_id + '/campaigns/display/report/' + $scope.campaign.id + '/basic');
        // } else {
        $location.path('/' + $scope.campaignCtn.value.organisation_id + '/campaigns/email');
        // }
      };

    }
  ]);
});