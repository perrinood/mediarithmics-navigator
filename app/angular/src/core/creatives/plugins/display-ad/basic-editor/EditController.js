define(['./module'], function (module) {
  'use strict';

  module.controller('core/creatives/plugins/display-ad/basic-editor/EditController', [
    '$scope', '$log', '$location', '$stateParams', 'core/creatives/plugins/display-ad/DisplayAdService', 'core/common/auth/Session',
    'core/creatives/CreativePluginService', '$controller', "core/common/ErrorService", '$state', 'core/common/IabService', 'lodash', 'Restangular',
    function ($scope, $log, $location, $stateParams, DisplayAdService, Session, CreativePluginService, $controller, errorService, $state, IabService, _, Restangular) {
      $scope.organisationId = Session.getCurrentWorkspace().organisation_id;

      $scope.$on("display-ad:loaded", function () {
        IabService.getAdSizes("DISPLAY_AD", $scope.organisationId).then((formats) => {
          $scope.iabAdSizes = formats;
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

      $scope.takeScreenshot = function (creativeId) {
        Restangular.one('creatives', creativeId).all('screenshots').post([], { organisation_id: $scope.organisationId }).then(function (response) {
          $log.debug("Screenshot was taken!" + response);
        });
      };

      $scope.save = function (disabledEdition) {
        $log.debug("save display ad : ", $scope.displayAd);
        if (disabledEdition) {
          if ($stateParams.creative_id !== undefined) {
            $scope.takeScreenshot($stateParams.creative_id);
          }
          $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
        } else {
          DisplayAdService.save().then(function (displayAdContainer) {
            $scope.takeScreenshot(displayAdContainer.id);
            $location.path(Session.getWorkspacePrefixUrl() + '/creatives/display-ad');
          }, function failure(response) {
            errorService.showErrorModal({
              error: response
            });
          });
        }
      };

      $scope.saveAndRefresh = function () {
        $log.debug("save display ad : ", $scope.displayAd);
        DisplayAdService.save().then(function (displayAdContainer) {
          $scope.takeScreenshot(displayAdContainer.id);
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
