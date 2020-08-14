'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('reportes').factory('Reportes', ['$resource',
	function($resource) {
		return $resource('api/reportes/:reporteId', { reporteId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
