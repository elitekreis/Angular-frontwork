'use strict';

//Procesos service used to communicate Procesos REST endpoints
angular.module('procesos').factory('Procesos', ['$resource',
	function($resource) {
		return $resource('api/procesos/:procesoId', { procesoId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);