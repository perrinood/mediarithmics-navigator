define(['./module'], function (module) {

  'use strict';

  module.controller('core/visitanalysers/ViewAllController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$location', '$uibModal', '$state', '$stateParams',
    function ($scope, Restangular, Session, $location, $uibModal, $state, $stateParams) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      Restangular.all("visit_analyzer_models").getList({
        organisation_id: organisationId
      }).then(function (visitAnalysers) {
        $scope.visitAnalysersModels = visitAnalysers;
      });
      $scope.organisationId = organisationId;
    }
  ]);
});
