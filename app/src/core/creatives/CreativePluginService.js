define(['./module'], function (module) {
  'use strict';

  function CreativeEditor(editor, Session) {
    this.modal_mode = editor.modal_mode;
    this.modal_template = editor.modal_template;
    this.modal_controller = editor.modal_controller;
    this.edit_path = editor.edit_path;
    this.create_path = editor.create_path;
    this.Session = Session;
  }

  CreativeEditor.prototype.getEditPath = function(creative) {
    return this.edit_path.replace(/{id}/g, creative.id).replace(/{organisation_id}/, creative.organisation_id).replace(/{datamart_id}/, this.Session.getCurrentWorkspace().datamart_id);
  };

  CreativeEditor.prototype.getCreatePath = function() {
    return this.create_path.replace(/{id}/g, "").replace(/{organisation_id}/, this.Session.getCurrentWorkspace().organisation_id).replace(/{datamart_id}/, this.Session.getCurrentWorkspace().datamart_id);
  };

  function CreativeTemplate(template, Session){
    this.name = template.name;
    this.editor_group_id = template.editor_group_id;
    this.editor_artifact_id = template.editor_artifact_id;
    this.image = template.image;
    this.editor= new CreativeEditor(template.editor, Session);
    this.creative_type = template.creative_type;

  }

  module.factory('core/creatives/CreativePluginService', [
    '$log', '$q', 'lodash','core/common/auth/Session',
    function ($log, $q, _, Session) {

      var creativeTemplates = [new CreativeTemplate({
        creative_type: "DISPLAY_AD",
        name: "Banner Quick Upload",
        editor_group_id: "com.mediarithmics.creative.display",
        editor_artifact_id: "basic-editor",
        image: "/images/plugins/creative-mcs-basic.png",
        editor: {
          modal_mode: true,
          modal_template: "src/core/creatives/plugins/display-ad/basic-editor/upload-creative.html",
          modal_controller: "core/creatives/plugins/display-ad/basic-editor/UploadCreativeController",
          edit_path: "/{organisation_id}/creatives/display-ad/basic-editor/edit/{id}"
        }
      }, Session), new CreativeTemplate({
        creative_type: "DISPLAY_AD",
        name: "Banner Expert Mode",
        editor_group_id: "com.mediarithmics.creative.display",
        editor_artifact_id: "default-editor",
        image: "/images/plugins/creative-mcs-default.png",
        editor: {
          create_path: "/{organisation_id}/creatives/display-ad/default-editor/create",
          edit_path: "/{organisation_id}/creatives/display-ad/default-editor/edit/{id}"
        }
      }, Session), new CreativeTemplate({
        creative_type: "VIDEO_AD",
        name: "Video Mode",
        editor_group_id: "com.mediarithmics.creative.video",
        editor_artifact_id: "default-editor",
        image: "/images/plugins/creative-mcs-video.png",
        editor: {
          create_path: "/{organisation_id}/creatives/video-ad/default-editor/create",
          edit_path: "/{organisation_id}/creatives/video-ad/default-editor/edit/{id}"
        }
      }, Session), new CreativeTemplate({
        creative_type: "EMAIL_TEMPLATE",
        name: "Email Template",
        editor_group_id: "com.mediarithmics.template.email",
        editor_artifact_id: "default-editor",
        image: "/images/plugins/creative-mcs-basic.png",
        editor: {
          create_path: "/{organisation_id}/creatives/email-template/default-editor/create",
          edit_path: "/{organisation_id}/creatives/email-template/default-editor/edit/{id}"
        }
      }, Session)
        // UNCOMMENT TO ADD THE FACEBOOK AD EDITOR
        //  , new CreativeTemplate({
        //  name : "Facebook Expert Mode",
        //  editor_group_id : "com.mediarithmics.creative.display",
        //  editor_artifact_id : "default-editor",
        //  image : "/images/plugins/creative-mcs-facebook.png",
        //  editor : {
        //    create_path : "/{organisation_id}/creatives/display-ad/facebook/create",
        //    edit_path : "/{organisation_id}/creatives/display-ad/default-editor/edit/{id}"
        //  }
        //}, Session)
      ];

      function CreativePluginService() {
      }

      CreativePluginService.prototype = {

        /**
         * Get all the creative templates, asynchronously.
         * @return {$q.promise} the promise with the templates.
         */
        getAllCreativeTemplates: function (creativeType) {
          var deferred = $q.defer();

          setTimeout(function () {
            var result;
            if (creativeType){
              result = creativeTemplates.filter(function(elm){
                return elm.creative_type === creativeType;
              });
            } else {
              result = creativeTemplates;
            }
            deferred.resolve(result);
          }, 0);

          return deferred.promise;
        },

        /**
         * Get the creative template for a given editor group/artifact id.
         * @param {String} editorGroupId the group id of the editor.
         * @param {String} editorArtifactId the artifact id of the editor.
         * @return {$q.promise} the promise with the template.
         */
        getCreativeTemplateFromEditor: function (editorGroupId, editorArtifactId) {
          var deferred = $q.defer();
          this.getAllCreativeTemplates().then(function success(templates) {
            var matchingTemplate = _.find(templates, function (template) {
              return template.editor_group_id === editorGroupId && template.editor_artifact_id === editorArtifactId;
            });
            if (matchingTemplate) {
              deferred.resolve(matchingTemplate);
            } else {
              deferred.reject(new Error("can't find a template for " + editorGroupId + ":" + editorArtifactId));
            }
          });
          return deferred.promise;
        },

        /**
         * Get the creative editor for a given group/artifact id.
         * @param {String} editorGroupId the group id of the template.
         * @param {String} editorArtifactId the artifact id of the template.
         * @return {$q.promise} the promise with the editor.
         */
        getEditor: function (editorGroupId, editorArtifactId) {
          var deferred = $q.defer();

          this.getCreativeTemplateFromEditor(editorGroupId, editorArtifactId).then(
            function success(template) {
              deferred.resolve(template.editor);
            }, deferred.reject
          );
          return deferred.promise;
        }
      };

      return new CreativePluginService();
    }
  ]);
});
