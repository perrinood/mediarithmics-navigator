define(['./module', 'angular'], function (module, angular) {
  'use strict';

  module.controller('core/settings/serviceusage/ViewAllController', [
    '$scope', '$log', '$location', '$state', '$stateParams', 'Restangular', 'core/common/auth/Session', 'ServiceUsageReportService', 'lodash',
    function ($scope, $log, $location, $state, $stateParams, Restangular, Session, ServiceUsageReportService, _) {
      $scope.datamartId = Session.getCurrentDatamartId();
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.itemsPerPage = 20;
      $scope.currentPage = 0;
      $scope.usages = [];

      // TODO MAKE DECORATORS WORK IN ORDER TO STOP DOING THIS BEAUTIFUL MANUAL JOIN...
      // Get campaign names
      Restangular.all('campaigns').getList({organisation_id: $scope.organisationId}).then(function (campaignsData) {
        $scope.campaignNames = [];
        _.forEach(campaignsData, function (campaign) {
          $scope.campaignNames[campaign.id] = campaign.name;
        });
      });

      // Get services names
      Restangular.all('services').getList({organisation_id: $scope.organisationId}).then(function (servicesData) {
        $scope.serviceNames = [];
        _.forEach(servicesData, function (service) {
          $scope.serviceNames[service.id] = service.name;
        });
      });

      // Get segments names for stats display
      Restangular.all('audience_segments').getList({organisation_id: $scope.organisationId}).then(function (segmentsData) {
        $scope.serviceElementNames = [];
        _.forEach(segmentsData, function (segment) {
          $scope.serviceElementNames[segment.id] = segment.name;
        });
      });

      ServiceUsageReportService.serviceUsageCustomerReport($scope.organisationId).then(function (data) {
        $scope.serviceUsageCustomerReport = data;
      });

      // ServiceUsageReportService.serviceUsageProviderReport($scope.organisationId).then(function (data) {
      //   $scope.serviceUsageProviderReport = data;
      // });

      // var buildProviderServiceUsageReport = function (serviceUsage) {
      //   var usages = [];
      //
      //   var usageRows = serviceUsage.getRows();
      //   for (var i = 0; i < usageRows.length; ++i) {
      //     usages[i] = {
      //       provider_organisation_id: usageRows[i][1],
      //       campaign_id: usageRows[i][1],
      //       campaign_name: $scope.campaignNames[usageRows[i][1]],
      //       service_name: $scope.serviceNames[usageRows[i][2]],
      //       // Keep only stats values. There's only one, unit_count so wee keep the first
      //       unit_count: usageRows[i][3]
      //     }
      //   }
      //
      //   return usages;
      // };
      //
      // $scope.$watchGroup(['serviceUsageProviderReport', 'campaignNames', 'serviceNames'], function (values) {
      //   var serviceUsageProviderReport = values[0];
      //   var campaignNames = values[1];
      //   var serviceNames = values[2];
      //   if (angular.isDefined(serviceUsageProviderReport) && angular.isDefined(campaignNames) && angular.isDefined(serviceNames)) {
      //     $scope.providerUsages = buildServiceUsageReport(serviceUsageProviderReport);
      //     console.log($scope.providerUsages);
      //   }
      // });

      var buildCustomerServiceUsageReport = function (serviceUsage) {
        var usages = [];

        var usageRows = serviceUsage.getRows();
        for (var i = 0; i < usageRows.length; ++i) {
          usages[i] = {
            customer_organisation_id: usageRows[i][0],
            campaign_name: $scope.campaignNames[usageRows[i][1]],
            service_name: $scope.serviceNames[usageRows[i][2]],
            service_element_name: $scope.serviceElementNames[usageRows[i][3]],
            // Keep only stats values. There's only one, unit_count so wee keep the first
            unit_count: usageRows[i][4]
          };
        }

        return usages;
      };

      $scope.$watchGroup(['serviceUsageCustomerReport', 'campaignNames', 'serviceNames', 'serviceElementNames'], function (values) {
        var serviceUsageCustomerReport = values[0];
        var campaignNames = values[1];
        var serviceNames = values[2];
        var serviceElementNames = values[3];
        if (angular.isDefined(serviceUsageCustomerReport) && angular.isDefined(campaignNames) && angular.isDefined(serviceNames) && angular.isDefined(serviceElementNames)) {
          $scope.customerUsages = buildCustomerServiceUsageReport(serviceUsageCustomerReport);
        }
      });
    }
  ]);
});
