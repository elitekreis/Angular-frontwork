'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('api/users', { e: '@enterprise'}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
angular.module('users').factory('ChangeStatusUserById', ['$resource',
	function($resource) {
		return $resource('/api/users/changeStatus', { userId: '@_id', estado: '@_estado'}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
angular.module('users').factory('FindUserById', ['$resource',
	function($resource) {
		return $resource('/api/users/byId', { userId: '@_id'}, { 
			update: {
				method: 'PUT'
			}
		});
	}
]);
