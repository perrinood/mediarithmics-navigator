define(['./module'], function (module) {
  'use strict';

  /**
   * DISPLAY AD SERVICE
   */

  module.factory('core/creatives/plugins/email-template/EmailTemplateService', [
    '$q', 'Restangular', '$log', 'core/common/auth/Session',
    function ($q, Restangular, $log, Session) {
      var idCounter = 1;
      var service = {};

      var rendererLabels = {
          "com.mediarithmics.template.email.dynamic-template": "Dynamic template",
          "com.ividence.email-renderer":"Custom template"
      };

      service.getRendererLabel = function(groupId, artifactId) {
        return rendererLabels[groupId + '.' + artifactId];
      };

      return service;
    }
  ]);
});
