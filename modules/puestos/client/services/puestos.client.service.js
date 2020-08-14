'use strict';

//Puestos service used to communicate Puestos REST endpoints
angular.module('puestos').factory('Puestos', ['$resource',
	function($resource) {
		return $resource('api/puestos/:puestoId', { puestoId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);