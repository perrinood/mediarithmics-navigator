define(['./module'], function (module) {

    'use strict';

    module.controller('core/datamart/queries/CreatePropertySelectorController', [
        '$scope', '$uibModalInstance', 'Restangular', 'core/common/auth/Session', 'core/datamart/queries/common/Common',

        function ($scope, $uibModalInstance, Restangular, Session, Common) {

            $scope.propertyTypes = Object.keys(Common.propertySelectorOperators);

            $scope.cancel = function() {
                $uibModalInstance.close();
            };

            $scope.done = function() {
                Restangular.one('datamarts', $scope.propertySelector.datamart_id).all('property_selectors').post($scope.propertySelector).then(function() {
                    $scope.$emit("mics-datamart-query:addProperty");
                    $uibModalInstance.close();
                }, function() {
                    $scope.error = "There was an error saving property";
                });
            };
        }
    ]);

});
