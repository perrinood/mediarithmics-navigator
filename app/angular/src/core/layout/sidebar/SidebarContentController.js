define(['./module'], function (module) {
  'use strict';

  module.controller('SidebarContentController', [
    '$scope', '$state', '$log', 'core/common/auth/Session',
    function ($scope, $state, $log, Session) {
      

      if ($state.current.data && $state.current.data.sidebar) {
        $scope.subCategory = $state.current.data.sidebar.selected;
      }

      $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.data && toState.data.sidebar) {
          $scope.subCategory = toState.data.sidebar.selected;
        }
      });
    }
  ]);
});
