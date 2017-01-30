/* global _ */
define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/video-ad/common/CommonEditController', [
    '$http', '$scope', '$sce', '$log', '$location', '$stateParams', 'core/creatives/plugins/video-ad/VideoAdService', 'core/common/auth/Session',
    'core/creatives/CreativePluginService', 'core/configuration', '$state',
    function ($http, $scope, $sce, $log, $location, $stateParams, VideoAdService, Session, CreativePluginService, configuration, $state) {
      var creativeId = $stateParams.creative_id;

      $scope.getRendererTitle = function (videoAd) {
        if (!videoAd) {
          return "";
        }
        return "Video";
      };

      $scope.doAction = function (action) {
        VideoAdService.makeAuditAction(action).then(function () {
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        });
      };

      CreativePluginService.getCreativeTemplateFromEditor("video-ad", "default-editor").then(function (template) {
        $scope.creativeTemplate = template;
      });

      VideoAdService.initEditVideoAd(creativeId).then(function () {
        $scope.videoAd = VideoAdService.getVideoAdValue();
        $scope.properties = VideoAdService.getProperties();
        $scope.vastUrl = VideoAdService.getAdServingUrl();
        $scope.audits = VideoAdService.getAudits();
        $scope.disabledEdition = $scope.videoAd.audit_status !== "NOT_AUDITED";
        $scope.previewUrl = configuration.ADS_PREVIEW_URL + "?ctx=PREVIEW&rid=" + $scope.videoAd.id + "&caid=preview";
        $log.debug("Ad serving preview url: ", $scope.previewUrl);
        if (!angular.isDefined($scope.vastUrl)) {
          return;
        }
        VideoAdService.parseVast($scope.vastUrl, function (config) {
          $scope.videoType = config.type;
          $scope.previewHeight = config.height;
          $scope.previewWidth = config.width;
          $scope.videoAd.format = config.width + "x" + config.height;
          $log.debug("Properties: ", $scope.properties[1].value.value);
          $scope.$emit("video-ad:loaded");
        });
      });

    }
  ]);
});

