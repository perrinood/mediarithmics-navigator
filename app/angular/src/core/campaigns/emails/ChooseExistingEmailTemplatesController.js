define(['./module'], function (module) {
  'use strict';

  module.controller('core/campaigns/emails/ChooseExistingEmailTemplatesController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', 'Restangular', 'core/common/auth/Session', 'core/common/ads/AdService', 'lodash',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, AdService, _) {
      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      Restangular.all("creatives").getList({
        max_results : 200,
        creative_type : 'EMAIL_TEMPLATE',
        archived : false,
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).then(function(result){
        $scope.emailTemplates = result;

        if ($scope.selectedTemplate){
          var selected = _.find($scope.emailTemplates, function(t){
            return t.id === $scope.selectedTemplate.email_template_id;
          });
          $scope.selected = {template:selected};
        }else{
          $scope.selected = {};
        }

      });

      $scope.done = function () {
        if ($scope.selected.template){
          $scope.$emit("mics-email-template:selected", {
            template: $scope.selected.template
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };

    }
  ]);
});
