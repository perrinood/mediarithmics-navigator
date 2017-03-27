define(['./module'], function (module) {
  'use strict';

  module.factory('core/campaigns/report/ChartsService', function () {
    var chartsList = {
      'clicks': 'Clicks',
      'impressions': 'Impressions',
      'cpc': 'CPC',
      'ctr': 'CTR',
      'cpm': 'CPM',
      'impressions_cost': 'Spent'
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
