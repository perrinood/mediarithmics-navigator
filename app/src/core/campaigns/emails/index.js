(function(){

  'use strict';

  var module = angular.module('core/campaigns/emails', [
    'core/campaigns',
    'ui.bootstrap',
    'restangular'
  ]);

  module.config([
    "$routeProvider",
    function ($routeProvider) {
      $routeProvider
      .when('/campaigns/email/expert/:campaign_id?', {
        templateUrl: 'src/core/campaigns/emails/index.html',
        topbar : false
      });
    }
  ]);

})();

