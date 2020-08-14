'use strict';

//Liquidaciones service used to communicate Liquidaciones REST endpoints
angular.module('liquidaciones').factory('Liquidaciones', ['$resource',
	function($resource) {
		return $resource('api/liquidaciones/:liquidacionId', { liquidacionId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);