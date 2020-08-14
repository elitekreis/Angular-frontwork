'use strict';

//Categories service used to communicate Categories REST endpoints
angular.module('categories').factory('Categories', ['$resource',
	function($resource) {
		return $resource('api/categories/:categoryId', { categoryId: '@_id', e: '@enterprise', type1: '@type1'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);