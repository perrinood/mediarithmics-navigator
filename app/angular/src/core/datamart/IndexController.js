define(['./module'], function (module) {

  'use strict';

  module.controller('core/datamart/IndexController', [
    '$scope', '$route', 'core/datamart/common/Common',
    function($scope, $route, Common) {
      $scope.locations = Common.locations;
    }
  ]);

});
