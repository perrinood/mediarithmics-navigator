define(['./module', 'lodash', 'core/common/ReportWrapper'], function (module, _, ReportWrapper) {
  'use strict';

  /**
   * The Report Wrapper is used to retrieve data from the json report object
   */

  var tableHeaders = {
    "goal_id": {name: "Id"},
    "ad_group_id": {name: "Id"},
    "ad_id": {name: "Id"},
    "site": {name: "Site"},
    "display_network": {name: "Display Network"},
    "ad_group_name": {name: "Ad Group Name"},
    "day": {name: "Date"},
    "price": {name: "Price", type: "currency"},
    "conversions": {name: "Conversions", type: "number"},
    "marketing_channel": {name: "Marketing Channel", type: "string"},
    "campaign_name": {name: "Campaign Name", type: "string"},
    "source": {name: "Source", type: "string"},
    "value": {name: "Value", type: "currency"}
  };


  /**
   * Campaign Analytics Report Service
   */
  module.factory('GoalAnalyticsReportService',
    ['$resource', 'Restangular', 'core/common/auth/Session', 'core/common/auth/AuthenticationService', 'core/configuration',
      'moment', 'core/campaigns/report/ChartsService',
      function ($resource, Restangular, Session, AuthenticationService, configuration, moment, ChartsService) {
        var WS_URL = configuration.WS_URL;

        /**
         * Resources definition
         */

        function buildConversionPerformanceResource() {
          return $resource(WS_URL + "/reports/conversion_performance_report", {}, {
            get: {
              method: 'GET',
              headers: {'Authorization': AuthenticationService.getAccessToken()}
            }
          });
        }

        function buildConversionAttributionResource() {
          return $resource(WS_URL + "/reports/conversion_attribution_performance_report", {}, {
            get: {
              method: 'GET',
              headers: {'Authorization': AuthenticationService.getAccessToken()}
            }
          });
        }

        /**
         * Default Date Range Used For Daily Stats
         */

        var range = {startDate: moment().subtract('days', 20), endDate: moment()};

        var startDate = function () {
          return moment(range.startDate).startOf('day');
        };

        var endDate = function () {
          return moment(range.endDate).add(1, 'day').startOf('day');
        };


        /**
         * Report Service
         */

        var ReportService = {};

        ReportService.getTableHeaders = function () {
          return tableHeaders;
        };

        ReportService.getPerformance = function (resource, dimensions, metrics, filters, limit) {
          return resource.get({
            organisation_id: Session.getCurrentWorkspace().organisation_id,
            start_date: startDate().format('YYYY-MM-D'),
            end_date: endDate().format('YYYY-MM-D'),
            dimension: dimensions,
            metrics: metrics,
            filters: filters,
            limit: limit || null
          });
        };

        ReportService.buildPerformanceReport = function (resource, dimensions, metrics, filters, limit) {
          return this.getPerformance(resource, dimensions, metrics, filters, limit)
            .$promise.then(function (response) {
              return new ReportWrapper(response.data.report_view, tableHeaders);
            });
        };
        ReportService.attributionCampaigns = function (goalId, attributionModelId) {
          return this.buildPerformanceReport(
            buildConversionAttributionResource(),
            "campaign_name,campaign_id,interaction_type",
            "weighted_conversions,weighted_value",
            "goal_id==" + goalId + ",attribution_model_id==" + attributionModelId
          );
        };
        ReportService.attributionCreatives = function (goalId, attributionModelId) {
          return this.buildPerformanceReport(
            buildConversionAttributionResource(),
            "creative_name,interaction_type",
            "weighted_conversions,weighted_value",
            "goal_id==" + goalId + ",attribution_model_id==" + attributionModelId
          );
        };

        ReportService.attributionSources = function (goalId, attributionModelId) {
          return this.buildPerformanceReport(
            buildConversionAttributionResource(),
            "marketing_channel,source,interaction_type",
            "weighted_conversions,weighted_value",
            "goal_id==" + goalId + ",attribution_model_id==" + attributionModelId
          );
        };


        ReportService.kpi = function (goalId, hasCpa) {
          return this.getPerformance(buildConversionPerformanceResource(), "", "conversions,price,value", "goal_id==" + goalId)
            .$promise.then(function (response) {
              var report = response.data.report_view;
              var firstLine = report.rows[0] || [];
              return {
                "conversions": firstLine[_.indexOf(report.columns_headers, "conversions")] || 0,
                "value": firstLine[_.indexOf(report.columns_headers, "value")] || 0
              };
            });
        };

        ReportService.attributionKpi = function (goalId, attributionModelId) {
          return this.getPerformance(buildConversionAttributionResource(), "interaction_type", "weighted_conversions,interaction_to_conversion_duration", "goal_id==" + goalId + ",attribution_model_id==" + attributionModelId)
            .$promise.then(function (response) {
              var report = response.data.report_view;
              var firstLine = report.rows[0] || [];
              var weightedConversionIdx = _.indexOf(report.columns_headers, "weighted_conversions");

              var allWeightedConversions = _(report.rows).reduce(function (sum, r) {
                return sum + r[weightedConversionIdx];
              }, 0);

              var interactionTypeIdx = _.indexOf(report.columns_headers, "interaction_type");
              var interactionToDurationTypeIdx = _.indexOf(report.columns_headers, "interaction_to_conversion_duration");
              var postView = _.find(report.rows, function (e) {
                  return e[interactionTypeIdx] === 'POST_VIEW';
                }) || [];
              var postClick = _.find(report.rows, function (e) {
                  return e[interactionTypeIdx] === 'POST_CLICK';
                }) || [];
              var postClickConversions = postClick[weightedConversionIdx] || 0;
              var postViewConversions = postView[weightedConversionIdx] || 0;
              var postViewConversionsDuration = postView[interactionToDurationTypeIdx];
              var postClickConversionsDuration = postClick[interactionToDurationTypeIdx];

              var duration = ((postView[interactionToDurationTypeIdx] * postViewConversions) || 0 + (postClick[interactionToDurationTypeIdx] * postClickConversions) || 0) / (postViewConversions + postClickConversions);


              return {
                "weighted_conversions": allWeightedConversions,
                "post_view": postViewConversions,
                "post_view_duration": postViewConversionsDuration,
                "post_click": postClickConversions,
                "post_click_duration": postClickConversionsDuration,
                "interaction_to_conversion_duration": duration
              };
            });
        };


        ReportService.getDefaultDateRanges = function () {
          return {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
            'Last 7 Days': [moment().subtract('days', 6), moment()],
            'Last 30 Days': [moment().subtract('days', 29), moment()]
          };
        };

        ReportService.getDateRange = function () {
          return range;
        };

        ReportService.setDateRange = function (newRange) {
          range = newRange;
        };

        ReportService.getStartDate = function () {
          return startDate();
        };

        ReportService.getEndDate = function () {
          return endDate();
        };

        ReportService.dateRangeIsToday = function () {
          return this.getStartDate().valueOf() >= this.getEndDate().subtract('days', 1).valueOf();
        };


        ReportService.dailyPerformance = function (goalId, leftMetric, rightMetric) {
          /**
           * This function iterates on report rows to map
           * x,y points in the Nvd3 format
           * WARNING : dateIter.valueOf returns the timestamp in the navigator timezone
           */
          var dailyStatsMapping = function (response) {
            var report = new ReportWrapper(response.data.report_view, tableHeaders);
            var leftMetricIndex = report.getMetricIndex(leftMetric);
            var rightMetricIndex = report.getMetricIndex(rightMetric);
            var y1 = [], y2 = [];
            var dateIter = startDate();

            while (dateIter.isBefore(endDate())) {
              // iterates on a key in string format
              var key = dateIter.format("YYYY-MM-DD");
              var row = report.getRowWithHeader("day", key);

              if (row[leftMetricIndex] === 0) {
                y1.push({x: dateIter.valueOf(), y: 0});
              } else {
                y1.push({x: dateIter.valueOf(), y: row[leftMetricIndex].value});
              }

              if (row[rightMetricIndex] === 0) {
                y2.push({x: dateIter.valueOf(), y: 0});
              } else {
                y2.push({x: dateIter.valueOf(), y: row[rightMetricIndex].value});
              }

              dateIter = dateIter.add(1, 'day');
            }

            return [
              {
                area: true,
                values: y1,
                key: ChartsService.getChartName(leftMetric),
                color: "#FE5858"
              },
              {
                values: y2,
                area: true,
                right: true,
                key: ChartsService.getChartName(rightMetric),
                color: "#00AC67"
              }
            ];
          };

          return buildConversionPerformanceResource().get({
            organisation_id: Session.getCurrentWorkspace().organisation_id,
            start_date: startDate().format('YYYY-MM-D'),
            end_date: endDate().format('YYYY-MM-D'),
            dimension: "day",
            metrics: leftMetric + "," + rightMetric,
            filters: "goal_id==" + goalId
          }).$promise.then(dailyStatsMapping);
        };

        /**
         * Hourly Performance For One Day
         */
        ReportService.hourlyPerformance = function (goalId, leftMetric, rightMetric) {
          /**
           * This function iterates on report rows to map
           * x,y points in the Nvd3 format
           * WARNING : dateIter.valueOf returns the timestamp in the navigator timezone
           */
          var hourlyStatsMapping = function (response) {
            var y1 = [], y2 = [];
            var report = new ReportWrapper(response.data.report_view, tableHeaders);
            var leftMetricIndex = report.getMetricIndex(leftMetric);
            var rightMetricIndex = report.getMetricIndex(rightMetric);
            var dateIter = startDate();

            while (dateIter.isBefore(endDate())) {
              // Key represent each hour
              var key = dateIter.format("YYYY-MM-DD");
              var key2 = dateIter.format("H");
              var row = report.getRowWithHeaders("day", key, "hour_of_day", key2);

              if (row[leftMetricIndex] === 0) {
                y1.push({x: dateIter.valueOf(), y: 0});
              } else {
                y1.push({x: dateIter.valueOf(), y: row[leftMetricIndex].value});
              }

              if (row[rightMetricIndex] === 0) {
                y2.push({x: dateIter.valueOf(), y: 0});
              } else {
                y2.push({x: dateIter.valueOf(), y: row[rightMetricIndex].value});
              }

              dateIter = dateIter.add(1, 'hour');
            }

            return [
              {
                area: true,
                values: y1,
                key: leftMetric,
                color: "#FE5858"
              },
              {
                values: y2,
                area: true,
                right: true,
                key: rightMetric,
                color: "#00AC67"
              }
            ];
          };

          return buildConversionPerformanceResource().get({
            organisation_id: Session.getCurrentWorkspace().organisation_id,
            start_date: startDate().format('YYYY-MM-D'),
            end_date: endDate().format('YYYY-MM-D'),
            dimension: "day,hour_of_day",
            metrics: leftMetric + "," + rightMetric,
            filters: "goal_id==" + goalId
          }).$promise.then(hourlyStatsMapping);
        };

        return ReportService;
      }]);
});
