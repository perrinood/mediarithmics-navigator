define(['./module', "autofill-event"], function (module) {
  'use strict';

  module.controller('core/password/RequestPasswordResetController', [
    '$scope', '$rootScope', '$location', '$stateParams', '$log', 'Restangular', 'core/login/constants',
    function ($scope, $rootScope, $location, $stateParams, $log, Restangular, LoginConstants) {
      $scope.email = "";

      if ($stateParams.error) {
        $scope.errorMessage = "Looks like that link has expired. Please enter your email below to start again.";
      }

      $scope.submit = function () {
        $scope.infoMessage = "Sending email...";
        Restangular.all("authentication/send_password_reset_email").post({email: $scope.email}).then(function () {
          $location.path('email-sent');
        }, function () {
          $rootScope.$broadcast(LoginConstants.LOGIN_FAILURE);
          $scope.errorMessage = "Please enter a valid registered email address.";
          $scope.infoMessage = undefined;
        });
      };
    }
  ]);
});