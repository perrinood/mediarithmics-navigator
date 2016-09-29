define(['./module'], function (module) {

  'use strict';
  var updateStatistics = function ($scope, AudienceSegmentAnalyticsReportService) {
      AudienceSegmentAnalyticsReportService.allAudienceSegments().then(function (report) {
        $scope.audienceSegmentStats = report;
      });
  };

  module.controller('core/datamart/partitions/EditAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal',
    function ($scope, Restangular, Session, $location, $uibModal) {
      var datamartId = Session.getCurrentWorkspace().datamart_id;
      Restangular.all('audience_partitions').getList({datamart_id: datamartId}).then(function (result) {        
        $scope.audiencePartitions = result;
        $scope.sortType = 'name';
      });

      $scope.createAudiencePartition = function (type) {
        $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions/" + type);
      };

      $scope.detailsAudiencePartition = function (audiencePartition, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions/" + audiencePartition.type + "/" + audiencePartition.id + "/report");
      };

      $scope.editAudiencePartition = function (audiencePartition, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        $location.path(Session.getWorkspacePrefixUrl() + "/datamart/partitions/" + audiencePartition.type + "/" + audiencePartition.id);
      };

    }
  ]);

});
