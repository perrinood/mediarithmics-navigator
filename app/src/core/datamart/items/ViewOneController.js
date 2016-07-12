define(['./module'], function (module) {
  'use strict';

  module.controller('core/datamart/items/ViewOneController', [
    '$scope', '$stateParams', 'Restangular', 'core/datamart/common/Common', 'core/common/auth/Session',
    function ($scope, $stateParams, Restangular, Common, Session) {
      $scope.categoryUrl = '#/' + $stateParams.organisation_id + '/datamart/categories/' + $stateParams.catalogId;
      $scope.catalogToken = $stateParams.catalogToken;

      // pass datamartId from other controller
      var datamartId = Session.getCurrentDatamartId();
      Restangular.one('datamarts', datamartId).one('catalogs/token=' + $stateParams.catalogToken).one('items', $stateParams.itemId).get().then(function (item) {
        $scope.item = item;
      });

      // add languageMapping controls
      $scope.languageMapping = Common.languageMapping;
    }
  ]);
});
