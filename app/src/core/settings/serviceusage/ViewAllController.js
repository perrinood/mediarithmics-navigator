define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/serviceusage/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'ServiceUsageReportService', 'lodash', '$q',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, ServiceUsageReportService, _, $q) {
      var currentWorkspace = Session.getCurrentWorkspace();
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPage = 0;
      $scope.usages = [];

      $scope.reportDateRange = ServiceUsageReportService.getDateRange();

      var updateStatistics = function ($scope, ServiceUsageReportService) {
        ServiceUsageReportService.setDateRange($scope.reportDateRange);
        ServiceUsageReportService.serviceUsageProviderReport($scope.organisationId).then(function (data) {
          buildProviderServiceUsageReport(data);
        });
      };

      $scope.$watch('reportDateRange', function () {
        updateStatistics($scope, ServiceUsageReportService, currentWorkspace.organisation_id);
      });

      // ServiceUsageReportService.serviceUsageCustomerReport($scope.organisationId).then(function (data) {
      //   buildCustomerServiceUsageReport(data);
      // });

      ServiceUsageReportService.serviceUsageProviderReport($scope.organisationId).then(function (data) {
        buildProviderServiceUsageReport(data);
      });

      var buildProviderServiceUsageReport = function (serviceUsage) {
        var usageRows = serviceUsage.getRows();
        for (var i = 0; i < usageRows.length; ++i) {
          $scope.usages[i] = {
            provider_organisation_id: usageRows[i][0],
            provider_name: usageRows[i][1],
            campaign_id: usageRows[i][2],
            campaign_name: usageRows[i][3],
            service_id: usageRows[i][4],
            service_name: usageRows[i][5],
            service_element_id: usageRows[i][6],
            segment_name: usageRows[i][7],
            unit_count: usageRows[i][8]
          };
        }
      };
    }
  ]);
});
