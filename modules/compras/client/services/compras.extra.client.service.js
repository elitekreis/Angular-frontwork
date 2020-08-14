'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('compras').factory('ComprasExtra', ['$http',
    function($http) {
        return {
            select: function(estado, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/compras/select",
                    params: {
                        e: enterprise,
                        estado: estado
                    }
                });
            },
            loadMore: function (enterprise, estado, last, limit) {
                return $http({
                    method: "get",
                    url: "/api/compras/loadmore",
                    params: {
                        e: enterprise,
                        last: last,
                        limit: limit,
                        estado: estado
                    }
                })
            },
            loadMoreByCaja: function (enterprise, estado, last, pagina, limit, caja) {
                return $http({
                    method: "get",
                    url: "/api/compras/loadmorebycaja",
                    params: {
                        e: enterprise,
                        last: last,
                        limit: limit,
                        pagina: pagina,
                        estado: estado,
                        caja: caja
                    }
                })
            },
            loadMoreByCajaDate: function (enterprise, estado, startdate, enddate, caja) {
                return $http({
                    method: "get",
                    url: "/api/compras/loadmorebycaja_date",
                    params: {
                        e: enterprise,                        
                        start: startdate,
                        end: enddate,
                        estado: estado,
                        caja: caja
                    }
                })
            },
            search: function (enterprise, estado,search ) {
                return $http({
                    method: "get",
                    url: "/api/compras/search",
                    params: {
                        e: enterprise,
                        estado: estado,
                        search: search
                    }
                })
            },
            loadMoreImpuestos: function (impuesto, last, limit, year, month) {
                return $http({
                    method: "get",
                    url: "/api/compras/loadmoreImpuestos",
                    params: {
                        impuesto: impuesto,
                        last: last,
                        limit: limit,
                        year: year,
                        month: month
                    }
                })
            }
        }
    }
]);
