define(['./module'], function (module) {
  'use strict';

  var updateStatistics = function ($scope, CampaignAnalyticsReportService, organisationId, ErrorService) {

    var currentStatObj = $scope.statisticsQuery = {
      rand: Math.random().toString(36).substring(8),
      isRunning: true,
      error: null
    };

    CampaignAnalyticsReportService.setDateRange($scope.reportDateRange);
    // Moment is not immutable
    var report = CampaignAnalyticsReportService.allCampaigns(organisationId);
    report.then(function (stats) {

      currentStatObj.isRunning = false;

      // an other refresh was triggered, don't do anything !
      if (currentStatObj.rand !== $scope.statisticsQuery.rand) {
        return;
      }

      $scope.displayCampaignsStatistics = stats;
    }).catch(function (e) {
      currentStatObj.isRunning = false;
      currentStatObj.error = e;
      ErrorService.showErrorModal(e);
    });
  };

  /**
   * Campaign list controller
   */
  module.controller('core/campaigns/ListDisplayCampaignsController', [
    '$scope', '$location', '$uibModal', '$log', 'Restangular', 'd3', 'moment', 'core/campaigns/DisplayCampaignService', 'core/common/auth/Session',
    'CampaignAnalyticsReportService', 'core/campaigns/CampaignPluginService', 'core/common/files/ExportService', 'core/common/ErrorService',
    function ($scope, $location, $uibModal, $log, Restangular, d3, moment, DisplayCampaignService, Session,
              CampaignAnalyticsReportService, CampaignPluginService, ExportService, ErrorService) {
      $log.debug("init campaigns");
      var currentWorkspace = Session.getCurrentWorkspace();

      $scope.currentPageDisplayCampaign = 1;
      $scope.itemsPerPage = 10;

      $scope.reportDateRange = CampaignAnalyticsReportService.getDateRange();
      $scope.reportDefaultDateRanges = CampaignAnalyticsReportService.getDefaultDateRanges();
      $scope.organisationName = function (id) {
        return Session.getOrganisationName(id);
      };

      $scope.administrator = currentWorkspace.administrator;

      var params = {organisation_id: currentWorkspace.organisation_id, max_results: 150, campaign_type: "DISPLAY"};
      if ($scope.administrator) {
        params = {administration_id: currentWorkspace.organisation_id, max_results: 150, campaign_type: "DISPLAY"};
      }

      Restangular.all('display_campaigns').getList(params).then(function (displayCampaigns) {
        $scope.displayCampaigns = displayCampaigns;
      });

      $scope.$watch('reportDateRange', function () {
        updateStatistics($scope, CampaignAnalyticsReportService, currentWorkspace.organisation_id, ErrorService);
      });

      $scope.refresh = function () {
        updateStatistics($scope, CampaignAnalyticsReportService, currentWorkspace.organisation_id, ErrorService);
      };

      // load display campaign templates
      CampaignPluginService.getAllDisplayCampaignEditors().then(function (editors) {
        $scope.campaignEditors = editors;
      });

      // create button
      $scope.create = function (template) {
        var organisationId = Session.getCurrentWorkspace().organisation_id;
        var datamartId = Session.getCurrentWorkspace().datamart_id;
        DisplayCampaignService.reset();
        DisplayCampaignService.initCreateCampaign(template, organisationId).then(function (campaignId) {
          var location = template.editor.create_path.replace(/{id}/g, campaignId).replace(/{organisation_id}/, organisationId).replace(/{datamart_id}/, datamartId);
          $log.debug("campaign init , campaign_id = ", campaignId);
          $location.path(location);
        });
      };

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
        return CampaignAnalyticsReportService.allCampaigns(Session.getCurrentWorkspace().organisation_id).then(function (report) {
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
        var currentExportObj = $scope.exportQuery = {
          rand: Math.random().toString(36).substring(8),
          isRunning: true,
          error: null
        };

        $scope.buildAllCampaignsExportData().then(function (dataExport) {

          currentExportObj.isRunning = false;

          // even if the rand is different, trigger the download
          ExportService.exportData([{
            name: "All Campaigns",
            data: dataExport
          }], 'AllCampaigns-' + currentWorkspace.organisation_id, extension);
        }).catch(function (e) {
          currentExportObj.isRunning = false;
          currentExportObj.error = e;
          ErrorService.showErrorModal(e);
        });
      };

      $scope.getCampaignDashboardUrl = function (campaign) {
        return Session.getWorkspacePrefixUrl() +  "/campaigns/" + campaign.type.toLowerCase() + "/report/" + campaign.id + "/basic";
      };

      $scope.newCampaign = function () {
        $location.path(Session.getWorkspacePrefixUrl()+ '/campaigns/select-campaign-template');
      };

      $scope.editCampaign = function (campaign, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

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
