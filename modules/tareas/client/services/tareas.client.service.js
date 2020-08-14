'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('tareas').factory('Tareas', ['$resource',
	function($resource) {
		return $resource('api/tareas/:tareaId', {
			tareaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
