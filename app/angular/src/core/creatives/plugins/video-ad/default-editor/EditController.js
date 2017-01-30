define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/video-ad/default-editor/EditController', [
    '$scope', '$sce', '$log', '$location', '$stateParams', 'core/creatives/plugins/video-ad/VideoAdService', 'core/common/auth/Session',
    'core/creatives/CreativePluginService', '$controller', 'core/common/ErrorService', '$state', 'core/common/IabService', 'lodash',
    function ($scope, $sce, $log, $location, $stateParams, VideoAdService, Session, CreativePluginService, $controller, errorService, $state, IabService, _) {

      $controller('core/creatives/plugins/video-ad/common/CommonEditController', {$scope: $scope});

      $scope.trustResource = function (src) {
        $log.debug("src:", src);
        return $sce.trustAsResourceUrl(src);
      };

      $scope.$on("video-ad:loaded", function () {
        // The parent controller has loaded the creative, you can use it now (check VideoAdService)
        $log.info("video-ad:loaded");
        $scope.iabAdSizes = _.map(IabService.getAdSizes($scope.videoAd.subtype), function (size) {
          return size.format;
        });
      });

      $scope.propertiesFilter = function (property) {
        return property.value.technical_name === 'destination_url';
      };

      // Save button
      $scope.save = function (disabledEdition) {
        if (disabledEdition) {
          $location.path(Session.getWorkspacePrefixUrl() + '/creatives');
        } else {
          VideoAdService.save().then(function (videoAdContainer) {
            $location.path(Session.getWorkspacePrefixUrl() + '/creatives');
          }, function failure(response) {
            errorService.showErrorModal({
              error: response
            });
          });
        }
      };

      // Save button
      $scope.saveAndRefresh = function () {
        VideoAdService.save().then(function (videoAdContainer) {
          // $state.reload();
          // see https://github.com/angular-ui/ui-router/issues/582
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: true, notify: true
          });
        }, function failure(response) {
          errorService.showErrorModal({
            error: response
          });
        });
      };

      // back button
      $scope.cancel = function () {
        VideoAdService.reset();
        $location.path(Session.getWorkspacePrefixUrl() + '/creatives');
      };
    }
  ]);
});

