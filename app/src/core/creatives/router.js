define(['./module'], function () {
  'use strict';

  /* Services */
  var module = angular.module('core/creatives');


    module.config([
      "$stateProvider",
      function ($stateProvider) {
        $stateProvider


        // list creatives 
        .state('creatives', {
            url:'/{organisation_id}/creatives',
          templateUrl: 'src/core/creatives/list.html'
        })

        // create a new creative
        .state('creatives/select-creative-template', {
            url:'/{organisation_id}/creatives/select-creative-template',
          templateUrl: 'src/core/creatives/create.html',
          topbar : false
        });


    }
  ]);


});
