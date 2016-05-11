define(['./module'], function (module) {
  'use strict';

module.factory("core/common/properties/PluginInstanceContainer", ["$q", "core/common/properties/PropertyContainer",function($q, PropertyContainer){
  function PluginInstanceContainer(pluginInstance, restangularEndpoint){
    this.restangularEndpoint = restangularEndpoint;
    this.value = pluginInstance;
    this.properties = [];
  }

  PluginInstanceContainer.prototype.loadProperties = function loadProperties() {
      var p = this.value.all("properties").getList();
      var self = this;
      p.then(function(properties){
        self.properties = [];
        for(var i = 0; i < properties.length ; i++) {
          self.properties.push(new PropertyContainer(properties[i], self.value));
        }

      });
      
    return self;

  };

  PluginInstanceContainer.prototype.loadDefaultProperties = function loadDefaultProperties(plugin) {
    var self = this;
    return plugin.all("properties").getList().then(function(properties) {
          for(var i=0; i < properties.length; i++) {
            var defaultProperty = properties[i].plain();
            delete defaultProperty.id;
            
            self.properties.push(new PropertyContainer(defaultProperty));

          }
          return self;

        });
  };

  PluginInstanceContainer.prototype.save = function() {
    if(!this.value.id) {
      var self = this;
      var p = self.restangularEndpoint.post(self.value).then(function(feed) {
        var updatePropertiesPromises = [];
        for(var y=0; y < self.properties.length; y++) {
          self.properties[y].setPluginInstance(feed);
          var update = self.properties[y].save();
          updatePropertiesPromises.push(update);
        }

        return $q.all(updatePropertiesPromises) ;
      });
      return  p;
    } else {
      var properties = this.properties;
      return this.value.save().then(function(instance){

        var updatePropertiesPromises = [];
        if(properties) {
          for(var y=0; y < properties.length; y++) {
            var update = properties[y].save();
            updatePropertiesPromises.push(update);
          }
        }

        return $q.all(updatePropertiesPromises) ;

      });
    }
  };
  return PluginInstanceContainer;


}]);

  module.factory("core/common/properties/PropertyContainer", [
    "$q", "Restangular",

    function($q, Restangular) {

      var PropertyContainer = function PropertyContainer(property, pluginInstance) {

        this.value = property;
        this.id = property.id;
        this.pluginInstance = pluginInstance;

      };

      PropertyContainer.prototype.save = function save() {
        if(this.value.id) {
          return this.update();
        } else {
          return this.persist();
        }
      };

      PropertyContainer.prototype.setPluginInstance = function setPluginInstance(pluginInstance) {
        this.pluginInstance = pluginInstance;
      };

      PropertyContainer.prototype.update = function update() {
          var deferred = $q.defer();

          if (this.value.origin === 'PLUGIN_STATIC') {
            deferred.resolve();
            return deferred.promise;
          }

          this.value.customPUT(this.value, 'technical_name=' + this.value.technical_name).then(function(property) {
            deferred.resolve(property);
          }, function(reason) {
            deferred.reject(reason);
          });

          return deferred.promise;
      };

      PropertyContainer.prototype.persist = function persist(creativeId) {
        return this.pluginInstance.one("properties").customPUT([this.value]);
      };

      return PropertyContainer;
    }

  ]);
});



