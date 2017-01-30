define(['./module'], function (module) {
  "use strict";

  module.config([
    "$stateProvider",
    function ($stateProvider) {
      $stateProvider
        .state('update-password', {
          url: '/update-password',
          templateUrl: 'angular/src/core/password/update-password.html'
        })
        .state('request-password-reset', {
          url: '/request-password-reset?error',
          templateUrl: 'angular/src/core/password/request-password-reset.html',
          publicUrl: true
        })
        .state('set-password', {
              url: '/set-password?email&token',
              templateUrl: 'angular/src/core/password/set-password.html',
              publicUrl: true
        })
        .state('email-sent', {
          url: '/email-sent',
          templateUrl: 'angular/src/core/password/email-sent.html',
          publicUrl: true
      });
    }
  ]);

});
