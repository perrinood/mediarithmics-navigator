(function(){

  'use strict';

  var module = angular.module('core/campaigns/keywords');

  module.controller('core/campaigns/keywords/Step2Controller', [
    "$scope",
    function ($scope) {

      // used by the included view
      // TODO : use events
      // $scope.keywordsList = $scope.campaign.keywordsLists[0];

      $scope.previous = function () {
        $scope.container.step = "step1";
      };

      $scope.next = function () {
        $scope.container.step = "step3";
      };
    }
  ]);
})();


