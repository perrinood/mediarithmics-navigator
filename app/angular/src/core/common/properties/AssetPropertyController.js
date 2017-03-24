define(['./module'], function (module) {
  'use strict';

  /*
   * Asset Property Field controller
   *
   */

  module.controller('core/common/properties/AssetPropertyController', [
    '$scope', '$uibModal', '$log','core/configuration',

    function($scope, $uibModal, $log, configuration) {
      if( $scope.property.value.file_path){
        $scope.image =  configuration.ASSETS_URL + $scope.property.value.file_path;
      }

      // upload an asset
      $scope.uploadAsset = function() {

        $log.debug("open upload asset modal window ");

        // display pop-up
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/common/properties/asset-upload.html',
          scope : $scope,
          backdrop : 'static',
          controller: 'core/common/properties/AssetUploadController',
          size: "lg"
        });

        uploadModal.result.then(function (assetValue) {

          if (typeof(assetValue) !== "undefined") {
            $log.debug('asset upload result =', assetValue);
            $scope.property.value = assetValue;
          }

        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      $scope.toggleImage = false;
      // view file
      $scope.viewFile = function() {
        $log.debug("view file");
        $scope.toggleImage = !$scope.toggleImage;

      };

    }]);  

});
