define(['./module'], function (module) {

  'use strict';
 
  module.controller("core/visitAnalysers/ChooseVisitAnalyserController", [
    "$scope", "$uibModal", "$log",
    function($scope, $uibModal, $log) {

      $scope.visitAnalyserChooseFromLibrary = function() {
        var uploadModal = $uibModal.open({
          templateUrl: 'angular/src/core/visitanalysers/ChooseExistingVisitAnalyser.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/visitanalysers/ChooseExistingVisitAnalyserController',
          size: "lg"
      });
      uploadModal.result.then(function(selectedVisitAnalyser) {
           if (selectedVisitAnalyser !== undefined) {
             $scope.$emit("mics-visit-analyser:selected", {
                visitAnalyser : selectedVisitAnalyser
             });
           }
         });
      };
      $scope.visitAnalyserSetToDefault = function () {
        $scope.$emit("mics-visit-analyser:selected", {
          visitAnalyser : null
        });
      };

    }
  ]);
});

