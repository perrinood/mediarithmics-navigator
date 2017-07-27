define(['./module', 'lodash'], function (module, _) {
  'use strict';

  var updateChartsStatistics = function ($scope, goalId, GoalAnalyticsReportService, ChartsService, charts) {
    var leftMetric = charts[0];
    var rightMetric = charts[1];

    // Get statistics according to time filter
    if ($scope.timeFilter === $scope.timeFilters[1]) {
      GoalAnalyticsReportService.hourlyPerformance(goalId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    } else {
      GoalAnalyticsReportService.dailyPerformance(goalId, leftMetric, rightMetric)
        .then(function (data) {
          $scope.chartData = data;
        });
    }
  };

  var updateStatistics = function ($scope, goalId, GoalAnalyticsReportService, ChartsService, charts) {
    GoalAnalyticsReportService.setDateRange($scope.reportDateRange);
    var attributionModels = $scope.attributionModels;


    if (GoalAnalyticsReportService.dateRangeIsToday()) {
      $scope.timeFilter = $scope.timeFilters[1];
    }

    $scope.xaxisdomain = [GoalAnalyticsReportService.getStartDate().toDate().getTime(),
      GoalAnalyticsReportService.getEndDate().toDate().getTime()
    ];

    updateChartsStatistics($scope, goalId, GoalAnalyticsReportService, ChartsService, charts);
    _.forEach(attributionModels, function (attributionModel) {
      attributionModel.stats = {};
      var stats = attributionModel.stats;

      GoalAnalyticsReportService.attributionKpi(goalId, attributionModel.id).then(function (data) {
        stats.global = data;
      });

      GoalAnalyticsReportService.attributionCampaigns(goalId, attributionModel.id).then(function (data) {
        stats.campaigns = data.transform("interaction_type", true);
      });
      GoalAnalyticsReportService.attributionSources(goalId, attributionModel.id).then(function (data) {
        stats.sources = data.transform("interaction_type", true);
      });
      GoalAnalyticsReportService.attributionCreatives(goalId, attributionModel.id).then(function (data) {
        stats.creatives = data.transform("interaction_type", true);
      });

      return;
    });


    GoalAnalyticsReportService.kpi(goalId)
      .then(function (data) {
        $scope.kpis = data;
      });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/goals/report/GoalReportController', [
    '$scope', '$location', '$uibModal', '$log', '$stateParams', 'Restangular', 'core/goals/report/ChartsService', 'GoalAnalyticsReportService', 'core/common/auth/Session', 'core/common/files/ExportService',
    function ($scope, $location, $uibModal, $log, $stateParams, Restangular, ChartsService, GoalAnalyticsReportService, Session, ExportService) {
      var goalId = $stateParams.goal_id;
      // Chart
      $scope.reportDateRange = GoalAnalyticsReportService.getDateRange();
      $scope.reportDefaultDateRanges = GoalAnalyticsReportService.getDefaultDateRanges();
      $scope.timeFilters = ['Daily', 'Hourly']; // Time filters order is important
      $scope.timeFilter = $scope.timeFilters[0];
      $scope.chartArea = "chart-area";
      $scope.charts = ['value', 'conversions'];
      $scope.getChartName = ChartsService.getChartName;
      // Tabs Set
      var tableHeadersKeys = Object.keys(GoalAnalyticsReportService.getTableHeaders());
      $scope.reverseSort = false;
      $scope.orderBy = "clicks";

      Restangular.one("goals", goalId).get().then(function (goal) {
        $scope.goal = goal;

        goal.all("attribution_models").getList().then(function (attributionModels) {
          $scope.attributionModels = attributionModels;
          $scope.defaultAttributionModel = _.find(attributionModels, {'default': true}, 'id').id;
          updateStatistics($scope, $stateParams.goal_id, GoalAnalyticsReportService, ChartsService, $scope.charts);
        });


      });


      /**
       * Data Table Export
       */

      var metricsTypes = {
        overview: "Overview",
        ads: "Ads",
        adGroups: "Ad Groups",
        sites: "Sites"
      };

      // TODO Generate Headers Dynamically
      var buildMetricsExportHeaders = function (metricsType) {
        var headers = ["Status", "Name", "Format"];
        if (metricsType === metricsTypes.sites) {
          headers = ["Name"];
        } else if (metricsType === metricsTypes.adGroups) {
          headers = ["Status", "Name"];
        }
        headers = headers.concat(["Imp.", "CPM", "Spent", "Clicks", "CTR", "CPC"]);
        if ($scope.hasCpa) {
          headers.push("CPA");
        }
        return headers;
      };

      var buildExportData = function (metrics, metricsType, header) {
        var data = [];
        for (var i = 0; i < metrics.length; ++i) {
          var row = [metrics[i].status, metrics[i].name, metrics[i].format];
          if (metricsType === metricsTypes.adGroups) {
            row = [metrics[i].status, metrics[i].name];
          } else if (metricsType === metricsTypes.sites) {
            row = [metrics[i].name];
          }
          for (var j = 0; j < metrics[i].info.length; ++j) {
            row.push(metrics[i].info[j].value || '');
          }
          data.push(row);
        }
        return header.concat(data);
      };

      var buildExportOverview = function (header) {
        var metrics = [$scope.kpis.conversions, $scope.kpis.conversion_value];


        return header.concat([metrics]).concat($scope.charts).concat($scope.chartData);
      };

      var buildExportHeader = function (metricsType) {
        var metricsHeaders = [];
        if (metricsType === metricsTypes.overview) {
          metricsHeaders = ["Conversions", "Conversion Value"];
        } else {
          metricsHeaders = buildMetricsExportHeaders(metricsType);
        }
        return [
          ["Organisation:", Session.getOrganisationName($scope.goal.organisation_id)],
          ["Goal: ", $scope.goal.name],
          ["From " + $scope.reportDateRange.startDate.format("DD-MM-YYYY"), "To " + $scope.reportDateRange.endDate.format("DD-MM-YYYY")],
          [],
          [metricsType],
          metricsHeaders
        ];
      };

      var buildCampaignMetricsExportData = function (ads, adGroups, sites) {
        var overviewData = buildExportOverview(buildExportHeader(metricsTypes.overview));
        var adsData = buildExportData(ads, metricsTypes.ads, buildExportHeader(metricsTypes.ads));
        var adGroupsData = buildExportData(adGroups, metricsTypes.adGroups, buildExportHeader(metricsTypes.adGroups));
        var sitesData = buildExportData(sites, metricsTypes.sites, buildExportHeader(metricsTypes.sites));
        return [
          {name: "Overview", data: overviewData},
          {name: "Ads", data: adsData},
          {name: "Ad Groups", data: adGroupsData},
          {name: "Sites", data: sitesData}
        ];
      };

      $scope.export = function (extension) {
        var dataExport = buildCampaignMetricsExportData($scope);
        ExportService.exportData(dataExport, $scope.goal.name + '-Metrics', extension);
      };


      /**
       * Stats
       */
      $scope.$watchGroup(['reportDateRange'], function (value) {
        updateStatistics($scope, $stateParams.goal_id, GoalAnalyticsReportService, ChartsService, $scope.charts);
      });

      $scope.refresh = function () {
        updateStatistics($scope, $stateParams.goal_id, GoalAnalyticsReportService, ChartsService, $scope.charts);
      };

      /**
       * Chart Utils
       */

      $scope.isHourlyMode = function () {
        return $scope.timeFilter === $scope.timeFilters[1];
      };

      $scope.dateRangeIsToday = function () {
        return GoalAnalyticsReportService.dateRangeIsToday();
      };

      $scope.goToCampaign = function (campaign) {
        var type = campaign ? campaign.type : "";
        if (type === "DISPLAY") {
          $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display/report/" + campaign.id + "/basic");
        } else {
          $location.path(Session.getWorkspacePrefixUrl() + "/campaigns/display");
        }
      };

      $scope.chooseCharts = function () {
        var modalInstance = $uibModal.open({
          templateUrl: 'angular/src/core/goals/report/ChooseCharts.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/goals/report/ChooseChartsController',
          size: 'lg',
          resolve: {
            charts: function () {
              return $scope.charts;
            }
          }
        });

        modalInstance.result.then(function (charts) {
          $scope.charts = charts;
          updateChartsStatistics($scope, $stateParams.goal_id, GoalAnalyticsReportService, ChartsService, charts);
        });
      };

      //$scope.showDetails = function () {
      //  $scope.details = !$scope.details;
      //  if ($scope.chartArea === "chart-area")
      //    $scope.chartArea = "chart-area show-details";
      //  else
      //    $scope.chartArea = "chart-area";
      //  updateChartsStatistics($scope, $stateParams.goal_id, GoalAnalyticsReportService, ChartsService, $scope.charts);
      //};
    }
  ]);
});
