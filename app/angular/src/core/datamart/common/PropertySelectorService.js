define(['./module'], function (module) {
  'use strict';

  module.factory('core/datamart/common/PropertySelectorService', [
    '$q', 'lodash', 'Restangular', '$log', 'core/common/auth/Session',
    function ($q, _, Restangular, $log, Session) {

      var service = {};
      var propertySelectors;

      service.getPropertySelectors = function(forceReload) {
        var deferred = $q.defer();

        if (!propertySelectors || forceReload) {
          var datamartId = Session.getCurrentDatamartId();
          Restangular.one('datamarts', datamartId).all('property_selectors').getList().then(function (result) {
            $log.debug("new property selectors : ", result);
            propertySelectors = result;
            deferred.resolve(propertySelectors);
          }, function error(reason) {
            deferred.reject(reason);
          });
        } else {
            deferred.resolve(propertySelectors);
        }

        return deferred.promise;
      };

      service.findPropertySelector = function(family, selectorName, familyParameter, selectorParameter, expression){
        return this.getPropertySelectors().then(function(selectors){
          return _.find(selectors, function(selector){
            return selector.selector_family === family &&
                   selector.family_parameters === (familyParameter ? familyParameter : null) &&
                   selector.selector_name === selectorName &&
                   selector.selector_parameters === (selectorParameter ? selectorParameter : null) &&
                   selector.expression === (expression ? expression : null);
          });
        });
      };

      service.findIndexPropertySelector = function(family, familyParameter){
        return this.findPropertySelector(family, "INDEX", familyParameter);
      };

      return service;
    }
  ]);
});
