define(['./module', 'moment'], function (module, moment) {
  'use strict';

  /**
   * Display Campaign Template Module
   * Template : Expert
   */

  module.controller('core/campaigns/emails/EditCampaignController', [
    'jquery', '$scope', '$uibModal', '$log', '$location', '$stateParams', '$sce', 'lodash', 'core/configuration',
    'core/campaigns/CampaignPluginService', 'core/common/WaitingService', 'core/common/ErrorService', 'core/campaigns/goals/GoalsService',
    'Restangular', 'core/campaigns/emails/EmailCampaignContainer', 'core/common/auth/Session', 'core/common/auth/AuthenticationService',
    function (jQuery, $scope, $uibModal, $log, $location, $stateParams, $sce, _, configuration,
              CampaignPluginService, WaitingService, ErrorService, GoalsService,
              Restangular, EmailCampaignContainer, Session, AuthenticationService) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      var campaignId = $stateParams.campaign_id;
      var campaignCtn = {};

      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.email", "default-editor").then(function (template) {
        campaignCtn = new EmailCampaignContainer(template.editor_version_id);
        if (!campaignId) {
          $scope.campaignCtn = campaignCtn;
        } else {
          campaignCtn.load(campaignId).then(function () {
            $scope.campaignCtn = campaignCtn;
            $log.debug($scope.campaignCtn);
            var templateId = campaignCtn.emailTemplates[0].email_template_id;
            loadEmailTemplate(templateId).then(function (emailRenderResponse) {
              $scope.emailRenderResponse = emailRenderResponse;
              var iframeHtml = document.getElementById('email-preview-html');
              writeToIframe(iframeHtml, emailRenderResponse.content && emailRenderResponse.content.html ? emailRenderResponse.content.html : "");
            });
          });
        }
      });

      $scope.selectExistingAudienceSegments = function () {
        var newScope = $scope.$new(true);
        newScope.segmentSelectionType = "EMAIL";
        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/segments/ChooseExistingAudienceSegmentsPopin.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/segments/ChooseExistingAudienceSegmentsPopinController',
          size: "lg"
        });
      };

      $scope.selectExistingEmailTemplates = function () {
        var newScope = $scope.$new(true);
        newScope.selectedTemplate = campaignCtn.emailTemplates[0];
        $uibModal.open({
          templateUrl: 'angular/src/core/campaigns/emails/chooseExistingEmailTemplates.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/campaigns/emails/ChooseExistingEmailTemplatesController',
          size: "lg"
        });
      };

      $scope.addEmailRouters = function () {
        var newScope = $scope.$new(true);
        newScope.selectedRouters = campaignCtn.emailRouters;
        $uibModal.open({
          templateUrl: 'angular/src/core/campaigns/emails/chooseExistingEmailRouters.html',
          scope: newScope,
          backdrop: 'static',
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

      function writeToIframe(iframe, content) {
        iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
        iframe.document.open();
        iframe.document.write(content);
        iframe.document.close();
      }


      function loadEmailTemplate(emailTemplateId) {
        $scope.previewWidth = 750;
        $scope.previewHeight = 500;
        var rawResponseRestangular = Restangular.withConfig(function (RestangularConfigurer) {
          RestangularConfigurer.setResponseExtractor(function (data, operation, what, url, response, deferred) {
            return response.data;
          });
        });
        return rawResponseRestangular.one('email_templates', emailTemplateId).one('preview').get();
      }

      $scope.$on("mics-email-template:selected", function (event, params) {
        loadEmailTemplate(params.template.id).then(function (emailRenderResponse) {
          $scope.emailRenderResponse = emailRenderResponse;
          var iframeHtml = document.getElementById('email-preview-html');
          writeToIframe(iframeHtml, emailRenderResponse.content && emailRenderResponse.content.html ? emailRenderResponse.content.html : "");
        }, function error(reason) {
          var iframeError = document.getElementById('email-preview-error');
          if (reason.data && reason.data.error) {
            writeToIframe(iframeError, "Error: " + reason.data.error);
          } else {
            writeToIframe(iframeError, reason.data);
          }
        });

        // $scope.previewUrl = $sce.trustAsResourceUrl(configuration.WS_URL + "/email_templates/" + params.template.id + "/preview?access_token=" + encodeURIComponent(AuthenticationService.getAccessToken()));
        var templateSelection = {email_template_id: params.template.id};
        campaignCtn.addEmailTemplate(templateSelection);
      });

      $scope.$on("mics-email-router:selected", function (event, params) {
        campaignCtn.emailRouters = [];
        params.routers.map(function (r) {
          var routerSelection = {email_router_id: r.id, email_router_version_id: r.version_id};
          campaignCtn.addEmailRouter(routerSelection);
        });

      });

      $scope.removeRouter = function (router) {
        campaignCtn.removeEmailRouter(router);
      };

      $scope.removeTemplate = function (template) {
        campaignCtn.removeEmailTemplate(template);
      };

      $scope.removeSegment = function (segment) {
        campaignCtn.removeAudienceSegment(segment);
      };


      $scope.save = function () {
        WaitingService.showWaitingModal();
        var promise = null;
        if (campaignCtn.id) {
          promise = campaignCtn.update();
        } else {
          promise = campaignCtn.persist();
        }

        promise.then(function success() {
          WaitingService.hideWaitingModal();
          $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/email/report/"  + $stateParams.campaign_id + "/basic");
        }, function failure(reason) {
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
        $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/email/report/"  + $stateParams.campaign_id + "/basic");
        // }
      };

    }
  ]);
});
