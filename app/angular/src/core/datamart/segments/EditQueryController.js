define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/segments/EditQueryController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {

      $scope.done = function() {
        $uibModalInstance.close($scope.queryContainer);
      };

      $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };

    }
  ]);
});
