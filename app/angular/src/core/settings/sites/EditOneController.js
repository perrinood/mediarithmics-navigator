define(['./module', 'jquery'], function (module, $) {
  'use strict';

  module.controller('core/settings/sites/EditOneController', [
    '$scope', '$log', '$location', '$state', '$stateParams', '$uibModal', '$filter', '$q', 'Restangular', 'core/common/auth/Session', 'lodash',
    'core/common/ErrorService', 'core/common/WarningService',
    function ($scope, $log, $location, $state, $stateParams, $uibModal, $filter, $q, Restangular, Session, _, ErrorService, WarningService) {
      var datamartId = Session.getCurrentDatamartId();
      var organisationId = Session.getCurrentWorkspace().organisation_id;
      $scope.organisationId  = organisationId;
      $scope.aliasesPerPage = 20;
      $scope.aliasesCurrentPage = 0;
      $scope.editMode = false;
      $scope.site = {type: "SITE", datamart_id: datamartId, organisation_id: organisationId};
      $scope.aliases = [];
      $scope.rules = [];
      $scope.originalAliasesIds = [];
      $scope.originalRulesIds = [];

      /**
       * Watchers
       */
      $scope.$watchGroup(["datamartId", "organisationId"], function (values) {
        if (values && $stateParams.siteId) {
          $scope.editMode = true;
          Restangular.one("datamarts/" + datamartId + "/sites/" + $stateParams.siteId).get({organisation_id: organisationId}).then(function (site) {
            $scope.site = site;
            if (site.token !== null) {
              $scope.siteToken = site.token;
            }

          //visit analyser
          if(site.visit_analyzer_model_id !== null){
            Restangular.one('visit_analyzer_models', site.visit_analyzer_model_id).get().then(function(activityAnalyser) {
            $scope.activityAnalyser = activityAnalyser;
            });
          }

          });
          Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/event_rules").getList({organisation_id: organisationId}).then(function (rules) {
            _.forEach(rules, function (rule) {
              $scope.originalRulesIds.push(rule.id);
            });
            $scope.rules = rules;
            $scope.selectedRule = undefined;
          });
          Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/aliases").getList({organisation_id: organisationId}).then(function (aliases) {
            $scope.originalAliasesIds = _.pluck(aliases, 'id');
            $scope.aliases = aliases;
          });
        }
      });


      /**
       * Helpers
       */

      function removeAliases() {
        var finalIds = _.pluck($scope.aliases, 'id');
        return _.map($scope.originalAliasesIds, function (id) {
          if (finalIds.indexOf(id) === -1) {
            return Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/aliases/" + id).remove({organisation_id: organisationId});
          }
        });
      }

      function addAliases() {
        return _.map($scope.aliases, function (elem) {
          if (elem.id === undefined) {
            elem.site_id = $stateParams.siteId;
            elem.organisation_id = organisationId;
            return Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/aliases").post(elem);
          }
        });
      }

      function removeRules() {
        var finalIds = _.pluck($scope.rules, 'id');
        return _.forEach($scope.originalRulesIds, function (id) {
          if (finalIds.indexOf(id) === -1) {
            return Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/event_rules/" + id).remove({organisation_id: organisationId});
          }
        });
      }

      function upsertRules() {
        return _.map($scope.rules, function (elem) {
          elem.site_id = $stateParams.siteId;
          if (elem.id === undefined) {
            var rule = {organisation_id: organisationId, properties: elem};
            return Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/event_rules").post(rule);
          } else {
            return Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId + "/event_rules/" + elem.id).customPUT(elem, undefined, {organisation_id: organisationId});
          }
        });
      }

      function handleSiteError(e) {
        if ($scope.siteToken === undefined) {
          ErrorService.showErrorModal({error: {message: "This site token is already taken."}});
        } else {
          ErrorService.showErrorModal(e);
        }
      }

      function sendSiteEdit() {
        $q.all(_.flatten([
          removeAliases(),
          addAliases(),
          removeRules(),
          upsertRules(),
          Restangular.all("datamarts/" + datamartId + "/sites/" + $stateParams.siteId).customPUT($scope.site, undefined, {organisation_id: organisationId})
            .catch(handleSiteError)
        ])).then(function () {
          $location.path(Session.getWorkspacePrefixUrl() + "/settings/sites");
        }).catch(function (e) {
          ErrorService.showErrorModal(e);
        });
      }

      /**
       * Filters
       */

      $scope.filteredAliases = function () {
        return $filter('filter')($scope.aliases, $scope.filteredAlias);
      };

      /**
       * Methods
       */

      // -------------- ALIASES ------------------

      $scope.newAlias = function () {
        $uibModal.open({
          templateUrl: 'angular/src/core/settings/sites/create.alias.html',
          backdrop: 'static',
          controller: 'core/settings/sites/CreateAliasController',
          size: 'md'
        }).result.then(function (alias) {
            $scope.aliases.push(alias);
          });
      };

      $scope.removeAlias = function (alias) {
        var idx = $scope.aliases.indexOf(alias);
        if (idx !== -1) {
          $scope.aliases.splice(idx, 1);
        }
      };


      // ---------------- SITE ----------------

      $scope.cancel = function () {
        $location.path(Session.getWorkspacePrefixUrl() + "/settings/sites");
      };

      $scope.done = function () {
        if ($scope.editMode) {
          if ($scope.siteToken !== $scope.site.token) {
            WarningService.showWarningModal("A site token is already set. Are you sure that you want to override it?").then(sendSiteEdit, function () {
              $scope.site.token = $scope.siteToken;
            });
          } else {
            sendSiteEdit();
          }
        } else {
          Restangular.all("datamarts/" + datamartId + "/sites").post($scope.site).then(function (site) {
            $scope.rules.forEach(function (ruleInfo) {
              var rule = {
                organisation_id: organisationId,
                properties: ruleInfo
              };
              Restangular.all("datamarts/" + datamartId + "/sites/" + site.id + "/event_rules").post(rule);
            });
            $q.all(
              $scope.aliases.map(function (alias) {
                alias.site_id = site.id;
                alias.organisation_id = organisationId;
                return Restangular.all("datamarts/" + datamartId + "/sites/" + site.id + "/aliases").post(alias);
              })
            ).then(function () {
                $location.path(Session.getWorkspacePrefixUrl() + "/settings/sites");
              });
          }, handleSiteError);
        }
      };


      // ---------------- VISIT ANALYSER ----------------
      $scope.$on("mics-visit-analyser:selected", function (event, params) {
        if (params.visitAnalyser === null) {
          $scope.visitAnalyser  = undefined;
          $scope.site.visit_analyzer_model_id = null;
        } else {
          $scope.visitAnalyser = params.visitAnalyser;
          $scope.site.visit_analyzer_model_id = params.visitAnalyser.id;
        }
      });


    }
  ]);
});
