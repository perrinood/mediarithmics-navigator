define(['./module','moment-duration-format', 'moment'], function (module, momentDuration, moment) {
  'use strict';

  module.filter('humanDuration', function () {
    return function (input, durationUnit) {
      if (typeof input === "undefined") {
        return "";
      }

      durationUnit = durationUnit || 'seconds';

      return moment.duration(input, durationUnit).format("d[d] h[h] m[m] s[s]");
    };
  });


});
