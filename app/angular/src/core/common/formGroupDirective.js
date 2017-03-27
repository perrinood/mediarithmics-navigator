define(['./module'], function (module) {
  'use strict';
  module.directive('mcsFormGroup', [
    function () {
      return {
        restrict: 'EA',
        transclude: true,
        scope: {
          labelText: "@",
          labelFor: '@',
          formGroupType: "@mcsFormGroup"
        },
        templateUrl: '/angular/src/core/common/formGroupDirective.html',
        replace: true
      };
    }
  ]);
});
