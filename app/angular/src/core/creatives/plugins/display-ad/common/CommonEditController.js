/* global _ */
define(['./module'], function (module) {
  'use strict';

  /**
   * Common controller
   */
  module.controller('core/creatives/plugins/display-ad/common/CommonEditController', [
    '$scope', '$sce', '$log', '$location', '$stateParams', 'core/creatives/plugins/display-ad/DisplayAdService', 'core/common/auth/Session', 'core/creatives/CreativePluginService', 'core/configuration', '$state',
    function ($scope, $sce, $log, $location, $stateParams, DisplayAdService, Session, CreativePluginService, configuration, $state) {
      var creativeId = $stateParams.creative_id;

      $scope.getRendererTitle = function (displayAd) {
        if (!displayAd) {
          return "";
        }
        switch (displayAd.renderer_group_id + "/" + displayAd.renderer_artifact_id) {
          case "com.mediarithmics.creative.display/image-script":
            return "Image Banner";
          case "com.mediarithmics.creative.display/image-iframe":
            return "Image Banner";
          case "com.mediarithmics.creative.display/flash-iframe":
            return "Flash Banner";
          default:
            return "";
        }
      };

      $scope.doAction = function (action) {
        DisplayAdService.makeAuditAction(action).then(function () {
          // $state.reload();
          // see https://github.com/angular-ui/ui-router/issues/582
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        });
      };

      CreativePluginService.getCreativeTemplateFromEditor("display-ad", "basic-editor").then(function (template) {
        $scope.creativeTemplate = template;
      });

      DisplayAdService.initEditDisplayAd(creativeId).then(function () {
        $scope.displayAd = DisplayAdService.getDisplayAdValue();
        $scope.properties = DisplayAdService.getProperties();
        $scope.audits = DisplayAdService.getAudits();
        $scope.disabledEdition = $scope.displayAd.audit_status !== "NOT_AUDITED";
        var tagType = "iframe";
        try {
          tagType = $scope.properties.find(function(prop){return prop.value.technical_name === "tag_type";}).value.value.value || "iframe";
        } catch(e){}

        if (tagType === "script") {
          $scope.previewUrl = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURI('<html><body style="margin-left: 0%; margin-right: 0%; margin-top: 0%; margin-bottom: 0%"><script type="text/javascript" src="https:' + configuration.ADS_PREVIEW_URL + '?ctx=PREVIEW&rid=' + $scope.displayAd.id + '&caid=preview' + '"></script></body></html>'));
        } else {
          $scope.previewUrl = $sce.trustAsResourceUrl(configuration.ADS_PREVIEW_URL + "?ctx=PREVIEW&rid=" + $scope.displayAd.id + "&caid=preview");
        }
        var sizes = $scope.displayAd.format.split("x");
        $scope.previewWidth = parseInt(sizes[0]);
        $scope.previewHeight = parseInt(sizes[1]);
        $scope.$emit("display-ad:loaded");
      });
    }
  ]);
});

