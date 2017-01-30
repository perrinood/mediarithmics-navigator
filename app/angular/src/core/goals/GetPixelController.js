define(['./module'], function (module) {

    'use strict';


    module.controller('core/goals/GetPixelController', [
        '$scope', '$uibModalInstance',
        function ($scope, $uibModalInstance) {
            
            $scope.close = function () {
                $uibModalInstance.close();
            };
        }

    ]);
});
