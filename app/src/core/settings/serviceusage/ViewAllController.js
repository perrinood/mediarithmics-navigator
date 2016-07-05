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
        ServiceUsageReportService.serviceUsageCustomerReport($scope.organisationId).then(function (data) {
          buildCustomerServiceUsageReport(data);
        });
      };

      $scope.$watch('reportDateRange', function () {
        updateStatistics($scope, ServiceUsageReportService, currentWorkspace.organisation_id);
      });

      ServiceUsageReportService.serviceUsageCustomerReport($scope.organisationId).then(function (data) {
        buildCustomerServiceUsageReport(data);
      });

      function getServiceElement(segmentId) {
        return Restangular.one('audience_segments', segmentId).get({organisation_id: $scope.organisationId});
      }

      function getService(serviceId) {
        return Restangular.one('services', serviceId).get({organisation_id: $scope.organisationId});
      }

      function getCampaign(campaignId) {
        return Restangular.one('campaigns', campaignId).get({organisation_id: $scope.organisationId});
      }

      function getOrganisation(organisationId) {
        return Restangular.one('organisations', organisationId).get({organisation_id: $scope.organisationId});
      }

      $scope.serviceUsageCustomerReport = [];

      function buildRow(usageRows, i) {
        var unitCount = usageRows[i][4];
        var list = [getOrganisation(usageRows[i][0]), getCampaign(usageRows[i][1]), getService(usageRows[i][2]), getServiceElement(usageRows[i][3])];
        return $q.all(list).then(function (results) {
          var organisation = results[0];
          var campaign = results[1];
          var service = results[2];
          var element = results[3];
          return {
            customer_organisation_name: organisation.name,
            campaign_name: campaign.name,
            service_name: service.name,
            service_element_name: element.name,
            unit_count: unitCount
          };
        }, function () {
          return undefined;
        });
      }

      var buildCustomerServiceUsageReport = function (serviceUsage) {
        var futures = [];
        var usageRows = serviceUsage.getRows();
        for (var i = 0; i < usageRows.length; ++i) {
          futures[i] = buildRow(usageRows, i);
        }

        $q.all(futures).then(function (result) {
          $scope.customerUsages = result.filter(function (n) {
            return n !== undefined;
          });
        }, function () {
          $log.error("An error occurred during service usage report build");
        });
      };
    }
  ]);
});
