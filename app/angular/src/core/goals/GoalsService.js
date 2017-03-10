define(['./module'], function (module) {
  'use strict';

  module.factory('core/campaigns/goals/GoalsService', function () {
    var conversionKey = 'CONVERSION';
    var goalTypesList = [
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

    return {
      getGoalTypesList: getGoalTypesList,
      getConversionType: getConversionType,
      isConversionType: isConversionType,
    };
  });
});
