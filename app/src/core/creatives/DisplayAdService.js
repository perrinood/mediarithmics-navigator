/* global _ */
(function () {
  'use strict';


  /*
   *
   * DISPLAY Ad SERVICE
   *
   */

  var module = angular.module('core/creatives');

  
  module.factory('core/creatives/DisplayAdService', [
    '$q', 'Restangular', 'core/common/IdGenerator', 'core/creatives/DisplayAdContainer', '$log', 'core/common/auth/Session',
    function($q, Restangular, IdGenerator, DisplayAdContainer,  $log, Session) {

      var idCounter = 1;
      var service = {};

      service.reset = function() {

        this.displayAdCtn = null;
      };

      service.getDisplayAdValue = function() {

        $log.debug("> getDisplayAdValue, ctn=", this.displayAdCtn);
        return this.displayAdCtn.value;
      };

      service.initEditDisplayAd = function(creativeId) {

        $log.debug("> initEditDisplayAd creativeId = ", creativeId);

        var ctn = new DisplayAdContainer();
        this.displayAdCtn = ctn;
        return ctn.load(creativeId);
      };

      return service;
    }
  ]);
})();
