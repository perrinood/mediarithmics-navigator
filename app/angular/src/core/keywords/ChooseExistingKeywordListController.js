define(['./module'], function (module) {
  'use strict';

  module.controller('core/keywords/ChooseExistingKeywordListController', [
    '$scope', '$uibModalInstance', '$document', '$log', 'core/campaigns/DisplayCampaignService', "Restangular", 'core/common/auth/Session',
    function($scope, $uibModalInstance, $document, $log, DisplayCampaignService, Restangular, Session) {

      $scope.availableKeywordLists = Restangular.all("keyword_lists").getList({
        organisation_id : Session.getCurrentWorkspace().organisation_id
      }).$object;

      $scope.selectedKeywordLists = [];

      $scope.done = function() {
        var keywordList;
        for (var i = 0; i < $scope.selectedKeywordLists.length; i++) {
          keywordList = $scope.selectedKeywordLists[i];
          $scope.$emit("mics-keyword-list:selected", {
            keywordList : keywordList
          });
        }
        $uibModalInstance.close();
      };

      $scope.cancel = function() {
        $uibModalInstance.close();
      };

    }
  ]);
});


