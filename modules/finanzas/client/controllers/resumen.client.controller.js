'use strict';

// Comprobantes controller
angular.module('finanzas').controller('ResumenController', ['$scope', '$stateParams', '$state', '$http',
 'user', 'PagosService', 'Impuestos','ServiceNavigation', '$rootScope',
    function($scope, $stateParams, $state, $http, user, PagosService, Impuestos, ServiceNavigation,$rootScope) {
        $scope.ventasTotal = 0;
        $scope.otrosIngresosTotal = 0;
        $scope.comprasTotal = 0;
        $scope.costosIndirectosTotal = 0;
        $scope.rrhhTotal = 0;
        $scope.impuestosTotal = 0;
        $scope.ventasTotales = 0;
        $scope.resultadoBruto = 0;
        $scope.resultadoNeto = 0;

        $scope.ventasRatio = 0;
        $scope.otrosIngresosRatio = 0;
        $scope.comprasRatio = 0;
        $scope.costosIndirectosRatio = 0;
        $scope.rrhhRatio = 0;
        $scope.impuestosRatio = 0;
        $scope.resultadoRatio = 0;

        $scope.loader = {}

        
        if(localStorage.getItem("dateResumen")) {
            var date = JSON.parse(localStorage.getItem("dateResumen"));
            year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        } else {
            var year = (new Date()).getFullYear();
            var month = (new Date()).getMonth();
        }

        var getMonth = JSON.parse(localStorage.getItem("month"));
        //var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + year;
        console.log(getMonth);

        $scope.$watchCollection('authentication', function () {
            if (!sessionStorage.getItem('centroDeCosto')) {
                sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            } else if ($stateParams.centroDeCosto !== '' && $stateParams.centroDeCosto !== sessionStorage.getItem('centroDeCosto')) {
                sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            }

            $scope.centroDeCosto = sessionStorage.getItem('centroDeCosto');

            /*Promise.all([
                findImpuestos(),
                findVentas(),
                findCompras(),
                findRRHH(),
                findCostosIndirectos().$promise,                                
            ]).then(function(result) {
                //calculateResumen();
            }).catch(function (error) {
                console.log(error);
            });*/

            findImpuestos()
            findVentas()
            findCompras()
            findRRHH()
            findCostosIndirectos().$promise 

        });



        function findVentas() {
            $scope.loader.isVentas = true;
            return $http.put('/api/ventas', {
                year: year,
                month: month,
                enterprise: user.enterprise._id,
                centroDeCosto: $scope.centroDeCosto
            }).success(function (ventas) {
                $scope.loader.isVentas = false;
                ventas.forEach(function(venta) {
                    if(venta.tipoComprobante && (venta.tipoComprobante.name === "Factura A" || venta.tipoComprobante.name === "Factura B" || venta.tipoComprobante.name === "Factura C"))
                        $scope.ventasTotal += venta.total;
                    else
                        $scope.otrosIngresosTotal += venta.total;
                });

                $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;

                $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                if($scope.ventasTotales) {
                    $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                }
            });
        }

       function findCompras() {
            $scope.loader.isCompras = true;
            var period = year + "-" + month;
            return $http.put('/api/compras', {
                year: year,
                month: month,
                period: period,
                enterprise: user.enterprise._id,
                centroDeCosto: $scope.centroDeCosto
            }).success(function (compras) {
                $scope.loader.isCompras = false;
                console.log(compras);
                compras.forEach(function(compra) {
                    $scope.comprasTotal += compra.total;
                });

                $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;

                $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                if($scope.ventasTotales) {
                    $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                }
            });
        }

        /*function findCompras() {
            var period = year + "-" + month;
            var url = "/api/reportes/compras/byMonthDetailed/" + period + "?e=" + user.enterprise._id
            return $http.get(url,{
                e:user.enterprise._id
            }).success(function(compras){
                console.log(compras)
                $scope.comprasTotal = compras.balance;

                $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;

                $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                if($scope.ventasTotales) {
                    $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                }
            })
        }*/

        function findCostosIndirectos() {
            $scope.loader.isCostIndirectos = true;
            var navList = ServiceNavigation.getNav();
            if(year != "" || month != ""){
                return PagosService.query({isResumen: true, year: year, month: month, e: user.enterprise._id, centroId: $scope.centroDeCosto,centroName: navList[navList.length - 1].name}, function(list) {                   
                   $scope.loader.isCostIndirectos = false;
                   list.forEach(function(item) {
                        $scope.costosIndirectosTotal += item.total;
                    });
                    $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;
                    $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                    $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                    if($scope.ventasTotales) {
                        $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                    }
                });
            }
        }

        /*function findRRHH() {
            $scope.loader.isRRHH = true;
            return $http.put('/api/empleados', {
                enterprise: user.enterprise._id,
                centrodecosto: $scope.centroDeCosto
            }).success(function (response) {
                var empleados = response;
                $scope.loader.isRRHH = false;
                for (var i = 0; i < empleados.length; i++) {
                    $http.put('/api/liquidaciones', {
                        empleadoId: empleados[i]._id,
                        month: month,
                        year: year
                    }).success(function (response) {
                        for (var j = 0; j < response.length; j++) {
                            $scope.rrhhTotal += response[j].total;
                        }
                    });
                }
            }).error(function (err) {
                console.log("Error: " + err);
            });
        }*/

        function findRRHH() {
            $scope.loader.isRRHH = true;
            return $http.put('/api/empleados', {
                enterprise: user.enterprise._id,
                centrodecosto: $scope.centroDeCosto
            }).success(function (response) {
                var empleados = response;

                $http.patch('/api/liquidaciones', {
                    //empleadoId: empleados[i]._id,
                    month: month,
                    year: year,
                    empList: empleados
                }).success(function (response) {
                    $scope.loader.isRRHH = false;                
                    $scope.rrhhTotal += response.total;

                    $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;  
                    $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                    $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                    if($scope.ventasTotales) {
                        $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                        $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                    }                 
                });
                
            }).error(function (err) {
                console.log("Error: " + err);
            });
        }

        /*function findImpuestos() {
            $scope.loader.isImpuestos = true;
            return $http.post('/api/impuestos/updateTotal', {
                month: month,
                year: year
            }).then(function () {
                Impuestos.query({centroDeCosto: $scope.centroDeCosto}, function (impuestos) {
                    $scope.loader.isImpuestos = false;
                    impuestos.forEach(function(impuesto) {
                        if(impuesto.name === 'IVA Compras') {
                            $scope.impuestosTotal -= impuesto.total;
                        } else {
                            $scope.impuestosTotal += impuesto.total;
                        }

                    });

                });
            }).catch(function (error) {
                console.log("Error: " + error);
            });
        }*/


        function findImpuestos() {
            $scope.loader.isImpuestos = true;            
            return Impuestos.query({centroDeCosto: $scope.centroDeCosto,month: month, year: year}, function (impuestos) {
                $scope.loader.isImpuestos = false;
                impuestos.forEach(function(impuesto) {
                    if(impuesto.name === 'IVA Compras') {
                        $scope.impuestosTotal -= impuesto.total;
                    } else {
                        $scope.impuestosTotal += impuesto.total;
                    }

                });

                $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;

                $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                if($scope.ventasTotales) {
                    $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                }

            });
        
        }



        /*$scope.$watchCollection("impuestosTotal",function(newVal,oldVal){
            if(newVal){
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;
            }
        })*/

        function calculateResumen() {
            return new Promise(function() {
                $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;
               //$scope.resultadoBruto = $scope.ventasTotales - $scope.comprasTotal - $scope.costosIndirectosTotal - $scope.rrhhTotal;
                $scope.resultadoBruto = $scope.ventasTotales - ($scope.comprasTotal + $scope.costosIndirectosTotal + $scope.rrhhTotal);
                
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;


                if($scope.ventasTotales) {
                    $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100 ;
                }

                $scope.$apply();
            });
        }
    }
]);