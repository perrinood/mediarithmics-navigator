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
          width: 400,
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
            opened: 468,
            totalOpened: 598,
            timeToOpen: "2h 24m 15s",
            complaints: 0,
            clicked: 56,
            totalClicks: 78,
            unsubscribed: 0,
            totalReceived: 977,
            delivered: 963,
            softBounced: 11,
            hardBounced: 3,
            date: "Thursday 03/11/2016, 11:30 AM"
          };
          $scope.data1 = [{key: "", y: 48.6}, {key: "", y: 52.4}];
          $scope.data2 = [{key: "", y: 7.5}, {key: "", y: 92.5}];
          $scope.data3 = [{key: "", y: 0}, {key: "", y: 100}];
        } else if (campaign.id === "1704") {
          $scope.mainInfo = {
            opened: 856,
            totalOpened: 1003,
            timeToOpen: "2h 12m 37s",
            complaints: 0,
            clicked: 132,
            totalClicks: 139,
            unsubscribed: 2,
            totalReceived: 1312,
            delivered: 1278,
            softBounced: 30,
            hardBounced: 4,
            date: "Wednesday 23/11/2016, 15:32 PM"
          };
          $scope.data1 = [{key: "", y: 56.6}, {key: "", y: 45.4}];
          $scope.data2 = [{key: "", y: 11}, {key: "", y: 89}];
          $scope.data3 = [{key: "", y: 1}, {key: "", y: 99}];
        } else if (campaign.id === "1705") {
          $scope.mainInfo = {
            opened: 668,
            totalOpened: 742,
            timeToOpen: "2h 32m 18s",
            complaints: 0,
            clicked: 88,
            totalClicks: 98,
            unsubscribed: 0,
            totalReceived: 835,
            delivered: 812,
            softBounced: 22,
            hardBounced: 1,
            date: "Friday 02/12/2016, 10:17 AM"
          };
          $scope.data1 = [{key: "", y: 72.5}, {key: "", y: 27.5}];
          $scope.data2 = [{key: "", y: 14.3}, {key: "", y: 85.7}];
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
            totalReceived: 0,
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
