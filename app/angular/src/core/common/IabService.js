define(['./module'], function (module) {
  "use strict";

  module.factory('core/common/IabService', [
    'Restangular', '$log', function (Restangular) {
      const service = {};

      service.getAdSizes = function (creativeSubtype, organisationId) {
        return Restangular.one('reference_tables/formats').get({ organisation_id: organisationId })
          .then((formats) => {
            let results = [];
            for (let i = 0; i < formats.length; ++i) {
              results.push({ id: formats[i].id, format: formats[i].width + "x" + formats[i].height });
            }
            return results;
          });
      };

      return service;
    }
  ]);
});
