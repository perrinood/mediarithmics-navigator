define(['./module'], function (module) {

  'use strict';
  var updateStatistics = function ($scope, AudienceSegmentAnalyticsReportService) {
      AudienceSegmentAnalyticsReportService.allAudienceSegments().then(function (report) {
        $scope.audienceSegmentStats = report;
      });
  };

  module.controller('core/datamart/segments/EditAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', 'core/datamart/segments/report/AudienceSegmentAnalyticsReportService', 'moment',
    '$filter',
    function ($scope, Restangular, Session, $location, $uibModal, AudienceSegmentAnalyticsReportService, moment, $filter) {
      var datamartId = Session.getCurrentWorkspace().datamart_id;

      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      Restangular.all('audience_segments').getList({datamart_id: datamartId, max_results: 200}).then(function (segments) {
        var filteredSegments = segments.filter(function (seg){
          return seg.type !== 'USER_PARTITION';
        });
        $scope.segments = filteredSegments;
        $scope.sortType = 'name';
      });

      $scope.filteredSegments = function() {
        return $filter('filter')($scope.segments, $scope.searchInput);
      };

      $scope.reportDateRange = {startDate: moment(), endDate: moment()};
      var todayDate = {startDate: moment(), endDate: moment()};
      var sevenDaysRange = {startDate: moment().subtract('days', 7), endDate: moment()};
      AudienceSegmentAnalyticsReportService.setDateRange(todayDate);

      updateStatistics($scope, AudienceSegmentAnalyticsReportService);
      $scope.refresh = function () {
        AudienceSegmentAnalyticsReportService.setDateRange(todayDate);
        updateStatistics($scope, AudienceSegmentAnalyticsReportService);
      };

      $scope.$watch('reportDateRange', function (newRange) {
        if (!newRange) {
          return;
        }

        /*
           if reportDateRange changes ,fetch statistics of the current day
        */
        AudienceSegmentAnalyticsReportService.setDateRange(todayDate);

        updateStatistics($scope, AudienceSegmentAnalyticsReportService);
      });

      $scope.createAudienceSegment = function (type) {
        $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments/" + type);
      };

      $scope.detailsAudienceSegment = function (segment, $event) {
        if ($event) {
          AudienceSegmentAnalyticsReportService.setDateRange(sevenDaysRange);
          $event.preventDefault();
          $event.stopPropagation();
        }

        $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments/" + segment.type + "/" + segment.id + "/report");
      };

      $scope.editAudienceSegment = function (segment, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments/" + segment.type + "/" + segment.id);
      };

      $scope.deleteAudienceSegment = function (segment, $event) {
        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }

        var newScope = $scope.$new(true);
        newScope.segment = segment;
        $uibModal.open({
          templateUrl: 'src/core/datamart/segments/delete.html',
          scope : newScope,
          backdrop : 'static',
          controller: 'core/datamart/segments/DeleteController'
        });

        return false;
      };
    }
  ]);

});
