define(['./module'], function (module) {
  'use strict';

  /*
   * Asset Property
   *
   * Asset file upload controller
   *   
   */

  module.controller('core/common/properties/AssetUploadController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session', 'core/configuration',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session, configuration) {

      $log.debug('Init AssetUploadController');

      // for the directive mics-pl-upload
      $scope.uploadedFiles = [];

      // for the page
      $scope.assetFiles = [];

      $scope.logAssetDeletion = function (elt) {
        $log.debug("deleted asset", elt);
      };

      $scope.$watchCollection("uploadedFiles", function (newFiles) {
        while(newFiles.length) {
          var file = newFiles.pop();
          $log.info("got new uploaded file, pushing as asset", file);
          $scope.assetFiles.push(file);
        }
      });

      $scope.pluploadOptions = {
        multi_selection: true,
        url : configuration.ADS_UPLOAD_URL + "?organisation_id=" + Session.getCurrentWorkspace().organisation_id,
        filters : {
          mime_types: [
            {title : "Image files", extensions : "jpg,jpeg,png,gif"},
            {title : "Flash files", extensions : "swf"}
          ],
          max_file_size: "200kb"
        }
      };


      $scope.done = function() {
        var assetValue = {};
        var file = $scope.assetFiles[0];
        assetValue.asset_id = file.id;
        assetValue.original_file_name = file.original_filename;

        $uibModalInstance.close(assetValue);
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

      $uibModalInstance.opened.then(function(){


      });



    }
  ]);
});

