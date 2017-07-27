define(['./module'], function (module) {
  'use strict';

  /* define the Authentication service */
  module.factory('core/common/IdGenerator', function() {

    var service = {};
    service.counter = 0;

    service.getId = function(){
      service.counter += 1;
      return 'T'+service.counter;
    };

    return service;
  });
});

