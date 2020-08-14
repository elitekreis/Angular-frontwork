'use strict';

//actividades service used to communicate Actividades REST endpoints
angular.module('actividades').factory('Actividades', ['$resource',
	function($resource) {
		return $resource('api/actividades/:actividadId', { liquidacionId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);