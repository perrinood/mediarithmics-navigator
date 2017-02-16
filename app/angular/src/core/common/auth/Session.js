define(['./module'], function (module) {
  'use strict';

  function Workspace(workspace, datamart)  {
    this.workspace = workspace;
    this.organisation_name = workspace.organisation_name;
    this.organisation_id = workspace.organisation_id;
    this.administrator = workspace.administrator;
    this.datamart = datamart;
    this.sourcesDatamart = [];
    if(datamart) {
      // TODO : remove the conditional assignement
      this.datamart_id = datamart.id || datamart.datamart_id;
      this.datamart_name = datamart.name;
    }
  }

  Workspace.prototype.hasDatamart = function() {
    return this.workspace.datamarts.length;
  };

  module.factory('core/common/auth/Session', [
    '$q', '$location', '$log', '$rootScope', 'Restangular', 'core/login/constants',  'core/configuration', 'core/common/auth/AuthenticationService', 'async','lodash',
    function ($q, $location, $log, $rootScope, Restangular, LoginConstants, coreConfig, AuthenticationService, async, _) {
      var service = {};
      service.initialized = false;

      var expirationTimer = null;
      service.workspaces = [];

      service.isInitialized = function () {
        return this.initialized;
      };

      service.parseWorkspaceId = function (workspaceString) {
        $log.debug("parseWorkspaceId:", workspaceString);
        var organisationId = null;
        var datamartId = null;
        if (workspaceString && workspaceString.match(/^\d+$/)) {
          organisationId = workspaceString;
        } else if (workspaceString && workspaceString.match(/^o\d+d[^\d]+/)) {
          organisationId = workspaceString.match(/o(\d+).*/)[1];
        } else if (workspaceString && workspaceString.match(/o(\d+)d(\d+)/)) {
          organisationId = workspaceString.match(/o(\d+)d(\d+)/)[1];
          datamartId = workspaceString.match(/o(\d+)d(\d+)/)[2];
        }
        return {organisation_id: organisationId, datamart_id: datamartId};
      };

      service.init = function (workspaceString) {
        var workspaceId = service.parseWorkspaceId(workspaceString);
        var organisationId = workspaceId.organisation_id;
        var datamartId = workspaceId.datamart_id;
        var deferred = $q.defer();
        var self = this;

        async.parallel({
            connectedUser: function (callback) {
                Restangular.one('connected_user').get().then(function (userProfile) {
                  callback(null, userProfile);
                }, function (err) {
                    callback(err);
                });
            },
            cookies: function (callback) {
                Restangular.withConfig(function(RestangularConfigurer) {
                    RestangularConfigurer.setDefaultHttpFields({withCredentials: true});
                }).one('my_cookies').get().then(function (response) {
                    callback(null, response.cookies);
                }, function (err) {
                    callback(err);
                });
             }
        }, function (err, results){
            if (err){
                deferred.reject(err);
            } else {

              self.userProfile = results.connectedUser;
              self.cookies = results.cookies;

              $log.debug("Initialize session with user profile:", self.userProfile);
              $log.debug("Loaded cookies:", self.cookies);

              if (!expirationTimer && AuthenticationService.hasAccessToken() && !AuthenticationService.hasRefreshToken()) {
                var expirationDate = AuthenticationService.getAccessTokenExpirationDate();
                var waitTime = expirationDate.getTime() - new Date().getTime() + 1 * 1000;
                expirationTimer = setTimeout(function () {
                  var isExpired = AuthenticationService.getAccessTokenExpirationDate().getTime() < new Date().getTime();
                  if (isExpired) {
                    $rootScope.$emit("global-message", {
                      message: "Your session has expired, you should log in again."
                    });
                  }
                }, waitTime);
              }

              if (organisationId) {
                $log.debug("Fetching organisation : ", organisationId);
                service.updateWorkspace(organisationId, datamartId).then(function () {
                  self.initialized = true;
                  deferred.resolve();
                });
              } else {
                self.workspaces = self.buildUserProfileWorkspaces();
                if (self.userProfile.default_workspace in self.userProfile.workspaces) {
                  $log.debug("use userProfile to create workspaces : ", self.userProfile.workspaces);

                  self.setCurrentWorkspace(service.workspaces[0]);
                } else if (self.userProfile.workspaces.length) {
                  $log.warn("default_workspace", self.userProfile.default_workspace, "is invalid, using the first one");
                  self.setCurrentWorkspace(service.workspaces[0]);
                } else {
                  $log.error("Can't set self.currentWorkspace, default_workspace =", self.userProfile.default_workspace, "workspaces =", self.userProfile.workspaces);
                }
                $log.debug("Use default : ", self.currentWorkspace);
                self.initialized = true;
                deferred.resolve();
              }
            }
        });

        return deferred.promise;
      };

      service.getUserProfile = function () {
        return this.userProfile;
      };
      service.setCurrentWorkspace = function (workspace) {
        if(workspace !== this.currentWorkspace) {
          $log.debug("change current workspace to ", workspace);
          this.currentWorkspace = workspace;

          document.title = workspace.organisation_name + " - " + workspace.datamart_name;
          $log.debug("Set page title to :", document.title);
          $rootScope.$broadcast(LoginConstants.WORKSPACE_CHANGED);
        }
      };

      service.getCurrentWorkspace = function () {
        return this.currentWorkspace;
      };

      service.getOrganisationName = function (id) {
        return this.getCurrentWorkspace().organisation_name;
      };

      service.getWorkspaces = function() {
        return service.workspaces;
      };
      service.buildUserProfileWorkspaces = function () {
        var result = [];
        for (var i = 0; i < this.userProfile.workspaces.length; i++) {
          pushWorkspace(result, this.userProfile.workspaces[i]);
        }

        return result;
      };

      function pushWorkspace(result, workspace) {
        for(var j = 0 ; j < workspace.datamarts.length; j++) {
          var datamart = workspace.datamarts[j];
          var w = new Workspace(workspace, datamart);
          if (datamart.type === 'CROSS_DATAMART'){
            w.sourcesDatamart = Restangular.one('datamarts', datamart.id).getList('sources').$object;
          }

          result.push(w);
        }
        if(workspace.datamarts.length === 0) {
          result.push(new Workspace(workspace));
        }
      }

      service.getWorkspacePrefixUrl = function () {
        return "/o"+ service.getCurrentWorkspace().organisation_id + "d"+service.getCurrentWorkspace().datamart_id;
      };

      service.getCurrentDatamartId = function () {
        return service.getCurrentWorkspace().datamart_id;
      };

      service.getCurrentDatamartToken = function() {
        return service.getCurrentWorkspace().datamart.token;
      };


      service.findWorkspaceByDatamartId = function (datamartId) {
        if(datamartId) {
          return _.find(service.workspaces, {"datamart_id": datamartId});
        } else {
          $log.debug("no datamart id provided, use first");
          return service.workspaces[0];
        }

      };

      service.hasDatamart = function () {
        return service.getCurrentWorkspace() && service.getCurrentWorkspace().hasDatamart();
      };
      service.updateWorkspaceFromCurrentWorkspace = function (workspaceString) {
        $log.info("updateWorkspaceFromCurrentWorkspace", workspaceString);
        var workspaceId = service.parseWorkspaceId(workspaceString);

        return service.updateWorkspace(workspaceId.organisation_id, workspaceId.datamart_id);
      };

      service.updateWorkspace = function (organisationId, datamartId) {

        if (organisationId) {
          return service.setWorkspace(organisationId, datamartId);
        } else {
          return service.setWorkspace(service.getCurrentWorkspace().organisation_id, service.getCurrentWorkspace().datamart_id);
        }
      };

      service.setWorkspace = function (organisationId, datamartId) {
        $log.debug("setWorkspace: ", organisationId , " - ", datamartId, " current: ", this.currentWorkspace);
        var self = this;
        if (!self.currentWorkspace || organisationId !== self.currentWorkspace.organisation_id || (datamartId !== self.currentWorkspace.datamart_id && !!datamartId)) {
          var promise = Restangular.one('organisations', organisationId).one('workspace').get();
          promise.then(function (result) {
            $log.debug("promise resolved", organisationId , " - ", datamartId);
            service.workspaces = [];
            pushWorkspace(service.workspaces, result);
            $log.debug("update workspaces : ", service.workspaces);

            self.setCurrentWorkspace(service.findWorkspaceByDatamartId(datamartId));
            return true;
          });
          return promise;
        } else {
          return $q.resolve(false);
        }

      };

      /**
       * Logout the user and reset the session.
       */
      service.logout = function () {
        this.initialized = false;
        this.currentWorkspace = null;
        this.userProfile = null;

        if (expirationTimer) {
          clearTimeout(expirationTimer);
          expirationTimer = null;
        }
      };

      return service;
    }
  ]);
});
