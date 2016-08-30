define(['./module'], function (module) {

  'use strict';

  module.controller('core/placementlists/EditDescriptorController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location) {
      var placementListId = $stateParams.placementlist_id;
      var descriptorId = $stateParams.descriptor_id;

      $scope.descriptor = {id: descriptorId};
      $scope.editMode = descriptorId;
      $scope.descriptorTypes = [];
      $scope.descriptorTypes['Exact Url'] = 'EXACT_URL';
      $scope.descriptorTypes['Exact Application Id'] = 'EXACT_APPLICATION_ID';
      $scope.descriptorTypes.Pattern = 'PATTERN';
      $scope.placementHolders = [];
      $scope.placementHolders.Application = 'APPLICATION';
      $scope.placementHolders['Web Browser'] = 'WEB_BROWSER';

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
            $log.error("Couldn't add the placement descriptor: ", err);
          });
        } else {
          // Update the placement descriptor
          $scope.descriptor.put().then(function () {
            $location.path(Session.getWorkspacePrefixUrl() + "/library/placementlists/" + placementListId);
          }, function (err) {
            $log.error("Couldn't update the placement descriptor: ", err);
          });
        }
      };
    }
  ]);
});

