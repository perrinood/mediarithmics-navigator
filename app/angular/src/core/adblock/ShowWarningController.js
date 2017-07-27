define(['./module'], function (module) {
  'use strict';

  module.controller('core/adblock/ShowWarningController', [
    '$scope', '$resource', '$rootScope', '$http',
    function ($scope, $resource, $rootScope, $http) {
      $scope.messages = [];

      $rootScope.$on("global-message", function (evt, args) {
        $scope.$apply(function () {
          $scope.messages.push(args.message);
        });
      });

      var currentVersion = null;
      function checkVersion() {
        $http.get("./version.txt").then(function (response) {
          var newVersion = response.data;

          if (!newVersion || response.status !== 200) {
            return;
          }

          if(currentVersion && currentVersion !== newVersion) {
            $scope.messages.push("A new version of the application is available, you should reload this page.");
          }

          currentVersion = newVersion;

          setTimeout(checkVersion, 10 * 1000);

        } /* ignore errors for now */);
      }
      checkVersion();

      $resource("./angular/src/core/adblock/display-ads/beacon.html").get({}, function () {
      }, function () {
        $scope.messages.push("An ad blocker has been detected. This site display your ads and creatives and won't work as expected. You should disable it on this site.");
      });

      if (localStorage.plugins) {
        var plugins = JSON.parse(localStorage.plugins);
        for (var i = 0; i < plugins.length; ++i) {
          var plugin = plugins[i];
          if (!window.PLUGINS_CONFIGURATION[plugin.name] || window.PLUGINS_CONFIGURATION[plugin.name].loadFailed) {
            $scope.messages.push("The plugin \'" + plugin.name + "\' couldn't be loaded. Please check your configuration.");
          }
        }
      }

      $scope.closeWarning = function () {
        $scope.messages = [];
      };
    }
  ]);
});
