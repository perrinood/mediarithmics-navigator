/* global nv, d3 */
define(['./module', 'd3', 'nv.d3', 'doubleLineChart'], function (module, ignore1, ignore2, ignore3) {
  'use strict';

  function initializeMargin(scope, attrs) {
    var margin = (scope.$eval(attrs.margin) || {left: 50, top: 50, bottom: 50, right: 50});
    if (typeof(margin) !== 'object') {
      // we were passed a vanilla int, convert to full margin object
      margin = {left: margin, top: margin, bottom: margin, right: margin};
    }
    scope.margin = margin;
  }

  function checkElementID(scope, attrs, element, chart, data) {
    var dataAttributeChartID; //randomly generated if id attribute doesn't exist
    if (!attrs.id) {
      dataAttributeChartID = 'chartid' + Math.floor(Math.random() * 1000000001);
      angular.element(element).attr('data-chartid', dataAttributeChartID);
      //if an id is not supplied, create a random id.
      if (d3.select('[data-chartid=' + dataAttributeChartID + '] svg').empty()) {
        d3.select('[data-chartid=' + dataAttributeChartID + ']').append('svg')
          .attr('height', scope.height)
          .attr('width', scope.width)
          .datum(data)
          .transition().duration((attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration)))
          .call(chart);
      } else {
        d3.select('[data-chartid=' + dataAttributeChartID + '] svg')
          .attr('height', scope.height)
          .attr('width', scope.width)
          .datum(data)
          .transition().duration((attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration)))
          .call(chart);
      }
    } else {
      if (angular.isArray(data) && data.length === 0) {
        d3.select('#' + attrs.id + ' svg').remove();
      }
      if (d3.select('#' + attrs.id + ' svg').empty()) {
        d3.select('#' + attrs.id)
          .append('svg');
      }
      d3.select('#' + attrs.id + ' svg')
        .attr('height', scope.height)
        .attr('width', scope.width)
        .datum(data)
        .transition().duration((attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration)))
        .call(chart);
    }
  }

  module.directive('micsDoubleLineChart', [function () {
    return {
      restrict: 'EA',
      scope: {
        // Data Specific
        data: '=',

        // Graph Specific
        id: '@',
        width: '@',
        height: '@',
        color: '&',
        nodata: '@',
        margin: '&',
        callback: '&',
        singleday: '&',
        showlegend: '@',
        interactive: '@',
        hourlymode: '&',
        useinteractiveguideline: '@',

        // AngularJS Specific
        objectequality: '@',

        // d3.js Specific
        transitionduration: '@'
      },
      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.d3Call = function (data, chart) {
          checkElementID($scope, $attrs, $element, chart, data);
        };
      }],
      link: function (scope, element, attrs) {
        scope.$watch('data', function (data) {
          if (data) {
            // When the chart exists we only update the data.
            if (scope.chart) {
              scope.chart.hourlyMode(scope.hourlymode());
              scope.chart.singleDay(scope.singleday());
              return scope.d3Call(data, scope.chart);
            }
            // Create the graph
            nv.addGraph({
              generate: function () {
                initializeMargin(scope, attrs);

                var chart = nv.models.doubleLineChart()
                  .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === 'true'))
                  .tooltips(true)
                  .showXAxis(true)
                  .showYAxis(true)
                  .interactive(true)
                  .useInteractiveGuideline(true)
                  .noData(attrs.nodata === undefined ? 'No Data Available' : scope.nodata)
                  .color(attrs.color === undefined ? nv.utils.defaultColor() : scope.color());

                scope.d3Call(data, chart);
                nv.utils.windowResize(chart.update);
                scope.chart = chart;
                return chart;
              },
              callback: attrs.callback === undefined ? null : scope.callback()
            });
          }
        }, (attrs.objectequality === undefined ? false : (attrs.objectequality === 'true')));
      }
    };
  }]);
});
