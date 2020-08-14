'use strict';

//Remuneraciones service used to communicate Remuneraciones REST endpoints
angular.module('remuneraciones').factory('Remuneraciones', ['$resource',
	function($resource) {
		return $resource('api/remuneraciones/:remuneracioneId', { remuneracioneId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);