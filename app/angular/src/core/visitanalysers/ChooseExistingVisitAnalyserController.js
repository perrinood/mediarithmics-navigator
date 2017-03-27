define(['./module'], function (module) {
  'use strict';

  module.controller('core/visitanalysers/ChooseExistingVisitAnalyserController', [
    '$scope', '$uibModalInstance', '$document', '$log', "Restangular", 'core/common/auth/Session',
    function($scope, $uibModalInstance, $document, $log,  Restangular, Session) {

      $scope.availableVisitAnalysers = Restangular.all("visit_analyzer_models").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedVisitAnalyser = {
        id : null
      };

      $scope.done = function() {
        var visitAnalyser;
        for (var i = 0; i < $scope.availableVisitAnalysers.length; i++) {
          visitAnalyser = $scope.availableVisitAnalysers[i];
          if(visitAnalyser.id === $scope.selectedVisitAnalyser.id) {
            $uibModalInstance.close(visitAnalyser);
          }
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});


