define(['./module'], function (module) {
  'use strict';

  module.controller('core/settings/mobileapplications/EditOneController', [
    '$scope', '$log', '$location', '$state', '$stateParams', '$uibModal', '$filter', '$q', 'Restangular', 'core/common/auth/Session', 'lodash',
    'core/common/ErrorService', 'core/common/WarningService',
    function ($scope, $log, $location, $state, $stateParams, $uibModal, $filter, $q, Restangular, Session, _, ErrorService, WarningService) {
      var datamartId = Session.getCurrentDatamartId();
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId = organisationId;
      $scope.editMode = false;
      $scope.app = {type: "MOBILE_APPLICATION", datamart_id: datamartId, organisation_id: organisationId};

      /**
       * Watchers
       */

      $scope.$watchGroup(["datamartId", "organisationId"], function (values) {
        if (values && $stateParams.appId) {
          $scope.editMode = true;
          Restangular.one("datamarts/" + datamartId + "/mobile_applications/" + $stateParams.appId).get({organisation_id: organisationId}).then(function (app) {
            $scope.app = app;
            if (app.token !== null) {
              $scope.appToken = app.token;
            }

            // visit analyser
            if (app.visit_analyzer_model_id !== null) {
              Restangular.one('visit_analyzer_models', app.visit_analyzer_model_id).get().then(function (visitAnalyser) {
                $scope.visitAnalyser = visitAnalyser;
              });
            }
          });
        }
      });


      /**
       * Helpers
       */

      function handleAppError(e) {
        if ($scope.appToken === undefined) {
          ErrorService.showErrorModal({error: {message: "This app token is already taken."}});
        } else {
          ErrorService.showErrorModal(e);
        }
      }

      function sendAppEdit() {
        $q.all(_.flatten([
          Restangular.all("datamarts/" + datamartId + "/mobile_applications/" + $stateParams.appId).customPUT($scope.app, undefined, {organisation_id: organisationId})
            .catch(handleAppError)
        ])).then(function () {
          $location.path(Session.getWorkspacePrefixUrl() + "/settings/mobileapplications");
        }).catch(function (e) {
          ErrorService.showErrorModal(e);
        });
      }

      /**
       * Methods
       */

      // ---------------- APP ----------------

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/settings/mobileapplications");
      };

      $scope.done = function () {
        if ($scope.editMode) {
          if ($scope.appToken !== $scope.app.token) {
            WarningService.showWarningModal("A app token is already set. Are you sure that you want to override it?").then(sendAppEdit, function () {
              $scope.app.token = $scope.appToken;
            });
          } else {
            sendAppEdit();
          }
        } else {
          Restangular.all("datamarts/" + datamartId + "/mobile_applications").post($scope.app).then(function (app) {
            $location.path(Session.getWorkspacePrefixUrl() + "/settings/mobileapplications");
          }, handleAppError);
        }
      };


      // ---------------- VISIT ANALYSER ----------------
      $scope.$on("mics-visit-analyser:selected", function (event, params) {
        if (params.visitAnalyser === null) {
          $scope.visitAnalyser = undefined;
          $scope.app.visit_analyzer_model_id = null;
        } else {
          $scope.visitAnalyser = params.visitAnalyser;
          $scope.app.visit_analyzer_model_id = params.visitAnalyser.id;
        }
      });
    }
  ]);
});
