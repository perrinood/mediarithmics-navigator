define(['./module'], function (module) {

  'use strict';

  module.controller('core/common/properties/CreatePropertyController', [
    '$scope', '$uibModalInstance', 'Restangular', '$location', 'core/common/auth/Session',

    function ($scope, $uibModalInstance, Restangular, $location, Session) {

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

      $scope.property = {
        technical_name: "",
        property_type: "STRING",
        value:{value:""},
        origin:"INSTANCE",
        writable:true,
        deletable:true
      };

      $scope.submit = function() {
        $uibModalInstance.close($scope.property);  
      };
    }
  ]);

});
