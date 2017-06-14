define(['./module'], function (module) {
  "use strict";

  module.factory('core/common/IabService', [
    'Restangular', '$log', function (Restangular) {
      var service = {};

      service.getAdSizes = function (creativeSubtype, organisationId) {
        return Restangular.one('reference_tables/formats').get({ organisation_id: organisationId })
          .then(function(formats) {
            var results = [];
            for (var i = 0; i < formats.length; ++i) {
              results.push(formats[i].width + "x" + formats[i].height);
            }
            return results;
          });
      };

      return service;
    }
  ]);
});
