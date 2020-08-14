'use strict';

//Entregas service used to communicate Entregas REST endpoints
angular.module('entregas').factory('Entregas', ['$resource',
	function($resource) {
		return $resource('api/entregas/:entregaId', { entregaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('entregas').factory('ClientsLocation', [ '$http',
	function($http) {
		// Stock factory service logic
		// ...

		// Public API
		return {
			getClientsByLocation: function (location, enterpriseID) {
		         if(location && enterpriseID){
		         	if(location !== null || location !== undefined)
		        	return $http({
			            url: '/api/clients/bylocation',
			            method: 'GET',
			            params: {e: enterpriseID, p: location},
			            headers: {},
			            data: {}
			        }).success(function(data){
			        	//OK
			            }
			        ).error(function(data){
						// FUCK!
			            });
		        } else {
		            return [];
		        }
	     	}
		};
	}
]);