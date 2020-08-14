'use strict';

//Costcenters service used to communicate Costcenters REST endpoints
angular.module('costcenters').factory('Costcenters', ['$resource',
	function($resource) {
		return $resource('api/costcenters/:costcenterId', { costcenterId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);