'use strict';

angular.module('stocks').factory('StockFactory', [ '$http',
	function($http) {
		// Stock factory service logic
		// ...

		// Public API
		return {
			getStockOrdersForProduct: function (productID, enterpriseID) {
				console.log('productID: ' + productID + ' enterpriseID: ' + enterpriseID );
		         if(productID && enterpriseID){
		        	return $http({
			            url: '/api/stocks/orders/' + productID,
			            method: 'GET',
			            params: {e: enterpriseID},
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