define(['./module'], function (module) {

  'use strict';

  module.controller('core/attributionmodels/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', 'core/configuration', 'ngTableParams', '$window', 'core/common/auth/AuthenticationService', "core/common/WaitingService", "core/common/ErrorService", "core/attributionmodels/PropertyContainer", "$q",
    function($scope, $log, Restangular, Session, _, $stateParams, $location, configuration, NgTableParams, $window, AuthenticationService, waitingService, errorService, PropertyContainer, $q) {

      var attributionModelId = $stateParams.id;
      var type = $stateParams.type;

      Restangular.one('attribution_models', attributionModelId).get().then(function (attributionModel) {
        $scope.attributionModel = attributionModel;
      });

      $scope.properties = [];
      Restangular.one('attribution_models', attributionModelId).all("properties").getList().then(function (properties) {
        for(var i=0; i < properties.length; i++) {
          // load the property container
          var propertyCtn = new PropertyContainer(properties[i]);

          $scope.properties.push(propertyCtn);
        }
      });

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl()+ "/library/attributionmodels");
      };

      $scope.next = function () {
        var promises = [$scope.attributionModel.put()];
        for(var i = 0; i < $scope.properties.length; i++) {
          promises.push($scope.properties[i].update());
        }
        $q.all(promises).then(function success(res){
          $log.info("success");
          $location.path( Session.getWorkspacePrefixUrl()+  "/library/attributionmodels");
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

