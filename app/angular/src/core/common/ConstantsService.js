define(['./module'], function (module) {
  "use strict";

  var constants = {
    "adgroup_visibility": {
      "ANY_POSITION": "Any position",
      "ABOVE_THE_FOLD": "Above the fold",
      "BELOW_THE_FOLD": "Below the fold"
    }

  };

  var safeConstant = function (type, value) {
    return constants[type][value] || type + "." + value;
  };

  module.factory('core/common/ConstantsService',
    [function () {
      var service = {};
      service.getValues = function (type) {
//        var result = [];
//        for(var i in constants[type]) {
//          result.push({key:i, label:constants[type][i]});
//        }
//        return result;
        return constants[type];
      };
      service.get = function (type, value) {
        return safeConstant(type, value);
      };
      return service;

    }
    ]);

  module.filter('constant', function () {
    return function (input, type) {
      input = input || '';
      var result = safeConstant(type, input);
      return result;
    };
  });
});
  


