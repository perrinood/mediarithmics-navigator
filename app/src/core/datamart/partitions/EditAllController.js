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

      // $scope.reportDateRange = {startDate: moment(), endDate: moment()};
      // var todayDate = {startDate: moment(), endDate: moment()};
      // var sevenDaysRange = {startDate: moment().subtract('days', 7), endDate: moment()};
      // AudienceSegmentAnalyticsReportService.setDateRange(todayDate);

      // updateStatistics($scope, AudienceSegmentAnalyticsReportService);
      // $scope.refresh = function () {
        // AudienceSegmentAnalyticsReportService.setDateRange(todayDate);
        // updateStatistics($scope, AudienceSegmentAnalyticsReportService);
      // };

      // $scope.$watch('reportDateRange', function (newRange) {
      //   if (!newRange) {
      //     return;
      //   }

        /*
           if reportDateRange changes ,fetch statistics of the current day
        */
        // AudienceSegmentAnalyticsReportService.setDateRange(todayDate);

        // updateStatistics($scope, AudienceSegmentAnalyticsReportService);
      // });

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

      // $scope.deleteAudiencePartition = function (audiencePartition, $event) {
      //   if ($event) {
      //     $event.preventDefault();
      //     $event.stopPropagation();
      //   }

      //   var newScope = $scope.$new(true);
      //   newScope.audiencePartition = audiencePartition;
      //   $uibModal.open({
      //     templateUrl: 'src/core/datamart/partitions/delete.html',
      //     scope : newScope,
      //     backdrop : 'static',
      //     controller: 'core/datamart/partitions/DeleteController'
      //   });

      //   return false;
      // };
    }
  ]);

});
