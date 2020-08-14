'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('cajas').factory('Cajas', ['$resource',
	function($resource) {
		return $resource('api/cajas/:cajaId', { cajaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('cajas').factory('CajasExtra', ['$http',
	function($http) {
		return {
			select: function(estado, enterprise) {
				return $http({
					method: "get",
					url: "/api/ventas/select",
					params: {
						e: enterprise,
						estado: estado
					}
				});
			},
			loadMoreByDate: function (enterprise, estado, startdate, enddate, cajaId) {
				return $http({
					method: "get",
					url: "/api/ventas/loadmoreByCaja_Date",
					params: {
						e: enterprise,
						start: startdate,
						end: enddate,
						caja: cajaId,						
						estado: estado
					}
				})
			}
		}
	}
]);
