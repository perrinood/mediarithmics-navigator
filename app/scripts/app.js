'use strict';

/*
 * Application Module 
 */

var navigatorApp = angular.module('navigatorApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'restangular',

  'plupload',
  'utilServices',
  'sessionServices',
  'loginControllers',
  'displayCampaignService',
  'displayCampaignControllers',
  'expertDisplayCampaignTemplate'
]);

// configure the application
navigatorApp.config(function ($routeProvider, $logProvider) {

    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html'        
      })
      .when('/remember-me', {
        templateUrl: 'views/remember-me.html'        
      })
      .when('/init-session', {
        templateUrl: 'views/init-session.html'        
      });

    $routeProvider
      .when('/display-campaigns', {
        templateUrl: 'views/display-campaigns/list.html'
      })
      .when('/display-campaigns/select-campaign-template', {
        templateUrl: 'views/display-campaigns/select-campaign-template.html'
      })
      .when('/display-campaigns/expert/edit-campaign/:campaign_id', {
        templateUrl:'views/display-campaigns/templates/expert/edit-campaign.html'
      })      
      .when('/display-campaigns/expert/edit-ad-group/:ad_group_id', {
        templateUrl:'views/display-campaigns/templates/expert/edit-ad-group.html'
      })            
      .when('/display-campaigns/edit-expert/:campaign_id', {
        templateUrl:'views/display-campaigns/templates/expert/edit-expert.html'
      })      
      .when('/display-ads', {
        templateUrl: 'views/display-ad-list.html'
      })
      .when('/home', {
        redirectTo: '/display-campaigns'
      })      
      .when('/route-not-found', {
        templateUrl: 'views/route-not-found.html'
      });

      /*
      .otherwise({
        redirectTo: '/route-not-found'
      });
    */
      $logProvider.debugEnabled(true);
      

  });


// configure the Restangular Service
navigatorApp.config(['RestangularProvider', function (RestangularProvider) {

  // set the api entry point
  RestangularProvider.setBaseUrl('http://127.0.0.1:9004/public/v1');

  // configure the response extractor
  RestangularProvider.setResponseExtractor(function(response, operation, what, url) {

      // This is a get for a list
      var newResponse;
      if (operation === "getList") {

        // this is an array  
        newResponse = response.data;
        // metadata ..                  
        // newResponse.metadata = response.data.meta;

      } else {

        // This is an element
        newResponse = response.data;

      }
      return newResponse;
    });  


}]);


navigatorApp.config(['$httpProvider', function ($httpProvider) {

  $httpProvider.interceptors.push(['$q', function ($q){

    return {
              'response' : function(response) {
                return response;
              },

              'responseError': function(rejection) {
                return rejection;

                /*

                if (rejection.status == 401) {                   

                  // check if the error is an AccesTokenCreationError or a RefreshTokenCreationError

                  // check if the AuthenticationService is already trying to reconnect

                  AuthenticationService.createAccessToken().then(function() {
                    // success
                    console.log("http interceptor : acces token renewed successfully");

                    // resend the queue requests

                  }, 
                  function() {
                    // failure : redirect to login page

                    // flush the queue requests

                    // redirect
                    $location.path('/login');                    
                  });


                }
             
              */
            }
          }
  }]);    
}]);


/* work to be performed after module loading */

// add an event listener on $routeChangeStart to restrict access to
// secured part of the app

navigatorApp.run(['$rootScope', '$location', 'AuthenticationService', 'Session', function ($rootScope, $location, AuthenticationService, Session) {


  // enumerate routes that don't need authentication
  var routesThatDontRequireAuth = ['/login', '/remember-me', '/init-session'];

  // check if current location requires authentication 
  var isSecured = function (route) {
    return !(_.find(routesThatDontRequireAuth,
      function (noAuthRoute) {
        // return true if route starts with noAuthRole
        return route.indexOf(noAuthRoute)==0;
      }));
  };


  $rootScope.$on('$routeChangeStart', function (event, next, current) {

    console.debug("$routeChangeStart  next : ", next);

    if ($location.url() == "/logout") {

      AuthenticationService.resetPendingPath();
      AuthenticationService.resetAccessToken();
      AuthenticationService.resetRefreshToken();
      $location.path('/login');

    } else if (isSecured($location.url())) {


      if (AuthenticationService.hasAccessToken()) {

        if (!Session.isInitialized()) {

          AuthenticationService.pushPendingPath($location.url());
          $location.path('/init-session');
        }
        

      } else if (AuthenticationService.hasRefreshToken()) {

        // keep the current path in memory
        AuthenticationService.pushPendingPath($location.url());

        // redirect to the remember-me page
        $location.path('/remember-me');

      } else {

        // redirect to login
        $location.path('/login');

      }
    }
  });
}]);
