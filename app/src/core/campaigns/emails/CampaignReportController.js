define(['./module', 'angular', 'lodash'], function (module, angular, _) {
  'use strict';

  /**
   * Email Campaign Report Controller
   */
  module.controller('core/campaigns/emails/CampaignReportController', [
    '$scope', '$http', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/campaigns/report/ChartsService', 'core/campaigns/emails/EmailCampaignService',
    'core/campaigns/CampaignPluginService', 'core/common/auth/Session', 'd3', 'moment', '$interval', '$q', 'core/common/ErrorService',
    'core/common/auth/AuthenticationService', '$timeout',
    function ($scope, $http, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, EmailCampaignService, CampaignPluginService,
              Session, d3, moment, $interval, $q, ErrorService, AuthenticationService, $timeout) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      // Chart
      $scope.timeFilters = ['Daily', 'Hourly']; // Time filters order is important
      $scope.timeFilter = $scope.timeFilters[0];
      $scope.chartArea = "chart-area";
      $scope.charts = ['clicks', 'impressions'];
      $scope.getChartName = ChartsService.getChartName;

      // Tabs Set
      $scope.reverseSort = true;
      $scope.orderBy = "clicks";

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
          showLegend: false
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

        if (campaign.id === "1699") {
          $scope.mainInfo = {
            opened: 14272,
            totalOpened: 16413,
            timeToOpen: "3h 51m 15s",
            complaints: 0,
            clicked: 1213,
            totalClicks: 1334,
            unsubscribed: 0,
            totalSent: 35894,
            delivered: 35837,
            softBounced: 146,
            hardBounced: 57,
            date: "Monday 11/07/2016, 11:30 AM"
          };
          $scope.data1 = [{key: "", y: 39.8}, {key: "", y: 60.2}];
          $scope.data2 = [{key: "", y: 8.5}, {key: "", y: 91.5}];
          $scope.data3 = [{key: "", y: 0}, {key: "", y: 100}];
        } else if (campaign.id === "1704") {
          $scope.mainInfo = {
            opened: 19672,
            totalOpened: 22623,
            timeToOpen: "3h 09m 37s",
            complaints: 0,
            clicked: 1711,
            totalClicks: 1883,
            unsubscribed: 0,
            totalSent: 48796,
            delivered: 48721,
            softBounced: 195,
            hardBounced: 75,
            date: "Tuesday 03/01/2017, 15:32 PM"
          };
          $scope.data1 = [{key: "", y: 40.4}, {key: "", y: 59.6}];
          $scope.data2 = [{key: "", y: 8.7}, {key: "", y: 91.3}];
          $scope.data3 = [{key: "", y: 0}, {key: "", y: 100}];
        } else {
          $scope.mainInfo = {
            opened: 0,
            totalOpened: 0,
            timeToOpen: "0h 0m 0s",
            complaints: 0,
            clicked: 0,
            totalClicks: 0,
            unsubscribed: 0,
            totalSent: 0,
            delivered: 0,
            softBounced: 0,
            hardBounced: 0,
            date: "No email sent yet"
          };
          $scope.data1 = [{key: "", y: 0}, {key: "", y: 100}];
          $scope.data2 = [{key: "", y: 0}, {key: "", y: 100}];
          $scope.data3 = [{key: "", y: 0}, {key: "", y: 100}];
        }
        $scope.options1.title.text = $scope.data1[0].y + " %";
        $scope.options2.title.text = $scope.data2[0].y + " %";
        $scope.options3.title.text = $scope.data3[0].y + " %";
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
          templateUrl: 'src/core/campaigns/delete.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/campaigns/DeleteController'
        });
      };
    }
  ]);
});
