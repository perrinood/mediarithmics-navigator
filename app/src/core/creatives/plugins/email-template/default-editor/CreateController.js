define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/CreateController', [
    '$scope', '$location', 'core/common/auth/Session', 'core/creatives/CreativePluginService', '$log', '$q',
    "Restangular", 'core/creatives/plugins/email-template/EmailTemplateService','core/common/properties/RendererPluginInstanceContainer',
    function ($scope, $location, Session, CreativePluginService, $log, $q, Restangular, EmailTemplateService, RendererPluginInstanceContainer) {

      $scope.wrapper = {
        emailTemplateName: "",
        selectedRenderer: null
      };

      //TODO uncomment when logo is ready
      // CreativePluginService.getCreativeTemplateFromEditor("com.mediarithmics.template.email", "basic-editor").then(function (template) {
        // $scope.creativeTemplate = template;
      // });

      Restangular.all('plugins').getList({plugin_type: "EMAIL_TEMPLATE_RENDERER"}).then(function(results){
        $scope.emailTemplateRenderers = _.filter(results, function(renderer) {
          return EmailTemplateService.getRendererLabel(renderer.group_id, renderer.artifact_id) != undefined;
        });
      });

      function createCreative(name, renderer) {
        var pluginInstance = {
          name: name,
          type: "EMAIL_TEMPLATE",
          organisation_id: Session.getCurrentWorkspace().organisation_id,
          renderer_group_id: renderer.group_id,
          renderer_artifact_id: renderer.artifact_id,
          editor_group_id: "com.mediarithmics.template.email",
          editor_artifact_id: "default-editor"
        };

        var endpoint = Restangular.all('email_templates');
        var creativeContainer = new RendererPluginInstanceContainer(pluginInstance, endpoint);

        return creativeContainer.save();
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
          var url = editor.getEditPath(creative.value);
          $location.path(url);
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/creatives/email-template");
      };

      $scope.getRendererLabel = function(renderer) {
        return EmailTemplateService.getRendererLabel(renderer.group_id, renderer.artifact_id);
      };

    }
  ]);
});
