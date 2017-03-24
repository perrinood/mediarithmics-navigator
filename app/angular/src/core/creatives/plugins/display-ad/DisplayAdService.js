define(['./module'], function (module) {
  'use strict';

  /**
   * DISPLAY AD SERVICE
   */

  module.factory('core/creatives/plugins/display-ad/DisplayAdService', [
    '$q', 'Restangular', 'core/common/IdGenerator', 'core/creatives/plugins/display-ad/DisplayAdContainer', '$log', 'core/common/auth/Session',
    function ($q, Restangular, IdGenerator, DisplayAdContainer, $log, Session) {
      var idCounter = 1;
      var service = {};

      service.reset = function () {
        this.displayAdCtn = null;
      };

      service.getDisplayAdValue = function () {
        $log.debug("> getDisplayAdValue, ctn=", this.displayAdCtn);
        return this.displayAdCtn.value;
      };

      service.getProperties = function () {
        $log.debug("> getProperties, ctn=", this.displayAdCtn);
        return this.displayAdCtn.properties;
      };

      service.getAudits = function () {
        return this.displayAdCtn.audits;
      };

      // initEditDisplayAd : returns a promise on the display ad container
      service.initEditDisplayAd = function (creativeId) {
        var ctn = new DisplayAdContainer(null);
        this.displayAdCtn = ctn;
        return ctn.load(creativeId);
      };

      // initEditDisplayAd : returns a promise on the display ad container
      service.initCreateDisplayAd = function (options) {
        var ctn = new DisplayAdContainer(options);
        ctn.organisationId = Session.getCurrentWorkspace().organisation_id;
        return (this.displayAdCtn = ctn);
      };

      // Save the display ad
      service.save = function () {
        if (this.displayAdCtn.id.indexOf('T') === -1) {
          return this.displayAdCtn.update();
        } else {
          return this.displayAdCtn.persist();
        }
      };

      service.makeAuditAction = function (action) {
        return this.displayAdCtn.makeAuditAction(action);
      };

      return service;
    }
  ]);
});
