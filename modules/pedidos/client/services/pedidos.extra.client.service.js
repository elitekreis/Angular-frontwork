'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('pedidos').factory('PedidosExtra', ['$http',
    function($http) {
        return {
            select: function(estado, enterprise, tipoPedido) {
                return $http({
                    method: "get",
                    url: "/api/pedidos/select",
                    params: {
                        e: enterprise,
                        estado: estado,
                        type: tipoPedido
                    }
                });
            },
            loadMore: function (enterprise, tipoPedido, estado, last, limit ) {
                return $http({
                    method: "get",
                    url: "/api/pedidos/loadmore",
                    params: {
                        e: enterprise,
                        last: last,
                        limit: limit,
                        estado: estado,
                        type: tipoPedido
                    }
                })
            },
            search: function (enterprise, tipoPedido, estado ,search) {
                return $http({
                    method: "get",
                    url: "/api/pedidos/search",
                    params: {
                        e: enterprise,
                        estado: estado,
                        tipoPedido: tipoPedido,
                        search: search
                    }
                })
            }
        }
    }
]);
