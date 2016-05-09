define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', "core/creatives/plugins/email-template/EmailTemplateContainer", '$q',
    "Restangular", 'core/creatives/plugins/email-template/EmailTemplateService',
    function ($scope, $location, Session, CreativePluginService, $log, EmailTemplateContainer, $q, Restangular, EmailTemplateService) {

      $scope.wrapper = {
        emailTemplateName: "",
        selectedRenderer: null
      };

      //TODO uncomment when logo is ready
      // CreativePluginService.getCreativeTemplateFromEditor("com.mediarithmics.template.email", "basic-editor").then(function (template) {
        // $scope.creativeTemplate = template;
      // });

      Restangular.all('plugins').getList({plugin_type: "EMAIL_TEMPLATE_RENDERER"}).then(function(result){
        $scope.emailTemplateRenderers = result;
      });

      function createCreative(name, renderer) {
        var options = {
          renderer: {
            groupId: renderer.group_id,
            artifactId: renderer.artifact_id
          },
          editor: {
            groupId: "com.mediarithmics.template.email",
            artifactId: "default-editor"
          }
        };

        var creativeContainer = new EmailTemplateContainer(name, options);

        return creativeContainer.persist();
      }

      $scope.done = function () {
        var name = $scope.wrapper.emailTemplateName;
        var renderer = $scope.wrapper.selectedRenderer;

        if (!name || !renderer) {
          $log.warn("no name or renderer : ", name, renderer, $scope);
          return;
        }

        createCreative(name, renderer).then(function () {
          $location.path(Session.getWorkspacePrefixUrl() + "/creatives/email-template");
        });
      };

      $scope.doneAndEdit = function () {
        var name = $scope.wrapper.emailTemplateName;
        var renderer = $scope.wrapper.selectedRenderer;

        if (!name || !renderer) {
          $log.warn("no name or renderer : ", name, renderer, $scope);
          return;
        }

        var promises = [
          CreativePluginService.getEditor("com.mediarithmics.template.email", "default-editor"),
          createCreative(name, renderer)
        ];

        $q.all(promises).then(function (results) {
          var editor = results[0];
          var creative = results[1];
          var url = editor.getEditPath(creative);
          $location.path(url);
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/creatives/email-template");
      };

      var rendererLabels = {
          "com.mediarithmics.template.email.dynamic-template": "Dynamic template",
          "com.ividence.email-renderer":"Custom template"
      };

      $scope.getRendererLabel = function(renderer) {
        return EmailTemplateService.getRendererLabel(renderer.group_id, renderer.artifact_id);
      };

    }
  ]);
});
