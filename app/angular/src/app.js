define(['app-setup', 'angularAMD', 'jquery'],
  function (app, angularAMD, jQuery) {
    'use strict';

    jQuery("#mics_loading").remove();

    app.run(['$rootScope', '$location', '$log', 'core/common/auth/AuthenticationService', 'core/common/auth/Session', "lodash", "core/login/constants", "core/common/ErrorReporting","$state","$stateParams", "$urlRouter",
      function ($rootScope, $location, $log, AuthenticationService, Session, _, LoginConstants, ErrorReporting, $state, $stateParams, $urlRouter ) {
        var defaults = _.partialRight(_.assign, function (a, b) {
          return typeof a === 'undefined' ? b : a;
        });

        ErrorReporting.setup();

        function updateWorkspaces() {
          $log.debug("app.js updateWorkspaces !", $state.current, $state.params);
          $rootScope.currentOrganisation = Session.getCurrentWorkspace().organisation_name;
          $rootScope.currentOrganisationId = Session.getCurrentWorkspace().organisation_id;
          var workspace = Session.getCurrentWorkspace();
          $rootScope.currentWorkspace =  workspace;
          $rootScope.currentWorkspaceId = "o" + workspace.organisation_id + "d" + workspace.datamart_id;
          var toStateParams = _.extend({} , $stateParams);
          toStateParams.organisation_id = $rootScope.currentWorkspaceId;
          $log.debug("redirect to new state", toStateParams);
          if($state.current.name.indexOf("init-session") === -1) {
            $state.go($state.current, toStateParams, {
              location: true, notify: true, reload: true
            });
          }
        }


        if (AuthenticationService.hasAccessToken()) {
          if (AuthenticationService.hasRefreshToken()) {
            AuthenticationService.setupTokenRefresher();
          }
          if (!Session.isInitialized()) {
            $log.debug("not initialized");
            AuthenticationService.pushPendingPath($location.url());
            $location.path('/init-session');
          }
        } else if (AuthenticationService.hasRefreshToken()) {
          $log.debug("has refresh token -> remember-me");
          // Keep the current path in memory
          AuthenticationService.pushPendingPath($location.url());
          // Redirect to the remember-me page
          $location.path('/remember-me');
        } else {
          var parsedStateFromUrl = _($state.get()).find(function(s) {
            // http://stackoverflow.com/questions/29892353/angular-ui-router-resolve-state-from-url/30926025#30926025

            if(s.$$state && s.$$state().url) {
              var urlAndQuery = $location.url().split("?");
              return !!s.$$state().url.exec(urlAndQuery[0], urlAndQuery[1]);
            } else {
              return false;
            }
          });
          $log.debug("parsed state from url : ", parsedStateFromUrl);
          if (!parsedStateFromUrl || !parsedStateFromUrl.publicUrl) {
            $log.debug("not a public url, go to login");
            AuthenticationService.pushPendingPath($location.url());
            // Redirect to login
            $location.path('/login');
          }
        }




        $rootScope.$on(LoginConstants.WORKSPACE_CHANGED, updateWorkspaces);




        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
          var options = defaults(toState, {
            publicUrl: false,
            topbar: true
          });

          if (toState.data && toState.data.category) {
            $rootScope.category = toState.data.category;
          } else {
            var urlMatch = toState.name.match(/\/?(\w+)\/?/);
            if (urlMatch) {
              $rootScope.category = urlMatch[1];
            }
          }

          $rootScope.topbar = options.topbar;


        });
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
          $log.debug("$stateChangeStart ", fromState.url, " : ", toState.url);
          $log.debug("$stateChangeStart ", fromParams, " : ", toParams);
          if (toState.publicUrl) {
            $log.debug("nothing to check, public url !");
          } else {
            if (!AuthenticationService.hasRefreshToken()) {
              if (toState.url !== 'login') {
                AuthenticationService.pushPendingPath($location.url());
              }
              // Redirect to login
              $location.path('/login');
            } else if (toParams.organisation_id !== fromParams.organisation_id && !!toParams.organisation_id) {
              var workspace = Session.getCurrentWorkspace();
              if (workspace && ("o" + workspace.organisation_id + "d" + workspace.datamart_id === toParams.organisation_id || workspace.organisation_id === toParams.organisation_id)) {
                $log.debug("done");
              } else if (toState.name !== 'logout') {
                $log.debug("prevent");
                event.preventDefault();
                Session.updateWorkspaceFromCurrentWorkspace(toParams.organisation_id).then(function (result) {
                  if (result) {
                    $state.go(toState, toParams, {
                      location: true, notify: true, reload: true
                    });
                  } else {
                    $state.go(toState, toParams, {
                      location: true, notify: false, reload: false
                    });
                  }
                });
              }
            }
          }
        });
      }
    ]);

    angularAMD.bootstrap(app, true, document.body);
    return app;
  });
