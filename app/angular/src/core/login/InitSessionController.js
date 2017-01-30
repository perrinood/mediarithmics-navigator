define(['./module'], function (module) {
  'use strict';

  module.controller('core/login/InitSessionController', [
    '$location', '$log', '$rootScope', 'core/common/auth/Session', 'core/common/auth/AuthenticationService', 'core/login/constants', '$stateParams',
    function ($location, $log, $rootScope, Session, AuthenticationService, LoginConstants, $stateParams) {
      Session.init($stateParams.organisationId).then(function () {
      if(!$stateParams.organisationId && !AuthenticationService.existingPendingPath()) {
        AuthenticationService.pushPendingPath(Session.getWorkspacePrefixUrl() + "/campaigns/display");
      }

        // Session init is successful

        // Set page title


        // broadcast login success event
        $rootScope.$broadcast(LoginConstants.LOGIN_SUCCESS);

        // Redirect to the pending path
        var path = AuthenticationService.popPendingPath();
        if(!path) {
          path = Session.getWorkspacePrefixUrl() + "/campaigns/display";
        }
        $log.debug("InitSessionController - Redirecting to :", path);
        $location.path(path.split(/\?/)[0]);

      }, function () {

        $rootScope.$broadcast(LoginConstants.LOGIN_FAILURE);
        // Failure: Go back to login page
        $location.path('login');
      });
    }
  ]);
});

