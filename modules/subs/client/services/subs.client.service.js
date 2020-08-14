'use strict';

//Subs service used to communicate Subs REST endpoints
angular.module('subs').factory('Subs', ['$resource',
	function($resource) {
		return $resource('api/subs/:subId', { subId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);