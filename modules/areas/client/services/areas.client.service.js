'use strict';

//Areas service used to communicate Areas REST endpoints
angular.module('areas').factory('Areas', ['$resource',
	function($resource) {
		return $resource('api/areas/:areaId', { areaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

