define(['./module'], function (module) {
  'use strict';

  /**
   * Display Ad Property Container
   */

  module.factory("core/creatives/plugins/display-ad/DisplayAdPropertyContainer", [
    "$q", "Restangular",

    function ($q, Restangular) {

      var DisplayAdPropertyContainer = function DisplayAdPropertyContainer(property) {
        this.value = property;
        this.id = property.id;
      };

      DisplayAdPropertyContainer.prototype.update = function update() {
        var deferred = $q.defer();

        if (this.value.origin === 'PLUGIN_STATIC') {
          deferred.resolve();
          return deferred.promise;
        }

        this.value.customPUT(this.value, 'technical_name=' + this.value.technical_name).then(function (property) {
          deferred.resolve(property);
        }, function (reason) {
          deferred.reject(reason);
        });

        return deferred.promise;
      };

      DisplayAdPropertyContainer.prototype.persist = function persist(creativeId) {
        return Restangular.one("display_ads", creativeId).one("renderer_properties").customPUT([this.value]);
      };

      return DisplayAdPropertyContainer;
    }
  ]);
});
