define(['lodash'], function (_) {
  'use strict';

  return function ReportWrapper(report, _tableHeaders) {
    var tableHeaders = _tableHeaders;

    for (var prop in _tableHeaders) {
      tableHeaders[prop].metric = prop;
    }

    //TODO send metadata in report

    var isMetrics = function (e) {
      return !(/name|_id|day|site/).test(e) || (/cookie/).test(e);
    };

    var notMetrics = function (e) {
      return (/name|_id|day|site/).test(e) && !(/cookie/).test(e);
    };


    var self = this;

    // Return the list of the report metrics (excluding the dimensions)
    this.getMetrics = function () {
      return _.filter(report.columns_headers, isMetrics);
    };

    // Return the index of a metric in the list of metrics (excluding the dimensions)
    this.getMetricIndex = function (metric) {
      return self.getMetrics().indexOf(metric);
    };

    // Get the first row where the first column matches the id
    this.getRow = _.memoize(function (id) {
      var row = _.select(report.rows, function (r) {
        return (r[0] + "") === (id + "");
      })[0];
      return self.decorate(row);
    });

    this.getHeaderIndex = _.memoize(function (header) {
      return report.columns_headers.indexOf(header);
    });

    this.getRowWithHeader = function (header, id) {
      var index = self.getHeaderIndex(header);
      var selectedRow = _.select(report.rows, function (row) {
        return (row[index] + "") === (id + "");
      })[0];
      return self.decorate(selectedRow);
    };

    this.getRows = function () {
      return report.rows;
    };

    this.getRowWithHeaders = function (header1, id1, header2, id2) {
      var index1 = self.getHeaderIndex(header1);
      var index2 = self.getHeaderIndex(header2);
      var selectedRow = _.select(report.rows, function (row) {
        return (row[index1] + "") === (id1 + "") && (row[index2] + "") === (id2 + "");
      })[0];
      return self.decorate(selectedRow);
    };

    this.toObject = _.memoize(function (row) {
      if (row === undefined) {
        return {};
      } else {
        // Build data array matching data values and data types
        return _.zipObject(report.columns_headers, row);
      }
    });

    this.transform = function (dimensionAsMetric, withTotals) {
      if (typeof(withTotals) === "undefined") {
        withTotals = true;
      }

      var keys = _.indexOf(report.columns_headers, dimensionAsMetric);
      var rows = _(report.rows);
      var metricsLength = report.columns_headers.length - keys;
      var allDimensionAsMetricValues = rows.map(function (r) {
        return r[keys];
      }).uniq();
      var newRows = rows.groupBy(function (r) {
        return _.slice(r, 0, keys);
      }).map(function (allRowByKey) {
        var key = _.slice(allRowByKey[0], 0, keys);
        var rowsByKey = allRowByKey.map(function (row) {
          return _.slice(row, keys);
        });
        var rowsGroupedByValue = _.groupBy(rowsByKey, function (row) {
          return row[0];
        });
        // x represent the metrics, one line by type
        var x = allDimensionAsMetricValues.map(function (value) {
          // there is only ONE VALUE per line !
          var metrics = (rowsGroupedByValue[value] || new Array(1))[0] || new Array(metricsLength);
          var r = {};
          r[value] = _.rest(metrics);
          return r;
        });
        var row = x.reduce(function (total, n) {
          var metrics = _.map(n)[0];
          _.forEach(metrics, function (m) {
            return total.push(m);
          });

          return total;
        }, key).valueOf();

        if (withTotals) {
          var totalValue = x.reduce(function (total, n) {
            return _.zipWith(total, _.values(n)[0], _.add);
          }, [0, 0]);
          row.push(totalValue);
        }

        return _.flatten(row);
      }).valueOf();

      var allDimensionAndTotal = allDimensionAsMetricValues;
      if (withTotals) {
        allDimensionAndTotal = allDimensionAsMetricValues.concat(["TOTAL"]);
      }

      var x = allDimensionAndTotal.map(function (d) {
        return report.columns_headers.slice(keys + 1).map(function (h) {
          return h + "." + d;
        });
      }).flatten().valueOf();

      var newReport = {};
      newReport.rows = newRows;
      newReport.columns_headers = _.slice(report.columns_headers, 0, keys).concat(x);

      return new ReportWrapper(newReport);
    };

    this.decorate = _.memoize(function (row) {
      if (row === undefined) {
        return _.map(new Array(self.getMetrics().length), function () {
          return 0;
        });
      } else {
        // Keep all values from the data that is a metric
        var values = _.slice(row, _.findLastIndex(report.columns_headers, notMetrics) + 1);
        // Replace 'null' with 0 to be able to use the data with the charts
        var clearedValues = values.map(function (v) {
          return v === null ? 0 : v;
        });
        var type = _.map(self.getMetrics(), function (m) {
          return tableHeaders[m].type;
        });
        // Build data array matching data values and data types
        return _.map(_.zip(clearedValues, type), function (t) {
          return {value: t[0], type: t[1]};
        });
      }
    });

    this.getMetricName = function (input) {
      if (angular.isDefined(tableHeaders[input])) {
        return tableHeaders[input].name;
      }
    };

    this.getMetricInfos = function (input) {
      if (angular.isDefined(tableHeaders[input])) {
        return tableHeaders[input];
      }
    };

    // Return the list of the report metrics (excluding the dimensions)
    this.getMetricsInfos = function () {
      return _.map(this.getMetrics(), this.getMetricInfos);
    };


    this.getMetricType = function (index) {
      return tableHeaders[this.getMetrics()[index]].type;
    };

    this.getObjectRows = function () {
      return _.map(report.rows, self.toObject, self);
    };

    this.getHeaders = function () {
      var headers = [];
      var metrics = this.getMetrics();
      for (var i = 0; i < metrics.length; ++i) {
        headers.push(this.getMetricName(metrics[i]));
      }
      return headers;
    };
  };
});
