'use strict';

//Ventas service used to communicate Ventas REST endpoints
angular.module('ventas').factory('Ventas', ['$resource',
	function($resource) {
		return $resource('api/ventas/:ventaId', { ventaId: '@_id', e: '@enterprise', w: '@filterDate.week', y: '@filterDate.year'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
