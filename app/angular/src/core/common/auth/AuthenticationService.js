define(['./module'], function (module) {
  'use strict';

  /* define the Authentication service */
  module.factory('core/common/auth/AuthenticationService', [
    '$q', '$log', '$document', 'Restangular', "jquery",
    function($q, $log, $document, Restangular, $) {

      var tokenRefresherTimer = null;

      var service = {};
      service.pendingPath = null;

      /* access token */
      service.setAccessToken = function(accessToken, expiresIn) {
        // set the token for REST API calls
        $.cookie("access_token", accessToken);
        $.cookie("access_token_expiration_date", new Date().getTime() + expiresIn * 1000);
      };

      service.getAccessToken = function() {
        // get the access token in a cookie
        $log.debug("getAccessToken : ", $.cookie("access_token"));
        return $.cookie("access_token");
      };

      service.getAccessTokenExpirationDate = function () {
        var date = new Date(0);
        try {
          date = new Date(parseInt($.cookie("access_token_expiration_date")));
        } catch (e) {}

        return date;
      };

      service.resetAccessToken = function() {
        $.removeCookie("access_token");
      };

      service.hasAccessToken = function() {
        var accessToken = $.cookie("access_token");
        if (accessToken) {
          Restangular.setDefaultHeaders({Authorization: accessToken});
          return true;
        } else {
          return false;
        }
      };

      /* refresh token */
      service.setRefreshToken = function(refreshToken, expires) {
        // store the refresh token in a cookie
        $.cookie("refresh_token", refreshToken, {expires: expires});
        service.resetTokenRefresher();
        service.setupTokenRefresher();
      };

      service.getRefreshToken = function() {
        // get the refresh token in a cookie
        $log.debug("getRefreshToken : ", $.cookie("refresh_token"));
        return $.cookie("refresh_token");
      };

      service.resetRefreshToken = function() {
        $.removeCookie("refresh_token");
        this.resetTokenRefresher();
      };

      service.hasRefreshToken = function() {
        var refreshToken = $.cookie("refresh_token");
        return !!refreshToken;
      };

      service.setupTokenRefresher = function () {
        if (tokenRefresherTimer) {
          return;
        }

        var expirationDate = service.getAccessTokenExpirationDate();

        var waitTime = (expirationDate.getTime() - new Date().getTime()) || 10 * 1000;
        $log.info("The access token will expire at", expirationDate, "scheduling a refresh in " + waitTime + " ms.");
        tokenRefresherTimer = setTimeout(function () {
          $log.info("The access token will soon expire, refreshing.");
          service.createAccessToken();
        }, waitTime);
      };

      service.resetTokenRefresher = function () {
        if (tokenRefresherTimer) {
          $log.info("Reseting the token refresher.");
          clearTimeout(tokenRefresherTimer);
        }
        tokenRefresherTimer = null;
      };

      /* pending path */
      service.resetPendingPath = function() {
        this.pendingPath = null;
      };

      service.pushPendingPath = function(pendingPath) {
        $log.debug("Push pending path: ", pendingPath);
        this.pendingPath = pendingPath;
      };

      service.existingPendingPath = function() {
        return !!this.pendingPath;
      };

      service.popPendingPath = function() {
        $log.debug("Pop pending path: ", this.pendingPath);
        var result = this.pendingPath;
        this.pendingPath = null;
        return result;
      };



      /* returns a promise on access token creation */
      service.createAccessToken = function(email, password) {

        var post = {};
        var self = this;

        // prepare post object
        if (this.hasRefreshToken()) {
          post.refresh_token = this.getRefreshToken();

        } else if  ( email && password) {
          post.email = email;
          post.password = password;

        } else {
          return $q.reject("No available credentials");
        }

        var deferred = $q.defer();

        Restangular.all("authentication/access_tokens").post(post)
        .then(function (data) {
          // success
          var accessToken = data.access_token;
          self.setAccessToken(accessToken, data.expires_in);
          Restangular.setDefaultHeaders({Authorization: accessToken});

          var newRefreshToken = data.refresh_token;
          if (newRefreshToken) {

            // store the refresh token during 7 days
            self.setRefreshToken(newRefreshToken, 7);
          }
          deferred.resolve();
        },

        function () {
          // failure
          self.resetAccessToken();
          Restangular.setDefaultHeaders({});

          deferred.reject();
        });

        // return the promise
        return deferred.promise;
      };

      service.createRefreshToken = function (email, password) {

        var post = {email:email, password:password};

        var self = this;
        var deferred = $q.defer();

        Restangular.all("authentication/refresh_tokens").post(post)
        .then(function (data) {
          // success
          var refreshToken = data.refresh_token;

          // store refresh token during 7 days
          self.setRefreshToken(refreshToken, 7);

          deferred.resolve();

        },
        function() {
          // failure
          self.resetAccessToken();
          self.resetRefreshToken();
          self.resetTokenRefresher();
          Restangular.setDefaultHeaders({});

          deferred.reject();
        });

        return deferred.promise;

      };

      /**
       * Logout the user and reset the cookies.
       */
      service.logout = function () {
        $log.info("logout !");
        service.resetPendingPath();
        service.resetAccessToken();
        service.resetRefreshToken();
        service.resetTokenRefresher();
      };

      return service;

    }
  ]);

});

