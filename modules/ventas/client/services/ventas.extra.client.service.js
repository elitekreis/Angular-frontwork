'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('ventas').factory('VentasExtra', ['$http',
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
            loadMore: function(enterprise, estado, last, limit, caja) {
                return $http({
                    method: "get",
                    url: "/api/ventas/loadmore",
                    params: {
                        e: enterprise,
                        last: last,
                        limit: limit,
                        estado: estado,
                        caja: caja
                    }
                })
            },
            loadMoreImpuestos: function(impuesto, last, limit, year, month) {
                return $http({
                    method: "get",
                    url: "/api/ventas/loadmoreImpuestos",
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