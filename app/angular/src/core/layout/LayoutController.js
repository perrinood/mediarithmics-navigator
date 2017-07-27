define(['./module'], function (module) {
  'use strict';

  /* Searches for the right sidebar */
  module.controller('LayoutController', [
    '$scope', '$state', '$stateParams', '$log', '$rootScope',
    function ($scope, $state, $rootScope) {

      $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.data && toState.data.sidebar) {
          $scope.showSidebar = true;
        } else {
          $scope.showSidebar = false;
        }
      });

      /*$scope.$on('hideShowSidebar', function (){
        $scope.showSidebar = !$scope.showSidebar;
      })*/

    }
  ]);
});


