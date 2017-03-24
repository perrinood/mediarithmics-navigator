define(['./module'], function (module) {
  'use strict';

  /* Searches for the right sidebar */
  module.controller('SidebarController', [
    '$scope', '$state', '$stateParams', '$log', '$rootScope',
    function ($scope, $state, $rootScope) {

      $scope.isDisplayed = true;

      $scope.findSidebar = function () {
        if ($state.current.data && $state.current.data.sidebar) {
          return $state.current.data.sidebar.templateUrl;
        }
      };

      $scope.showHideSidebar = function () {
        $scope.isDisplayed = !$scope.isDisplayed;
        $scope.$emit('hideShowSidebar');
      };

    }
  ]);
});


