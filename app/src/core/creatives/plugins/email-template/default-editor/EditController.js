define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/email-template/default-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/creatives/plugins/email-template/EmailTemplateContainer', 'core/common/auth/Session', 'core/creatives/CreativePluginService',
    '$controller', "core/common/ErrorService", '$state', 'core/common/IabService', 'lodash', 'Restangular', '$uibModal','core/common/WaitingService','core/common/ErrorService',
    function ($scope, $log, $location, $stateParams, EmailTemplateContainer, Session, CreativePluginService, $controller, errorService, $state, IabService, _, Restangular, $uibModal, WaitingService, ErrorService) {

      $scope.organisationId = $stateParams.organisation_id;
      $scope.emailTemplateCtn = new EmailTemplateContainer();
      $scope.emailTemplateCtn.load($stateParams.creative_id);

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
          $location.path(Session.getWorkspacePrefixUrl() + '/creatives');
        }, function failure(reason){
          WaitingService.hideWaitingModal();
          ErrorService.showErrorModal({
            error: reason
          });
        });
      };

      $scope.saveAndRefresh = function () {

      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + '/creatives');
      };
    }
  ]);
});
