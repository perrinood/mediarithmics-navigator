define(['./module'], function (module) {
  'use strict';

  module.filter('approxNumber', function () {
    return function (input) {
      if (typeof input === "undefined") {
        return "";
      }
      var number = parseInt(input);
      var result = "" + input;
      var unit = "";
      var abs = Math.abs(number);
      if(abs >= Math.pow(10, 12)) {
        // trillion
        result = (number / Math.pow(10, 12)).toFixed(1) + " trillions";
      } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
        // billion
        result = (number / Math.pow(10, 9)).toFixed(1) + " billions";
      } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
        // million
        result = (number / Math.pow(10, 6)).toFixed(1) + " millions";
      } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
        // thousand
        result = (number / Math.pow(10, 3)).toFixed(1) + " thousands";
      }

      return result;
    };
  });


});
