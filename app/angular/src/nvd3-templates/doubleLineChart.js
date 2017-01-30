/* global nv */
define(['d3', 'nv.d3'], function (d3, ignore) {
  "use strict";

  nv.models.doubleLineChart = function () {

    /**
     * Public Variables with Default Settings
     */

    // Basic Chart variables
    var lines1 = nv.models.line(),
      lines2 = nv.models.line(),
      xAxis = nv.models.axis(),
      yAxis1 = nv.models.axis(),
      yAxis2 = nv.models.axis(),
      legend = nv.models.legend(),
      interactiveLayer = nv.interactiveGuideline(),
      scale = d3.time.scale();

    lines1.xScale(scale);
    xAxis.orient('bottom').tickPadding(7);
    yAxis1.orient('left');
    yAxis2.orient('right');

    // Margin
    var margin = {top: 10, right: 60, bottom: 20, left: 60},
      color = nv.utils.defaultColor(),
      width = null,
      height = null,
      showLegend = true,
      showXAxis = true,
      singleDay = false,
      hourlyMode = false,
      showYAxis = true,
      rightAlignYAxis = false,
      useInteractiveGuideline = false,
      tooltips = true,
      tooltip = function (key, x, y, e, graph) {
        return '<h3>' + key + '</h3>' +
          '<p>' + y + ' at ' + x + '</p>';
      },
      x,
      y1,
      y2,
      state = {},
      defaultState = null,
      noData = 'No Data Available.',
      dispatch = d3.dispatch('tooltipShow', 'tooltipHide', 'stateChange', 'changeState'),
      transitionDuration = 250,
      comprehensibleValues = [1, 2, 5, 10];

    /**
     * Private Variables
     */

    var showTooltip = function (e, offsetElement) {
      var left = e.pos[0] + ( offsetElement.offsetLeft || 0 ),
        top = e.pos[1] + ( offsetElement.offsetTop || 0),
        x = xAxis.tickFormat()(lines1.x()(e.point, e.pointIndex)),
        y = (e.series.right ? yAxis2 : yAxis1 ).tickFormat()(lines1.y()(e.point, e.pointIndex)),
        content = tooltip(e.series.key, x, y, e, chart);
      nv.tooltip.show([left, top], content, null, null, offsetElement);
    };

    function findMinMax(data) {
      var max, min, minX, maxX = 0;
      var maxTmp, minTmp;
      data.forEach(
        function (serie, i) {
          maxTmp = d3.max(serie.values, function (o) {
            return o.y;
          });
          max = d3.max([max, maxTmp]);

          minTmp = d3.min(serie.values, function (o) {
            return o.y;
          });
          min = d3.min([min, minTmp]);
          var maxXTmp = d3.max(serie.values, function (o) {
            return o.x;
          });
          var minXTmp = d3.min(serie.values, function (o) {
            return o.x;
          });

          maxX = d3.max([maxX, maxXTmp]);
          minX = d3.min([minX, minXTmp]);
        }
      );

      if ((min === 0 && max === 0) || (min === 0 && max === undefined) || (min === undefined && max === undefined)) {
        min = 0;
        max = 1;
      }

      if ((max === 0 && min === undefined)) {
        min = -1;
        max = 0;
      }

      max = (max < 1) ? Math.ceil(max * 10) / 10 : Math.ceil(max);
      return {
        min: Math.floor(min), max: max, xRange: [minX, maxX],
        allPositive: function () {
          return min >= 0 && max >= 0;
        },
        allNegative: function () {
          return min < 0 && max < 0;
        },
        ratio: function () {
          return max / (max - min);
        }
      };
    }

    function rescale(bounds) {
      var max = bounds.max;
      if (bounds.max >= 1) {
        var scaleMax = Math.floor(Math.log(bounds.max) / Math.LN10);
        max = comprehensibleValues.filter(function (elem) {
            return elem * Math.pow(10, scaleMax) >= bounds.max;
          })[0] * Math.pow(10, scaleMax);
      }
      var neg = false;
      if (bounds.min < 0) {
        neg = true;
      }
      var scaleMin = Math.floor(Math.log(neg ? -bounds.min : bounds.min) / Math.LN10);
      var min = bounds.min === 0 ? 0 : comprehensibleValues.filter(function (elem) {
        return elem * Math.pow(10, scaleMin) <= neg ? -bounds.min : bounds.min;
      })[0] * Math.pow(10, scaleMin);

      bounds.min = neg ? -min : min;
      bounds.max = max;
      return bounds;
    }

    function alignZeroAxis(lines1, lines2, primaryBounds, secondaryBounds) {
      primaryBounds = rescale(primaryBounds);
      secondaryBounds = rescale(secondaryBounds);

      // see here  http://peltiertech.com/Excel/Charts/AlignXon2Ys.html and http://stackoverflow.com/questions/11766879/d3-js-nvd3-js-how-to-set-y-axis-range

      if (primaryBounds.allPositive() && secondaryBounds.allPositive()) {
        primaryBounds.min = 0;
        secondaryBounds.min = 0;
      } else if (primaryBounds.allNegative() && secondaryBounds.allNegative()) {
        primaryBounds.max = 0;
        secondaryBounds.max = 0;
      } else if (primaryBounds.ratio !== secondaryBounds.ratio) {
        if (primaryBounds.ratio() < secondaryBounds.ratio()) {
          secondaryBounds.min = primaryBounds.min / primaryBounds.max * secondaryBounds.max;
        } else {
          primaryBounds.min = secondaryBounds.min / secondaryBounds.max * primaryBounds.max;
        }
      }

      lines1.yDomain([primaryBounds.min, primaryBounds.max]);
      lines2.yDomain([secondaryBounds.min, secondaryBounds.max]);
    }

    function chart(selection) {
      selection.each(function (data) {

        var container = d3.select(this);
        var that = this;
        var availableWidth = (width || parseInt(container.style('width')) || 960) - margin.left - margin.right;
        var availableHeight = (height || parseInt(container.style('height')) || 400) - margin.top - margin.bottom;

        chart.update = function () {
          container.transition().duration(transitionDuration).call(chart);
        };

        chart.container = this;

        state.disabled = data.map(function (d) {
          return !!d.disabled;
        });

        if (!defaultState) {
          var key;
          defaultState = {};
          for (key in state) {
            if (state[key] instanceof Array) {
              defaultState[key] = state[key].slice(0);
            } else {
              defaultState[key] = state[key];
            }
          }
        }

        /**
         * Display noData message if there's nothing to show.
         */

        if (!data || !data.length || !data.filter(function (d) {
            return d.values.length;
          }).length) {
          var noDataText = container.selectAll('.nv-noData').data([noData]);

          noDataText.enter().append('text')
            .attr('class', 'nvd3 nv-noData')
            .attr('dy', '-.7em')
            .style('text-anchor', 'middle');

          noDataText
            .attr('x', margin.left + availableWidth / 2)
            .attr('y', margin.top + availableHeight / 2)
            .text(function (d) {
              return d;
            });

          return chart;
        } else {
          container.selectAll('.nv-noData').remove();
        }

        /**
         * Setup Scales
         */

        var dataLeft = data.filter(function (d) {
          return !d.disabled && !d.right;
        });
        var dataRight = data.filter(function (d) {
          return d.right;
        }); // removed the !d.disabled clause here to fix Issue #240
        var boundsLeft = findMinMax(dataLeft);
        var boundsRight = findMinMax(dataRight);
        var range = d3.merge([boundsLeft.xRange, boundsRight.xRange]);
        if (dataLeft.length === 0) {
          range = boundsRight.xRange;
        } else if (dataRight === 0) {
          range = boundsLeft.xRange;
        }
        lines1.xDomain([d3.min(range), d3.max(range)]);

        x = lines1.xScale();
        y1 = lines1.yScale();
        y2 = lines2.yScale();
        alignZeroAxis(lines1, lines2, boundsLeft, boundsRight);

        /**
         * Setup containers and skeleton of chart
         */

        var wrap = container.selectAll('g.nv-wrap.nv-doubleLineChart').data([data]);
        var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-doubleLineChart').append('g');
        var g = wrap.select('g');

        gEnter.append("rect").style("opacity", 0);
        gEnter.append('g').attr('class', 'nv-x nv-axis');
        gEnter.append('g').attr('class', 'nv-y1 nv-axis axis-primary');
        gEnter.append('g').attr('class', 'nv-y2 nv-axis axis-secondary');
        gEnter.append('g').attr('class', 'nv-linesWrap-y1');
        gEnter.append('g').attr('class', 'nv-linesWrap-y2');
        gEnter.append('g').attr('class', 'nv-legendWrap');
        gEnter.append('g').attr('class', 'nv-interactive');

        g.select("rect")
          .attr("width", availableWidth)
          .attr("height", (availableHeight > 0) ? availableHeight : 0);

        /**
         * Legend
         */

        if (showLegend) {
          legend.width(availableWidth);
          g.select('.nv-legendWrap')
            .datum(data)
            .call(legend);
          if (margin.top !== legend.height()) {
            margin.top = legend.height();
            availableHeight = (height || parseInt(container.style('height')) || 400) - margin.top - margin.bottom;
          }
          wrap.select('.nv-legendWrap')
            .attr('transform', 'translate(0,' + (-margin.top) + ')');
        }

        wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        if (rightAlignYAxis) {
          g.select(".nv-y.nv-axis").attr("transform", "translate(" + availableWidth + ",0)");
        }

        /**
         * Main Chart Component(s)
         */

        // Set up interactive layer
        if (useInteractiveGuideline) {
          interactiveLayer
            .width(availableWidth)
            .height(availableHeight)
            .margin({left: margin.left, top: margin.top})
            .svgContainer(container)
            .xScale(x);
          wrap.select(".nv-interactive").call(interactiveLayer);
        }

        // Chart lines
        lines1
          .width(availableWidth)
          .height(availableHeight)
          .color(data.map(function (d, i) {
            return d.color || color(d, i);
          }).filter(function (d, i) {
            return !data[i].disabled && !data[i].right;
          }));

        var linesWrap = g.select('.nv-linesWrap-y1')
          .datum(data.filter(function (d) {
            return !d.disabled && !d.right;
          }));

        linesWrap.transition().call(lines1);

        lines2
          .width(availableWidth)
          .height(availableHeight)
          .color(data.map(function (d, i) {
            return d.color || color(d, i);
          }).filter(function (d, i) {
            return !data[i].disabled && data[i].right;
          }));

        var lines2Wrap = g.select('.nv-linesWrap-y2')
          .datum(data.filter(function (d) {
            return !d.disabled && d.right;
          }));

        lines2Wrap.transition().call(lines2);


        /**
         * Setup Axes
         */

        if (showXAxis) {
          var xValues = 0;
          if (singleDay) {
            xAxis.tickFormat(function (d) {
              return d3.time.format('%H:%M')(new Date(d));
            });
            xValues = 24; // Because there are 24 hours a day
          } else {
            xAxis.tickFormat(function (d) {
              return d3.time.format('%d %b')(new Date(d));
            });
            xValues = d3.time.day.range(range[0], range[1], 1).length + 1; // Depending on the selected days
          }
          xAxis.scale(x).tickSize(-availableHeight, 0);

          if (xValues < availableWidth / 100) {
            xAxis.ticks(d3.time.day, 1);
          } else {
            xAxis.ticks(Math.floor(availableWidth / 100));
          }

          g.select('.nv-x.nv-axis').attr('transform', 'translate(0,' + y1.range()[0] + ')');
          g.select('.nv-x.nv-axis').transition().call(xAxis);
        }

        // Y Axes
        if (showYAxis) {
          yAxis1
            .scale(y1)
            .ticks(availableHeight / 36)
            .tickSize(-availableWidth, 0);

          g.select('.nv-y1.nv-axis')
            .transition()
            .call(yAxis1);

          yAxis2
            .scale(y2)
            .ticks(availableHeight / 36)
            .tickSize(-availableWidth, 0);

          g.select('.nv-y2.nv-axis')
            .attr("transform", "translate(" + availableWidth + ",0)")
            .transition()
            .call(yAxis2);
        }


        /**
         * Event handling
         */

        legend.dispatch.on('stateChange', function (newState) {
          state = newState;
          dispatch.stateChange(state);
          chart.update();
        });

        interactiveLayer.dispatch.on('elementMousemove', function (e) {
          lines1.clearHighlights();
          lines2.clearHighlights();
          var singlePoint, pointIndex, pointXLocation, allData = [];
          data
            .filter(function (series, i) {
              series.seriesIndex = i;
              return !series.disabled;
            })
            .forEach(function (series, i) {
              pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x());
              var point = series.values[pointIndex];
              lines1.highlightPoint(i, pointIndex, true);
              lines2.highlightPoint(i, pointIndex, true);

              if (angular.isUndefined(point)) {
                return;
              }

              if (angular.isUndefined(singlePoint)) {
                singlePoint = point;
              }

              if (angular.isUndefined(pointXLocation)) {
                pointXLocation = chart.xScale()(chart.x()(point, pointIndex));
              }

              allData.push({
                key: series.key,
                value: Math.round(chart.y()(point, pointIndex) * 100) / 100,
                color: color(series, series.seriesIndex)
              });
            });

          // Highlight the tooltip entry based on which point the mouse is closest to.
          if (allData.length > 2) {
            var yValue = chart.yScale().invert(e.mouseY);
            var domainExtent = Math.abs(chart.yScale().domain()[0] - chart.yScale().domain()[1]);
            var threshold = 0.03 * domainExtent;
            var indexToHighlight = nv.nearestValueIndex(allData.map(function (d) {
              return d.value;
            }), yValue, threshold);
            if (indexToHighlight !== null) {
              allData[indexToHighlight].highlight = true;
            }
          }

          // Change tooltip title to display hour when hourly mode is selected
          var timeFormat = function (d) {
            return d3.time.format('%H:%M')(new Date(d));
          };
          var xValue = xAxis.tickFormat()(chart.x()(singlePoint, pointIndex));
          var tooltipTitle = "";
          if (singleDay || !hourlyMode) {
            tooltipTitle = xValue;
          } else {
            tooltipTitle = xValue + " - " + timeFormat(chart.x()(singlePoint, pointIndex));
          }

          interactiveLayer.tooltip
            .chartContainer(that.parentNode)
            .enabled(tooltips)
            .valueFormatter(function (d, i) {
              return yAxis1.tickFormat()(d);
            })
            .data({
              value: tooltipTitle,
              series: allData
            })();

          interactiveLayer.renderGuideLine(pointXLocation);
        });

        interactiveLayer.dispatch.on("elementMouseout", function (e) {
          dispatch.tooltipHide();
          lines1.clearHighlights();
          lines2.clearHighlights();
        });

        dispatch.on('tooltipShow', function (e) {
          if (tooltips && !useInteractiveGuideline) {
            showTooltip(e, that.parentNode);
          }
        });

        dispatch.on('changeState', function (e) {
          if (typeof e.disabled !== 'undefined' && data.length === e.disabled.length) {
            data.forEach(function (series, i) {
              series.disabled = e.disabled[i];
            });
            state.disabled = e.disabled;
          }
          chart.update();
        });
      });

      return chart;
    }

    /**
     * Expose public variables
     */

    chart.dispatch = dispatch;
    chart.lines1 = lines1;
    chart.lines2 = lines2;
    chart.legend = legend;
    chart.xAxis = xAxis;
    chart.yAxis1 = yAxis1;
    chart.yAxis2 = yAxis2;
    chart.interactiveLayer = interactiveLayer;

    d3.rebind(chart, lines1, 'defined', 'isArea', 'x', 'y', 'size', 'xScale', 'yScale', 'xDomain', 'yDomain', 'xRange', 'yRange', 'forceX', 'forceY', 'interactive', 'clipEdge', 'clipVoronoi', 'useVoronoi', 'id', 'interpolate');

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart.margin = function (_) {
      if (!arguments.length) {
        return margin;
      }
      margin.top = typeof _.top !== 'undefined' ? _.top : margin.top;
      margin.right = typeof _.right !== 'undefined' ? _.right : margin.right;
      margin.bottom = typeof _.bottom !== 'undefined' ? _.bottom : margin.bottom;
      margin.left = typeof _.left !== 'undefined' ? _.left : margin.left;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      return chart;
    };

    chart.height = function (_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      return chart;
    };

    chart.color = function (_) {
      if (!arguments.length) {
        return color;
      }
      color = nv.utils.getColor(_);
      legend.color(color);
      return chart;
    };

    chart.showLegend = function (_) {
      if (!arguments.length) {
        return showLegend;
      }
      showLegend = _;
      return chart;
    };

    chart.showXAxis = function (_) {
      if (!arguments.length) {
        return showXAxis;
      }
      showXAxis = _;
      return chart;
    };

    chart.singleDay = function (_) {
      if (!arguments.length) {
        return singleDay;
      }
      singleDay = _;
      return chart;
    };

    chart.hourlyMode = function (_) {
      if (!arguments.length) {
        return hourlyMode;
      }
      hourlyMode = _;
      return chart;
    };

    chart.showYAxis = function (_) {
      if (!arguments.length) {
        return showYAxis;
      }
      showYAxis = _;
      return chart;
    };

    chart.rightAlignYAxis = function (_) {
      if (!arguments.length) {
        return rightAlignYAxis;
      }
      rightAlignYAxis = _;
      yAxis1.orient((_) ? 'right' : 'left');
      return chart;
    };

    chart.useInteractiveGuideline = function (_) {
      if (!arguments.length) {
        return useInteractiveGuideline;
      }
      useInteractiveGuideline = _;
      if (_ === true) {
        chart.interactive(false);
        chart.useVoronoi(false);
      }
      return chart;
    };

    chart.tooltips = function (_) {
      if (!arguments.length) {
        return tooltips;
      }
      tooltips = _;
      return chart;
    };

    chart.tooltipContent = function (_) {
      if (!arguments.length) {
        return tooltip;
      }
      tooltip = _;
      return chart;
    };

    chart.state = function (_) {
      if (!arguments.length) {
        return state;
      }
      state = _;
      return chart;
    };

    chart.defaultState = function (_) {
      if (!arguments.length) {
        return defaultState;
      }
      defaultState = _;
      return chart;
    };

    chart.noData = function (_) {
      if (!arguments.length) {
        return noData;
      }
      noData = _;
      return chart;
    };

    chart.transitionDuration = function (_) {
      if (!arguments.length) {
        return transitionDuration;
      }
      transitionDuration = _;
      return chart;
    };

    return chart;
  };
});
