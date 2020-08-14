'use strict';

//Compras service used to communicate Compras REST endpoints
angular.module('historialCompras').factory('HistorialCompras', ['$resource',
	function($resource) {
		return $resource('api/historialCompras', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);