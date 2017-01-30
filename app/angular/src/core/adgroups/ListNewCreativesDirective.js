define(['./module'], function (module) {
  'use strict';

  module.directive('micsListNewCreatives', [
    '$log', 'lodash', 'core/configuration',
    function ($log, _, configuration) {
      return {
        // restrict: 'E',
        scope: {
          wrappers: '=',
          externalOnDelete: '=onDelete',
          showDelete: "="
        },
        templateUrl: 'angular/src/core/adgroups/ListNewCreatives.html',
        link: function (scope, iElement, iAttrs) {
          scope.showPreview = function (crea) {
            if (crea.mime_type === "application/x-shockwave-flash") {
              return "images/flash/Adobe-swf_icon.png";
            } else {
              return configuration.ASSETS_URL + crea.file_path;
            }
          };
          scope.ASSETS_URL = configuration.ASSETS_URL;
          scope.onDelete = function (eltToDelete) {
            var idx = scope.wrappers.indexOf(eltToDelete);
            if (idx === -1) {
              $log.warn("micsListCreatives: trying to delete an unknown elt", eltToDelete);
              return;
            }

            scope.wrappers.splice(idx, 1);

            if (scope.externalOnDelete) {
              scope.externalOnDelete.call(null, eltToDelete);
            }
          };
        }
      };
    }
  ]);
});

