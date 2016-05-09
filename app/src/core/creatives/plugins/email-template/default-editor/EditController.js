define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/creatives/plugins/email-template/EmailTemplateContainer', 'core/common/auth/Session', 'core/creatives/CreativePluginService',
    'Restangular', '$uibModal','core/common/WaitingService','core/common/ErrorService',
    'core/creatives/plugins/email-template/EmailTemplateService',
    function ($scope, $log, $location, $stateParams, EmailTemplateContainer, Session, CreativePluginService, Restangular, $uibModal, WaitingService, ErrorService, EmailTemplateService) {

      function loadPreview(creativeId){
        Restangular.one('email_templates', creativeId).one('preview').get()
        .then(function(emailRenderResponse){

          $scope.previewError = null;
          $scope.emailRenderResponse = emailRenderResponse;

          var ifrm = document.getElementById('email-preview-html');
          ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
          ifrm.document.open();
          ifrm.document.write(emailRenderResponse.content.html);
          ifrm.document.close();
        }, function error(reason){
          if (reason.data && reason.data.error_id){
            $scope.previewError = "Cannot load preview, errorId: " + reason.data.error_id;
          } else {
            $scope.previewError = "Cannot load preview";
          }
        });
      }

      $scope.organisationId = $stateParams.organisation_id;
      $scope.emailTemplateCtn = new EmailTemplateContainer();
      $scope.emailTemplateCtn.load($stateParams.creative_id).then(function(){
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
            $scope.emailTemplateCtn.addProperty(property);
          });
      };

      $scope.save = function () {
        WaitingService.showWaitingModal();
        var promise = $scope.emailTemplateCtn.update();

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
        var promise = $scope.emailTemplateCtn.update();

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
