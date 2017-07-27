define(['./module'], function (module) {
  'use strict';

  module.factory("core/bidOptimizer/PropertyContainer", [
    "$q", "Restangular",

    function ($q, Restangular) {

      var PropertyContainer = function PropertyContainer(property) {

        this.value = property;
        this.id = property.id;

      };

      PropertyContainer.prototype.update = function update() {
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

      PropertyContainer.prototype.persist = function persist(creativeId) {
        return Restangular.one("bid_optimizers", creativeId).one("properties").customPUT([this.value]);
      };

      return PropertyContainer;
    }

  ]);
});



