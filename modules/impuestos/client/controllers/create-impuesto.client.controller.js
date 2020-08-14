'use strict';

// Create Impuesto controller
angular.module('impuestos').controller('ImpuestosCreateController', ['$state', '$scope', '$stateParams', 'Impuestos',
    function ($state, $scope, $stateParams, Impuestos) {


        $scope.resetCoefficient = function resetCoefficient() {
            if(!$scope.type) {
                $scope.coefficient = undefined;
                $scope.automaticoType = undefined;
            }
        };

        // Create new impuesto
        $scope.create = function create() {
            var impuesto = new Impuestos({
                name: $scope.name,
                descripcion: $scope.descripcion ? $scope.descripcion : undefined,
                total: 0.0,
                coefficient: $scope.coefficient,
                type: $scope.type,
                automaticoType: $scope.automaticoType,
                centroDeCosto: $stateParams.centroDeCosto,
                month: (new Date()).getMonth(),
                year: (new Date()).getFullYear()
            });

            // Redirect after save
            impuesto.$save(function (response) {
                if (response._id) {
                    $state.go('home.viewImpuesto', {centroDeCosto: $stateParams.centroDeCosto});
                }
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        }
    }]);

