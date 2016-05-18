define(['./module'], function (module) {

  'use strict';

  module.factory('core/datamart/queries/common/Common', function() {

      /* Note about operators :
          Operators are applied on condition's value
          Operators depend on the selector's type (STRING, INTEGER, ....)
          Selector's type do NOT reflect the condition's value type
          From the GUI point of view, condition's value type is ALWAYS a string
      */
      var propertySelectorOperators = {
        "STRING": [
          {operator:"EQUAL", label:"is"},
          {operator:"NOT_EQUAL", label:"is not"},
          {operator:"CONTAINS", label:"contains"},
          {operator:"NOT_CONTAINS", label:"doesn't contain"},
          {operator:"START_WITH", label:"starts with"},
          {operator:"NOT_START_WITH", label:"doesn't start with"},
          {operator:"IS_EMPTY", label:"is empty"},
          {operator:"IS_NOT_EMPTY", label:"is not empty"},
          {operator:"MATCH", label:"matches"},
          {operator:"NOT_MATCH", label:"doesn't match"}],
        "TEXT": [
          {operator:"EQUAL", label:"is"},
          {operator:"NOT_EQUAL", label:"is not"},
          {operator:"CONTAINS", label:"contains"},
          {operator:"NOT_CONTAINS", label:"doesn't contain"},
          {operator:"START_WITH", label:"starts with"},
          {operator:"NOT_START_WITH", label:"doesn't start with"},
          {operator:"IS_EMPTY", label:"is empty"},
          {operator:"IS_NOT_EMPTY", label:"is not empty"}],
        "LIST_OF_STRING": [
          {operator:"CONTAINS", label:"contains"},
          {operator:"NOT_CONTAINS", label:"doesn't contain"},
          {operator:"START_WITH", label:"starts with"},
          {operator:"NOT_START_WITH", label:"doesn't start with"},
          {operator:"IS_EMPTY", label:"is empty"},
          {operator:"IS_NOT_EMPTY", label:"is not empty"},
          {operator:"IN", label:"in"},
          {operator:"NOT_IN", label:"not in"}],
        "INTEGER": [
          {operator:"EQUAL", label:"="},
          {operator:"NOT_EQUAL", label:"!="},
          {operator:"GT", label:">"},
          {operator:"GTE", label:">="},
          {operator:"LT", label:"<"},
          {operator:"LTE", label:"<="}],
        "DOUBLE": [
          {operator:"EQUAL", label:"="},
          {operator:"NOT_EQUAL", label:"!="},
          {operator:"GT", label:">"},
          {operator:"GTE", label:">="},
          {operator:"LT", label:"<"},
          {operator:"LTE", label:"<="}],
        "LONG": [
          {operator:"EQUAL", label:"="},
          {operator:"NOT_EQUAL", label:"!="},
          {operator:"GT", label:">"},
          {operator:"GTE", label:">="},
          {operator:"LT", label:"<"},
          {operator:"LTE", label:"<="}],
        "DATE": [
          {operator:"EQUAL", label:"is"},
          {operator:"GT", label:"after"},
          {operator:"GTE", label:"after or equal"},
          {operator:"LT", label:"before"},
          {operator:"LTE", label:"before or equal"},
          {operator:"RELATIVE_GT", label:"more than"},
          {operator:"RELATIVE_LT", label:"less than"},
          {operator:"BETWEEN", label:"between date"}],
        "BOOLEAN": [
          {operator:"EQUAL", label:"is"},
          {operator:"NOT_EQUAL", label:"not"}]
      };

      var familyLabels = { USER_PROFILE:"Profile", USER_VISITS:"Visits" ,
                           USER_CONVERSIONS:"Conversions", USER_DEVICES:"Devices",
                           USER_SEGMENTS:"Segments", USER_EMAILS:"Emails",
                           USER_TOUCHES:"Touches", USER_EMAIL_ADDRESSES:"Email Addresses",
                           "$product_view":"Product views",
                           "$product_list_view":"Product list views"};
      var elementLabels = { USER_PROFILE:"Profile", USER_VISITS:"Visit" ,
                            USER_CONVERSIONS:"Conversion", USER_DEVICES:"Device",
                            USER_SEGMENTS:"Segment", USER_EMAILS:"Email",
                            USER_TOUCHES:"Touch", USER_EMAIL_ADDRESSES:"Email Address",
                            "$product_view":"Product view",
                            "$product_list_view":"Product list view"};

      var propertySelectorExpressions = [
        {name:"MAX", applicableSelectorType:["INTEGER","DOUBLE","LONG"], applicableEvaluationType:["ARRAY","TABLE"]},
        {name:"MIN", applicableSelectorType:["INTEGER","DOUBLE","LONG"], applicableEvaluationType:["ARRAY","TABLE"]},
        {name:"SUM", applicableSelectorType:["INTEGER","DOUBLE","LONG"], applicableEvaluationType:["ARRAY","TABLE"]},
        {name:"AVERAGE", applicableSelectorType:["INTEGER","DOUBLE","LONG"], applicableEvaluationType:["ARRAY","TABLE"]},
        {name:"COUNT", applicableSelectorType:["INTEGER","DOUBLE","LONG"], applicableEvaluationType:["ARRAY","TABLE"]},
        {name:"OLDEST", applicableSelectorType:["INTEGER","DOUBLE","LONG","STRING","DATE","BOOLEAN"], applicableEvaluationType:["ARRAY","TABLE"]},
        {name:"NEWEST", applicableSelectorType:["INTEGER","DOUBLE","LONG","STRING","DATE","BOOLEAN"], applicableEvaluationType:["ARRAY","TABLE"]}
      ];

      var familyWithIndex = ["USER_VISITS","USER_EVENTS","USER_EMAILS","USER_CONVERSIONS", "USER_TOUCHES"];

      var indexOptions = [
        {id:"0", index:-1, operator:"", label:"Any,s"},
        {id:"1", index:0, operator:"EQUAL", label:"In the last"},
        {id:"2", index:1, operator:"EQUAL", label:"In the next to last"},
        {id:"3", index:1, operator:"LTE", label:"Among the last 2,s"},
        {id:"4", index:2, operator:"LTE", label:"Among the last 3,s"}
      ];

      return { propertySelectorOperators: propertySelectorOperators,
        familyLabels: familyLabels,
        elementLabels:elementLabels,
        propertySelectorExpressions:propertySelectorExpressions,
        indexOptions: indexOptions,
        familyWithIndex: familyWithIndex};
    }
  );

});
