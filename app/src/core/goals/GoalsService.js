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
