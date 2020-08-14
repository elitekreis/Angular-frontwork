'use strict';

// Comprobantes controller
angular.module('finanzas').controller('ResumenListController', ['$scope', '$http', 'costcenters', 'Impuestos', 'PagosService','ServiceNavigation',"$rootScope",
    function($scope, $http, costcenters, Impuestos, PagosService, ServiceNavigation,$rootScope) {
        $scope.costcenters = costcenters;


        //if costceners promises is not resolved
        if(costcenters.length > 0)
            localStorage.setItem("holdCostcenters",JSON.stringify(costcenters));
            //$rootScope.holdCostcenters = costcenters;

        if(localStorage.getItem("dateResumen")) {
            var date = JSON.parse(localStorage.getItem("dateResumen"));
            $scope.year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            $scope.month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        } else {
            $scope.year = (new Date()).getFullYear();
            $scope.month = (new Date()).getMonth();
        }

        ServiceNavigation.navInit();

        
        $scope.getName = function(name) {
            ServiceNavigation.addNav({name:name});
            $rootScope.$broadcast("nav change",true);
        }

        /*$scope.$watchCollection("year",function(newVal,oldval){           
            localStorage.setItem("year",JSON.stringify({yearName : newVal}))
            //$rootScope.period.year = newVal;
        })*/

        /*$scope.$watchCollection("month",function(newVal,oldval){
            var elemPos = $scope.monthList.map(function(x){return x.id}).indexOf(newVal);
            localStorage.setItem("month",JSON.stringify({monthName : $scope.monthList[elemPos].name,monthId: $scope.monthList[elemPos].id}))
            //$rootScope.period.month = newVal;
        })*/

        // definicion de funciones

        $scope.monthList = 
        [       
            {id: 'all', name: 'Ninguno'},
            { id: 0, name: 'enero' },
            { id: 1, name: 'febrero' },
            { id: 2, name: 'marzo' },
            {id:  3, name: 'abril'},
            {id:  4, name:  'mayo'},
            {id: 5, name:   'junio'},
            {id: 6, name: 'julio'},
            {id:7, name:'agosto'},
            {id:8, name:'septiembre'},
            {id:9, name: 'octubre'},
            {id:10, name:'noviembre'},
            {id:11, name:'diciembre'}
          ];
        


        
       /* $scope.monthList = [
            {id: 0, name: 'enero'},
            {id: 1, name: 'febrero'},
            {id: 2, name: 'marzo'},
            {id: 3, name: 'abril'},
            {id: 4, name: 'mayo'},
            {id: 5, name: 'junio'},
            {id: 6, name: 'julio'},
            {id: 7, name: 'agosto'},
            {id: 8, name: 'septiembre'},
            {id: 9, name: 'octubre'},
            {id: 10, name: 'noviembre'},
            {id: 11, name: 'diciembre'}
        ];*/

        $scope.yearList = [];

        $scope.ventasTotal = {};
        $scope.otrosIngresosTotal = {};
        $scope.comprasTotal = {};
        $scope.costosIndirectosTotal = {};
        $scope.rrhhTotal = {};
        $scope.impuestosTotal = {};
        $scope.ventasTotales = {};

        $scope.totalResumen = {};
        $scope.totalRatioResumen = {};


        // It returns current year. And fill the yearList array with options from 2016 to the current year.
        var endYear = (new Date()).getFullYear();
        for (var startYear = 2016; startYear <= endYear; startYear++) {
            $scope.yearList.push(String(startYear));
        }

        $scope.isMonthLoading = false;
        $scope.monthInput = new Date(JSON.parse(localStorage.getItem("rawDate"))) || new Date();
        console.log(JSON.parse(localStorage.getItem("rawDate")))

        $scope.monthSelected = function() {
            if ($scope.monthInput) {
                //$scope.isMonthLoading = true;
                localStorage.setItem('rawDate',JSON.stringify($scope.monthInput))
                $scope.monthValue = getMonth($scope.monthInput);
                //$scope.loadReportes('mes');
                console.log($scope.monthInput);
            }
        };


        function getMonth(date) {
            var month = date.getMonth();
            var year = date.getFullYear();            
            localStorage.setItem("dateResumen", JSON.stringify({year: year, month: month}));
            var elemPos = $scope.monthList.map(function(x){return x.id}).indexOf(month);
            localStorage.setItem("month",JSON.stringify({monthName : $scope.monthList[elemPos].name}));
            return (year + '-' + month)
        }


        
        $scope.findResumen = function () {
            localStorage.setItem("dateResumen", JSON.stringify({year: $scope.year, month: $scope.month}));

            //check if costcenter is resolved
            if(costcenters.length === 0) {
                costcenters = JSON.parse(localStorage.getItem("holdCostcenters")) || [{}]; 
            }
           
            costcenters.forEach(function(costcenter) {
                if(!costcenter.deleted) {
                    $scope.ventasTotal[costcenter._id] = 0;
                    $scope.otrosIngresosTotal[costcenter._id] = 0;
                    $scope.comprasTotal[costcenter._id] = 0;
                    $scope.costosIndirectosTotal[costcenter._id] = 0;
                    $scope.rrhhTotal[costcenter._id] = 0;
                    $scope.impuestosTotal[costcenter._id] = 0;
                    $scope.ventasTotales[costcenter._id] = 0;

                    $scope.totalResumen[costcenter._id] = 0;
                    $scope.totalRatioResumen[costcenter._id] = 0;

                    /*Promise.all([
                        findVentas(costcenter._id),
                        findCompras(costcenter._id),
                        findCostosIndirectos(costcenter._id).$promise,
                        findRRHH(costcenter._id),
                        findImpuestos(costcenter._id)
                    ]).then(function(result) {
                        //calculateResumen(costcenter._id);
                    }).catch(function (error) {
                        console.log(error);
                    });*/

                    findVentas(costcenter._id)
                    findCompras(costcenter._id)
                    findCostosIndirectos(costcenter._id).$promise
                    findRRHH(costcenter._id)
                    findImpuestos(costcenter._id)
                }
            });
        };

        function initLoad() {
            $scope.findResumen();
        }

        function calculateResumen(costcenter) {
            return new Promise(function() {
                $scope.ventasTotales[costcenter] = $scope.ventasTotal[costcenter] + $scope.otrosIngresosTotal[costcenter];
                $scope.totalResumen[costcenter] = $scope.ventasTotales[costcenter] - ($scope.comprasTotal[costcenter] +
                 $scope.costosIndirectosTotal[costcenter] + $scope.rrhhTotal[costcenter] + $scope.impuestosTotal[costcenter]);


                if($scope.ventasTotales[costcenter]) {
                    $scope.totalRatioResumen[costcenter] = Math.round(($scope.totalResumen[costcenter] / $scope.ventasTotales[costcenter]) * 10000) / 100;
                } else {
                    $scope.totalRatioResumen[costcenter] = 0;
                }

                $scope.$apply();
            });
        }

        function findVentas(centroDeCosto) {
            return $http.put('/api/ventas', {
                year: $scope.year,
                month: $scope.month,
                enterprise: user.enterprise._id,
                centroDeCosto: centroDeCosto
            }).success(function (ventas) {
                ventas.forEach(function(venta) {
                    if(venta.tipoComprobante && (venta.tipoComprobante.name === "Factura A" || venta.tipoComprobante.name === "Factura B" || venta.tipoComprobante.name === "Factura C"))
                        $scope.ventasTotal[centroDeCosto] += venta.total;
                    else
                        $scope.otrosIngresosTotal[centroDeCosto] += venta.total;
                });

                $scope.ventasTotales[centroDeCosto] = $scope.ventasTotal[centroDeCosto] + $scope.otrosIngresosTotal[centroDeCosto];
                if($scope.ventasTotales[centroDeCosto]) {
                    $scope.totalRatioResumen[centroDeCosto] = Math.round(($scope.totalResumen[centroDeCosto] / $scope.ventasTotales[centroDeCosto]) * 10000) / 100;
                } else {
                    $scope.totalRatioResumen[centroDeCosto] = 0;
                }
            });
        }

        function findCompras(centroDeCosto) {
            var period = $scope.year + "-" + $scope.month;
            return $http.put('/api/compras', {
                year: $scope.year,
                month: $scope.month,
                period: period,
                enterprise: user.enterprise._id,
                centroDeCosto: centroDeCosto
            }).success(function (compras) {
                compras.forEach(function(compra) {
                    $scope.comprasTotal[centroDeCosto] += compra.total;
                });
            });

            $scope.totalResumen[centroDeCosto] = $scope.ventasTotales[centroDeCosto] - ($scope.comprasTotal[centroDeCosto] +
            $scope.costosIndirectosTotal[centroDeCosto] + $scope.rrhhTotal[centroDeCosto] + $scope.impuestosTotal[centroDeCosto]);
            if($scope.ventasTotales[centroDeCosto]) {
                $scope.totalRatioResumen[centroDeCosto] = Math.round(($scope.totalResumen[centroDeCosto] / $scope.ventasTotales[centroDeCosto]) * 10000) / 100;
            } else {
                $scope.totalRatioResumen[centroDeCosto] = 0;
            }
        }

        function findCostosIndirectos(centroDeCosto) {
            if($scope.year != "" || $scope.month != ""){
                return PagosService.query({isResumen: true,year: $scope.year, month: $scope.month, e: user.enterprise._id, centroId: centroDeCosto}, function(pagos) {
                    pagos.forEach(function(pago) {
                        $scope.costosIndirectosTotal[centroDeCosto] += pago.total;
                    });
                    $scope.totalResumen[centroDeCosto] = $scope.ventasTotales[centroDeCosto] - ($scope.comprasTotal[centroDeCosto] +
                    $scope.costosIndirectosTotal[centroDeCosto] + $scope.rrhhTotal[centroDeCosto] + $scope.impuestosTotal[centroDeCosto]);
                    if($scope.ventasTotales[centroDeCosto]) {
                        $scope.totalRatioResumen[centroDeCosto] = Math.round(($scope.totalResumen[centroDeCosto] / $scope.ventasTotales[centroDeCosto]) * 10000) / 100;
                    } else {
                        $scope.totalRatioResumen[centroDeCosto] = 0;
                    }
                });
            }
        }

        /*function findRRHH(centroDeCosto) {
            return $http.put('/api/empleados', {
                enterprise: user.enterprise._id,
                centrodecosto: centroDeCosto
            }).success(function (response) {
                var empleados = response;
                for (var i = 0; i < empleados.length; i++) {
                    $http.put('/api/liquidaciones', {
                        empleadoId: empleados[i]._id,
                        month: $scope.month,
                        year: $scope.year
                    }).success(function (response) {
                        for (var j = 0; j < response.length; j++) {
                            $scope.rrhhTotal[centroDeCosto] += response[j].total;
                        }
                    });
                }
            }).error(function (err) {
                console.log("Error: " + err);
            });
        }*/

        function findRRHH(centroId) {
            return $http.put('/api/empleados', {
                enterprise: user.enterprise._id,
                centrodecosto: centroId
            }).success(function (response) {
                var empleados = response;
                $http.patch('/api/liquidaciones', {
                    //empleadoId: empleados[i]._id,
                    month: $scope.month,
                    year: $scope.year,
                    empList: empleados
                }).success(function (res) {                   
                    $scope.rrhhTotal[centroId] += res.total;  
                    $scope.totalResumen[centroId] = $scope.ventasTotales[centroId] - ($scope.comprasTotal[centroId] +
                    $scope.costosIndirectosTotal[centroId] + $scope.rrhhTotal[centroId] + $scope.impuestosTotal[centroId]);
                    if($scope.ventasTotales[centroId]) {
                        $scope.totalRatioResumen[centroId] = Math.round(($scope.totalResumen[centroId] / $scope.ventasTotales[centroId]) * 10000) / 100;
                    } else {
                        $scope.totalRatioResumen[centroId] = 0;
                    }                  
                });
                
            }).error(function (err) {
                console.log("Error: " + err);
            });
        }


        /*function findImpuestos(centroDeCosto) {
            return $http.post('/api/impuestos/updateTotal', {
                month: $scope.month,
                year: $scope.year
            }).then(function () {
                Impuestos.query({centroDeCosto: centroDeCosto}, function (impuestos) {
                    impuestos.forEach(function(impuesto) {
                        if(impuesto.name === 'IVA Compras') {
                            $scope.impuestosTotal[centroDeCosto] -= impuesto.total;
                        } else {
                            $scope.impuestosTotal[centroDeCosto] += impuesto.total;
                        }
                    });
                });
            }).catch(function (error) {
                console.log("Error: " + error);
            });
        }*/

        function findImpuestos(centroId) {                       
            return Impuestos.query({centroDeCosto: centroId}, function (impuestos) {
                impuestos.forEach(function(impuesto) {
                    if(impuesto.name === 'IVA Compras') {
                        $scope.impuestosTotal[centroId] -= impuesto.total;
                    } else {
                        $scope.impuestosTotal[centroId] += impuesto.total;
                    }

                });
                //$scope.rrhhTotal[centroId] += response.total;  
                $scope.totalResumen[centroId] = $scope.ventasTotales[centroId] - ($scope.comprasTotal[centroId] +
                $scope.costosIndirectosTotal[centroId] + $scope.rrhhTotal[centroId] + $scope.impuestosTotal[centroId]);
                if($scope.ventasTotales[centroId]) {
                    $scope.totalRatioResumen[centroId] = Math.round(($scope.totalResumen[centroId] / $scope.ventasTotales[centroId]) * 10000) / 100;
                } else {
                    $scope.totalRatioResumen[centroId] = 0;
                }                   

            });
        
        }

        //initLoad();
    }
]);