define(['./module', 'lodash', 'core/common/ReportWrapper'], function (module, _, ReportWrapper) {
  'use strict';

  var tableHeaders = {
    "provider_organisation_id": {name: "Provider Organisation Id", type: "number"},
    "service_id": {name: "Service Id", type: "number"},
    "service_element_id": {name: "Service Element Id", type: "number"},
    "customer_organisation_id": {name: "Customer Organisation Id", type: "number"},
    "campaign_id": {name: "Campaign Id", type: "number"},
    "sub_campaign_id": {name: "Sub Campaign Id", type: "number"},
    "unit_count": {name: "Unit Count", type: "number"}
  };

  /**
   * Campaign Analytics Report Service
   */
  module.factory('ServiceUsageReportService', ['$resource', 'Restangular', 'core/common/auth/Session',
    'core/common/auth/AuthenticationService', 'core/configuration', 'moment',
    function ($resource, Restangular, Session, AuthenticationService, configuration, moment) {
      var WS_URL = configuration.WS_URL;

      var serviceUsageCustomerResource = $resource(
        WS_URL + "/reports/service_usage_customer_report",
        {},
        {
          get: {
            method: 'GET',
            headers: {'Authorization': AuthenticationService.getAccessToken()}
          }
        }
      );

      var serviceUsageProviderResource = $resource(
        WS_URL + "/reports/service_usage_provider_report",
        {},
        {
          get: {
            method: 'GET',
            headers: {'Authorization': AuthenticationService.getAccessToken()}
          }
        }
      );

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

      ReportService.getPerformance = function (resource, dimensions, metrics, filters, sort, limit) {
        return resource.get({
          organisation_id: Session.getCurrentWorkspace().organisation_id,
          start_date: startDate().format('YYYY-MM-D'),
          end_date: endDate().format('YYYY-MM-D'),
          dimension: dimensions,
          metrics: metrics,
          filters: filters,
          sort: sort,
          limit: limit || null
        });
      };

      ReportService.buildPerformanceReport = function (resource, dimensions, metrics, filters, sort, limit) {
        return this.getPerformance(resource, dimensions, metrics, filters, sort, limit)
          .$promise.then(function (response) {
            return new ReportWrapper(response.data.report_view, tableHeaders);
          });
      };

      ReportService.serviceUsageCustomerReport = function (organisationId, sort, limit) {
        return this.buildPerformanceReport(
          serviceUsageCustomerResource,
          "campaign_id,campaign_name,customer_name,service_id,service_name,service_element_id,service_element_name",
          "unit_count",
          "organisation_id==" + organisationId,
          sort,
          limit
        );
      };

      ReportService.serviceUsageProviderReport = function (organisationId, sort, limit) {
        return this.buildPerformanceReport(
          serviceUsageProviderResource,
          "campaign_id,campaign_name,provider_name,service_id,service_name,service_element_id,service_element_name",
          "unit_count",
          "organisation_id==" + organisationId,
          sort,
          limit
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

      return ReportService;
    }]);
});