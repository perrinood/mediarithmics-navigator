define(['./module'], function (module) {
  "use strict";

  module.factory('core/common/WarningService', [
    "$rootScope", "$uibModal",
    function ($rootScope, $uibModal) {
      var service = {};
      var warningModal = null;

      service.showWarningModal = function (message) {
        var scope = $rootScope.$new(true);

        scope.message = message;
        warningModal = $uibModal.open({
          scope: scope,
          templateUrl: 'angular/src/core/common/warning.html',
          controller: 'core/common/WarningController',
          backdrop: 'static',
          keyboard: false
        });

        return warningModal.result;
      };

      service.hideWarningModal = function () {
        if (warningModal) {
          warningModal.close();
          warningModal = null;
        }
      };

      return service;
    }
  ]);

});




