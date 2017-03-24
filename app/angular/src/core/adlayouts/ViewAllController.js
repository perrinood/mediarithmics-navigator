define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/adlayouts/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$state', '$stateParams', '$uibModal', '$log', '$filter',
    function ($scope, Restangular, Session, $location, $state, $stateParams, $uibModal, $log, $filter) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.adLayouts = [];
      $scope.adRenderers = [];
      $scope.adLayoutRendererVersions = [];
      $scope.itemsPerPage = 10;
      $scope.currentPage = 1;

      // Get list of ad renderers
      Restangular.all("plugins").getList({plugin_type: "DISPLAY_AD_RENDERER"}).then(function (renderers) {
        for (var i = 0; i < renderers.length; ++i) {
          $scope.adRenderers[renderers[i].id] = renderers[i].artifact_id;
        }
      });

      $scope.filteredAdLayouts = function () {
        return $filter('filter')($scope.adLayouts, $scope.adLayoutName);
      };

      function matchAdLayoutVersions(versions) {
        if (versions[0]) {
          $.grep($scope.adLayouts, function (e) {
            if (e.id === versions[0].ad_layout_id) {
              e.versions = versions;
            }
          });
        }
      }

      function setUpAdLayoutVersions(versions) {
        versions.sort(function (a, b) {
          return a.creation_date < b.creation_date;
        });
        matchAdLayoutVersions(versions);
      }

      function addAdLayoutRendererVersion(adLayoutId, rendererId, rendererVersionId) {
        Restangular.one("plugins/" + rendererId + "/versions/" + rendererVersionId).get().then(function (version) {
          $scope.adLayoutRendererVersions[adLayoutId] = version.version_id;
        });
      }

      function getAdLayouts() {
        $scope.adLayouts = [];
        Restangular.all("ad_layouts").getList({organisation_id: organisationId}).then(function (adLayouts) {
          for (var i = 0; i < adLayouts.length; ++i) {
            var adLayout = adLayouts[i];
            $scope.adLayouts.push(adLayout);
            addAdLayoutRendererVersion(adLayout.id, adLayout.renderer_id, adLayout.renderer_version_id);
            Restangular.one("ad_layouts", adLayout.id).one("versions").get({
              organisation_id: organisationId,
              statuses: "DRAFT,PUBLISHED"
            }).then(setUpAdLayoutVersions);
          }
        });
      }

      getAdLayouts();

      function preventEvent(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      function publish(adLayoutVersion) {
        Restangular.one("ad_layouts", adLayoutVersion.ad_layout_id).one("versions", adLayoutVersion.id).customPUT({status: "PUBLISHED"}, undefined, {organisation_id: organisationId}).then(function () {
          adLayoutVersion.status = "PUBLISHED";
        }, function () {
          $log.debug("There was an error on publish");
        });
      }

      function archive(adLayout, adLayoutVersion) {
        return Restangular.one("ad_layouts", adLayoutVersion.ad_layout_id).one("versions", adLayoutVersion.id).remove({organisation_id: organisationId}).then(function () {
          for (var i = 0; i < adLayout.versions.length; ++i) {
            if (adLayout.versions[i].id === adLayoutVersion.id) {
              adLayout.versions.splice(i, 1);
            }
          }
        }, function () {
          $log.debug("There was an error on archive");
        });
      }

      function draftCheck(adLayout, callback) {
        if (adLayout.versions && adLayout.versions.length && adLayout.versions[0].status === 'DRAFT') {
          var modal = $uibModal.open({
            templateUrl: 'angular/src/core/adlayouts/warning.draft.html',
            scope: $scope,
            backdrop: 'static',
            controller: 'core/adlayouts/WarningModalController'
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
      $scope.createNewVersion = function (adLayout, event) {
        preventEvent(event);
        draftCheck(adLayout, function (draftExists) {
          if (!draftExists) {
            $location.path(Session.getWorkspacePrefixUrl()+ "/library/adlayouts/" + adLayout.id + "/new-version");
          }
        });
      };

      /**
       * Check if a draft already exists, if not use the given version as a base for new version
       */
      $scope.duplicate = function (adLayout, version, event) {
        preventEvent(event);
        draftCheck(adLayout, function (draftExists) {
          if (!draftExists) {
            $location.path(Session.getWorkspacePrefixUrl()+ "/library/adlayouts/" + adLayout.id + "/new-version/" + version.id);
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
            templateUrl: 'angular/src/core/adlayouts/warning.publish.html',
            scope: $scope,
            backdrop: 'static',
            controller: 'core/adlayouts/WarningModalController'
          });
        } else {
          publish(version);
        }
      };

      $scope.archive = function (adLayout, adLayoutVersion, event) {
        preventEvent(event);
        archive(adLayout, adLayoutVersion);
      };
    }
  ]);
});
