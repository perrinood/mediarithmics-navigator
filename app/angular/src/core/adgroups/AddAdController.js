define(['./module'], function (module) {
  'use strict';

  module.controller('core/adgroups/AddAdController', [
    '$scope', '$uibModalInstance', 'lodash', 'core/common/IabService', 'core/common/auth/Session',
    function ($scope, $uibModalInstance, _, IabService, Session) {
      $scope.ad = {};
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      IabService.getAdSizes("DISPLAY_AD", $scope.organisationId).then(function(formats) {
        $scope.iabAdSizes = formats;
      });

      $scope.done = function () {
        $uibModalInstance.close($scope.ad);
      };

      $scope.canSave = function() {
        return $scope.ad.technical_name && $scope.ad.name && $scope.ad.format;
      };

      $scope.cancel = function () {
        $uibModalInstance.close();
      };
    }
  ]);
});

