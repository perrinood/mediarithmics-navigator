define(['./module', "autofill-event"], function (module) {
  'use strict';

  module.controller('core/login/MainController', [
    '$scope', '$location', '$log', '$rootScope', '$window', 'jquery', 'core/common/auth/AuthenticationService', 'core/common/auth/Session', 'core/login/constants',
    function($scope, $location, $log, $rootScope, $window, $, AuthenticationService, Session, LoginConstants) {
      if (Session.isInitialized()) {
        $location.path(Session.getWorkspacePrefixUrl());
      }
      $scope.user = {email:"", password:""};

      $scope.rememberMe = true;

      setTimeout(function() {
        $("#loginEmail,#loginPassword").checkAndTriggerAutoFillEvent();
      } ,200);

      function showSimpleError() {
        $scope.authError = true;
        // failure : display an error message
        $scope.message = "Authentication error";
      }

      function initSession () {
        $scope.authError = false;
        Session.init().then(function() {

          // broadcast login success event
          var event = new Event(LoginConstants.LOGIN_SUCCESS);
          $window.dispatchEvent(event);
          $rootScope.$broadcast(LoginConstants.LOGIN_SUCCESS);

          var newPath = AuthenticationService.popPendingPath();
          if(!newPath) {
            newPath = Session.getWorkspacePrefixUrl();
          }
          $log.debug("Redirecting to : "+newPath);
          // success : redirect to the pending path
          $location.path(newPath);

        }, function () {
          $rootScope.$broadcast(LoginConstants.LOGIN_FAILURE);
          showSimpleError();
        });
      }

      $scope.resetPassword = function() {
        $location.path('request-password-reset');
      };

      $scope.submit = function() {
        if ($scope.rememberMe) {
          AuthenticationService.createRefreshToken($scope.user.email, $scope.user.password).then(function() {
            // Success : create an access token
            AuthenticationService.createAccessToken().then(initSession, showSimpleError);
          }, showSimpleError);
        } else {
          // Authentication without creation of refresh token
          AuthenticationService.createAccessToken($scope.user.email, $scope.user.password).then(function() {
            Session.init().then(initSession, showSimpleError);
          }, showSimpleError);
        }
      };
    }
  ]);
});

