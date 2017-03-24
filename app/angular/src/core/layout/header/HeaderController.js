define(['./module'], function (module) {
  'use strict';

  /* Searches for the right navbar */
  module.controller('HeaderController', [
    '$scope', '$state', '$stateParams', '$log',
    function ($scope, $state) {
      $scope.findNavbar = function () {
        if (!$state.current.data || !$state.current.data.navbar) {
          return 'angular/src/core/layout/header/navbar/navigator-navbar/navigator-navbar.html';
        }
        return $state.current.data.navbar;
      };
    }
  ]);
});


