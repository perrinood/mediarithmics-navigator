define(['./module'], function (module) {
  'use strict';

  module.factory('core/creatives/plugins/video-ad/VideoAdContainer', [
    '$q', 'Restangular', 'core/common/IdGenerator', 'async', 'core/creatives/plugins/video-ad/VideoAdPropertyContainer', '$log',
    function ($q, Restangular, IdGenerator, async, VideoAdPropertyContainer, $log) {

      var VideoAdContainer = function VideoAdContainer(options) {
        this.value = {};
        this.properties = [];

        if (!options) {
          return;
        }
        this.value = {
          name: "",
          type: "VIDEO_AD",
          subtype: options.subtype,
          format: "",
          organisation_id: "",
          renderer_group_id: options.renderer.groupId,
          renderer_artifact_id: options.renderer.artifactId,
          editor_group_id: options.editor.groupId,
          editor_artifact_id: options.editor.artifactId
        };
      };

      VideoAdContainer.prototype.load = function (creativeId) {
        var root = Restangular.one('video_ads', creativeId);
        // get the video ad
        var creativeResourceP = root.get();
        // get the properties
        var propertiesP = root.getList('renderer_properties');
        // get the audits
        var auditsP = root.getList('audits');
        var self = this;
        self.properties = [];
        var deferred = $q.defer();

        $q.all([creativeResourceP, propertiesP, auditsP]).then(function (result) {
          // set the video ad value
          self.value = result[0];
          self.id = self.value.id;
          var properties = result[1];
          // this is a read-only value, no need to use a wrapper
          self.audits = result[2];

          if (properties.length > 0) {
            for (var i = 0; i < properties.length; i++) {
              // load the property container
              var propertyCtn = new VideoAdPropertyContainer(properties[i]);
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

      VideoAdContainer.prototype.getOrCreatePropertyValueByTechnicalName = function getProperty(technicalName) {
        for (var i = 0; i < this.properties.length; i++) {
          if (this.properties[i].value.technical_name === technicalName) {
            return this.properties[i].value;
          }
        }
        var propContainer = new VideoAdPropertyContainer({
          "technical_name": technicalName,
          "value": {}
        });
        this.properties.push(propContainer);
        return propContainer.value;
      };

      VideoAdContainer.prototype.getProperty = function getProperty(id) {
        for (var i = 0; i < this.properties.length; i++) {
          if (this.properties[i].id === id) {
            return this.properties[i];
          }
        }
        return null;
      };

      VideoAdContainer.prototype.setProperty = function setProperty(id, value) {
        for (var i = 0; i < this.properties.length; i++) {
          if (this.properties[i].id === id) {
            this.properties[i].value.value.url = value;
          }
        }
        return null;
      };

      VideoAdContainer.prototype.getProperties = function getProperties() {
        return this.properties;
      };

      VideoAdContainer.prototype.persist = function persist() {
        var deferred = $q.defer();
        var self = this;
        this.value.organisation_id = this.organisationId;

        Restangular.all('video_ads').post(this.value).then(angular.bind(this, function (videoAd) {
          self.id = videoAd.id;
          var pArray = [];

          if (self.properties.length > 0) {
            for (var i = 0; i < this.properties.length; i++) {
              // persist the properties container
              pArray.push(this.properties[i].persist(self.id));
            }
            $q.all(pArray).then(function () {
              deferred.resolve(self);
            }, function (reason) {
              deferred.reject(reason);
            });
          } else {
            // return the loaded container
            deferred.resolve(self);
          }
        }), function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      VideoAdContainer.prototype.update = function update() {
        var deferred = $q.defer();
        var self = this;

        this.value.put().then(function (campaign) {
          var properties = self.properties;
          // update properties
          async.mapSeries(properties, function (property, callback) {
            // update the property
            property.update(self.id).then(function (result) {
              callback(null, result);
            }, function (reason) {
              callback(reason, null);
            });
          }, function (err, results) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(self);
            }
          });
        }, function (reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };

      VideoAdContainer.prototype.makeAuditAction = function makeAuditAction(action) {
        return Restangular
          .one('video_ads', this.id)
          .all("action")
          .customPOST({
            audit_action: action
          });
      };

      return VideoAdContainer;
    }
  ]);
});

