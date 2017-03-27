define(['./module'], function (module) {

  'use strict';


  module.controller('core/datamart/segments/ViewOneController', [
    '$scope', 'moment', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', 'core/datamart/queries/QueryContainer', 'd3', '$timeout', 'core/datamart/segments/report/AudienceSegmentAnalyticsReportService',
    function ($scope, moment, $log, Restangular, Session, _, $stateParams, QueryContainer, d3, $timeout, AudienceSegmentAnalyticsReportService) {


      $scope.organisationId = $stateParams.organisation_id;

      $scope.datamartId = Session.getCurrentDatamartId();

      $scope.statsLoading = true;

      $scope.statistics = {total: 0, hasEmail: 0, hasCookie: 0};

      $scope.reportDateRange = AudienceSegmentAnalyticsReportService.getDateRange();
      $scope.reportDefaultDateRanges = AudienceSegmentAnalyticsReportService.getDefaultDateRanges();

      $scope.segmentId = $stateParams.segment_id;

      Restangular.one('audience_segments', $scope.segmentId).get().then(function (audienceSegment) {
          $scope.segment = audienceSegment;
         });


      var metrics = ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids' ,'mobile_cookie_ids', 'user_point_deletions', 'user_point_additions'];

      var legendPrettyPrint = function(legend){
        switch(legend){
          case "user_points" : return "User points";
          case "user_accounts" : return "User accounts";
          case "emails" : return "Emails";
          case "desktop_cookie_ids" : return "Desktop cookie ids";
          case "user_point_deletions" : return "User point deletions";
          case "user_point_additions" : return "User point additions";
          case "mobile_cookie_ids" : return "Mobile cookies ids";

        }

      };

      var workBreakDownReport = function(elementReport){
        //quick fix to remove underscore in legend
        elementReport.key = legendPrettyPrint(elementReport.key);
        return elementReport;

      };

       var workAdditionsDeletionsReport = function(elementReport){

        if (elementReport.key === 'user_point_deletions') {
          for (var i = 0; i < elementReport.values.length; i++) {
            elementReport.color =  "#FE5858";
            elementReport.values[i].y = Math.abs(elementReport.values[i].y) * -1;
          }
        }
        else {
          elementReport.color =  "#00AC67";
        }
        //quick fix to remove underscore in legend
        elementReport.key = legendPrettyPrint(elementReport.key);
        return elementReport;
      };

      var isAllStatsEqualZero = function(reportView, valueIdx, metricsBreakDown){
        var totalsSum = _.filter(reportView, function(obj){
          return metricsBreakDown.indexOf(obj.key) !== -1;
        }).map(function(obj){
          return obj.values[valueIdx].y;
        }).reduce(function(a,b){return a + b;} , 0);

        return totalsSum === 0;
      };

      /*
        this function  recover statistics of yesterday if all statistics of today are all equal 0. and this du the a bug
        we have in the job we use to generate statistics.
      */
      var correctReport = function(reportView){

           var metricsBreakDown = ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids' ,'mobile_cookie_ids'];

           var lenValues = reportView[0].values.length;

           if (lenValues > 1) {
             for (var valueIdx = 1; valueIdx < lenValues; valueIdx++){

                if (isAllStatsEqualZero(reportView, valueIdx, metricsBreakDown)) {
                 for (var metricIdx = 0; metricIdx < metrics.length; metricIdx++) {

                   switch (reportView[metricIdx].key) {
                     case "user_points" :  reportView[metricIdx].values[valueIdx].y = reportView[metricIdx].values[valueIdx -1 ].y ; break;
                     case "user_accounts" : reportView[metricIdx].values[valueIdx].y = reportView[metricIdx].values[valueIdx -1 ].y ; break;
                     case "emails" : reportView[metricIdx].values[valueIdx].y = reportView[metricIdx].values[valueIdx -1 ].y ; break;
                     case "desktop_cookie_ids" : reportView[metricIdx].values[valueIdx].y = reportView[metricIdx].values[valueIdx -1 ].y ; break;
                     case "mobile_cookie_ids" :  reportView[metricIdx].values[valueIdx].y = reportView[metricIdx].values[valueIdx -1 ].y ; break;
                     case "user_point_deletions" :  reportView[metricIdx].values[valueIdx].y = 0 ; break;
                     case "user_point_additions" :  reportView[metricIdx].values[valueIdx].y = 0 ; break;
                   }
                 }
                }
             }
           }
           return reportView;
      };

      $scope.$watch('reportDateRange', function (newVal) {
        if (!newVal) {
          return;
        }

        AudienceSegmentAnalyticsReportService.setDateRange($scope.reportDateRange);

        AudienceSegmentAnalyticsReportService.dailyPerformanceMetrics($scope.segmentId, metrics).then(function (report) {

          var correctedReport = correctReport(report);
          $scope.breakDownData = [];
          $scope.dataCreationSuppression = [];

          for (var metricIdx = 0; metricIdx < metrics.length; metricIdx++) {

            switch (correctedReport[metricIdx].key) {
              case "user_points" : $scope.statistics.total = correctedReport[metricIdx].values[correctedReport[metricIdx].values.length -1 ].y;$scope.breakDownData.push(workBreakDownReport(correctedReport[metricIdx]))  ; break;
              case "user_accounts" : $scope.statistics.hasUserAccountId= correctedReport[metricIdx].values[correctedReport[metricIdx].values.length -1 ].y; $scope.breakDownData.push(workBreakDownReport(correctedReport[metricIdx])); break;
              case "emails" : $scope.statistics.hasEmail = correctedReport[metricIdx].values[correctedReport[metricIdx].values.length -1 ].y;$scope.breakDownData.push(workBreakDownReport(correctedReport[metricIdx])); break;
              case "desktop_cookie_ids" : $scope.statistics.hasCookie = correctedReport[metricIdx].values[correctedReport[metricIdx].values.length -1 ].y; $scope.breakDownData.push(workBreakDownReport(correctedReport[metricIdx])); break;
              case "mobile_cookie_ids" : $scope.statistics.hasCookie = $scope.statistics.hasCookie + correctedReport[metricIdx].values[correctedReport[metricIdx].values.length -1 ].y;$scope.breakDownData.push(workBreakDownReport(correctedReport[metricIdx])); break;
              default : $scope.dataCreationSuppression.push(workAdditionsDeletionsReport(correctedReport[metricIdx])) ; break;
            }
            $scope.statsError = null;
            $scope.statsLoading = false;

          }
        });
      });


      Restangular.one('audience_segments', $scope.segmentId).get().then(function (segment) {
        $scope.segment = segment;
      });


      $scope.optionsCreationSuppression = {
        chart: {
          type: 'multiBarChart',
          height: 300,
          margin: {
            top: 20,
            right: 20,
            bottom: 45,
            left: 45
          },
          clipEdge: true,
          duration: 500,
          stacked: true,
          showControls: false,
          xAxis: {
            tickFormat: function (d) {
              return d3.time.format('%d %b')(new Date(d));
            },
            showMaxMin: false
          },
          yAxis: {
            axisLabelDistance: -20,
            tickFormat: function (d) {
              return d3.format(',.0f')(Math.abs(d));
            }
          }
        }
      };

      $scope.breakDownOptions = {
        chart: {
          type: 'lineChart',
          height: 300,

          margin: {
            top: 20,
            right: 20,
            bottom: 40,
            left: 100
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          xAxis: {
            tickFormat: function (d) {
              return d3.time.format('%d %b')(new Date(d));
            },
            showMaxMin: false
          },
          yAxis: {
            tickFormat: function (d) {
              return  d3.format(',.0f')(d);
            },
            axisLabelDistance: -0.01
          }

        }
      };


      /**
       *  I added this watch because the directive nvd3 shows the graph before the data completely loaded, and it gives a svg width bigger than the container
       *  see https://github.com/krispo/angular-nvd3/issues/40
       */
      $scope.$watch('breakDownData', function () {
        $timeout(function () {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      });

      $scope.$watch('dataCreationSuppression', function () {
        $timeout(function () {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      });

    }
  ]);
});

