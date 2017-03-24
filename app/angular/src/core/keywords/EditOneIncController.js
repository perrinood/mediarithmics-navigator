define(['./module'], function (module) {

  'use strict';


  module.controller('core/keywords/EditOneIncController', [
    '$scope', '$log', 'Restangular', 'core/common/auth/Session', 'lodash', '$uibModal',
    function($scope, $log, Restangular, Session, _, $uibModal) {
      var organisationId = Session.getCurrentWorkspace().organisation_id;

      // $scope.keywordsList is a KeywordListContainer

      $scope.newPositiveKeywordExpression = {
        expression : ""
      };
      $scope.newNegativeKeywordExpression = {
        expression : ""
      };

      $scope.statsLoading = false;

      $scope.negativeExpressionsFilter = function (expression) {
        return expression.exclude === true;
      };

      $scope.positiveExpressionsFilter = function (expression) {
        return expression.exclude === false;
      };

      $scope.refreshStats = function () {
        var positiveExpressions = _.filter($scope.keywordsList.keywordExpressions, $scope.positiveExpressionsFilter);
        var negativeExpressions = _.filter($scope.keywordsList.keywordExpressions, $scope.negativeExpressionsFilter);

        $scope.statsLoading = true;
        Restangular.all('keyword_lists').all('statistics').post({
          positive_expressions:_.pluck(positiveExpressions, 'expression'),
          negative_expressions:_.pluck(negativeExpressions, 'expression')
        },{organisation_id:organisationId})
        .then(function (stats) {
          $scope.stats = stats;
          $scope.statsLoading = false;
        });
        return false;
      };

      $scope.doNothing = function ($event) {
        $event.preventDefault();
      };

      $scope.addKeywordExpression = function (kw, newKeywordExpression, type) {
        if (kw.addExpression(newKeywordExpression.expression, type)) {
          newKeywordExpression.expression = "";
        }
      };

      $scope.removeKeywordExpression = function(kw, keywordExpression) {
        kw.removeExpression(keywordExpression.expression, keywordExpression.exclude);
      };

      $scope.importKeywordExpressions = function (kw, typeStr) {
        var childScope = $scope.$new(true);
        childScope.type = typeStr;
        $uibModal.open({
          templateUrl: 'angular/src/core/keywords/ImportList.html',
          scope : childScope,
          backdrop : 'static',
          controller: 'core/keywords/ImportListController',
          size: "lg"
        });
      };

      $scope.$on("mics-keywords-list:import", function (event, data) {
        var exclude = data.type === "exclude";
        if (data.deleteExisting) {
          $scope.keywordsList.removeAllExpressions(exclude);
        }
        for(var i = 0; i < data.keywords.length; i++) {
          $scope.keywordsList.addExpression(data.keywords[i], exclude);
        }

      });
    }
  ]);
});
