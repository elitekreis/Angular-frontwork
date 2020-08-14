'use strict';

//Clients service used to communicate Clients REST endpoints
angular.module('clients').factory('Clients', ['$resource',
	function($resource) {
		return $resource('api/clients/:clientId', { clientId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);