define(['./module'], function (module) {
  'use strict';

  module.directive('mcsBidOptimizerFeaturesContributionReport', [
    'Restangular', 'moment',
    function (Restangular, moment) {
      return {
        restrict: 'E',
        scope: {
          report: '='
        },
        link: function link(scope, element, attrs) {

          scope.$watch('report', function (newVal) {
            if (newVal) {

              scope.minSize = 8;
              scope.maxSize = 30;

              scope.featuresContribution = scope.report.$features_contribution.sort(function (feat1, feat2) {
                return feat2.$contribution - feat1.$contribution;
              });

              var maxContribution = -1;

              for (var idxFeatureContribution in scope.featuresContribution) {
                var featureContribution = scope.featuresContribution[idxFeatureContribution];
                for (var idxCategoriesContribution in featureContribution.$categories_contributions) {
                  var categoriesContribution = featureContribution.$categories_contributions[idxCategoriesContribution];
                  maxContribution = Math.max(maxContribution, Math.abs(categoriesContribution.$weight));
                }
              }

              scope.getRadius = function (weight) {
                var radius = scope.maxSize * Math.abs(parseFloat(weight)) / maxContribution;
                var tmpSize = Math.max(radius, scope.minSize);
                return Math.ceil(Math.min(tmpSize, scope.maxSize));
              };

              scope.getColor = function (weight) {
                if (parseFloat(weight) < 0) {
                  return "#FE5858";
                }
                else {
                  return "#00AC67";
                }
              };

            }
          }, true);
        },

        templateUrl: 'angular/src/core/bidOptimizer/reports/view.report.features-contribution.html'
      };

    }]);

});
