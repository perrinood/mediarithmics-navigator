define(['./module'], function (module) {
  'use strict';

  module.controller('core/adgroups/AddAdController', [
    '$scope', '$uibModalInstance', 'lodash', 'core/common/IabService',
    function ($scope, $uibModalInstance, _, IabService) {
      $scope.ad = {};

      $scope.iabAdSizes = _.map(IabService.getAdSizes("BANNER"), function (size) {
        return size.format;
      });

      $scope.done = function () {
        $scope.$broadcast("display-ad/basic-editor:save");
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

