define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/common/auth/Session', 'core/creatives/CreativePluginService',
    'Restangular', '$uibModal','core/common/WaitingService','core/common/ErrorService',
    'core/creatives/plugins/email-template/EmailTemplateService', 'core/common/properties/RendererPluginInstanceContainer','lodash',
    function ($scope, $log, $location, $stateParams, Session, CreativePluginService, Restangular, $uibModal, WaitingService, ErrorService, EmailTemplateService, RendererPluginInstanceContainer, _) {

      function writeToIfrm(ifrm,content){
        ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
        ifrm.document.open();
        ifrm.document.write(content);
        ifrm.document.close();
      }

      function loadPreview(creativeId){
        var rawResponseRestangular = Restangular.withConfig(function(RestangularConfigurer) {
          RestangularConfigurer.setResponseExtractor(function(data, operation, what, url, response, deferred) {
            return response.data;
          });
        });
        rawResponseRestangular.one('email_templates', creativeId).one('preview').get()
        .then(function(emailRenderResponse){
          $scope.emailRenderResponse = emailRenderResponse;

          var ifrmHtml = document.getElementById('email-preview-html');
          writeToIfrm(ifrmHtml, emailRenderResponse.content ? emailRenderResponse.content.html : "");

          var ifrmText = document.getElementById('email-preview-text');
          writeToIfrm(ifrmText, emailRenderResponse.content ? emailRenderResponse.content.text : "");

        }, function error(reason){
          var ifrmError = document.getElementById('email-preview-error');
          if (reason.data && reason.data.error_id){
            writeToIfrm(ifrmError, "error_id:"+reason.data.error_id);
          }else{
            writeToIfrm(ifrmError, reason.data);
          }
        });

      }

      var endpoint = Restangular.all('email_templates');

      $scope.organisationId = $stateParams.organisation_id;
      $scope.emailTemplateCtn = new RendererPluginInstanceContainer({}, endpoint);
      $scope.emailTemplateCtn.load($stateParams.creative_id).then(function(result){
          loadPreview($stateParams.creative_id);
      });

      //TODO uncomment when logo is ready
      // CreativePluginService.getCreativeTemplateFromEditor("com.mediarithmics.template.email", "basic-editor").then(function (template) {
        // $scope.creativeTemplate = template;
      // });

      $scope.addProperty = function () {
          var newScope = $scope.$new(true);
          $uibModal.open({
              templateUrl: 'src/core/common/properties/create-property.html',
              scope: newScope,
              backdrop: 'static',
              controller: 'core/common/properties/CreatePropertyController'
          }).result.then(function ok(property){
            $scope.emailTemplateCtn.createProperty(property.technical_name, property.property_type, property.value);
          });
      };

      $scope.save = function () {
        WaitingService.showWaitingModal();
        var promise = $scope.emailTemplateCtn.save();

        promise.then(function success(){
          WaitingService.hideWaitingModal();
          $location.path(Session.getWorkspacePrefixUrl() + '/creatives/email-template');
        }, function failure(reason){
          WaitingService.hideWaitingModal();
          ErrorService.showErrorModal({
            error: reason
          });
        });
      };

      $scope.saveAndRefresh = function () {
        WaitingService.showWaitingModal();
        var promise = $scope.emailTemplateCtn.save();

        promise.then(function success(){
          WaitingService.hideWaitingModal();
          loadPreview($stateParams.creative_id);
        }, function failure(reason){
          WaitingService.hideWaitingModal();
          ErrorService.showErrorModal({
            error: reason
          });
        });
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + '/creatives/email-template');
      };

      $scope.refreshPreview = function() {
        loadPreview($stateParams.creative_id);
      };

      $scope.getRendererLabel = function(groupId, artifactId) {
        return EmailTemplateService.getRendererLabel(groupId, artifactId);
      };

    }
  ]);
});
