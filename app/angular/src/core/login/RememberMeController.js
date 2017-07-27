define(['./module', "autofill-event"], function (module) {
  'use strict';

  module.controller('core/login/RememberMeController', [
    '$location', '$log', 'core/common/auth/AuthenticationService',
    function($location, $log, AuthenticationService) {

      $log.debug("RememberMeController called !");

      AuthenticationService.createAccessToken().then(function () {
        // success  redirect to the pending path
        $location.path(AuthenticationService.popPendingPath());

      }, function() {
        // failure : redirect to the login page
        $location.path('/login');
      });
    }
  ]);

});

