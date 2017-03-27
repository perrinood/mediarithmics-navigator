define(['./module', 'clipboard', 'jquery'], function (module, clipboard, $) {
  'use strict';

  module.controller('core/assets/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$state', '$stateParams', '$log', 'core/configuration', '$filter',
    function ($scope, Restangular, Session, $location, $state, $stateParams, $log, configuration, $filter) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.assetsUrl = configuration.ASSETS_URL;
      $scope.assets = [];
      $scope.adRenderers = [];
      $scope.adLayoutRendererVersions = [];
      $scope.listMode = true;

      $scope.pluploadOptions = {
        multi_selection: true,
        url: configuration.ADS_UPLOAD_URL + "?organisation_id=" + Session.getCurrentWorkspace().organisation_id,
        filters: {
          mime_types: [
            {title: "Image files", extensions: "jpg,jpeg,png,gif"},
            {title: "Flash files", extensions: "swf"}
          ],
          max_file_size: "200kb"
        }
      };

      $scope.uploadOptions = {
        files: $scope.assets,
        automaticUpload: false,
        filesOverride: false,
        uploadedFiles: []
      };

      // Pagination
      $scope.currentPageCreative = 1;
      $scope.itemsPerPage = 10;

      $scope.filteredAssets = function () {
        return $filter('filter')($scope.assets, $scope.assetName);
      };

      $scope.$watch('listMode', function(value) {
        if (value) {
          $scope.itemsPerPage = 10;
        } else {
          $scope.itemsPerPage = 50;
        }
      });

      Restangular.all("asset_files").getList({organisation_id: $scope.organisationId}).then(function (assets) {
        $scope.assets = assets;
      });

      $scope.printAssets = function() {
        $log.debug($scope.assets);
      };

      $scope.archive = function (assetId) {
        Restangular.one("asset_files", assetId).remove().then(function () {
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        });
      };

      $scope.$on('plupload:uploaded', function () {
        $state.transitionTo($state.current, $stateParams, {
          reload: true, inherit: true, notify: true
        });
      });
    }
  ]);
});