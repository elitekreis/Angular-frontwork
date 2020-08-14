'use strict';

// Comprobantes controller
angular.module('remuneraciones').controller('RemuneracioneEditController', ['$state', '$scope', 'user', 'remuneracione', 'categories',
	function($state, $scope, user, remuneracione, categories) {		
		$scope.remuneracione = remuneracione;
		$scope.categories = categories;
		$scope.units = ["U", "Hs"];

		$scope.update = function() {
			var updatedRemuneracione = $scope.remuneracione;

            if ($scope.category !== undefined) {
                updatedRemuneracione.category = $scope.category._id;
			}

            if ($scope.unit !== undefined) {
                updatedRemuneracione.unit = $scope.unit;
            }

            updatedRemuneracione.$update(function() {
                $state.go('home.remuneraciones')
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
	}
]);
