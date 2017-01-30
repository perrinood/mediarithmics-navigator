define(['./module'], function (module) {
  'use strict';

  module.factory('core/datamart/query/QueryService', [
    '$q', 'lodash', 'Restangular', '$log', 'core/common/auth/Session', 'core/datamart/queries/common/Common',
    function ($q, _, Restangular, $log, Session, Common) {

      var service = {};

      service.getPropertySelectorDisplayName = function(selectorName, selectorParameter, selectorExpression, selectorLabel) {
        var name = selectorName;
        if (selectorParameter){
          if (selectorParameter.startsWith("[")){
            name = JSON.parse(selectorParameter).join(".");
          } else {
            name = selectorParameter;
          }
        }
        if (selectorExpression){
          name = name;
        }
        if (selectorLabel){
          name = selectorLabel;
        }
        return name;
      };

      service.getSelectorFamilyName = function(selectorFamily, familyParameter){
        if (selectorFamily === 'USER_EVENTS'){
          return service.getSelectorFamilyName(familyParameter);
        } else if (Common.familyLabels[selectorFamily]) {
          return Common.familyLabels[selectorFamily];
        } else {
          return selectorFamily;
        }
      };

      service.getPropertySelectorValueType = function(type, expression){
        if (expression && expression === 'COUNT'){
          //an expression applied to a selector (eg: count(items_viewed))
          //change type from LIST_OF_STRINGS to INTEGER
          return 'INTEGER';
        } else {
          return type;
        }
      };

      service.isExpressionApplicable = function(selectedValue, expression){
        return (expression && expression.applicableSelectorType.indexOf(selectedValue.value.value_type) !== -1 &&
            expression.applicableEvaluationType.indexOf(selectedValue.value.wrapper_evaluation_type) !== -1);
      };

      service.getIndexOptions = function(family, familyParameter){
        var self = this;
        var elementLabel = "";
        if (Common.elementLabels[family]){
          elementLabel = Common.elementLabels[family];
        } else if (Common.elementLabels[familyParameter]){
          elementLabel = Common.elementLabels[familyParameter];
        } else {
          elementLabel = familyParameter;
        }
        var options = Common.indexOptions.map(function(option){
          return {id:option.id, index:option.index, operator:option.operator, label:option.label.split(',')[0] + ' ' + elementLabel.toLowerCase() + (option.label.split(',')[1] ? option.label.split(',')[1] : "")};
        });
        return options;
      };

      return service;
    }
  ]);
});
