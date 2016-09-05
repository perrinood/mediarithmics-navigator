define(['./module'], function (module) {

  'use strict';

  module.controller('core/placementlists/EditDescriptorController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/common/ErrorService',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, ErrorService) {
      var placementListId = $stateParams.placementlist_id;
      var descriptorId = $stateParams.descriptor_id;

      $scope.descriptor = {id: descriptorId};
      $scope.editMode = descriptorId;
      $scope.descriptorTypes = {
        'EXACT_URL': 'Exact Url',
        'EXACT_APPLICATION_ID': 'Exact Application Id',
        'PATTERN': 'Pattern'
      };
      $scope.placementHolders = {
        'APPLICATION': 'Application',
        'WEB_BROWSER': 'Web Browser'
      };

      if ($scope.editMode) {
        Restangular.one('placement_lists', placementListId).one('placement_descriptors', descriptorId).get().then(function (descriptor) {
          $scope.descriptor = descriptor;
        });
      } else {
        $scope.descriptor = {id: descriptorId, descriptor_type: 'PATTERN', placement_holder: 'WEB_BROWSER'};
      }

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/library/placementlists/" + placementListId);
      };

      $scope.done = function () {
        if (!$scope.editMode) {
          // Create and link the placement descriptor to the placement list
          Restangular.one('placement_lists', placementListId).post('placement_descriptors', $scope.descriptor, {placement_list_id: placementListId}).then(function () {
            $location.path(Session.getWorkspacePrefixUrl() + "/library/placementlists/" + placementListId);
          }, function (err) {
            ErrorService.showErrorModal(err);
          });
        } else {
          // Update the placement descriptor
          $scope.descriptor.put().then(function () {
            $location.path(Session.getWorkspacePrefixUrl() + "/library/placementlists/" + placementListId);
          }, function (err) {
            ErrorService.showErrorModal(err);
          });
        }
      };
    }
  ]);
});

