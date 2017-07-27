define(['./module'], function (module) {
  'use strict';

  module.controller('core/password/UpdatePasswordController', [
    '$scope', '$stateParams', '$location', '$log', 'core/common/auth/Session', 'Restangular',
    function ($scope, $stateParams, $location, $log, Session, Restangular) {
      $scope.oldPassword = "";
      $scope.newPassword = "";
      $scope.confirmPassword = "";

      $scope.submit = function () {
        if ($scope.newPassword.length < 4) {
          $scope.errorMessage = "Your new password is too short.";
        } else if ($scope.newPassword !== $scope.confirmPassword) {
          $scope.errorMessage = "Invalid password.";
        } else {
          $scope.infoMessage = "Changing password... Please wait.";
          Restangular.all("authentication/update_password").post({
            oldPassword: $scope.oldPassword,
            newPassword: $scope.newPassword
          }).then(function () {
            $scope.successMessage = "Your password was successfully changed.";
            $scope.infoMessage = undefined;
            $scope.errorMessage = undefined;
          }, function () {
            $scope.errorMessage = "You old password doesn't match.";
            $scope.infoMessage = undefined;
            $scope.successMessage = undefined;
          });
        }
      };

      $scope.goTo = function(path) {
        $location.path(path);
      };
    }
  ]);
});
