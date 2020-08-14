(function () {
    'use strict';

    angular.module('empleados').controller('EmpleadosCentrodecostoListController', EmpleadosListCentrodecostoController);

    EmpleadosListCentrodecostoController.$inject = ['Costcenters', 'user', '$scope', '$rootScope','$http', 'PagosService', 'ServiceNavigation'];

    function EmpleadosListCentrodecostoController(Costcenters, user, $scope, $rootScope, $http, PagosService, ServiceNavigation) {

        if (localStorage.getItem("dateEmpleados")) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            $scope.year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            $scope.month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        } else {
            $scope.year = (new Date()).getFullYear();
            $scope.month = (new Date()).getMonth();
        }

        // $scope.year = (new Date()).getFullYear();
        // $scope.month = (new Date()).getMonth();


        ServiceNavigation.navInit();

        
        $scope.getName = function(name) {
            ServiceNavigation.addNav({name:name});
            $rootScope.$broadcast("nav change",true);
        }

        $scope.$watchCollection("year",function(newVal,oldval){           
            localStorage.setItem("year",JSON.stringify({yearName : newVal}))
           
        })

        $scope.$watchCollection("month",function(newVal,oldval){
            var elemPos = $scope.monthList.map(function(x){return x.id}).indexOf(newVal);
            localStorage.setItem("month",JSON.stringify({monthName : $scope.monthList[elemPos].name}))
           
        })

        $scope.monthList = [
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
        ];
        $scope.yearList = [];

        // It returns current year. And fill the yearList array with options from 2016 to the current year.
        var endYear = (new Date()).getFullYear();
        for (var startYear = 2016; startYear <= endYear; startYear++) {
            $scope.yearList.push(String(startYear));
        }

        var getEmpleados = function(index, costcenter) {
            $http.put('/api/empleados', {
                enterprise: user.enterprise._id,
                centrodecosto: costcenter._id
            }).success(function (response) {
                var empleados = response;
                costcenter.activo = empleados.length;
                for (var j = 0; j < empleados.length; j++) {
                    $scope.countActividades(index, empleados[j]);
                    $scope.summLiquidaciones(index, empleados[j]);
                    $scope.summPagos(index, empleados[j]);
                }
            }).error(function (err) {
                console.log("Error: " + err);
            });
        };

        $scope.findEmpleados = function () {
            localStorage.setItem("dateEmpleados", JSON.stringify({year: $scope.year, month: $scope.month}));
            Costcenters.query({e: user.enterprise.enterprise}, function (costcenters) {
                $scope.costcenters = costcenters;

                for (var i = 0; i < costcenters.length; i++) {
                    if (!$scope.costcenters[i].hasOwnProperty("activo")) {
                        $scope.costcenters[i]["activo"] = 0;
                    }

                    getEmpleados(i, $scope.costcenters[i]);
                }
            });
        };

        $scope.findEmpleados();


        $scope.countActividades = function (index, empleado) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if (date && (date.month || date.year)) {
                $http.put('/api/actividades', {
                    empleadoId: empleado._id,
                    month: date.month || null,
                    year: date.year || null
                }).success(function (response) {
                    var hourDiff;
                    var minuteDiff;
                    if(!$scope.costcenters[index].hasOwnProperty("faltas")) {
                        $scope.costcenters[index]["faltas"] = 0;
                    }

                    for (var i = 0; i < response.length; i++) {
                        hourDiff = new Date(response[i].created).getHours() - Number(empleado.puesto.horarioE.split(":")[0]);
                        minuteDiff = new Date(response[i].created).getMinutes() - Number(empleado.puesto.horarioE.split(":")[1]);

                        if (response[i].operacion == "Falta") {
                            $scope.costcenters[index].faltas += 1;
                        }
                    }
                });
            } else {
                $http.put('/api/actividades', {
                    empleadoId: empleado._id
                }).success(function (response) {
                    var hourDiff;
                    var minuteDiff;
                    if(!$scope.costcenters[index].hasOwnProperty("faltas")) {
                        $scope.costcenters[index]["faltas"] = 0;
                    }

                    for (var i = 0; i < response.length; i++) {
                        hourDiff = new Date(response[i].created).getHours() - Number(empleado.puesto.horarioE.split(":")[0]);
                        minuteDiff = new Date(response[i].created).getMinutes() - Number(empleado.puesto.horarioE.split(":")[1]);

                        if (response[i].operacion == "Falta") {
                            $scope.costcenters[index].faltas += 1;
                        }
                    }
                });
            }
        };

        $scope.summLiquidaciones = function (index, empleado) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));

            if (date && (date.month || date.year)) {
                $http.put('/api/liquidaciones', {
                    empleadoId: empleado._id,
                    impuestosId: '',
                    year: date.year || null
                }).success(function (response) {
                    if (!$scope.costcenters[index].hasOwnProperty("liquidacion")) {
                        $scope.costcenters[index]["liquidacion"] = 0;
                    }
                    if(!$scope.costcenters[index].hasOwnProperty("liquidacionAcumulada")) {
                        $scope.costcenters[index]["liquidacionAcumulada"] = 0;
                    }

                    for (var i = 0; i < response.length; i++) {
                        var fechaDeLiquidacion2 = new Date(response[i].fechaDeLiquidacion2);
                        if(fechaDeLiquidacion2.getFullYear() == date.year && fechaDeLiquidacion2.getMonth()+1 == date.month){
                            $scope.costcenters[index].liquidacion += response[i].total;
                        }
                        $scope.costcenters[index].liquidacionAcumulada += response[i].total;
                    }
                });
            } else {
                $http.put('/api/liquidaciones', {
                    empleadoId: empleado._id
                }).success(function (response) {
                    if (!$scope.costcenters[index].hasOwnProperty("liquidacion")) {
                        $scope.costcenters[index]["liquidacion"] = 0;
                    }

                    for (var i = 0; i < response.length; i++) {
                        $scope.costcenters[index].liquidacion += response[i].total;
                    }
                });
            }
        };

        $scope.summPagos = function (index, empleado) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if(!$scope.costcenters[index].hasOwnProperty("pago")) {
                $scope.costcenters[index]["pago"] = 0;
            }
            if(!$scope.costcenters[index].hasOwnProperty("pagoAcumulado")) {
                $scope.costcenters[index]["pagoAcumulado"] = 0;
            }

            if (date && (date.month || date.year)) {
                PagosService.query({
                    empleadoId: empleado._id,
                    impuestosId: '',
                    year: date.year || null
                }, function (response) {
                    for (var i = 0; i < response.length; i++) {
                        var pagoDate = new Date(response[i].pagoDate);
                        if(pagoDate.getFullYear() == date.year && pagoDate.getMonth()+1 == date.month){
                            $scope.costcenters[index].pago += (response[i].montoE + response[i].montoC);
                        }
                        $scope.costcenters[index].pagoAcumulado += (response[i].montoE + response[i].montoC);
                    }
                });
            } else {
                PagosService.query({
                    empleadoId: empleado._id
                }, function (response) {
                    for (var i = 0; i < response.length; i++) {
                        $scope.costcenters[index].pago += (response[i].montoE + response[i].montoC);
                    }
                });
            }
        };
    }
})();
  