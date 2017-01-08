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

      $scope.ads = [];
      $scope.adGroups = [];
      EmailCampaignService.getDeepCampaignView($stateParams.campaign_id).then(function (campaign) {
        $scope.campaign = campaign;
      });

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
            'left': '183px',
            'font-weight': 'bold',
            'font-size': '22px'
          }
        }
      };

      $scope.options2 = angular.copy($scope.options1);
      $scope.options3 = angular.copy($scope.options1);

      $scope.options2.chart.color = ['#fe5858', '#E6E6E6'];
      $scope.options3.chart.color = ['#FE8F10', '#E6E6E6'];

      $scope.data1 = [{key: "", y: 48.6}, {key: "", y: 52.4}];
      $scope.data2 = [{key: "", y: 7.5}, {key: "", y: 92.5}];
      $scope.data3 = [{key: "", y: 0}, {key: "", y: 100}];

      $scope.options1.title.text = $scope.data1[0].y + " %";
      $scope.options2.title.text = $scope.data2[0].y + " %";
      $scope.options3.title.text = $scope.data3[0].y + " %";

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
