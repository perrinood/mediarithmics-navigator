define(['./module'], function (module) {
  "use strict";

  module.factory('core/common/ErrorService', [
    "$uibModal", "$rootScope", "$log",
    function ($uibModal, $rootScope, $log) {
      var service = {};
      var errorModal = null;

      service.showErrorModal = function(options) {
        var scope = $rootScope.$new(true);

        options = options || {};
        scope.messageType = options.messageType || "full";

        if (options.error instanceof Error) {
          $log.error(options.error);
        } else if (options.error && options.error.data) {
          scope.errorId = options.error.data.error_id;
        } else if (options.error && options.error.message) {
          scope.message = options.error.message;
        }

        errorModal = $uibModal.open({
          scope: scope,
          templateUrl: 'angular/src/core/common/error.html',
          controller: 'core/common/ErrorController',
          backdrop : 'static',
          keyboard : false
        });

        return errorModal.result;
      };

      service.hideErrorModal = function() {
        if(errorModal) {
          errorModal.close();
          errorModal = null;
        }
      };

      return service;
    }
  ]);

});




