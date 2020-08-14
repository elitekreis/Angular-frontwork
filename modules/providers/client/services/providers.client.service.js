'use strict';

//Providers service used to communicate Providers REST endpoints
angular.module('providers').factory('Providers', ['$resource',
	function($resource) {
		return $resource('api/providers/:providerId', { providerId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);