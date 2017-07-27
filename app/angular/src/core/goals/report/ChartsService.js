define(['./module'], function (module) {
  'use strict';

  module.factory('core/goals/report/ChartsService', function () {
    var chartsList = {
      'conversions': 'Conversion',
      'price': 'Price',
      'value': 'Value'
    };

    function getChartsList() {
      return chartsList;
    }

    function getChartName(key) {
      return chartsList[key];
    }

    return {
      getChartsList: getChartsList,
      getChartName: getChartName
    };
  });
});
