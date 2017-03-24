define(['./module'], function (module) {
  'use strict';

  module.controller('core/common/files/upload/UploadAssetController', [
    '$scope', '$log', 'core/common/auth/Session', 'core/configuration', '$uibModalInstance', 'pluploadOptions', 'uploadOptions',
    function ($scope, $log, Session, configuration, $uibModalInstance, pluploadOptions, uploadOptions) {
      $scope.pluploadOptions = pluploadOptions;
      $scope.options = uploadOptions;

      $scope.done = function () {
        if ($scope.options.files.length) {
          $scope.$broadcast("plupload:upload", $scope.options.files);
        } else {
          $uibModalInstance.close();
        }
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss(false);
      };

      $scope.$on("plupload:uploaded", function () {
        $uibModalInstance.close(true);
      }, function () {
        $log.debug("Upload error");
      });
    }
  ]);
});