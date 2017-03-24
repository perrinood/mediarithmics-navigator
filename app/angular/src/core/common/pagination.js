define(['./module'], function (module) {
  'use strict';

  module.filter('offset', function() {
    return function(input, start) {
      if (!input) {
        return;
      }
      start = parseInt(start, 10);
      return input.slice(start);
    };
  });
});
