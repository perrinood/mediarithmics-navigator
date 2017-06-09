/* global _ */
define(['./module'], function (module) {
  'use strict';

  /**
   * Common controller
   */
  module.controller('core/creatives/plugins/display-ad/common/CommonEditController', [
    '$scope', '$sce', '$log', '$location', '$stateParams', 'core/creatives/plugins/display-ad/DisplayAdService',
    'core/common/auth/Session', 'core/creatives/CreativePluginService', 'core/configuration', '$state', 'Restangular',
    function ($scope, $sce, $log, $location, $stateParams, DisplayAdService,
              Session, CreativePluginService, configuration, $state, Restangular) {
      const creativeId = $stateParams.creative_id;

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

      function retrieveFormat() {
        return Restangular.one('display_ads', $scope.displayAd.id).one('format').get().then(function (format) {
          $scope.previewWidth = parseInt(format.width);
          $scope.previewHeight = parseInt(format.height);
          $scope.displayAd.ad_format_id = format.id;
          $scope.displayAd.format = format.width + "x" + format.height;
        }, () => {
          $log.debug("Display ad has no format");
        });
      }

      DisplayAdService.initEditDisplayAd(creativeId)
        .then(() => {
          $scope.displayAd = DisplayAdService.getDisplayAdValue();
          $scope.properties = DisplayAdService.getProperties();
          $scope.audits = DisplayAdService.getAudits();
          $scope.disabledEdition = $scope.displayAd.audit_status !== "NOT_AUDITED";
          let tagType = "iframe";
          try {
            tagType = $scope.properties.find(function (prop) {return prop.value.technical_name === "tag_type";}).value.value.value || "iframe";
          } catch (e) {}

          if (tagType === "script") {
            $scope.previewUrl = $sce.trustAsResourceUrl('data:text/html;charset=utf-8,' + encodeURI('<html><body style="margin: 0;"><script type="text/javascript" src="https:' + configuration.ADS_PREVIEW_URL + '?ctx=PREVIEW&rid=' + $scope.displayAd.id + '&caid=preview' + '"></script></body></html>'));
          } else {
            $scope.previewUrl = $sce.trustAsResourceUrl(configuration.ADS_PREVIEW_URL + "?ctx=PREVIEW&rid=" + $scope.displayAd.id + "&caid=preview");
          }
        })
        .then(retrieveFormat)
        .then(() => {
          $scope.$emit("display-ad:loaded");
        });
    }
  ]);
});

