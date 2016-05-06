define(['./module'], function (module) {
  'use strict';

  /**
   * Display Ad Property Container
   */

  module.factory("core/creatives/plugins/email-template/EmailTemplatePropertyContainer", [
    "$q", "Restangular",

    function ($q, Restangular) {

      var EmailTemplatePropertyContainer = function EmailTemplatePropertyContainer(property) {
        this.value = property;
        this.id = property.id;
      };

      EmailTemplatePropertyContainer.prototype.update = function update(creativeId) {
        var deferred = $q.defer();

        if (this.value.origin === 'PLUGIN_STATIC') {
          deferred.resolve();
          return deferred.promise;
        }

        Restangular.one("email_templates", creativeId).all("renderer_properties").customPUT(this.value, 'technical_name=' + this.value.technical_name).then(function (property) {
          deferred.resolve(property);
        }, function (reason) {
          deferred.reject(reason);
        });

        return deferred.promise;
      };

      EmailTemplatePropertyContainer.prototype.persist = function persist(creativeId) {
        return Restangular.one("email_templates", creativeId).all("renderer_properties").post(this.value);
      };

      return EmailTemplatePropertyContainer;
    }
  ]);
});
