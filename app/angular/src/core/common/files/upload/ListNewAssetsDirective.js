define(['./module'], function (module) {
  'use strict';

  module.directive('micsListNewAssets', ['$log',
    function ($log) {
      return {
        scope: {
          assets: "=",
          showDelete: "="
        },
        templateUrl: 'angular/src/core/common/files/upload/list-new-assets.html',
        link: function (scope, elem, attrs) {
          scope.delete = function (asset) {
            var idx = scope.assets.indexOf(asset);
            if (idx === -1) {
              $log.warn("micsListNewAssets: Trying to delete an unknown asset", asset);
              return;
            }
            scope.assets.splice(idx, 1);
          };
        }
      };
    }
  ]);
});

