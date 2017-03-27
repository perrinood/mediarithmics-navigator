define(['./module'], function (module) {
  'use strict';

module.factory("core/common/properties/PluginInstanceContainer", ["$q", "core/common/properties/PropertyContainer",function($q, PropertyContainer){

  var PluginInstanceContainer = function PluginInstanceContainer(pluginInstance, restangularEndpoint){
    this.restangularEndpoint = restangularEndpoint;
    this.value = pluginInstance;
    this.properties = [];
    this.propertyResourceName = "properties";
  };

  PluginInstanceContainer.prototype.createProperty = function addProperty(technicalName, type, value){
    var newProperty = {
      technical_name: technicalName,
      property_type: type,
      value: value
    };
    var pc = new PropertyContainer(newProperty, this.value);
    pc.new = true;
    this.properties.push(pc);
  };

  PluginInstanceContainer.prototype.loadProperties = function loadProperties() {
      var p = this.value.all(this.propertyResourceName).getList();
      var self = this;
      return p.then(function(properties){
        self.properties = [];
        for(var i = 0; i < properties.length ; i++) {
          self.properties.push(new PropertyContainer(properties[i], self.value));
        }
        return self;
      });
  };

  PluginInstanceContainer.prototype.loadDefaultProperties = function loadDefaultProperties(plugin) {
    var self = this;
    return plugin.all(this.propertyResourceName).getList().then(function(properties) {
          for(var i=0; i < properties.length; i++) {
            var defaultProperty = properties[i].plain();
            delete defaultProperty.id;

            self.properties.push(new PropertyContainer(defaultProperty));

          }
          return self;

        });
  };

  PluginInstanceContainer.prototype.load = function(pluginInstanceId) {
    var self = this;
    return self.restangularEndpoint.get(pluginInstanceId).then(function(pluginInstance){
      self.value = pluginInstance;
      return self.loadProperties();
    });
  };

  PluginInstanceContainer.prototype.save = function() {
    var self = this;
    if(!this.value.id) {
      var p = self.restangularEndpoint.post(self.value).then(function(instance) {
        self.value = instance;
        var updatePropertiesPromises = [];
        for(var y=0; y < self.properties.length; y++) {
          self.properties[y].setPluginInstance(instance);
          var update = self.properties[y].save(self.propertyResourceName);
          updatePropertiesPromises.push(update);
        }

        return $q.all(updatePropertiesPromises).then(function(result){
          return self;
        });
      });
      return  p;
    } else {
      var properties = this.properties;
      return this.value.save().then(function(instance){
        self.value = instance;
        var updatePropertiesPromises = [];
        if(properties) {
          for(var y=0; y < properties.length; y++) {
            var update = properties[y].save(self.propertyResourceName);
            updatePropertiesPromises.push(update);
          }
        }

        return $q.all(updatePropertiesPromises).then(function(result){
          return self;
        });

      });
    }
  };

  return PluginInstanceContainer;

}]);

module.factory("core/common/properties/RendererPluginInstanceContainer", ["$q", "core/common/properties/PluginInstanceContainer",function($q, PluginInstanceContainer){

  var RendererPluginInstanceContainer = function RendererPluginInstanceContainer(pluginInstance, restangularEndpoint){
    PluginInstanceContainer.call(this, pluginInstance, restangularEndpoint);
    this.propertyResourceName = "renderer_properties";
  };

  RendererPluginInstanceContainer.prototype = Object.create(PluginInstanceContainer.prototype);

  return RendererPluginInstanceContainer;

}]);

module.factory("core/common/properties/PropertyContainer", ["$q", "Restangular",function($q, Restangular) {

  var PropertyContainer = function PropertyContainer(property, pluginInstance) {
    this.value = property;
    this.pluginInstance = pluginInstance;
    this.new = null;
  };

  PropertyContainer.prototype.save = function save(propertyResourceName) {
    if(this.new) {
      return this.persist(propertyResourceName);
    } else {
      return this.update(propertyResourceName);
    }
  };

  PropertyContainer.prototype.setPluginInstance = function setPluginInstance(pluginInstance) {
    this.pluginInstance = pluginInstance;
  };

  PropertyContainer.prototype.update = function update(propertyResourceName) {
      var deferred = $q.defer();

      if (this.value.origin === 'PLUGIN_STATIC') {
        deferred.resolve();
        return deferred.promise;
      }

      this.pluginInstance.one(propertyResourceName).customPUT(this.value, 'technical_name=' + this.value.technical_name).then(function(property) {
        deferred.resolve(property);
      }, function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
  };

  PropertyContainer.prototype.persist = function persist(propertyResourceName) {
    return this.pluginInstance.all(propertyResourceName).post(this.value);
  };

  return PropertyContainer;
}]);

});
