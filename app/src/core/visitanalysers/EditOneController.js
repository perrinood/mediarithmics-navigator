define(['./module'], function (module) {

  'use strict';

  module.controller('core/visitanalysers/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", "core/common/ErrorService", "core/bidOptimizer/PropertyContainer", "$q",
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, errorService, PropertyContainer, $q) {
      var isEdit = $stateParams.id ? true : false;
      var visitAnalyserId = $stateParams.id;
      var type = $stateParams.type;

      Restangular.one('visit_analyzer_models', visitAnalyserId).get().then(function (visitAnalyser) {
        $scope.visitAnalyser = visitAnalyser;
      });

      $scope.properties = [];
      Restangular.one('visit_analyzer_models', visitAnalyserId).all("properties").getList().then(function (properties) {
        for(var i=0; i < properties.length; i++) {
          // load the property container
          var propertyCtn = new PropertyContainer(properties[i]);

          $scope.properties.push(propertyCtn);
        }
      });

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/library/visitanalysers");
      };

      $scope.next = function () {
        var promises = [$scope.visitAnalyser.put()];
        for(var i = 0; i < $scope.properties.length; i++) {
          promises.push($scope.properties[i].update());
        }
        $q.all(promises).then(function success(res){
          $log.info("success");
          $location.path(Session.getWorkspacePrefixUrl() + "/library/visitanalysers");
        }, function failure(response) {
          $log.info("failure");
          errorService.showErrorModal({
            error: response,
            messageType:"simple"
          });
        });
      };
    }
  ]);
});

