define(['./module'], function (module) {

  'use strict';


  module.controller('core/datamart/partitions/ViewOneController', [
    '$scope', 'Restangular', 'core/common/auth/Session', '$stateParams', '$q',
    function ($scope, Restangular, Session, $stateParams, $q) {
      var partitionId = $stateParams.partition_id;
      var datamartId = Session.getCurrentDatamartId();

      var segments = [];

      $q.all([
        Restangular.one('audience_partitions', partitionId).get(),
        Restangular.all('audience_segments').getList({ datamart_id: datamartId, audience_partition_id: partitionId})
      ]).then(function (res) {
        var partition = res[0];
        segments = res[1];

        $scope.partition = partition;
        $scope.segments = segments;

      });

    }    
  ]);
});

