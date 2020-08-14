'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('arqueos').factory('Arqueos', ['$resource',
	function($resource) {
		return $resource('api/arqueos/:arqueoId', { arqueoId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);


angular.module('arqueos').factory('ArqueosExtra', ['$http',
	function($http) {
		return {			
			loadMore: function (enterprise, last, limit, cajaId) {
				return $http({
					method: "get",
					url: "/api/arqueos/loadmoreByCaja",
					params: {
						e: enterprise,
						p: last,
						limit: limit,
						caja: cajaId
					}
				})
			},
			loadMoreByDate: function (enterprise, startdate, enddate, cajaId) {
				return $http({
					method: "get",
					url: "/api/arqueos/loadmoreByCaja_Date",
					params: {
						e: enterprise,						
						start: startdate,
						end: enddate,
						caja: cajaId
					}
				})
			}
		}
	}
]);
