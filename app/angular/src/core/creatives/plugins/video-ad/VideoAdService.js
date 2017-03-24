define(['./module'], function (module) {
  'use strict';

  /**
   * VIDEO AD SERVICE
   */

  module.factory('core/creatives/plugins/video-ad/VideoAdService', [
    '$q', '$http', '$sce', 'Restangular', 'core/common/IdGenerator', 'core/creatives/plugins/video-ad/VideoAdContainer', '$log', 'core/common/auth/Session',
    function ($q, $http, $sce, Restangular, IdGenerator, VideoAdContainer, $log, Session) {
      var service = {};

      service.reset = function () {
        this.videoAdCtn = null;
      };

      service.getVideoAdValue = function () {
        $log.debug("> getVideoAdValue, ctn=", this.videoAdCtn);
        return this.videoAdCtn.value;
      };

      service.getProperties = function () {
        $log.debug("> getProperties, ctn=", this.videoAdCtn);
        return this.videoAdCtn.properties;
      };

      service.getAdServingUrl = function () {
        for (var i in this.videoAdCtn.properties) {
          if (this.videoAdCtn.properties[i].value.technical_name === "ad_serving_url") {
            return this.videoAdCtn.properties[i].value.value.url;
          }
        }
        return "Unknown";
      };

      service.getVastValues = function (vast) {
        var parsedXML = {};
        var xmlDoc;
        if (angular.isDefined(DOMParser)) {
          var parser = new DOMParser();
          xmlDoc = parser.parseFromString(vast, "text/xml");
        } else if (angular.isDefined(window.ActiveXObject)) {
          xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async = false;
          xmlDoc.loadXML(vast);
        }
        parsedXML.height = xmlDoc.getElementsByTagName("MediaFile")[0].getAttribute('height');
        parsedXML.width = xmlDoc.getElementsByTagName("MediaFile")[0].getAttribute('width');
        parsedXML.type = xmlDoc.getElementsByTagName("MediaFile")[0].getAttribute('type');
        return parsedXML;
      };

      service.parseVast = function (vastUrl, cb) {
        var self = this;
        $http.get(vastUrl).success(function (vast) {
          var vastProperties = self.getVastValues(vast);
          cb({
            type: vastProperties.type,
            width: vastProperties.width,
            height: vastProperties.height
          });
        });
      };

      service.getAudits = function () {
        return this.videoAdCtn.audits;
      };

      // initEditVideoAd : returns a promise on the video ad container
      service.initEditVideoAd = function (creativeId) {
        var ctn = new VideoAdContainer(null);
        this.videoAdCtn = ctn;
        return ctn.load(creativeId);
      };

      service.initCreateVideoAd = function (options) {
        var ctn = new VideoAdContainer(options);
        ctn.organisationId = Session.getCurrentWorkspace().organisation_id;
        return (this.videoAdCtn = ctn);
      };

      // Save the video ad
      service.save = function () {
        if (this.videoAdCtn.id.indexOf('T') === -1) {
          return this.videoAdCtn.update();
        } else {
          return this.videoAdCtn.persist();
        }
      };

      service.makeAuditAction = function (action) {
        return this.videoAdCtn.makeAuditAction(action);
      };

      return service;
    }
  ]);
});
