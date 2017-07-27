define(['./module'], function (module) {
  'use strict';

  module.controller('core/common/properties/AdLayoutSelectController', ['$scope', '$uibModalInstance', 'propAdLayout', 'displayAdRenderer', 'Restangular',
    function ($scope, $modalInstance, propAdLayout, displayAdRenderer, Restangular) {
      function findItem(list, id) {
        for (var i = 0; i < list.length; ++i) {
          if (list[i].id === id) {
            return list[i];
          }
        }
      }

      function setupAdLayoutVersions(adLayoutId, versionId) {
        Restangular.one("ad_layouts/" + adLayoutId + "/versions").getList("", {
          "statuses": "DRAFT,PUBLISHED",
          "organisation_id": $scope.organisationId
        }).then(function (versions) {
          if (versions.length) {
            $scope.versions = versions;
            $scope.selectedVersion = !versionId ? versions[0] : findItem(versions, versionId);
          } else {
            $scope.versions = null;
            $scope.selectedVersion = null;
          }
        });
      }

      // Setup and select Ad Layout
      Restangular.one("ad_layouts").getList("", {
        "renderer_version_id": displayAdRenderer.versionId,
        "organisation_id": $scope.organisationId
      }).then(function (adLayouts) {
        if (adLayouts.length) {
          $scope.adLayouts = adLayouts;
          $scope.selectedAdLayout = !propAdLayout.id ? adLayouts[0] : findItem(adLayouts, propAdLayout.id);
          setupAdLayoutVersions($scope.selectedAdLayout.id, propAdLayout.version);
        }
      });

      // Setup Ad Layout version once the selected Ad Layout is set
      $scope.selectAdLayout = function (adLayout) {
        $scope.selectedAdLayout = adLayout;
        if (adLayout && adLayout.id) {
          setupAdLayoutVersions(adLayout.id);
        }
      };

      $scope.selectVersion = function(version) {
        $scope.selectedVersion = version;
      };

      $scope.done = function () {
        $modalInstance.close({adLayout: $scope.selectedAdLayout, version: $scope.selectedVersion});
      };

      $scope.cancel = function () {
        $modalInstance.dismiss(false);
      };
    }]);
});