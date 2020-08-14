// Pagos service used to communicate Pagos REST endpoints
(function () {
  'use strict';

  angular
    .module('pagos')
    .factory('PagosService', PagosService);

  PagosService.$inject = ['$resource'];

  function PagosService($resource) {
    return $resource('api/pagos/:pagoId', {
      pagoId: '@_id', e: '@enterprise'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
angular.module('pagos').factory('LastMonthTotal', ['$http',
  function($http) {
    return {
      costosLastMonthTotal: function(controId) {
        console.log("costor id "+controId);
        return $http({
          method: "get",
          url: "api/pagos/getCostoLastMonthTotal",
          params:{
            controId:controId
          }
        });
      },
      serviciosLastMonthTotal: function() {
        return $http({
          method: "get",
          url: "api/pagos/getServiciosLastMonthTotal",
        });
      },
    }
  }
]).factory('ServiceNavigation', ['$location',
  function($location) {
    var inneNavList = [];
    return {
      addNav : function(navObj) { 
        if(inneNavList.length > 0) {      
          var elempos = inneNavList.map(function(x){return x.name}).indexOf(navObj.name);
          if(elempos === -1)
            inneNavList.push(navObj);
        } else {
          inneNavList.push(navObj);
        }         
          
        window.localStorage.setItem("subNav",JSON.stringify(inneNavList));              
      },
      getNav : function() {        
        return (inneNavList.length > 0 ) ? inneNavList : JSON.parse(window.localStorage.getItem("subNav"));
      },
      navInit: function(val){      
        inneNavList.splice(0);   
        window.localStorage.removeItem("subNav");
      },
      back: function() {        
        if(window.localStorage.getItem("subNav")){
          inneNavList = JSON.parse(window.localStorage.getItem("subNav"))
          window.localStorage.removeItem("subNav");
        }      
        inneNavList.splice(inneNavList.length - 1, 1);
        window.localStorage.setItem("subNav",JSON.stringify(inneNavList)); 
      }
    }
  }
]).factory('PagosExtra', ['$http',
	function($http) {
		return {			
			loadMoreByCaja: function (enterprise, last, pagina, limit, cajaId) {
				return $http({
					method: "get",
					url: "/api/pagos/loadmorebycaja",
					params: {
						e: enterprise,					
						caja: cajaId,												
						p: last,
            limit: limit,
            pagina: pagina
					}
				})
      },
      loadMoreByCajaDate: function (enterprise, startdate, enddate, cajaId) {
				return $http({
					method: "get",
					url: "/api/pagos/loadmorebycaja_date",
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