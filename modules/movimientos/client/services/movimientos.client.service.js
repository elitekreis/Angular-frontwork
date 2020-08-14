'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('movimientos').factory('Movimientos', ['$resource',
	function($resource) {
		return $resource('api/movimientos/:movimientoId', { movimientoId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('movimientos').factory('MovimientosExtra', ['$http',
	function($http) {
		return {			
			loadMore: function (enterprise, estado, cajaId, last, limit) {
				return $http({
					method: "get",
					url: "/api/movimientos/loadmore",
					params: {
						e: enterprise,					
						cajaid: cajaId,						
						estado: estado,
						p: last,
						limit: limit
					}
				})
			},
			loadMoreByDate: function (enterprise, estado, cajaId, startdate, enddate) {
				return $http({
					method: "get",
					url: "/api/movimientos/loadmorebydate",
					params: {
						e: enterprise,					
						cajaid: cajaId,						
						estado: estado,
						start: startdate,
						end: enddate
					}
				})
			}
		}
	}
]);