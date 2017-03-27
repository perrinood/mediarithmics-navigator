define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/adlayouts/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$state', '$stateParams', '$location', 'core/common/IabService', 'core/configuration',
    function ($scope, $log, Restangular, Session, _, $state, $stateParams, $location, IabService, configuration) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.editMode = $state.current.name === "adlayouts/editVersion";
      $scope.selectedFiles = [];
      $scope.adLayoutVersion = {};
      $scope.adSizes = _.map(IabService.getAdSizes("DISPLAY_AD"), function (size) {
        return size.format;
      });
      $scope.pluploadOptions = {
        url: configuration.WS_URL + "/ad_templates?organisation_id=" + organisationId,
        chunks_size: '100kb',
        filters: {
          mime_types: [
            {title: "Ad Layout Templates", extensions: "ssp"}
          ],
          max_file_size: "100kb"
        },
        multipart_params: {names: ""}
      };

      function setUpAdLayout(adLayoutId, callback) {
        Restangular.one("ad_layouts", adLayoutId).get({organisation_id: organisationId})
          .then(function (adLayout) {
            $scope.adLayout = adLayout;
            $scope.adRendererVersions = [$scope.adLayout.renderer_version_id];
          })
          .then(callback);
      }

      function setupAdLayoutVersion(adLayoutId, adLayoutVersionId) {
        Restangular.one("ad_layouts", adLayoutId).one("versions", adLayoutVersionId).get({organisation_id: organisationId}).then(function (version) {
          $scope.adLayoutVersion = {
            id: version.id,
            version_id: version.version_id,
            status: $state.current.name === "adlayouts/duplicateVersion" ? "DRAFT" : version.status,
            template: "mics://data_file/tenants/" + organisationId + "/ads_templates/",
            organisation_id: organisationId,
            ad_layout_id: $scope.adLayout.id,
            filename: $state.current.name === "adlayouts/duplicateVersion" ? undefined : version.filename
          };
        });
      }

      // Setup ad layout and ad layout version
      setUpAdLayout($stateParams.ad_layout_id, function () {
        if ($stateParams.version_id) {
          setupAdLayoutVersion($stateParams.ad_layout_id, $stateParams.version_id);
        } else {
          $.extend($scope.adLayoutVersion, {
            version_id: 0,
            ad_layout_id: $stateParams.ad_layout_id,
            organisation_id: organisationId,
            template: "mics://data_file/tenants/" + organisationId + "/ads_templates/",
            status: "DRAFT"
          });
        }
      });

      function optionalUpload() {
        if ($scope.selectedFiles.length) {
          $scope.$broadcast("plupload:upload");
        } else {
          $location.path(Session.getWorkspacePrefixUrl()+ "/library/adlayouts");
        }
      }

      $scope.done = function () {
        if ($scope.editMode) {
          // Edit a version
          $scope.adLayoutVersionUpdate = {filename: $scope.adLayoutVersion.filename};
          if ($scope.adLayoutVersion.filename) {
            $scope.adLayoutVersionUpdate.template = $scope.adLayoutVersion.template;
          } else {
            $scope.adLayoutVersionUpdate.template = null;
          }
          Restangular.all('ad_layouts/' + $scope.adLayout.id + '/versions/' + $scope.adLayoutVersion.id)
            .customPUT($scope.adLayoutVersionUpdate, undefined, {organisation_id: organisationId}).then(function (adLayoutVersion) {
              $scope.pluploadOptions.url = location.protocol + configuration.WS_URL + "/ad_layouts/" + $scope.adLayout.id + "/versions/" + adLayoutVersion.id + "/ad_templates?organisation_id=" + organisationId;
              optionalUpload();
          });
        } else {
          // Create a new version
          if ($scope.selectedFiles[0]) {
            $scope.adLayoutVersion.filename = $scope.selectedFiles[0].name;
          } else {
            $scope.adLayoutVersion.template = null;
          }
          Restangular.one('ad_layouts/' + $scope.adLayout.id + "/versions/last").get({organisation_id: organisationId}).then(function (version) {
            if (version) {
              $scope.adLayoutVersion.version_id = parseInt(version.version_id) + 1;
            } else {
              $scope.adLayoutVersion.version_id = 1;
            }
            Restangular.all('ad_layouts/' + $scope.adLayoutVersion.ad_layout_id + '/versions').post($scope.adLayoutVersion).then(function (adLayoutVersion) {
              $scope.pluploadOptions.url = location.protocol + configuration.WS_URL + "/ad_layouts/" + $scope.adLayout.id + "/versions/" + adLayoutVersion.id + "/ad_templates?organisation_id=" + organisationId;
              optionalUpload();
            });
          });
        }
      };

      $scope.$watch("selectedFiles", function (files) {
        if (files.length) {
          $scope.adLayoutVersion.filename = files[0].name;
        }
      });

      $scope.$on("plupload:uploaded", function () {
        $scope.$apply(function () {
          $location.path(Session.getWorkspacePrefixUrl()+ "/library/adlayouts");
        });
      });

      $scope.removeSelectedFiles = function () {
        $scope.selectedFiles = [];
        $scope.adLayoutVersion.filename = "";
      };

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl()+ "/library/adlayouts");
      };
    }
  ])
  ;
})
;
