define(['./module'], function (module) {

    'use strict';

    module.directive('mcsQueryTool', [
        'Restangular', '$q', 'lodash', 'core/common/auth/Session',
        'core/datamart/queries/common/Common', '$uibModal', "async",
        'core/common/promiseUtils', '$log', 'core/datamart/queries/QueryContainer', 'core/datamart/queries/CriteriaContainer', 'moment', '$rootScope',
        'core/datamart/query/QueryService', 'core/datamart/common/PropertySelectorService','core/login/constants',
        function (Restangular, $q, lodash, Session, Common, $uibModal, async, promiseUtils, $log, QueryContainer, CriteriaContainer, moment, $rootScope, QueryService, PropertySelectorService,LoginConstants) {

            return {
                restrict: 'E',
                scope: {
                    // same as '=condition'
                    queryContainer: '=',
                    statisticsEnabled: '=',
                    selectedValuesEnabled: '='
                },
                link: function ($scope, element, attr) {

                    var queryContainer = $scope.queryContainer;
                    if (!queryContainer){
                      $scope.error = "Cannot load query-tool instance";
                      throw "Missing queryContainer";
                    }

                    var organisationId = Session.getCurrentWorkspace().organisation_id;

                    //dataTransfer hack : The jQuery event object does not have a dataTransfer property... true, but one can try:
                    angular.element.event.props.push('dataTransfer');

                    $scope.statistics = {total: 0, hasUserAccountId: 0, hasEmail: 0, hasCookie: 0};

                    var fetchPropertySelectors = function (forceReload) {
                        PropertySelectorService.getPropertySelectors(forceReload).then(function (result) {
                            $scope.criteriaContainer = CriteriaContainer.loadPropertySelectors(result);
                        });
                    };

                    fetchPropertySelectors();

                    $scope.propertySelectorOperators = Common.propertySelectorOperators;
                    $scope.propertySelectorExpressions = Common.propertySelectorExpressions;

                    var resultsTabSelected = false;

                    var reload = function () {
                        $scope.statsLoading = true;
                        var jsonQuery = queryContainer.prepareJsonQuery();
                        Restangular.one('datamarts', queryContainer.datamartId).customPOST(jsonQuery, 'query_executions').then(function (result) {
                            $scope.statistics.total = result.total;
                            $scope.statistics.hasEmail = result.total_with_email;
                            $scope.statistics.hasUserAccountId = result.total_with_user_account_id;
                            $scope.statistics.hasCookie = result.total_with_cookie;
                            $scope.statistics.executionTimeInMs = result.execution_time_in_ms;
                            $scope.statsError = null;
                            $scope.statsLoading = false;
                        }, function () {
                            $scope.statistics.total = 0;
                            $scope.statistics.hasEmail = 0;
                            $scope.statistics.hasUserAccountId = 0;
                            $scope.statistics.hasCookie = 0;
                            $scope.statistics.executionTimeInMs = 0;
                            $scope.statsError = "There was an error executing query";
                            $scope.statsLoading = false;
                        });

                        $scope.results = [];
                        $scope.resultsError = null;

                        if (resultsTabSelected && $scope.statistics.total !== 0 && $scope.queryContainer.selectedValues.length !== 0) {
                            $scope.resultsLoading = true;
                            Restangular.one('datamarts', queryContainer.datamartId).customPOST(jsonQuery, 'query_executions/result_preview').then(function (results) {
                                $scope.results = results;
                                $scope.resultsLoading = false;
                                $scope.resultsError = null;

                                $scope.families = Object.keys(results.metadata).sort();

                                $scope.selectedColumns = lodash.flatten(lodash.map($scope.families, function(family) {
                                    return results.metadata[family];
                                }));

                            }, function () {
                                $scope.resultsLoading = false;
                                $scope.resultsError = "There was an error retrieving results";
                            });
                        }
                    };

                    $scope.goToTimeline = function (userPointId) {
                        return "/#" + Session.getWorkspacePrefixUrl() + "/datamart/users/" + userPointId;
                    };

                    $scope.addGroup = function (queryContainer, $event) {
                        if ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                        }
                        queryContainer.addGroupContainer();
                    };

                    $scope.copyGroup = function (queryContainer, conditionGroupContainer) {
                        queryContainer.copyGroupContainer(conditionGroupContainer);
                    };
                    $scope.removeGroup = function (queryContainer, conditionGroupContainer) {
                        queryContainer.removeGroupContainer(conditionGroupContainer);
                    };

                    $scope.toggleExclude = function (conditionGroupContainer) {
                        conditionGroupContainer.toggleExclude();
                    };

                    $scope.removeCond = function (groupContainer, elementContainer, condition) {
                        elementContainer.removeCondition(condition);
                        if (elementContainer.conditions.length === 0){
                            groupContainer.removeElementContainer(elementContainer);
                        }
                    };

                    $scope.removeElem = function (conditionGroupContainer, elementContainer) {
                        conditionGroupContainer.removeElementContainer(elementContainer);
                    };

                    $scope.addElement = function (dragEl, dropEl, conditionGroupContainer) {

                        var drag = element.find('#' + dragEl);
                        var dragPropertySelectorId = drag.children('span').attr('id');
                        var propertySelector = $scope.criteriaContainer.findPropertySelector(dragPropertySelectorId);

                        $scope.$apply(function () {
                            conditionGroupContainer.createElementWithCondition(propertySelector.value);
                        });
                    };

                    $scope.addCondition = function (dragEl, dropEl, elementContainer) {

                        var drag = element.find('#' + dragEl);
                        var dragPropertySelectorId = drag.children('span').attr('id');
                        var propertySelector = $scope.criteriaContainer.findPropertySelector(dragPropertySelectorId);

                        $scope.$apply(function () {
                            elementContainer.createCondition(propertySelector.value);
                        });
                    };

                    $scope.addSelectedValue = function (dragEl, dropEl, queryContainer) {

                        var drag = element.find('#' + dragEl);
                        var dragPropertySelectorId = drag.children('span').attr('id');
                        var propertySelector = $scope.criteriaContainer.findPropertySelector(dragPropertySelectorId);

                        $scope.$apply(function () {
                            queryContainer.createSelectedValue(propertySelector.value);
                        });
                    };

                    $scope.addExpressionToSelectedValue = function (dragEl, dropEl, selectedValue) {

                        var drag = element.find('#' + dragEl);

                        var expressionName = drag.attr('name');
                        var dragExpression = lodash.find(Common.propertySelectorExpressions, function(element){
                          return element.name === expressionName;
                        });

                        $scope.$apply(function () {
                            selectedValue.addExpression(dragExpression);
                        });
                    };

                    $scope.removeSelectedValue = function (queryContainer, selectedValue) {
                        queryContainer.removeSelectedValue(selectedValue);
                        $scope.results = [];
                    };

                    $scope.resultsTabSelect = function(){
                        resultsTabSelected = true;
                        reload();
                    };

                    $scope.resultsTabDeselect = function(){
                        resultsTabSelected = false;
                    };

                    if ($scope.statisticsEnabled){
                        reload();
                    }

                    $scope.refreshQuery = function () {
                        reload();
                    };


                    var r = $rootScope.$on(LoginConstants.WORKSPACE_CHANGED, function (event, params) {
                        $log.info("reload property selectors");
                        fetchPropertySelectors(true);
                    });

                    $scope.$on('$destroy', function () {
                        $log.log("destroy");
                        r();
                    });


                    $scope.$on("mics-datamart-query:addProperty", function (event, params) {
                        fetchPropertySelectors(true);
                    });

                    element.bind("dragstart", function (ev) {
                      $scope.$apply(function () {
                        var dragElementDataFamily = ev.target.getAttribute("data-family");
                        if (dragElementDataFamily === "selector_expression"){
                          var expressionName = ev.target.getAttribute("name");
                          $scope.currentlyDraggedExpression = lodash.find(Common.propertySelectorExpressions, function(element){
                            return element.name === expressionName;
                          });
                          $scope.onGoingDragExpression = true;
                        } else {
                          $scope.onGoingDrag = true;
                          $scope.currentlyDraggedFamily = dragElementDataFamily;
                        }
                      });
                    });

                    element.bind("dragend", function (ev) {
                        $scope.$apply(function () {
                            var dragElementDataFamily = ev.target.getAttribute("data-family");
                            $scope.onGoingDrag = false;
                            $scope.onGoingDragExpression = false;
                            $scope.currentlyDraggedExpression = null;
                        });
                    });

                    $scope.familyMatchesForDrop = function(family) {
                        return family === $scope.currentlyDraggedFamily;
                    };

                    $scope.isExpressionApplicable = function(selectedValue) {
                        return QueryService.isExpressionApplicable(selectedValue, $scope.currentlyDraggedExpression);
                    };

                    $scope.addPropertySelector = function (family) {
                        var newScope = $scope.$new(true);
                        newScope.propertySelector = {
                            datamart_id: queryContainer.datamartId,
                            selector_family: family,
                            selector_name: 'CUSTOM_PROPERTY'
                        };
                        $uibModal.open({
                            templateUrl: 'src/core/datamart/queries/create-property-selector.html',
                            scope: newScope,
                            backdrop: 'static',
                            controller: 'core/datamart/queries/CreatePropertySelectorController'
                        });
                    };

                    $scope.toHumanReadableDuration = function (duration) {
                        return moment.duration(duration, 'ms').format("d [days] h [hours] m [minutes] s [seconds] S [ms]");
                    };

                    //TODO [later release] add dataEvaluationType (SCALAR/ARRAY/TABLE)
                    //to get rid of those if and constructor checks
                    $scope.displayValue = function (value, dataType) {
                        if (dataType === 'DATE'){
                            if (Array.isArray(value)){
                                return value.map(function (v){
                                  if (Array.isArray(v)){
                                    return v.map(function(w){
                                      return moment(w).format('DD/MM/YYYY');
                                    });
                                  }else{
                                    return moment(v).format('DD/MM/YYYY');
                                  }
                                });
                            } else {
                                return moment(value).format('DD/MM/YYYY');
                            }
                        }  else {
                            return value;
                        }
                    };
                    $scope.cleanupId = function (value) {
                      return value.replace( /(:|\.|\[|\]|,|\$)/g, "");
                    };

                    $scope.indexOptions = Common.indexOptions;

                },
                templateUrl: function (elem, attr) {
                    return 'src/core/datamart/queries/query-ui.html';
                }
            };
        }]);

    module.directive('mcsQueryCondition', [ 'core/datamart/queries/common/Common', 'core/datamart/query/QueryService', function (Common, QueryService) {
        return {
            restrict: 'E',
            scope: {
                // same as '=condition'
                condition: '='
            },
            controller: function ($scope) {
                $scope.operators = Common.propertySelectorOperators[$scope.condition.getSelectorValueType()];

                $scope.initConditionValue = function (condition){
                  if (condition.value.property_selector_value_type === "DATE"){
                    if (condition.value.operator === "BETWEEN"){
                      condition.value.value = {from:"", to:""};
                    } else {
                      condition.value.value = "";
                    }
                  }

                };
            },
            templateUrl: function (elem, attr) {
                return 'src/core/datamart/queries/condition.html';
            }
        };
    }]);

    module.directive('mcsQueryConditionValueTokenfield', function () {
        return {
            restrict: 'E',
            scope: {
                // same as '=condition'
                condition: '='
            },
            template: '<input type=\"search\" class=\"form-control tokenfield\" ng-model=\"tokens.values\">',
            link:function(scope, elem, attr){
                scope.tokens = {values:""};

                var tokenfieldInput = elem.find('.tokenfield');

                scope.$watch('tokens.values', function(newValue, oldValue){
                    if (oldValue){
                        var tokens = tokenfieldInput.tokenfield('getTokens');
                        scope.condition.value = tokens.map(
                            function(token){
                                return token.value;
                            }
                        );
                    }
                });

                tokenfieldInput.tokenfield({
                    tokens:scope.condition.value
                });

            }
        };
    });

    module.directive('mcsQueryConditionValueDateRange', [ 'moment',  function (moment) {
        return {
            restrict: 'E',
            scope: {
                // same as '=condition'
                condition: '='
            },
            templateUrl: 'src/core/datamart/queries/value-condition-type-date-range.html',
            link:function(scope, elem, attr){

                var fromDateInputField = elem.find('input[name="fromDateInputField"]');
                var toDateInputField = elem.find('input[name="toDateInputField"]');

                if (scope.condition.value.value.from && scope.condition.value.value.to){
                    scope.datefield = {
                        from:moment(scope.condition.value.value.from).format("L"),
                        to:moment(scope.condition.value.value.to).format("L")
                    };
                }else{
                    scope.datefield = {from:"",to:""};
                }


                fromDateInputField.daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    startDate: scope.datefield.from ? scope.datefield.from : moment(),
                    minDate: moment("1900-01-01"),
                    maxDate: moment().add(10,'y')
                });

                fromDateInputField.on('apply.daterangepicker', function(ev, picker) {
                    scope.condition.value.value.from = picker.startDate.startOf("day").format();
                });

                toDateInputField.daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    startDate: scope.datefield.to ? scope.datefield.to : moment(),
                    minDate: moment("1900-01-01"),
                    maxDate: moment().add(10,'y')
                });

                toDateInputField.on('apply.daterangepicker', function(ev, picker) {
                    scope.condition.value.value.to = picker.startDate.endOf("day").format();
                });
            }
        };
    }]);

    module.directive('mcsQueryConditionValueSimpleDate', [ 'moment',  function (moment) {
        return {
            restrict: 'E',
            scope: {
                // same as '=condition'
                condition: '='
            },
            templateUrl: 'src/core/datamart/queries/value-condition-type-date-simple.html',
            link:function(scope, elem, attr){

                var datefieldInput = elem.find('input[name="simpleDateInputField"]');

                if (scope.condition.value.value){
                    scope.datefield = {date:moment(scope.condition.value.value).format("L")};
                }else{
                    scope.datefield = {date:""};
                }

                datefieldInput.daterangepicker({
                    singleDatePicker: true,
                    showDropdowns: true,
                    startDate: scope.datefield.date ? scope.datefield.date : moment(),
                    minDate: moment("1900-01-01"),
                    maxDate: moment().add(10,'y')
                });

                datefieldInput.on('apply.daterangepicker', function(ev, picker) {
                    scope.condition.value.value = picker.startDate.startOf("day").format();
                });
            }
        };
    }]);

    module.directive('mcsQueryConditionValueRelativeDate', [ 'moment',  function (moment) {

        function updateCondition(scope){
            var isoPeriod = "P" + scope.relativeDateNumber + scope.relativeDateMagnitude;
            scope.condition.value.value = isoPeriod;
        }

        return {
            restrict: 'E',
            scope: {
                // same as '=condition'
                condition: '='
            },
            templateUrl: 'src/core/datamart/queries/value-condition-type-relative-date.html',
            link:function(scope, elem, attr){

                scope.magnitudes = [
                    {label:"days", letter:"D"},
                    {label:"months", letter:"M"},
                    {label:"years", letter:"Y"}
                ];

                if (scope.condition.value.value){
                    scope.relativeDateNumber = scope.condition.value.value.charAt(1);
                    scope.relativeDateMagnitude = scope.condition.value.value.charAt(2);
                } else {
                    scope.relativeDateNumber = "";
                    scope.relativeDateMagnitude = "";
                }


                scope.$watch('relativeDateNumber', function(newValue, oldValue){
                    updateCondition(scope);
                });

                scope.$watch('relativeDateMagnitude', function(newValue, oldValue){
                    updateCondition(scope);
                });

            }
        };
    }]);

    module.directive('mcsQueryReadOnlyView', [
      function () {

        return {
            restrict: 'E',
            scope: {
                queryContainer: '='
            },
            templateUrl: 'src/core/datamart/queries/query-readonly-view.html',
            link:function(scope, elem, attr){
              scope.selectedValuesEnabled = true;
            }
        };
    }]);

});
