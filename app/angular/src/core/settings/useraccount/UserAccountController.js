define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/UserAccountController', [
    '$scope', '$log', '$location', 'Restangular', 'core/common/auth/Session',
    function ($scope, $log, $location, Restangular, Session) {
      var userProfile = Session.getUserProfile();
      $scope.email = userProfile.email;
      $scope.firstName = userProfile.first_name;
      $scope.lastName = userProfile.last_name;
      $scope.workspaces = userProfile.workspaces;

      $scope.changePasswordRequest = function () {
        $location.path('/update-password');
      };


      if (localStorage.plugins) {
        $scope.plugins = JSON.parse(localStorage.plugins);

        $scope.plugins_updated = false;
        $scope.savePlugins = function() {
          $log.info("save plugins", $scope.plugins);
          $scope.plugins_updated = true;
          localStorage.plugins = JSON.stringify($scope.plugins);
        };
      }
    }
  ]);

});
