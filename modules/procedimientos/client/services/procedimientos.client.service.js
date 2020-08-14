'use strict';

//Procesos service used to communicate Procesos REST endpoints
angular.module('procedimientos').factory('Procedimientos', ['$resource',
	function($resource) {
		return $resource('api/procedimientos/:procedimientoId', { procedimientoId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);