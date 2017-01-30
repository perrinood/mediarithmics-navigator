define(['./module'], function (module) {
  'use strict';

  module.directive('micsAssetThumbnail', [
    '$log', 'lodash', 'core/configuration',
    function ($log, _, configuration) {
      return {
        scope: {
          asset: '='
        },
        templateUrl: 'angular/src/core/adgroups/AssetThumbnail.html',
        link: function (scope, iElement, iAttrs) {
          scope.showPreview = function (asset) {
            if (asset.mime_type === "application/x-shockwave-flash") {
              return "images/flash/Adobe-swf_icon.png";
            } else {
              return configuration.ASSETS_URL + asset.file_path;
            }
          };
          scope.ASSETS_URL = configuration.ASSETS_URL;
        }
      };
    }
  ]);
});


