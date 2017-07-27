define(['./module'], function (module) {

  'use strict';


  module.filter('mcsEnumLabel', function () {
      return function (input) {
        return  (input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().substring(1)).replace(/_/g, ' ');
      };

    });
});

