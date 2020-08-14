'use strict';

//Enterprises service used to communicate Enterprises REST endpoints
angular.module('enterprises').factory('Enterprises', ['$resource',
	function($resource) {
		return $resource('api/enterprises/:enterpriseId', { enterpriseId: '@_id'/*, e: '@enterprise'*/
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
