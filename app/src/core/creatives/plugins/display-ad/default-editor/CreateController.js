define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/display-ad/default-editor/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', "core/creatives/plugins/display-ad/DisplayAdService", '$q',
    function ($scope, $location, Session, CreativePluginService, $log, DisplayAdService, $q) {

      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.groupArtifacts = [
        {name: "Image file (.png, .jpg, .gif)", groupId: "com.mediarithmics.creative.display", artifactId: "image-iframe"},
        {name: "Image file (.png, .jpg, .gif), for skins", groupId: "com.mediarithmics.creative.display", artifactId: "image-script"},
        {name: "Flash file (.swf)", groupId: "com.mediarithmics.creative.display", artifactId: "flash-iframe"},
        {name: "Dynamic template", groupId: "com.mediarithmics.creative.display", artifactId: "dynamic-template"},
        {name: "External ad server", groupId: "com.mediarithmics.creative.display", artifactId: "external-display-ad-renderer"}
      ];
      // TODO handle multiple groups / artifacts renderers according to the organisation
      if ($scope.organisationId === "1051" || $scope.organisationId === "1042") {
        $scope.groupArtifacts.push({name: "Ividence template", groupId: "com.ividence", artifactId: "display-ad-renderer"});
      }
      $scope.wrapper = {
        groupArtifact: undefined,
        name: undefined
      };

      $scope.disabled = function() {
        return !!($scope.wrapper.groupArtifact === undefined || $scope.wrapper.name === undefined);
      };

      CreativePluginService.getCreativeTemplateFromEditor("com.mediarithmics.creative.display", "default-editor").then(function (template) {
        $scope.creativeTemplate = template;
      });

      function createCreative(name, groupId, artifactId) {
        var options = {
          renderer: {
            groupId: groupId,
            artifactId: artifactId
          },
          editor: {
            groupId: "com.mediarithmics.creative.display",
            artifactId: "default-editor"
          },
          subtype: "BANNER"
        };
        var creativeContainer = DisplayAdService.initCreateDisplayAd(options);

        creativeContainer.value.name = name;
        return creativeContainer.persist();
      }

      $scope.done = function () {
        var name = $scope.wrapper.name;
        var groupId = $scope.wrapper.groupArtifact.groupId;
        var artifactId = $scope.wrapper.groupArtifact.artifactId;

        if (!name || !artifactId || !groupId) {
          $log.warn("no name, artifactId or groupId: ", name, artifactId, groupId, $scope);
          return;
        }

        createCreative(name, groupId, artifactId).then(function () {
          $location.path(Session.getWorkspacePrefixUrl() + "/creatives/display-ad");
        });
      };

      $scope.doneAndEdit = function () {
        var name = $scope.wrapper.name;
        var groupId = $scope.wrapper.groupArtifact.groupId;
        var artifactId = $scope.wrapper.groupArtifact.artifactId;

        if (!name || !artifactId || !groupId) {
          $log.warn("no name, artifactId or groupId: ", name, artifactId, groupId, $scope);
          return;
        }

        var promises = [
          CreativePluginService.getEditor("com.mediarithmics.creative.display", "default-editor"),
          createCreative(name, groupId, artifactId)
        ];

        $q.all(promises).then(function (results) {
          var editor = results[0];
          var creative = results[1];
          var url = editor.getEditPath(creative.value);
          $location.path(url);
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/creatives/display-ad");
      };

    }
  ]);
});
