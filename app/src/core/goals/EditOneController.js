define(['./module'], function (module) {

  'use strict';


  module.controller('core/goals/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$state','$uibModal',
    'core/datamart/queries/QueryContainer', '$q', 'core/common/promiseUtils', 'async', 'core/common/WaitingService',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, $state,$uibModal,QueryContainer, $q, promiseUtils, async, WaitingService) {
      var goalId = $stateParams.goal_id;
      var triggerDeletionTask = false;
      var datamartId = Session.getCurrentDatamartId();
      var queryId = -1;
      var deletedAttributionModels = [];
      var isCreationMode = goalId ? false : true;

      /**
       * Conversion Value
       */
      
      function initConversionValue() {

          $scope.conversionValue = {
            goalValueCurrency: $scope.goal.goal_value_currency || 'EUR',
            defaultGoalValue: $scope.goal.default_goal_value,
            addConversionValue: $scope.goal.default_goal_value ? true : false
          };
          
      }

      $scope.initConversionValue = initConversionValue;

      /**
       * Triggers
       */

      function addTrigger() {
        var newScope = $scope.$new(true);
        newScope.enableSelectedValues = false;
        newScope.queryContainer = new QueryContainer(datamartId);
        $uibModal.open({
          templateUrl: 'src/core/datamart/queries/edit-query.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/queries/EditQueryController',
          windowClass: 'edit-query-popin'
        }).result.then(function ok(queryContainerUpdate) {
          $scope.queryContainer = queryContainerUpdate;
        }, function cancel() {
          $log.debug("Edit Query model dismissed");
        });
      }

      function editTrigger(queryId) {
        var newScope = $scope.$new(true);
        newScope.queryContainer = $scope.queryContainer.copy();
        newScope.enableSelectedValues = false;
        $uibModal.open({
          templateUrl: 'src/core/datamart/queries/edit-query.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/queries/EditQueryController',
          windowClass: 'edit-query-popin'
        }).result.then(function ok(queryContainerUpdate) {
          $scope.queryContainer = queryContainerUpdate;
        }, function cancel() {
          $log.debug("Edit Query model dismissed");
        });
      }

      function removeTrigger() {
        $scope.queryContainer = null;
        if ($scope.goal.new_query_id) {
          queryId = $scope.goal.new_query_id;
          $scope.goal.new_query_id = null;
          triggerDeletionTask = true;
        }
      }

      function getPixelTrackingUrl() {

        $scope.error = null;

        var promise;

        if (isCreationMode) {
          promise = saveOrUpdateOperations();
        } else {
          promise = $q.resolve();
        }

        function displayPixelTrackingUrl() {
          var currentDatamartToken = Session.getCurrentDatamartToken();
          var newScope = $scope.$new(true);

          newScope.pixelTrackingUrl = 'http://events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=' + currentDatamartToken + '&goal_id=' + $scope.goal.id;

          function logResult() {
            $log.debug("Get pixel code modal closed");
          }

          $uibModal.open({
            templateUrl: 'src/core/goals/get-pixel.html',
            scope: newScope,
            backdrop: 'static',
            controller: 'core/goals/GetPixelController'
          }).result.then(logResult);

        }

        function displayError(reason) {
          if (reason.message) {
            $scope.error = "An error occured while getting pixel tracking url: " + reason.message;
          } else {
            $scope.error = "An error occured while getting pixel tracking url";
          }
        }

        promise
          .then(removeTrigger)
          .then(displayPixelTrackingUrl)
          .catch(displayError);

      }

      $scope.trigger = 'query';
      $scope.addTrigger = addTrigger;
      $scope.editTrigger = editTrigger;
      $scope.removeTrigger = removeTrigger;
      $scope.getPixelTrackingUrl = getPixelTrackingUrl;

      /**
       * Attribution Model
       */

      function AttributionModelContainer(value) {
        this.selectedAsDefault = "false";

        if (value) {
            this.value = value;
            this.id = value.id;

            if (value.default){
              this.selectedAsDefault = "true";
            }
        }

      }

      function updateDefaultAttributionModel(attributionModel) {
        var previousDefault = $scope.attributionModels.find(function (el) { return el.selectedAsDefault === "true"; });
        previousDefault.selectedAsDefault = "false";
        previousDefault.value.default = false;

        attributionModel.selectedAsDefault = "true";
        attributionModel.value.default = true;
      }

      function addAttributionModel(type) {
        $uibModal.open({
          templateUrl: 'src/core/attributionmodels/ChooseExistingAttributionModel.html',
          scope: $scope,
          backdrop: 'static',
          controller: 'core/attributionmodels/ChooseExistingAttributionModelController',
          size: "lg"
        });

        return;
      }

      function addDirectAttributionModel(type) {

        var existingDirectModel = $scope.attributionModels.find(function (model) {
          return model.value.attribution_type === 'DIRECT';
        });

        if (!existingDirectModel) {
          var directAttributionModel = {
            attribution_type: 'DIRECT'
          };

          if ($scope.attributionModels.length === 0) {
            directAttributionModel.default = "true";
          }

          $scope.attributionModels.push(new AttributionModelContainer(directAttributionModel));
        }
      }

      function deleteAttributionModel(attribution) {
        if (attribution.id) {
          deletedAttributionModels.push(attribution);
        }

        var i = $scope.attributionModels.indexOf(attribution);
        $scope.attributionModels.splice(i, 1);

        if ($scope.attributionModels.length > 0 && attribution.selectedAsDefault === "true") {
          var first = $scope.attributionModels[0];
          first.selectedAsDefault = "true";
          first.value.default = true;
        }
      }

      function onAttributionModelSelected(event, data) {

        var alreadySelected = $scope.attributionModels.find(function (model) {
          return model.value.attribution_model_id === data.attributionModel.id;
        });

        if (!alreadySelected) {
          var selectedAttributionModel = {
            attribution_model_id: data.attributionModel.id,
            attribution_model_name: data.attributionModel.name,
            group_id: data.attributionModel.group_id,
            artifact_id: data.attributionModel.artifact_id,
            attribution_type: 'WITH_PROCESSOR'
          };

          if ($scope.attributionModels.length === 0) {
            selectedAttributionModel.default = "true";
          }

          $scope.attributionModels.push(new AttributionModelContainer(selectedAttributionModel));
        }
      }

      function getAttributionModelTasks() {
        var deleteAttributionModelTasks = deletedAttributionModels.map(function (attribution) {
          return function (callback) {
            promiseUtils.bindPromiseCallback(attribution.value.remove(), callback);
          };
        });

        var updateAttributionModelTasks = $scope.attributionModels.filter(function (attribution) {
          return attribution.id;
        }).map(function (attribution) {
          return function (callback) {
            promiseUtils.bindPromiseCallback(attribution.value.put(), callback);
          };
        });

        var createAttributionModelTasks = $scope.attributionModels.filter(function (attribution) {
          return !attribution.id;
        }).map(function (attribution) {
          return function (callback) {
            var promise = $scope.goal.all("attribution_models").post({ "attribution_model_id": attribution.value.attribution_model_id, "attribution_type": attribution.value.attribution_type });
            promiseUtils.bindPromiseCallback(promise, callback);
          };
        });

        var attributionModelTasks = [];
        attributionModelTasks = attributionModelTasks.concat(deleteAttributionModelTasks);
        attributionModelTasks = attributionModelTasks.concat(updateAttributionModelTasks);
        attributionModelTasks = attributionModelTasks.concat(createAttributionModelTasks);

        return attributionModelTasks;

      }

      $scope.attributionModels = [];
      $scope.updateDefaultAttributionModel = updateDefaultAttributionModel;
      $scope.addAttributionModel = addAttributionModel;
      $scope.addDirectAttributionModel = addDirectAttributionModel;
      $scope.deleteAttributionModel = deleteAttributionModel;
      $scope.$on("mics-attribution-model:selected", onAttributionModelSelected);


      /**
       * Actions
       */

      function saveOrUpdateGoal(){

        var promise;

        if (!$scope.goal.name) {
          promise = $q.reject({ message: 'A name is required to save a goal' });
        } else if (!goalId) {
          promise = Restangular.all('goals').post($scope.goal, {organisation_id: Session.getCurrentWorkspace().organisation_id});
        } else {
          promise = $q.resolve($scope.goal);
        }

        function saveAttributionModel(goal) {
          $scope.goal = goal;
          var deferred = $q.defer();
          var attributionP = deferred.promise;
          async.series(getAttributionModelTasks(), function (err, res) {
            if (err) {
              deferred.reject(err);
            } else {
              deferred.resolve(res);
            }
          });
          return attributionP;
        }

        function setConversionValue() {
          var conversionValue = {};
          if ($scope.conversionValue.addConversionValue) {
            conversionValue = {
              default_goal_value: $scope.conversionValue.defaultGoalValue,
              goal_value_currency: $scope.conversionValue.goalValueCurrency
            };
          } else {
            conversionValue = {
              default_goal_value: null,
              goal_value_currency: null
            };
          }
          $scope.goal = Restangular.copy(angular.merge({}, $scope.goal, conversionValue));
        }

        function saveGoal() {
          return $scope.goal.put();
        }

        function checkDeletionTask() {
          if (triggerDeletionTask) {
            return Restangular.one('datamarts', datamartId).one('queries', queryId).remove();
          } else {
            return $q.resolve();
          }
        }

        return promise.then(saveAttributionModel)
                      .then(setConversionValue)
                      .then(saveGoal)
                      .then(checkDeletionTask);
      }

      function saveOrUpdateQueryContainer() {

        var promise;

        if ($scope.queryContainer) {
          promise = $scope.queryContainer.saveOrUpdate().then(function success(updateQueryContainer) {
            if (!$scope.goal.new_query_id) {
              $scope.goal.new_query_id = updateQueryContainer.id;
            }
            return $q.resolve();
          });
        } else {
          promise = $q.resolve();
        }

        return promise;

      }

      function saveOrUpdateOperations() {
        return saveOrUpdateQueryContainer().then(saveOrUpdateGoal);
      }

      function done() {
        $scope.error = null;
      
        function success() {
          WaitingService.hideWaitingModal();
          $location.path(Session.getWorkspacePrefixUrl() + "/library/goals");
        }

        function error(reason) {
          WaitingService.hideWaitingModal();
          if (reason.data && reason.data.error_id) {
            $scope.error = "An error occured while saving goal , errorId: " + reason.data.error_id;
          } else if (reason.message) {
            $scope.error = "An error occured while saving goal: " + reason.message;
          } else {
            $scope.error = "An error occured while saving goal";
          }
        }

        // workaround for WaitingService.hideWaitingModal() that doesn't seems to work properly
        if (!$scope.goal.name) {
          error({ message: 'A name is required to save a goal' });
        } else {
          WaitingService.showWaitingModal();
          saveOrUpdateOperations().then(success, error);
        }        

      }

      function cancel() {

        var promise;

        if (isCreationMode && $scope.goal.id) {
          promise = $scope.goal.remove();
        } else {
          promise = $q.resolve();
        }

        function redirectToGoalsLibrary() {
          return $location.path(Session.getWorkspacePrefixUrl() + "/library/goals");
        }

        function displayError(error) {
          if (error.data && error.data.error_id) {
            $scope.error = "An error occured while deleting goal , errorId: " + error.data.error_id;
          } else {
            $scope.error = "An error occured while deleting goal";
          }
        }

        promise
          .then(redirectToGoalsLibrary)
          .catch(displayError);
        
      }

      $scope.done = done;
      $scope.cancel = cancel;


      /**
       * Init
       */

      if (!goalId) {
        $scope.goal = { type: 'organisation_goal' };
        initConversionValue();
      } else {
        Restangular.one("goals", goalId).get().then(function (goal) {
          $scope.goal = goal;
          initConversionValue();
          goal.all("attribution_models").getList().then(function (attributionModels) {
            $scope.attributionModels = attributionModels.map(function (attributionModel) {
              return new AttributionModelContainer(attributionModel);
            });
          });

          //load goal query if any
          if (goal.new_query_id) {
            var queryContainer = new QueryContainer(datamartId, goal.new_query_id);
            queryContainer.load().then(function sucess(loadedQueryContainer) {
              $scope.queryContainer = loadedQueryContainer;
            }, function error(reason) {
              if (reason.data && reason.data.error_id) {
                $scope.error = "An error occured while loading trigger , errorId: " + reason.data.error_id;
              } else {
                $scope.error = "An error occured while loading trigger";
              }
            });
          }

        });
      } 

      $scope.$watch("goal['name']", function (goalName) {
        $scope.disabled = goalName ? false : true;
      });

    }     

  ]);
});
