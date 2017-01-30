define(['./module'], function (module) {
  'use strict';

  module.factory('core/campaigns/goals/GoalsService', function () {
    var visitKey = 'VISIT_SITE';
    var clickKey = 'CLICK_ON_AD';
    var conversionKey = 'CONVERSION';
    var goalTypesList = [
      {key: clickKey, name: 'Click On Ad', description: 'Stop Campaign On Click'},
      {key: visitKey, name: 'Website Visit', description: 'Stop Campaign On Visit'},
      {key: conversionKey, name: 'Conversion Goal', description: ''}
    ];

    function getGoalTypesList() {
      return goalTypesList;
    }

    function getConversionType() {
      return conversionKey;
    }

    function isConversionType(type) {
      return type === conversionKey;
    }

    function isClickType(type) {
      return type === clickKey;
    }

    function isVisitType(type) {
      return type === visitKey;
    }

    return {
      getGoalTypesList: getGoalTypesList,
      getConversionType: getConversionType,
      isConversionType: isConversionType,
      isClickType: isClickType,
      isVisitType: isVisitType
    };
  });
});
