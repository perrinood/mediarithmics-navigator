define(['../module'], function (module) {
  'use strict';

  module.directive('breakdownTable', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        reportView: '=report',
        iterator: '=iterator',
        startHeaders: '=headers'
      },
      templateUrl: '/angular/src/core/campaigns/report/tables/breakdown-table.html'
    };
  });

  var tableHeaders = {
    "creative_id": "Id",
    "ad_group_id": "Id",
    "ad_id": "Id",
    "ad_group_name": "Ad Group Name",
    "impressions_cost": "Spend",
    "impressions": "Impressions",
    "cpc": "CPC",
    "clicks": "Clicks",
    "ctr": "CTR",
    "cpm": "CPM"

  };

  module.filter('tableHeader', function () {
    return function (input) {
      input = input || '';
      var out = tableHeaders[input] || input;
      return out;
    };
  });
});
