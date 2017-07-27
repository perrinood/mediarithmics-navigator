define(['./module'], function (module) {
  'use strict';

  module.filter('website', function () {
    return function (input) {
      input = input || '';
      var out = input.replace(/site\:web\:/, "");
      return out;
    };
  });
});
