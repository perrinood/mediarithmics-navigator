define(['navigator-setup', 'angularAMD', 'lodash', 'async', 'jquery', 'plupload', 'd3', 'moment', 'clipboard', 'tracekit'],
  function (navigator, angularAMD, lodash, async, jquery, plupload, d3, moment, Clipboard, TraceKit) {
    "use strict";

    navigator.factory('lodash', [
      function () {
        return lodash;
      }
    ]);

    navigator.factory('async', [
      function () {
        return async;
      }
    ]);

    navigator.factory('jquery', [
      function () {
        return jquery;
      }
    ]);

    navigator.factory('plupload', [
      function () {
        return plupload;
      }
    ]);

    navigator.factory('d3', [
      function () {
        return d3;
      }
    ]);

    navigator.factory('moment', [
      function () {
        return moment;
      }
    ]);

    navigator.factory('tracekit', [
      function () {
        return TraceKit;
      }
    ]);

    // Load the brand css
    navigator.config(['core/configuration',
      function (configuration) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = configuration.ASSETS_URL + "/white_label/" + location.hostname + "/style.css";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
    ]);

    // Configure the application
    navigator.config(["$stateProvider", "$logProvider", "$urlRouterProvider",
      function ($stateProvider, $logProvider, $urlRouterProvider) {

        $stateProvider
          .state('404', {
            template: '<div>404 Not Found</div>'
          })
          .state('login', {
            url: '/login',
            templateUrl: 'angular/src/core/login/main.html',
            publicUrl: true
          })
          .state('logout', {
            url: '/logout',
            templateUrl: 'angular/src/core/login/logout.html',
            publicUrl: true
          })
          .state('remember-me', {
            url: '/remember-me',
            templateUrl: 'angular/src/core/login/remember-me.html',
            publicUrl: true
          })
          .state('init-session/withOrganisation', {
            url: '/init-session/:organisationId',
            templateUrl: 'angular/src/core/login/init-session.html',
            publicUrl: true
          })
          .state('init-session/withoutOrganisation', {
            url: '/init-session',
            templateUrl: 'angular/src/core/login/init-session.html',
            publicUrl: true
          });

//        $urlRouterProvider.when('', '/init-session');
//        $urlRouterProvider.when('/', '/init-session');
        $urlRouterProvider.when('/:organisationId/settings', '/:organisationId/settings/useraccount');
        $urlRouterProvider.when('/:organisationId', '/:organisationId/campaigns/display');
        $urlRouterProvider.when('/:organisationId/campaigns', '/:organisationId/campaigns/display');

        $urlRouterProvider.otherwise(function ($injector, $location) {
          var state = $injector.get('$state');
          state.go('404');
          return $location.path();
        });

        $logProvider.debugEnabled(true);

        // Setup clipboard copy utility
        new Clipboard('.mics-btn-clipboard');
      }
    ]);

    // Configure the Restangular Service
    navigator.config(['RestangularProvider', 'core/configuration',
      function (RestangularProvider, configuration) {
        // Set the api entry point
        RestangularProvider.setBaseUrl(configuration.WS_URL);
        RestangularProvider.addRequestInterceptor(function (element, operation, what, url) {
          if (operation === "put") {
            delete element.metadata;
          }
          return element;
        });
        // Configure the response extractor
        RestangularProvider.setResponseExtractor(function (response, operation, what, url) {
          // This is a get for a list
          var newResponse;
          if (operation === "getList") {
            // This is an array
            newResponse = response.data;
            // Add paging to metadata
            newResponse.metadata = {
              paging: {
                count: response.count,
                first_result: response.first_result,
                max_result: response.max_result
              }
            };
          } else {
            // This is an element
            newResponse = response.data;
          }
          return newResponse;
        });
      }
    ]);

    return navigator;
  });
