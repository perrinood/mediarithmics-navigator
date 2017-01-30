define(['./module'], function (module) {
  'use strict';

  module.controller('core/common/properties/StyleSheetSelectController', ['$scope', '$uibModalInstance', 'propStyleSheet', 'Restangular',
    function ($scope, $modalInstance, propStyleSheet, Restangular) {
      function findItem(list, id) {
        for (var i = 0; i < list.length; ++i) {
          if (list[i].id === id) {
            return list[i];
          }
        }
      }

      function setupStyleSheetVersions(styleSheetId, versionId) {
        Restangular.one("style_sheets/" + styleSheetId + "/versions").getList("", {
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

      // Setup and select Style Sheet
      Restangular.one("style_sheets").getList("", {"organisation_id": $scope.organisationId}).then(function (styleSheets) {
        if (styleSheets.length) {
          $scope.styleSheets = styleSheets;
          $scope.selectedStyleSheet = !propStyleSheet.id ? styleSheets[0] : findItem(styleSheets, propStyleSheet.id);
          setupStyleSheetVersions($scope.selectedStyleSheet.id, propStyleSheet.version);
        }
      });

      // Setup Style Sheet version once the selected Style Sheet is set
      $scope.selectStyleSheet = function (styleSheet) {
        $scope.selectedStyleSheet = styleSheet;
        if (styleSheet && styleSheet.id) {
          setupStyleSheetVersions(styleSheet.id);
        }
      };

      $scope.selectVersion = function (version) {
        $scope.selectedVersion = version;
      };

      $scope.done = function () {
        $modalInstance.close({styleSheet: $scope.selectedStyleSheet, version: $scope.selectedVersion});
      };

      $scope.cancel = function () {
        $modalInstance.dismiss(false);
      };
    }]);
});