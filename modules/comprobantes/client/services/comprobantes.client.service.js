'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('comprobantes').factory('Comprobantes', ['$resource',
	function($resource) {
		return $resource('api/comprobantes/:comprobanteId', { comprobanteId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
