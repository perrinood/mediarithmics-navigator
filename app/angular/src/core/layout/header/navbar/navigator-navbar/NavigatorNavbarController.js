define(['./module'], function (module) {
  'use strict';

  module.controller('NavigatorNavbarController', [
    '$scope', '$log', 'core/common/auth/Session', 'core/login/constants', '$rootScope', 'core/configuration',
    function ($scope, $log, Session, LoginConstants, $rootScope, configuration) {
      $scope.getBrandLogo = function () {
        return configuration.ASSETS_URL + "/white_label/" + location.hostname + "/logo.png";
      };

      function isLogged() {
        $scope.isLogged = Session.isInitialized();
        $scope.user = Session.getUserProfile();
      }

      isLogged();

      $scope.switchWorkspace = function (workspace) {
        Session.setCurrentWorkspace(workspace);
      };

      function updateWorkspaces() {
        $log.debug("updateWorkspaces !");
        $scope.workspaces = Session.getWorkspaces();
        $scope.hasDatamart = Session.hasDatamart();
        $scope.organisationId = Session.getCurrentWorkspace().organisation_id;
        $scope.datamartId = Session.getCurrentDatamartId();
      }

      if (Session.isInitialized()) {
        updateWorkspaces();
      }
      $scope.$on(LoginConstants.LOGIN_SUCCESS, isLogged);
      $scope.$on(LoginConstants.WORKSPACE_CHANGED, updateWorkspaces);
      $scope.$on(LoginConstants.LOGIN_SUCCESS, updateWorkspaces);
      $scope.$on(LoginConstants.LOGIN_FAILURE, isLogged);
      $scope.$on(LoginConstants.LOGOUT, isLogged);
    }
  ]);
});


