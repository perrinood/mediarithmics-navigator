define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/stylesheets/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$state', '$stateParams', '$uibModal', '$log', '$filter',
    function ($scope, Restangular, Session, $location, $state, $stateParams, $uibModal, $log, $filter) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.stylesheets = [];
      $scope.adRenderers = [];
      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      // Get list of ad renderers
      Restangular.all("plugins").getList({plugin_type: "STYLE_SHEET"}).then(function (renderers) {
        for (var i = 0; i < renderers.length; ++i) {
          $scope.adRenderers[renderers[i].id] = renderers[i].artifact_id;
        }
      });

      $scope.filteredStyleSheets = function () {
        return $filter('filter')($scope.stylesheets, $scope.stylesheetName);
      };

      function setUpVersions(versions) {
        versions.sort(function (a, b) {
          return a.creation_date < b.creation_date;
        });
        if (versions[0]) {
          $.grep($scope.stylesheets, function (e) {
            if (e.id === versions[0].style_sheet_id) {
              e.versions = versions;
            }
          });
        }
      }

      function getStyleSheets() {
        $scope.stylesheets = [];
        Restangular.all("style_sheets").getList({organisation_id: organisationId}).then(function (stylesheets) {
          for (var i = 0; i < stylesheets.length; ++i) {
            var stylesheet = stylesheets[i];
            $scope.stylesheets.push({
              id: stylesheet.id,
              name: stylesheet.name,
              format: stylesheet.format,
              renderer_id: stylesheet.renderer_id,
              renderer_version_id: stylesheet.renderer_version_id,
              organisation_id: stylesheet.organisation_id
            });
            Restangular.one("style_sheets", stylesheet.id).one("versions").get({
              organisation_id: organisationId,
              statuses: "DRAFT,PUBLISHED"
            }).then(setUpVersions);
          }
        });
      }

      getStyleSheets();

      function preventEvent(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      function publish(stylesheetVersion) {
        Restangular.one("style_sheets", stylesheetVersion.style_sheet_id).one("versions", stylesheetVersion.id).customPUT({status: "PUBLISHED"}, undefined, {organisation_id: organisationId}).then(function () {
          stylesheetVersion.status = "PUBLISHED";
        }, function () {
          $log.debug("There was an error on publish");
        });
      }

      function archive(stylesheet, stylesheetVersion) {
        return Restangular.one("style_sheets", stylesheetVersion.style_sheet_id).one("versions", stylesheetVersion.id).remove({organisation_id: organisationId}).then(function () {
          for (var i = 0; i < stylesheet.versions.length; ++i) {
            if (stylesheet.versions[i].id === stylesheetVersion.id) {
              stylesheet.versions.splice(i, 1);
            }
          }
        }, function () {
          $log.debug("There was an error on archive");
        });
      }

      function draftCheck(stylesheet, callback) {
        if (stylesheet.versions && stylesheet.versions.length && stylesheet.versions[0].status === 'DRAFT') {
          var modal = $uibModal.open({
            templateUrl: 'angular/src/core/stylesheets/warning.draft.html',
            scope: $scope,
            backdrop: 'static',
            controller: 'core/stylesheets/WarningModalController'
          });
          modal.result.then(function () {
            callback(true);
          });
        } else {
          callback(false);
        }
      }

      /**
       * Check if a draft already exists, if not use the given version as a base for new version
       */
      $scope.createNewVersion = function (stylesheet, event) {
        preventEvent(event);
        draftCheck(stylesheet, function (draftExists) {
          if (!draftExists) {
            $location.path(Session.getWorkspacePrefixUrl() + "/library/stylesheets/" + stylesheet.id + "/new-version");
          }
        });
      };

      /**
       * Check if a draft already exists, if not use the given version as a base for new version
       */
      $scope.duplicate = function (stylesheet, version, event) {
        preventEvent(event);
        draftCheck(stylesheet, function (draftExists) {
          if (!draftExists) {
            $location.path(Session.getWorkspacePrefixUrl() + "/library/stylesheets/" + stylesheet.id + "/new-version/" + version.id);
          }
        });
      };

      /**
       * Only publishes the draft version, which is always the last one since there's only one draft at a time
       */
      $scope.publish = function (version, event) {
        preventEvent(event);
        if (version.template === null) {
          $uibModal.open({
            templateUrl: 'angular/src/core/stylesheets/warning.publish.html',
            scope: $scope,
            backdrop: 'static',
            controller: 'core/stylesheets/WarningModalController'
          });
        } else {
          publish(version);
        }
      };

      $scope.archive = function (stylesheet, stylesheetVersion, event) {
        preventEvent(event);
        archive(stylesheet, stylesheetVersion);
      };
    }
  ]);
});