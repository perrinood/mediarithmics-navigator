define(['./module'], function (module) {
  'use strict';

  var updateStatistics = function ($scope, CampaignAnalyticsReportService, organisationId) {
    CampaignAnalyticsReportService.setDateRange($scope.reportDateRange);
    // Moment is not immutable
    var report = CampaignAnalyticsReportService.allCampaigns(organisationId);
    report.then(function (stats) {
      $scope.displayCampaignsStatistics = stats;
    });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/campaigns/ListEmailCampaignsController', [
    '$scope', '$location', '$uibModal', '$log', 'Restangular', 'd3', 'moment', 'core/campaigns/DisplayCampaignService', 'core/common/auth/Session',
    'CampaignAnalyticsReportService', 'core/campaigns/CampaignPluginService', 'core/common/files/ExportService',
    function ($scope, $location, $uibModal, $log, Restangular, d3, moment, DisplayCampaignService, Session, CampaignAnalyticsReportService, CampaignPluginService, ExportService) {
      var currentWorkspace = Session.getCurrentWorkspace();

      $scope.currentPageEmailCampaign = 1;
      $scope.itemsPerPage = 10;

      $scope.reportDateRange = CampaignAnalyticsReportService.getDateRange();
      $scope.reportDefaultDateRanges = CampaignAnalyticsReportService.getDefaultDateRanges();
      $scope.organisationName = function (id) {
        return Session.getOrganisationName(id);
      };

      $scope.administrator = currentWorkspace.administrator;

      var params = {organisation_id: currentWorkspace.organisation_id};
      if ($scope.administrator) {
        params = {administration_id: currentWorkspace.organisation_id};
      }

      Restangular.all('email_campaigns').getList(params).then(function (emailCampaigns) {
        $scope.emailCampaigns = emailCampaigns;
      });

      $scope.$watch('reportDateRange', function () {
        updateStatistics($scope, CampaignAnalyticsReportService, currentWorkspace.organisation_id);
      });

      var buildAllCampaignsExportHeaders = function (report) {
        var headers = ["Status", "Name"];
        if ($scope.administrator) {
          headers = headers.concat("Organisation");
        }
        var metrics = report.getMetrics();
        // TODO get metrics with formatted names
        for (var i = 0; i < metrics.length; ++i) {
          headers = headers.concat(report.getMetricName(metrics[i]));
        }
        return headers;
      };

      $scope.buildAllCampaignsExportData = function () {
        return CampaignAnalyticsReportService.allCampaigns().then(function (report) {
          var dataExport = [
            ["All Campaigns"],
            ["From " + $scope.reportDateRange.startDate.format("DD-MM-YYYY"), "To " + $scope.reportDateRange.endDate.format("DD-MM-YYYY")],
            [],
            buildAllCampaignsExportHeaders(report)
          ];
          for (var i = 0; i < $scope.displayCampaigns.length; ++i) {
            var campaign = $scope.displayCampaigns[i];
            var row = [campaign.status, campaign.name];
            if ($scope.administrator) {
              row.push($scope.organisationName($scope.organisation_id));
            }
            var campaignMetrics = report.getRow(campaign.id);
            for (var j = 0; j < campaignMetrics.length; ++j) {
              row.push(campaignMetrics[j].value || '');
            }
            row = row.concat();
            dataExport = dataExport.concat([row]);
          }
          return dataExport;
        });
      };

      $scope.export = function (extension) {
        $scope.buildAllCampaignsExportData().then(function (dataExport) {
          ExportService.exportData([{
            name: "All Campaigns",
            data: dataExport
          }], 'AllCampaigns-' + currentWorkspace.organisation_id, extension);
        });
      };

      $scope.getCampaignDashboardUrl = function (campaign) {
        // return Session.getWorkspacePrefixUrl() + '/campaigns/email/edit/' + campaign.id;
        return Session.getWorkspacePrefixUrl() + "/campaigns/" + campaign.type.toLowerCase() + "/report/" + campaign.id + "/basic";
      };

      $scope.newCampaign = function () {
        $location.path(Session.getWorkspacePrefixUrl() + '/campaigns/email/edit');
      };

      $scope.editCampaign = function (campaign) {

        CampaignPluginService.getCampaignEditorFromVersionId(campaign.editor_version_id).then(function (template) {
          var location = template.editor.getEditPath(campaign);
          $location.path(location);
        });
        return false;
      };

      $scope.deleteCampaign = function (campaign, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }
        var newScope = $scope.$new(true);
        newScope.campaign = campaign;
        $uibModal.open({
          templateUrl: 'angular/src/core/campaigns/delete.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/campaigns/DeleteController'
        });
        return false;
      };
    }
  ]);

});
