define(['./module'], function (module) {
  'use strict';


  module.directive('fetchCampaign', [
    "Restangular", "$q", "$log",
    function (Restangular, $q, $log) {
      return {
        restrict: 'EA',
        controller: ["$scope", function ($scope) {
          this.setup = function (fetchCampaign) {
            var match = fetchCampaign.match(/^\s*(.+)\s+as\s+(.*?)\s*$/);
            var campaignIdExpr = match[1];
            var exposedVar = match[2];
            $scope.$watch(campaignIdExpr, function (newValue, oldValue, scope) {
              if (!newValue) {
                return;
              }
              Restangular.one("campaigns", newValue).get().then(function (campaign) {
                $scope[exposedVar] = campaign;
              });
            });
          };
        }
        ],
        link: function (scope, element, attrs, myCtrl) {
          myCtrl.setup(attrs.fetchCampaign);
        }
      };
    }
  ]);


});
