'use strict';

//Categories service used to communicate Categories REST endpoints
angular.module('impuestos').factory('Impuestos', ['$resource', '$http',
    function($resource, $http) {
        return $resource('api/impuestos/:impuestoId', {
            impuestoId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]).factory('ImpuestosTax', ['$http',
    function($http) {
        return {

            loadMoreImpuestos: function(impuesto, last, limit, year, month,iva,ivaVentas,ivaCompras) {
                return $http({
                    method: "get",
                    url: "/api/impuestos/ajustar",
                    params: {
                        impuestoId: impuesto,
                        last: last,
                        limit: limit,
                        year: year,
                        month: month,
                        IVA: iva,
                        ivaVentas: ivaVentas,
                        ivaCompras: ivaCompras,

                    }
                })
            }
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
]);