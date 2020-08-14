'use strict';

//Compras service used to communicate Compras REST endpoints
angular.module('compras').factory('Compras', ['$resource',
	function($resource) {
		return $resource('api/compras/:compraId', { compraId: '@_id', e: '@enterprise', i: '@product', w: '@filterDate.week', y: '@filterDate.year', estado: '@estado', p: '@p', pcount: '@pcount'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
