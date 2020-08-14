'use strict';

//Condicionventas service used to communicate Condicionventas REST endpoints
angular.module('condicionventas').factory('Condicionventas', ['$resource',
	function($resource) {

		console.log('condicionventas service ');

		return $resource('api/condicionventas/:condicionventaId', { condicionventaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('condicionventas').factory('CondicionventasExtra', ['$http',
	function($http) {
		return {
			loadMore: function (enterprise, name) {
				return $http({
					method: "get",
					url: "api/condicionventas/loadmore",
					params: {
						e: enterprise,
						name: name					
					}
				})
			}
		}
	}
]);



//Condicionventas service used to communicate Condicionventas REST endpoints
// angular.module('condicionventas').factory('Condicionventas', ['$resource',
// 	function($resource) {
// 		return $resource('api/condicionventas', { e: '@enterprise'
// 		}, {
// 			update: {
// 				method: 'PUT'
// 			}
// 		});
// 	}
// ]);