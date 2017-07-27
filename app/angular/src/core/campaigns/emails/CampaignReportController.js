define(['./module', 'angular', 'lodash'], function (module, angular, _) {
  'use strict';

  /**
   * Email Campaign Report Controller
   */
  module.controller('core/campaigns/emails/CampaignReportController', [
    '$scope', '$http', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/campaigns/report/ChartsService', 'core/campaigns/emails/EmailCampaignService',
    'core/campaigns/CampaignPluginService', 'core/common/auth/Session', 'd3', 'moment', '$interval', '$q', 'core/common/ErrorService',
    'core/common/auth/AuthenticationService', '$timeout', 'CampaignAnalyticsReportService', 'core/campaigns/emails/EmailCampaignContainer',
    function ($scope, $http, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, EmailCampaignService, CampaignPluginService,
              Session, d3, moment, $interval, $q, ErrorService, AuthenticationService, $timeout, CampaignAnalyticsReportService,EmailCampaignContainer) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      // Chart
      $scope.timeFilters = ['Daily', 'Hourly']; // Time filters order is important
      $scope.timeFilter = $scope.timeFilters[0];
      $scope.chartArea = "chart-area";
      $scope.getChartName = ChartsService.getChartName;

      $scope.recipient = {email: ""};
      $scope.messageSent = "";

      $scope.date = {reportDateRange: CampaignAnalyticsReportService.getDateRange()};
      $scope.reportDefaultDateRanges = CampaignAnalyticsReportService.getDefaultDateRanges();

      var campaignId = $stateParams.campaign_id;
      var campaignCtn = {};
      CampaignPluginService.getCampaignEditor("com.mediarithmics.campaign.email", "default-editor").then(function (template) {
        campaignCtn = new EmailCampaignContainer(template.editor_version_id);
        if (!campaignId) {
          $scope.campaignCtn = campaignCtn;
        } else {
          campaignCtn.load(campaignId).then(function () {
            $scope.campaignCtn = campaignCtn;
            $log.debug("campaignCtn",$scope.campaignCtn);
            if (campaignCtn.emailTemplates.length > 0) {
              $scope.templateId = campaignCtn.emailTemplates[0].email_template_id;
            }

          });
        }
      });

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



      function fetchEmailStat(campaignId) {
        CampaignAnalyticsReportService.emailPerformance(campaignId).then(function (data) {
          $scope.emailStats = data;

          var emailOpenedPercent = ($scope.emailStats.email_sent > 0 ? $scope.emailStats.impressions * 100 / $scope.emailStats.email_sent : 0.0).toFixed(2);
          var emailClickedPercent = ($scope.emailStats.email_sent  > 0 ? $scope.emailStats.clicks * 100 / $scope.emailStats.email_sent  : 0.0).toFixed(2);
          var emailUnsubscribedPercent = ($scope.emailStats.email_sent  > 0 ? $scope.emailStats.email_unsubscribed * 100 / $scope.emailStats.email_sent  : 0.0).toFixed(2);

          $scope.dataOpenedEmail = [{key: "Emails opened", y: emailOpenedPercent }, {key: "Emails not opened", y:  100 - emailOpenedPercent}];
          $scope.dataClickedEmail = [{key: "Emails clicked", y: emailClickedPercent }, {key: "Emails not clicked", y: 100 - emailClickedPercent}];
          $scope.dataUnsubscribedEmail = [{key: "Emails Unsubscribed", y: emailUnsubscribedPercent }, {key: "Emails not Unsubscribed", y: 100 - emailUnsubscribedPercent}];

          $scope.options1.title.text = $scope.dataOpenedEmail[0].y + " %";
          $scope.options2.title.text = $scope.dataClickedEmail[0].y + " %";
          $scope.options3.title.text = $scope.dataUnsubscribedEmail[0].y + " %";

        });
      }

       $scope.sendEmail = function () {
        if ($scope.recipient.email !== undefined && $scope.organisationId !== undefined && $scope.templateId !== undefined) {
          Restangular.one('email_templates', $scope.templateId).all('send_test').post({
            organisation_id: $scope.organisationId,
            email: $scope.recipient.email
          }).then(function () {
            $scope.messageSent = "Message sent";
          });
        }
      };

      /**
       * Charts
       */

      $timeout(function () {
        window.dispatchEvent(new Event('resize'));
      }, 0);

      $scope.options1 = {
        chart: {
          type: 'pieChart',
          height: 300,
          width: 300,
          transitionDuration: 500,
          donut: true,
          color: ['#00ad68', '#E6E6E6'],
          x: function(d) {
            return d.key;
          },
          y: function (d) {
            return d.y;
          },
          showLabels: false,
          pie: {
            startAngle: function (d) {
              return d.startAngle / 2 - Math.PI / 2;
            },
            endAngle: function (d) {
              return d.endAngle / 2 - Math.PI / 2;
            }
          },
          labelType:"percent",
          yAxis: {
            tickFormat: function (d) {
              return d3.format('.01f')(d) + ' ' + $scope.campaign.currency_code;
            }
          },
          showLegend: true
        },
        title: {
          enable: true,
          text: "",
          css: {
            'position': 'absolute',
            'top': '120px',
            'font-weight': 'bold',
            'font-size': '22px'
          }
        }
      };

      $scope.options2 = angular.copy($scope.options1);
      $scope.options3 = angular.copy($scope.options1);

      $scope.options2.chart.color = ['#fe5858', '#E6E6E6'];
      $scope.options3.chart.color = ['#FE8F10', '#E6E6E6'];

      /**
       * Email Campaign Data
       */

      EmailCampaignService.getDeepCampaignView($stateParams.campaign_id).then(function (campaign) {
        $scope.campaign = campaign;

        fetchEmailStat($scope.campaign.id);

      });

      /**
       * Campaigns Management
       */

      $scope.$watch('campaign', function (campaign) {
        if (campaign !== undefined) {
          CampaignPluginService.getCampaignEditorFromVersionId($scope.campaign.editor_version_id).then(function (template) {
            $scope.template = template;
          });
        }
      });

      $scope.editCampaign = function (campaign) {
        if ($scope.template) {
          var location = $scope.template.editor.getEditPath(campaign);
          $location.path(location);
        }
      };

      $scope.deleteCampaign = function (campaign) {
        var newScope = $scope.$new(true);
        newScope.campaign = campaign;
        $uibModal.open({
          templateUrl: 'angular/src/core/campaigns/delete.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/campaigns/DeleteController'
        });
      };

      $scope.$watchGroup(['date.reportDateRange'], function (values) {

        if (values && $scope.campaign){
          CampaignAnalyticsReportService.setDateRange($scope.date.reportDateRange);
          fetchEmailStat($scope.campaign.id);
        }
      });

    }
  ]);
});
