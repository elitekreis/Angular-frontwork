'use strict';

angular.module('products').factory('Metrics', [
	function() {
		// Metrics service logic
		// ...

		// Public API
		return {
			query: function() {
				return [ 'Bultos','Cajas','Cajones','Cm3','Grs', 'Horas', 'Kg','Latas','Litros','Ml','Mts2','U.'];
			}
		};
	}
]);