define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/serviceusage/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'ServiceUsageReportService', 'lodash', '$q', 'ngTableParams', 'core/common/files/ExportService',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, ServiceUsageReportService, _, $q, NgTableParams, ExportService) {
      var currentWorkspace = Session.getCurrentWorkspace();
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      var fetchedUsages = null;

      $scope.reportDateRange = ServiceUsageReportService.getDateRange();

      function buildProviderServiceUsageReport(serviceUsage) {
        var usageRows = serviceUsage.getRows();
        var usages = usageRows.map(function (usageRow) {
          return {
            provider_organisation_id: usageRow[0],
            provider_name: usageRow[1],
            campaign_id: usageRow[2],
            campaign_name: usageRow[3],
            service_id: usageRow[4],
            service_name: usageRow[5],
            service_element_id: usageRow[6],
            segment_name: usageRow[7],
            unit_count: usageRow[8]
          };
        });

        fetchedUsages = usages;
        $scope.tableParams.settings({
          data: usages
        });
      }

      $scope.tableParams = new NgTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      });

      function updateStatistics($scope, ServiceUsageReportService) {
        var currentStatObj = $scope.statisticsQuery = {
          rand: Math.random().toString(36).substring(8),
          isRunning: true,
          error: null
        };
        ServiceUsageReportService.setDateRange($scope.reportDateRange);
        ServiceUsageReportService.serviceUsageProviderReport($scope.organisationId).then(function (data) {
          currentStatObj.isRunning = false;
          if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
            return;
          }
          buildProviderServiceUsageReport(data);
        });
      }

      $scope.$watch('reportDateRange', function () {
        updateStatistics($scope, ServiceUsageReportService, currentWorkspace.organisation_id);
      });

      $scope.export = function (extension) {
        // TODO handle different types
        if (extension !== 'xlsx') {
          return;
        }

        ExportService.exportData([{
          name: "Service Usage Report",
          data: [
            ['All service usage reports'],
            ["From " + $scope.reportDateRange.startDate.format("DD-MM-YYYY"), "To " + $scope.reportDateRange.endDate.format("DD-MM-YYYY")],
            ['Provider Name', 'Campaign Name', 'Service Name', 'Service Element Name', 'Usage']
          ].concat(fetchedUsages.map(function(usage) {
            return [
              usage.provider_name,
              usage.campaign_name,
              usage.service_name,
              usage.segment_name,
              usage.unit_count
            ];
          }))
        }], 'Service Usage Report', extension);
      };
    }
  ]);
});
