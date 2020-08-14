'use strict';

//Products service used to communicate Products REST endpoints
angular.module('products').factory('Products', ['$resource',
	function($resource) {
		return $resource('api/products/:productId', { productId: '@_id', e: '@enterprise', c: '@categoryOfPrice'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);