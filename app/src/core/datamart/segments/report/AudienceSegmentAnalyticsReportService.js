define(['./module', 'lodash', 'core/common/ReportWrapper'], function (module, _, ReportWrapper) {
  'use strict';


  var tableHeaders = {
    "audience_segment_id": {name: "Id"},
    "day": {name: "Date"},
    "user_points": {name: "# of users", type: "number"},
    "user_accounts": {name: "# of accounts", type: "number"},
    "emails": {name: "# of emails", type: "number"},
    "mobile_cookie_ids": {name: "# of mapped mobiles (cookie)", type: "number"},
    "mobile_ad_ids": {name: "# of mapped mobiles (ad id)", type: "number"},
    "desktop_cookie_ids": {name: "# of mapped desktop", type: "number"},
    "user_point_deletions": {name: "users deletions", type: "number"},
    "user_point_additions": {name: "users additions", type: "number"}
  };


  /**
   * Audience Analytics Report Service
   */
  module.factory('core/datamart/segments/report/AudienceSegmentAnalyticsReportService',
    ['$resource', 'Restangular', 'core/common/auth/Session', 'core/common/auth/AuthenticationService', 'core/configuration',
      'moment', 'core/datamart/segments/report/ChartsService',
      function ($resource, Restangular, Session, AuthenticationService, configuration, moment, ChartsService) {
        var WS_URL = configuration.WS_URL;

        /**
         * Resources definition
         */

        function buildAudienceSegmentsResource() {
          return $resource(WS_URL + "/reports/audience_segment_report", {}, {
            get: {
              method: 'GET',
              headers: {'Authorization': AuthenticationService.getAccessToken()}
            }
          });
        }

        /**
         * Default Date Range Used For Daily Stats
         */

        var range = {startDate: moment().subtract('days', 7), endDate: moment()};

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

        ReportService.getReport = function (resource, dimensions, metrics, filters, limit) {
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

        ReportService.buildReport = function (resource, dimensions, metrics, filters, limit) {
          return this.getReport(resource, dimensions, metrics, filters, limit)
            .$promise.then(function (response) {
              return new ReportWrapper(response.data.report_view, tableHeaders);
            });
        };
        ReportService.allAudienceSegments = function () {
          return this.buildReport(
            buildAudienceSegmentsResource(),
            "audience_segment_id",
            "user_points,user_accounts,emails,desktop_cookie_ids,user_point_additions,user_point_deletions",
            ""
          );
        };
        ReportService.audienceSegments = function (audienceSegmentId) {
          return this.buildReport(
            buildAudienceSegmentsResource(),
            "",
            "user_points,user_accounts,emails,user_point_additions",
            "audience_segment_id==" + audienceSegmentId
          );
        };

        ReportService.audienceSegmentsForPartition = function (audiencePartitionId) {
          return this.buildReport(
            buildAudienceSegmentsResource(),
            "audience_segment_id",
            "user_points",
            "audience_partition_id==" + audiencePartitionId
          );
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

          return buildAudienceSegmentsResource().get({
            organisation_id: Session.getCurrentWorkspace().organisation_id,
            start_date: startDate().format('YYYY-MM-D'),
            end_date: endDate().format('YYYY-MM-D'),
            dimension: "day",
            metrics: leftMetric + "," + rightMetric,
            filters: "audience_segment_id==" + goalId
          }).$promise.then(dailyStatsMapping);
        };


        ReportService.dailyPerformanceMetrics = function (goalId, metrics) {
          /**
           * This function iterates on report rows to map
           * x,y points in the Nvd3 format
           * WARNING : dateIter.valueOf returns the timestamp in the navigator timezone
           */
          var dailyStatsMapping = function (response) {
            var report = new ReportWrapper(response.data.report_view, tableHeaders);

            var metricsIndex = [];
            var rows = [];
            for (var i = 0; i < metrics.length; i++) {
              rows.push([]);
              metricsIndex[metrics[i]] = report.getMetricIndex(metrics[i]);
            }

            var dateIter = startDate();

            while (dateIter.isBefore(endDate())) {
              // iterates on a key in string format
              var key = dateIter.format("YYYY-MM-DD");
              var row = report.getRowWithHeader("day", key);

              for (i = 0; i < metrics.length; i++) {
                if (row[metricsIndex[metrics[i]]] === 0) {
                  rows[metricsIndex[metrics[i]]].push({x: dateIter.valueOf(), y: 0});
                } else {
                  rows[metricsIndex[metrics[i]]].push({x: dateIter.valueOf(), y: row[metricsIndex[metrics[i]]].value});
                }
              }

              dateIter = dateIter.add(1, 'day');
            }

            var r = [];
            for (i = 0; i < metrics.length; i++) {
              r.push({
                values: rows[metricsIndex[metrics[i]]],
                key: metrics[i]
              });
            }
            return r;

          };

          return buildAudienceSegmentsResource().get({
            organisation_id: Session.getCurrentWorkspace().organisation_id,
            start_date: startDate().format('YYYY-MM-D'),
            end_date: endDate().format('YYYY-MM-D'),
            dimension: "day",
            metrics: metrics.join(','),
            filters: "audience_segment_id==" + goalId
          }).$promise.then(dailyStatsMapping);
        };

        return ReportService;
      }]);
});
