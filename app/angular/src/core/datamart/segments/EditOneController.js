define(['./module'], function (module) {

  'use strict';



  module.controller('core/datamart/segments/EditOneController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$stateParams', '$location', '$uibModal', 'moment',
    'core/datamart/queries/QueryContainer', '$q', 'core/common/properties/PluginInstanceContainer',
    function ($scope, $log, Restangular, Session, _, $stateParams, $location, $uibModal, moment, QueryContainer, $q, PluginInstanceContainer) {
      var segmentId = $stateParams.segment_id;
      var type = $stateParams.type;

      $scope.isCreationMode = !segmentId;

      $scope.realTime = {
        active: false
      };

      if (!segmentId) {
        $scope.segmentLifetime = "never";
        if (type === 'USER_QUERY') {
          $scope.segment = {
            type: type,
            datamart_id: Session.getCurrentDatamartId(),
            evaluation_mode: 'PERIODIC',
            evaluation_period: 1,
            evaluation_period_unit: 'DAY'
          };
          var queryContainer = new QueryContainer(Session.getCurrentDatamartId());
          $scope.queryContainer = queryContainer;
        } else {
          $scope.segment = {
            datamart_id: Session.getCurrentDatamartId(),
            type: type,
          };
        }

      } else {
        Restangular.one('audience_segments', segmentId).get().then(function (segment) {
          $scope.segment = segment;

          if (segment.type === 'USER_QUERY') {
            $scope.realTime.active = segment.evaluation_mode === 'REAL_TIME';
            var queryContainer = new QueryContainer(Session.getCurrentDatamartId(), segment.query_id);
            queryContainer.load().then(function sucess(loadedQueryContainer) {
              $scope.queryContainer = loadedQueryContainer;
            });

          }

          if (segment.default_lifetime) {
            $scope.segmentLifetime = "expire";
            $scope.segmentLifetimeNumber = moment.duration(segment.default_lifetime, 'minutes').asDays();
            $scope.segmentLifetimeUnit = 'days';
          } else {
            $scope.segmentLifetime = "never";
          }
          segment.all('external_feeds').getList().then(function (feeds) {
            var pluginContainers = [];

            for (var i = 0; i < feeds.length; i++) {
              var pic = new PluginInstanceContainer(feeds[i]);
              pic.loadProperties($q);
              pluginContainers.push(pic);
            }

            $scope.activations = pluginContainers;

          });

        });
      }

      var saveSegment = function (queryId) {

        function updateActivationStatusIfNeeded(promise, activation) {
          if (activation.value.id === undefined && activation.value.status === 'ACTIVE') {
            return promise.then(function () {
              $log.info("start activation", activation);
              activation.value.status = 'ACTIVE';
              return activation.save();
            });
          } else {
            return promise;
          }

        }

        function pushSegment() {
          var promise = null;

          //compute default_lifetime
          if ($scope.segmentLifetime === 'never') {
            $scope.segment.default_lifetime = null;
          } else {
            $scope.segment.default_lifetime = moment.duration($scope.segmentLifetimeNumber, $scope.segmentLifetimeUnit).asMinutes();
          }

          if ($scope.realTime.active) {
            $scope.segment.evaluation_mode = 'REAL_TIME';
          } else if ($scope.segment.evaluation_mode !== 'LIVE') {
            $scope.segment.evaluation_mode = 'PERIODIC';
          }

          if (segmentId) {
            promise = $scope.segment.put();
          } else {
            $scope.segment.query_id = queryId;
            promise = Restangular.all('audience_segments').post($scope.segment, { organisation_id: Session.getCurrentWorkspace().organisation_id });
          }
          promise.then(function (audienceSegment) {
            var promises = [];
            if ($scope.activations) {
              for (var i = 0; i < $scope.activations.length; i++) {
                var activation = $scope.activations[i];
                var p = activation.save();
                promises.push(updateActivationStatusIfNeeded(p, activation));
              }
              return $q.all(promises).then(function () {
                return audienceSegment;
              });
            } else {
              return audienceSegment;
            }
          }, function failure() {
            $scope.error = 'There was an error while saving segment';
            $log.info("failure");
          }).then(function success(audienceSegment) {
            $log.info("success");
            $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments/" + audienceSegment.type + "/" + audienceSegment.id + "/report");
          }, function failure() {
            $scope.error = 'There was an error while saving segment';
            $log.info("failure");
          });
        }

        //we search technical name if it's defined and not empty
        //and if technical name is an ampty string we set it as undefined
        $scope.segment.technical_name = ($scope.segment.technical_name === "" || $scope.segment.technical_name === null) ? undefined : $scope.segment.technical_name;
        if ($scope.segment.technical_name !== undefined) {
          //check if an active segment with the same technical name doesn't exist
          Restangular.all('audience_segments').getList({ datamart_id: $scope.segment.datamart_id, technical_name: $scope.segment.technical_name }).then(function (segments) {
            if (segments.length === 0) {
              pushSegment();
            } 
            else if (segments[0].id === $scope.segment.id){
              pushSegment();
            }
             else {
              $scope.error = 'The Technical Name "' + $scope.segment.technical_name + '" is already used';
            }
          }
          );
        } else {
          pushSegment();
        }

      };

      $scope.goals = [];

      $scope.$on("mics-audience-segment:external-feed-added", function (event, activation) {
        $log.info("new external feed added : ", activation);
        if ($scope.activations.indexOf(activation) === -1) {
          $scope.activations.push(activation);
        }
      });

      $scope.$on("mics-audience-segment:goal-selected", function (event, selectedGoal) {
        var existingGoal = !!_.find($scope.goals, function (goal) {
          return goal.id === selectedGoal.id;
        });

        if (!existingGoal) {
          $scope.goals.push(selectedGoal);
        }
      });

      $scope.addActivation = function () {
        var endpoint = $scope.segment.all('external_feeds');
        var newScope = $scope.$new(true);

        newScope.activation = new PluginInstanceContainer({}, endpoint);

        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/segments/add-activation.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/segments/AddActivationController'
        });
      };

      $scope.editQuery = function () {
        var newScope = $scope.$new(true);
        newScope.queryContainer = $scope.queryContainer.copy();
        newScope.enableSelectedValues = true;
        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/queries/edit-query.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/queries/EditQueryController',
          windowClass: 'edit-query-popin'
        }).result.then(function ok(queryContainerUpdate) {
          $scope.queryContainer = queryContainerUpdate;
        }, function cancel() {
          $log.debug("Edit Query model dismissed");
        });
      };

      $scope.editActivation = function (activation) {
        var newScope = $scope.$new(true);
        newScope.activation = activation;

        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/segments/add-activation.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/segments/AddActivationController',
          size: "lg"
        });
      };

      $scope.addGoal = function () {
        var newScope = $scope.$new(true);
        $uibModal.open({
          templateUrl: 'angular/src/core/datamart/segments/ChooseExistingGoal.html',
          scope: newScope,
          backdrop: 'static',
          controller: 'core/datamart/segments/ChooseExistingGoalController',
          size: 'lg'
        });
      };

      $scope.removeGoal = function (goal) {
        var i = $scope.goals.indexOf(goal);
        $scope.goals.splice(i, 1);
      };

      $scope.removeActivation = function (activation) {
        var i = $scope.activations.indexOf(activation);
        $scope.activations.splice(i, 1);
      };

      $scope.cancel = function () {
        if ($scope.segment.id) {
          $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments/" + $scope.segment.type + "/" + $scope.segment.id + "/report");
        } else {
          $location.path(Session.getWorkspacePrefixUrl() + "/datamart/segments");
        }

      };

      $scope.next = function () {
        if ($scope.segment.type === 'USER_QUERY') {
          $scope.queryContainer.saveOrUpdate().then(function sucess(updateQueryContainer) {
            saveSegment(updateQueryContainer.id);
          }, function error(reason) {
            if (reason.data && reason.data.error_id) {
              $scope.error = "An error occured while saving query , errorId: " + reason.data.error_id;
            } else {
              $scope.error = "An error occured while saving query";
            }
          });
        } else {
          saveSegment();
        }
      };
    }
  ]);
});
