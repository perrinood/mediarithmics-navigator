define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/video-ad/default-editor/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', "core/creatives/plugins/video-ad/VideoAdService", '$q',
    function ($scope, $location, Session, CreativePluginService, $log, VideoAdService, $q) {

      $scope.wrapper = {
        name: ""
      };

      CreativePluginService.getCreativeTemplateFromEditor("com.mediarithmics.creative.video", "default-editor").then(function (template) {
        $scope.creativeTemplate = template;
      });

      function createCreative(name) {
        var options = {
          renderer: {
            groupId: "com.mediarithmics.creative.video",
            artifactId: "external-video-ad-renderer"
          },
          editor: {
            groupId: "com.mediarithmics.creative.video",
            artifactId: "default-editor"
          },
          subtype: "VIDEO"
        };
        var creativeContainer = VideoAdService.initCreateVideoAd(options);

        creativeContainer.value.name = name;
        return creativeContainer.persist();
      }

      $scope.done = function () {
        var name = $scope.wrapper.name;

        if (!name) {
          $log.warn("No name: ", name, $scope);
          return;
        }

        createCreative(name).then(function () {
          $location.path(Session.getWorkspacePrefixUrl() + "/creatives");
        });
      };

      $scope.doneAndEdit = function () {
        var name = $scope.wrapper.name;

        if (!name) {
          $log.warn("No name: ", name, $scope);
          return;
        }

        var promises = [
          CreativePluginService.getEditor("com.mediarithmics.creative.video", "default-editor"),
          createCreative(name)
        ];

        $q.all(promises).then(function (results) {
          var editor = results[0];
          var creative = results[1];
          var url = editor.getEditPath(creative);
          $location.path(url);
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/creatives");
      };
    }
  ]);
});
