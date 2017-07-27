define(['./module', "plupload"], function (module) {
  'use strict';

  module.directive('mcsUploadAsset', [
    '$log', 'core/configuration', 'core/common/auth/Session', 'core/common/auth/AuthenticationService', "$uibModal", "core/common/ErrorService",
    function ($log, configuration, Session, AuthenticationService, $uibModal, ErrorService) {
      return {
        restrict: 'E',
        scope: {
          title: "=",
          uploadOptions: "=",
          pluploadOptions: "="
        },
        template: '<button class="browse-button mics-btn mics-btn-add"><span ng-click="start()">Upload Assets</span></button>',
        link: function (scope, element, attributes) {
          scope.start = function() {
            $uibModal.open({
              templateUrl: 'angular/src/core/common/files/upload/upload-asset.html',
              scope: scope,
              backdrop: 'static',
              controller: 'core/common/files/upload/UploadAssetController',
              size: 'lg',
              resolve: {
                uploadOptions: function() {
                  return scope.uploadOptions;
                },
                pluploadOptions: function() {
                  return scope.pluploadOptions;
                }
              }
            });
          };
        }
      };
    }
  ]);
});
