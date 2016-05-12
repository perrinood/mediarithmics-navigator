define(['./module'], function(module) {

  'use strict';

  module.directive('mcsEventRules', ['$log', '$location', '$state', '$stateParams', '$uibModal', '$filter', '$q', 'core/common/auth/Session', 'lodash',
    'core/common/ErrorService', 'core/common/WarningService',
    function($log, $location, $state, $stateParams, $uibModal, $filter, $q, Session, _, ErrorService, WarningService) {


      return {
        restrict: 'E',
        scope: {
          rules: '=',

        },
        link: function link(scope, element, attrs) {
          var datamartId = Session.getCurrentDatamartId();
          var organisationId = Session.getCurrentWorkspace().organisation_id;
          scope.rulesPerPage = 20;
          scope.rulesCurrentPage = 0;

          scope.ruleEditMode = false;
          scope.ruleCreationMode = false;
          scope.ruleTypes = {
            CATALOG_AUTO_MATCH: "Catalog Auto Match",
            USER_ACCOUNT_ID_INSERTION: "User Account Id Creation",
            URL_MATCH: "Url Match",
            PROPERTY_TO_ORIGIN_COPY: "Property To Origin Copy"
          };
          scope.autoMatchTypes = {
            CATEGORY: "Category",
            PRODUCT: "Product",
            PRODUCT_AND_CATEGORY: "Product And Category"
          };
          scope.hashFunctions = ["SHA_256", "MD5", "NO_HASH"];
          scope.originPropertySources = ["URL", "EVENT_PROPERTY", "REFERRER"];


          /**
           * Watchers
           */

          scope.filteredEventRules = function() {
            return $filter('filter')(scope.rules, scope.filteredRule);
          };

          scope.$watch('filteredRule', function(rule) {
            if (rule) {
              scope.selectedRule = undefined;
            }
          });




          // -------------- RULES ------------------

          function resetRuleEdit() {
            if (scope.ruleCreationMode) {
              scope.selectedRule = undefined;
              scope.tmpRule = undefined;
              scope.tmpRuleProperties = undefined;
            } else {
              scope.tmpRule = angular.extend({}, scope.selectedRule);
              scope.tmpRuleProperties = scope.tmpRule.event_template ? scope.tmpRule.event_template.$properties : undefined;
            }
          }
          scope.showDetails = function(rule) {
            scope.cancelRuleEdit();
            scope.selectedRule = rule;
            scope.tmpRule = angular.extend({}, rule);
            scope.tmpRuleProperties = scope.tmpRule.event_template ? scope.tmpRule.event_template.$properties : undefined;
          };

          scope.newRule = function(type) {
            scope.ruleCreationMode = true;
            scope.ruleEditMode = true;
            resetRuleEdit();
            if (type === "CATALOG_AUTO_MATCH") {
              scope.tmpRule = {
                type: type,
                auto_match_type: "CATEGORY"
              };
            } else if (type === "USER_ACCOUNT_ID_INSERTION") {
              scope.tmpRule = {
                type: type,
                hash_function: scope.hashFunctions[0],
                remove_source: 'false',
                to_lower_case: 'false'
              };
            } else if (type === "URL_MATCH") {
              scope.tmpRule = {
                type: type,
                event_template: {
                  $event_name: "",
                  $properties: {}
                },
                pattern: ""
              };
              scope.tmpRuleProperties = scope.tmpRule.event_template.$properties;
            } else if (type === "PROPERTY_TO_ORIGIN_COPY") {
              scope.tmpRule = {
                type: type,
                property_name: "",
                property_source: scope.originPropertySources[0],
                destination: ""
              };
            }
            scope.selectedRule = scope.tmpRule;
          };

          scope.editRule = function() {
            scope.ruleEditMode = true;
            scope.tmpRule = angular.extend({}, scope.selectedRule);
            scope.tmpRuleProperties = scope.tmpRule.event_template.$properties;
          };

          scope.removeRule = function(rule) {
            var idx = scope.rules.indexOf(rule);
            if (idx !== -1) {
              scope.rules.splice(idx, 1);
            }
            scope.selectedRule = undefined;
          };

          scope.shortenString = function(str, length) {
            if (str === undefined) {
              return "";
            }
            if (str.length > length) {
              return str.substring(0, length) + "...";
            }
            return str;
          };

          scope.getSummary = function(rule) {
            if (rule === undefined) {
              return "";
            }
            var str = "";
            switch (rule.type) {
              case "CATALOG_AUTO_MATCH":
                if (rule.auto_match_type === undefined) {
                  return "";
                }
                return scope.autoMatchTypes[rule.auto_match_type];
              case "USER_ACCOUNT_ID_INSERTION":
                str = scope.shortenString(rule.property_source, 25);
                return "Property " + str + " is hashed to " + rule.hash_function;
              case "URL_MATCH":
                str = scope.shortenString(rule.pattern, 25);
                return "Matches " + str;
              case "PROPERTY_TO_ORIGIN_COPY":
                str = scope.shortenString(rule.property_name, 25);
                return "Property " + str + " in" + rule.property_source + "is copied to " + rule.destination;

            }
          };

          scope.cancelRuleEdit = function() {
            resetRuleEdit();
            scope.ruleCreationMode = false;
            scope.ruleEditMode = false;
          };

          scope.confirmRuleEdit = function() {
            if (scope.ruleCreationMode) {
              scope.ruleCreationMode = false;
              scope.rules.push(scope.tmpRule);
            }
            scope.ruleEditMode = false;
            Object.keys(scope.selectedRule).map(function(a) {
              if (a in scope.tmpRule) {
                scope.selectedRule[a] = scope.tmpRule[a];
              }
            });
          };


          // Auto Match Rule
          scope.newEventTemplateProperty = function() {
            $uibModal.open({
              templateUrl: 'src/core/settings/eventrules/create.event-template-property.html',
              backdrop: 'static',
              controller: 'core/settings/eventrules/CreateEventTemplatePropertyController',
              size: 'md',
              resolve: {
                properties: function() {
                  return scope.tmpRule.event_template.$properties;
                }
              }
            }).result.then(function(prop) {
              if (scope.tmpRule.event_template.$properties[prop.key] !== undefined) {
                WarningService.showWarningModal("This property has already been defined. ");
              } else {
                scope.tmpRule.event_template.$properties[prop.key] = prop.value;
              }
            });
          };

          scope.removeEventTemplateProperty = function(key) {
            delete scope.tmpRule.event_template.$properties[key];
          };


        },
        templateUrl: 'src/core/settings/eventrules/event-rules.html'
      };

    }
  ]);


});