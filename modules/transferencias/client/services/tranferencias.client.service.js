'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('transferencias').factory('Transferencias', ['$resource',
	function($resource) {
		return $resource('api/transferencias/:transferenciaId', { transferenciaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
angular.module('transferencias').factory('TransferenciasExtra', ['$http',
	function($http) {
		return {			
			loadMore: function (enterprise, pagina, limit, cajaId) {
				return $http({
					method: "get",
					url: "/api/transferencias/loadmorebycaja",
					params: {
						e: enterprise,					
						caja: cajaId,						
						pagina: pagina,
						limit: limit
					}
				})
			},
			loadMoreByDate: function (enterprise, startdate, enddate, cajaId) {
				return $http({
					method: "get",
					url: "/api/transferencias/loadmorebycaja_date",
					params: {
						e: enterprise,					
						caja: cajaId,						
						start: startdate,
						end: enddate
					}
				})
			}

		}
	}
]);