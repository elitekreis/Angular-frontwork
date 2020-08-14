'use strict';

//Taxconditions service used to communicate Taxconditions REST endpoints
angular.module('taxconditions').factory('Taxconditions', ['$resource',
	function($resource) {
		return $resource('api/taxconditions/:taxconditionId', { taxconditionId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);