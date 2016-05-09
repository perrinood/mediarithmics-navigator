define(['./module'], function (module) {
  'use strict';

  module.factory("core/creatives/plugins/email-template/EmailTemplateContainer", [
    "$q", "Restangular", "async", "core/creatives/plugins/email-template/EmailTemplatePropertyContainer", "$log",
    'core/common/auth/Session','lodash','core/common/promiseUtils',
    function ($q, Restangular, async, PropertyContainer, $log, Session, _, promiseUtils) {

      function saveOrUpdatePropertyTask(propertyCtn, creativeId){
        return function (callback) {
          var promise;
          if (propertyCtn.id) {
            promise = propertyCtn.update(creativeId);
          } else {
            promise = propertyCtn.persist(creativeId);
          }
          promiseUtils.bindPromiseCallback(promise, callback);
        };
      }

      var EmailTemplateContainer = function EmailTemplateContainer(name, options) {
        this.value = {};
        this.properties = [];

        if (!options) {
          return;
        }
        this.value = {
          name: name,
          type: "EMAIL_TEMPLATE",
          organisation_id: Session.getCurrentWorkspace().organisation_id,
          renderer_group_id: options.renderer.groupId,
          renderer_artifact_id: options.renderer.artifactId,
          editor_group_id: options.editor.groupId,
          editor_artifact_id: options.editor.artifactId
        };
      };

      EmailTemplateContainer.prototype.load = function (creativeId) {
        var root = Restangular.one('email_templates', creativeId);

        var creativeResourceP = root.get();

        var propertiesP = root.getList('renderer_properties');

        var self = this;
        self.properties = [];
        var deferred = $q.defer();

        $q.all([creativeResourceP, propertiesP]).then(function (result) {
          self.value = result[0];
          self.id = self.value.id;
          var properties = result[1];

          if (properties.length > 0) {
            for (var i = 0; i < properties.length; i++) {
              // load the property container
              var propertyCtn = new PropertyContainer(properties[i]);
              self.properties.push(propertyCtn);
            }
            deferred.resolve(self);
          } else {
            // return the loaded container
            deferred.resolve(self);
          }
        }, function (reason) {
          deferred.reject(reason);
        });

        // return the promise
        return deferred.promise;
      };

      EmailTemplateContainer.prototype.addProperty = function addProperty(property) {
        this.properties.push(new PropertyContainer(property));
      };

      EmailTemplateContainer.prototype.persist = function persist() {
        return Restangular.all('email_templates').post(this.value);
      };

      EmailTemplateContainer.prototype.update = function update() {
        var deferred = $q.defer();
        var self = this;

        this.value.put().then(function (result) {

          var propertyTasks = _.map(self.properties, function(p){
            return saveOrUpdatePropertyTask(p, self.value.id);
          });

          var pList = [];
          pList = pList.concat(propertyTasks);

          async.series(pList, function (err, res) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(self);
            }
          });
          return deferred.promise;
        }, function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      return EmailTemplateContainer;
    }
  ]);
});
