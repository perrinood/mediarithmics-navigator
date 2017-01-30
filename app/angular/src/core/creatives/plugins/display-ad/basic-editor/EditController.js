define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/display-ad/basic-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/creatives/plugins/display-ad/DisplayAdService', 'core/common/auth/Session',
    'core/creatives/CreativePluginService', '$controller', "core/common/ErrorService", '$state', 'core/common/IabService', 'lodash',
    function ($scope, $log, $location, $stateParams, DisplayAdService, Session, CreativePluginService, $controller, errorService, $state, IabService, _) {

      $scope.$on("display-ad:loaded", function () {
        $scope.iabAdSizes = _.map(IabService.getAdSizes($scope.displayAd.subtype), function (size) {
          return size.format;
        });
      });

      $controller('core/creatives/plugins/display-ad/common/CommonEditController', {$scope: $scope});

      $scope.$on("display-ad:loaded", function () {
        // The parent controller has loaded the creative, you can use it now (check DisplayAdService)
        $log.info("display-ad:loaded");
      });
      $scope.$watch('properties', function (properties) {

        var destinationUrlProperty = _.find(properties, function (property) {
          return property.value.technical_name === 'destination_url' || property.value.technical_name === 'click_url';
        });
        if (destinationUrlProperty) {
          $scope.destinationUrlProperty = destinationUrlProperty.value;
        }
        var pixelTagProperty = _.find(properties, function (property) {
          return property.value.technical_name === 'tag';
        });
        if (pixelTagProperty) {
          $scope.pixelTagProperty = pixelTagProperty.value;
        }
      });

      $scope.save = function (disabledEdition) {
        $log.debug("save display ad : ", $scope.display_ad);
        if (disabledEdition) {
          $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
        } else {
          DisplayAdService.save().then(function () {
            $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
          }, function failure(response) {
            errorService.showErrorModal({
              error: response
            });
          });
        }
      };

      $scope.saveAndRefresh = function () {
        $log.debug("save display ad : ", $scope.display_ad);
        DisplayAdService.save().then(function (displayAdContainer) {
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

      $scope.cancel = function () {
        DisplayAdService.reset();
        $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
      };
    }
  ]);
});
