define(['./module', "autofill-event"], function (module) {
  'use strict';

  module.controller('core/password/SetPasswordController', [
    '$scope', '$rootScope', '$location', '$stateParams', '$state', '$log', 'Restangular', 'core/common/auth/AuthenticationService', 'core/common/auth/Session', 'core/login/constants',
    function ($scope, $rootScope, $location, $stateParams, $state, $log, Restangular, AuthenticationService, Session, LoginConstants) {
      if (!angular.isDefined($stateParams.token) || !angular.isDefined($stateParams.email)) {
        $log.error("Invalid url arguments. Redirecting to password reset request page.");
        $location.path('request-password-reset');
      }
      $scope.newPassword = "";
      $scope.confirmPassword = "";

      function initSession() {
        Session.init().then(function () {

          $state.go('init-session/withoutOrganisation',{
            location: true, notify: true, reload: true
          });
        }, function () {

        });
      }

      function loginError() {
        $scope.errorMessage = "Error: Impossible to log in.";
        $location.path('request-password-reset').search({error: 1});
      }

      $scope.submit = function () {
        if ($scope.newPassword.length < 4) {
          $scope.errorMessage = "The chosen password is too short.";
        } else if ($scope.newPassword !== $scope.confirmPassword) {
          $scope.errorMessage = "Passwords do not match.";
        } else {
          $scope.infoMessage = "Setting up your new password... Please wait.";
          Restangular.all("authentication/set_password").post({
            email: $stateParams.email,
            token: $stateParams.token,
            password: $scope.newPassword
          }).then(function () {
            $scope.successMessage = "Your new password was successfully set.";
            $scope.errorMessage = undefined;
            $scope.infoMessage = undefined;
          }, function () {
            $scope.errorMessage = "We're sorry, we couldn't set up your new password.";
            $scope.successMessage = undefined;
            $scope.infoMessage = undefined;
          });
        }
      };

      $scope.login = function() {
        AuthenticationService.createRefreshToken($stateParams.email, $scope.newPassword).then(function () {
          AuthenticationService.createAccessToken().then(initSession, loginError);
        }, loginError);
      };

      $scope.goTo = function(path) {
        $location.path(path);
      };
    }
  ]);
});