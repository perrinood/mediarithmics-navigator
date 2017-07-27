define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/display-ad/facebook/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', "core/creatives/plugins/display-ad/DisplayAdService", '$q',
    function ($scope, $location, Session, CreativePluginService, $log, DisplayAdService, $q) {

      $scope.wrapper = {
        name: "",
        artifactId: ""
      };

      CreativePluginService.getCreativeTemplateFromEditor("display-ad", "basic-editor").then(function (template) {
        $scope.creativeTemplate = template;
      });

      function createCreative(name, artifactId) {
        var subtype = (artifactId === "facebook-right-hand-side") ? 'FACEBOOK_RIGHT_HAND_SIDE' : 'FACEBOOK_NEWS_FEED';
        var options = {
          renderer: {
            groupId: "com.mediarithmics.creative.display",
            artifactId: artifactId
          },
          editor: {
            groupId: "com.mediarithmics.creative.display",
            artifactId: "default-editor"
          },
          subtype: subtype
        };
        var creativeContainer = DisplayAdService.initCreateDisplayAd(options);
        creativeContainer.value.name = name;
        return creativeContainer.persist();
      }

      $scope.done = function () {
        var name = $scope.wrapper.name;
        var artifactId = $scope.wrapper.artifactId;

        if (!name || !artifactId) {
          $log.warn("Missing name or artifactId: ", name, artifactId, $scope);
          return;
        }

        createCreative(name, artifactId).then(function () {
          $location.path(Session.getWorkspacePrefixUrl() + "/creatives/display-ad");
        });
      };

      $scope.doneAndEdit = function () {
        var name = $scope.wrapper.name;
        var artifactId = $scope.wrapper.artifactId;

        if (!name || !artifactId) {
          $log.warn("Missing name or artifactId: ", name, artifactId, $scope);
          return;
        }

        var promises = [
          CreativePluginService.getEditor("com.mediarithmics.creative.display", "default-editor"),
          createCreative(name, artifactId)
        ];

        $q.all(promises).then(function (results) {
          var editor = results[0];
          var creative = results[1];
          var url = editor.getEditPath(creative);
          $location.path(url);
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/creatives/display-ad");
      };

    }
  ]);
});
