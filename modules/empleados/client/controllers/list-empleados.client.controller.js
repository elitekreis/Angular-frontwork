(function () {
    'use strict';

    angular.module('empleados').controller('EmpleadosListController', EmpleadosListController);

    EmpleadosListController.$inject = ['$http', '$stateParams', 'user',  '$scope', '$mdDialog', '$rootScope', 'PagosService', 'ServiceNavigation', 'Liquidaciones', 'Authentication',];

    function EmpleadosListController($http, $stateParams, user, $scope, $mdDialog, $rootScope, PagosService, ServiceNavigation,Authentication) {

        $scope.empleados = [];
        $scope.concepto = "";
        $scope.centroDeCosto = $stateParams.costcenterId;

        $http.put('/api/empleados',
            {
                enterprise: user.enterprise._id,
                centrodecosto: $scope.centroDeCosto
            })
            .success(function(response) {
                $scope.empleados = response;
                for(var i=0; i < $scope.empleados.length; i++) {
                    $scope.countActividades(i);
                    $scope.summLiquidaciones(i);
                    $scope.summPagos(i);
                }

            }).error(function(err) {
                console.log("Error: " + err);
            });

        $scope.getName = function(name) {            
          ServiceNavigation.addNav({name:name});
        }

        $rootScope.$broadcast("nav change",true);

        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName;      

      
        $scope.countActividades = function(index) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if (date && (date.month || date.year)) {
                $http.put('/api/actividades', {
                    empleadoId: $scope.empleados[index]._id,
                    month: date.month || null,
                    year: date.year || null
                }).success(function (response) {
                    var hourDiff;
                    var minuteDiff;
                    if(!$scope.empleados[index].hasOwnProperty("faltas")) {
                        $scope.empleados[index]["faltas"] = 0;
                    }

                    if(!$scope.empleados[index].hasOwnProperty("llegasTardes")) {
                        $scope.empleados[index]["llegasTardes"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {

                        hourDiff = Number(response[i].created.split("T")[1].split(":")[0]) - Number($scope.empleados[index].puesto.horarioE.split(":")[0]) - 3;
                        minuteDiff = Number(response[i].created.split("T")[1].split(":")[1]) - Number($scope.empleados[index].puesto.horarioE.split(":")[1]);

                        if(response[i].operacion == "Falta") {
                            $scope.empleados[index].faltas += 1;
                        } else if(response[i].operacion == "Hola" && (hourDiff < -2 || hourDiff > 0 || (hourDiff == 0 && minuteDiff > 15))) {
                            $scope.empleados[index].llegasTardes += 1;
                        }
                    }
                });
            } else {
                $http.put('/api/actividades', {
                    empleadoId: $scope.empleados[index]._id
                }).success(function (response) {
                    var hourDiff;
                    var minuteDiff;
                    if(!$scope.empleados[index].hasOwnProperty("faltas")) {
                        $scope.empleados[index]["faltas"] = 0;
                    }

                    if(!$scope.empleados[index].hasOwnProperty("llegasTardes")) {
                        $scope.empleados[index]["llegasTardes"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {
                        hourDiff = Number(response[i].created.split("T")[1].split(":")[0]) - Number($scope.empleados[index].puesto.horarioE.split(":")[0]) - 3;
                        minuteDiff = Number(response[i].created.split("T")[1].split(":")[1]) - Number($scope.empleados[index].puesto.horarioE.split(":")[1]);

                        if(response[i].operacion == "Falta") {
                            $scope.empleados[index].faltas += 1;
                        } else if(response[i].operacion == "Hola" && (hourDiff < -2 || hourDiff > 0 || (hourDiff == 0 && minuteDiff > 15))) {
                            $scope.empleados[index].llegasTardes += 1;
                        }
                    }
                });
            }
        };

        $scope.summLiquidaciones = function(index) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));

            if (date && (date.month || date.year)) {
                $http.put('/api/liquidaciones', {
                    empleadoId: $scope.empleados[index]._id,
                    impuestosId: '',
                    year: date.year || null
                }).success(function (response) {
                    if(!$scope.empleados[index].hasOwnProperty("liquidacion")) {
                        $scope.empleados[index]["liquidacion"] = 0;
                    }
                    if(!$scope.empleados[index].hasOwnProperty("liquidacionAcumulada")) {
                        $scope.empleados[index]["liquidacionAcumulada"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {
                        var fechaDeLiquidacion2 = new Date(response[i].fechaDeLiquidacion2);
                        if(fechaDeLiquidacion2.getFullYear() == date.year && fechaDeLiquidacion2.getMonth()+1 == date.month){
                            $scope.empleados[index].liquidacion += response[i].total;
                        }
                        $scope.empleados[index].liquidacionAcumulada += response[i].total;
                    }
                });
            } else {
                $http.put('/api/liquidaciones', {
                    empleadoId: $scope.empleados[index]._id
                }).success(function (response) {
                    if(!$scope.empleados[index].hasOwnProperty("liquidacion")) {
                        $scope.empleados[index]["liquidacion"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {
                        $scope.empleados[index].liquidacion += response[i].total;
                    }
                });
            }
        };

        $scope.summPagos = function (index) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if(!$scope.empleados[index].hasOwnProperty("pago")) {
                $scope.empleados[index]["pago"] = 0;
            }
            if(!$scope.empleados[index].hasOwnProperty("pagoAcumulado")) {
                $scope.empleados[index]["pagoAcumulado"] = 0;
            }

            if (date && (date.month || date.year)) {
                PagosService.query({
                    empleadoId: $scope.empleados[index]._id,
                    impuestosId: '',
                    year: date.year || null
                }, function(response) {
                    for(var i = 0; i < response.length; i++) {
                        var pagoDate = new Date(response[i].pagoDate);
                        if(pagoDate.getFullYear() == date.year && pagoDate.getMonth()+1 == date.month){
                            $scope.empleados[index].pago += (response[i].montoE + response[i].montoC);
                        }
                        $scope.empleados[index].pagoAcumulado += (response[i].montoE + response[i].montoC);
                    }
                });
            } else {
                PagosService.query({
                    empleadoId: $scope.empleados[index]._id
                }, function(response) {
                    for(var i = 0; i < response.length; i++) {
                        $scope.empleados[index].pago += (response[i].montoE + response[i].montoC);
                    }
                });
            }
        };

        if(!$rootScope.$$listenerCount.callAddPago) {
            $rootScope.$on("callAddPago", function (event, data) {
                $scope.showDialogPago(data.event, data.item);
            });
        }

        if(!$rootScope.$$listenerCount.callAddLiquidencion) {
            $rootScope.$on("callAddLiquidencion", function (event, data) {
                $scope.showDialogLiquidencion(data.event, data.item);
            });
        }

        $scope.showDialogLiquidencion = function ($event, item) {
            $mdDialog.cancel();
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-liquidacion.client.view.html',
                locals: {
                    item: item,
                    user: user
                },
                controller: DialogController1
            })
        }; 

        $scope.showDialogPago = function ($event, item) {
            $mdDialog.cancel();
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-pago.client.view.html',
                locals: {
                    item: item,
                    user: user
                },
                controller: DialogController
            })
        }; //end showDialog

        function DialogController($scope, $mdDialog, $state, item, user, PagosService, $filter, Socket, Cajas,Authentication) {
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watchCollection('ServiciosService', function () {
                $scope.findPago();
            });
            $scope.$watchCollection('Cajas', function () {
                $scope.findCajas();
            });

            $scope.item = item;
            $scope.item.name = item.userLogin.displayName;
            $scope.item.personal = true;

            $scope.montoE = 0;
            $scope.montoC = 0;

            $scope.errorCaja = undefined;

            $scope.assignConcepto = function (concepto) {
                $scope.concepto = concepto;
            };

            $scope.findCajas = function () {
                Cajas.query({e: user.enterprise._id}, function (data) {
                    $scope.cajas = $filter('filter')(data, function (item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.findPago = function () {
                $scope.pagos = PagosService.query({e: user.enterprise._id});
            };

            $scope.createPago = function ($event, item) {
                console.log($scope.concepto);
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var numero = $scope.pagos.length + 1;

                        var pago = {
                            numero: numero,
                            personal: item._id,
                            cajaD: $scope.caja._id,
                            montoE: $scope.montoE,
                            montoC: $scope.montoC,
                            pagoDate: $scope.pagoDate,
                            concepto: $scope.concepto,
                            saldo: $scope.caja.total - ($scope.montoE + $scope.montoC),
                            observaciones: $scope.observaciones,
                            enterprise: user.enterprise._id,
                            user: item.userLogin._id,
                            type: 'personal',
                            userLogin:item.userLogin.displayName,
                        };

                        Socket.emit('pago.create', pago);
                        $state.go('home.viewSaldo', {empleadoId: item._id, displayName: item.userLogin.displayName}, {reload: true});
                        $mdDialog.hide();
                    }
                    else {
                        $scope.errorCaja = 'Se debe seleccionar la caja origin'
                    }
                }
            };


        }


        function DialogController1(user, $state, $filter, $scope, $http, $stateParams, Empleados, Authentication, Liquidaciones) {

            $scope.authentication = Authentication;
            $scope.minLengthPersonal = 0;
            $scope.remuneraciones = [];
            $scope.modoEditar = [];
            $scope.addedConceptos = [];
            $scope.totalLiqudacion = 0;
            $scope.fechaDeLiquidacion = new Date();
            $scope.fechaDeLiquidacion2 = new Date();
            $scope.rrhh = undefined;
            $scope.editing = false;
            $scope.fromPersonal = false;
    
            $scope.$watchCollection('authentication', function () {
                $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
                $scope.findPersonal();
    
                if($stateParams.empleadoId) {
                    $scope.fromPersonal = true;
                }
    
                if ($stateParams.liquidacionId) {
                    $scope.editing = true;
                    $scope.findOne();
                }
            });
    
            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.searchTextChangePersonal = function (text) {
                return $filter('filter')($scope.personal, {deleted: false, $: text});
            };
    
            $scope.searchTextChangeConcepto = function (text) {
                return $filter('filter')($scope.remuneraciones, {$: text});
            };
    
            $scope.selectedItemChange = function (item) {
                $scope.rrhh = item;

            $scope.ii = 0;
                $scope.remuneraciones = item && item.userLogin && item.userLogin.remuneraciones || [];
                for (var i = 0; i < $scope.remuneraciones.length; i++) {
                    $http.post('/api/remuneraciones/' + $scope.remuneraciones[i]._id).success(
                        function (res) {
                                if(res.deleted){
                                    $scope.remuneraciones.splice( i-$scope.ii,1);
                                    $scope.ii +=1 ;
                                }
                            console.log($scope.remuneraciones);
                            if(res.deleted){
                                $scope.remuneraciones.deleted = true;
                                return false;
                            }
                            return true;
                        }

                    ).error(function (err) {
                            // $scope.error = response.message;
                            console.log(err);
                        });
                }
            };
            
            $scope.selectedItemChangeConcepto = function (item) {
                $scope.concepto = item;
            };
    
            $scope.findOne = function () {
                $http({
                    method: 'GET',
                    url: ('/api/liquidaciones/' + $stateParams.liquidacionId)
                }).then(function successCallback(res) {
                    $scope.liquidacion = res.data;
    
                    $scope.findPersonal($scope.liquidacion.empleado._id);
                    $scope.observaciones = $scope.liquidacion.observaciones;
                    $scope.fechaDeLiquidacion = new Date($scope.liquidacion.fechaDeLiquidacion);
                    $scope.fechaDeLiquidacion2 = new Date($scope.liquidacion.fechaDeLiquidacion2);
                    $scope.totalLiqudacion = $scope.liquidacion.total;
                    $scope.addedConceptos = $scope.liquidacion.remuneraciones;
                    $scope.modoEditar = new Array($scope.addedConceptos.length).fill(false);
    
                    for(var i = 0; i < $scope.addedConceptos.length; i++) {
                        $scope.addedConceptos[i].totalAll = $scope.addedConceptos[i].cantidad * $scope.addedConceptos[i].total
                    }
                }, function errorCallback(err) {
                    console.log('Error' + err);
                });
            };
    
            $scope.findPersonal = function (empleadoId) {
                var empleado = empleadoId || null;
                if ($scope.SEARCH !== undefined) {
                    Empleados.query({e: $scope.SEARCH.enterprise}, function (response) {
                        $scope.personal = response;
                        if ($stateParams.empleadoId || empleado) {
                            for (var i = 0; i < $scope.personal.length; i++) {
                                if ($scope.personal[i]._id == $stateParams.empleadoId || $scope.personal[i]._id == empleado) {
                                    $scope.rrhh = $scope.personal[i];
                                }
                            }
                        }
                    });
                } else {
                    Empleados.query({}, function (response) {
                        $scope.personal = response;
                        if ($stateParams.empleadoId || empleado) {
                            for (var i = 0; i < $scope.personal.length; i++) {
                                if ($scope.personal[i]._id == $stateParams.empleadoId || $scope.personal[i]._id == empleado) {
                                    $scope.rrhh = $scope.personal[i];
                                }
                            }
                        }
                    });
                }
            };
    
            $scope.sendRRHH = function ($event, rrhh) {
                if ($event.keyCode === 13) {
                    $event.preventDefault();
                    if ((rrhh === null) || (rrhh === undefined)) {
                        $scope.mensajePer = 'No seleccionaste un personal valido';
                    } else {
                        $scope.rrhh = personal;
                    }
                }
            };
    
            $scope.addConcepto = function (concepto) {
    
                concepto.totalAll = concepto.total * concepto.cantidad;
                $scope.modoEditar.push(false);
    
                // If the remuneracion is not our list we add it
                if (!checkIfAlreadyIn(concepto)) {
                    $scope.addedConceptos.push(concepto);
                    $scope.totalLiqudacion += concepto.totalAll;
                    $scope.button_disabled = true;
                    
                } else {
                    $scope.error = 'The concepto is already in the list';
                }
            };
    
            // Check if concepto is already in our list
            var checkIfAlreadyIn = function (concepto) {
                for (var i = 0; i < $scope.addedConceptos.length; i++) {
                    if ($scope.addedConceptos[i]._id == concepto._id) {
                        return true;
                    }
                }
    
                return false;
            };
    
            $scope.editTrue = function (index) {
                $scope.modoEditar[index] = true;
            };
    
            $scope.updateP = function (index, p) {
                $scope.addedConceptos[index].cantidad = p.cantidad;
                $scope.totalLiqudacion -= $scope.addedConceptos[index].totalAll;
                $scope.addedConceptos[index].totalAll = $scope.addedConceptos[index].total * p.cantidad;
                $scope.totalLiqudacion += $scope.addedConceptos[index].totalAll;
    
                $scope.modoEditar[index] = false;
            };
    
            $scope.eliminarProducto = function (index) {
                $scope.totalLiqudacion -= $scope.addedConceptos[index].totalAll;
                $scope.addedConceptos.splice(index, 1);
                $scope.button_disabled = false;
            };
    
            $scope.showAdvancedRRHH = function () {
                $state.go('home.createPersonal');
            };
    
            $scope.showAdvancedConcepto = function () {
                $state.go('home.viewPersona', {personaId: $scope.rrhh._id});
            };
    
            $scope.clickSubmit = function () {
                if ($scope.rrhh !== undefined) {
                    if ($scope.totalLiqudacion !== 0) {
                        if ($scope.fechaDeLiquidacion <= $scope.fechaDeLiquidacion2) {
                            var liquidacion = new Liquidaciones({
                                empleado: $scope.rrhh,
                                enterprise: $scope.rrhh.enterprise,
                                created: new Date(),
                                fechaDeLiquidacion: $scope.fechaDeLiquidacion,
                                fechaDeLiquidacion2: $scope.fechaDeLiquidacion2,
                                total: $scope.totalLiqudacion,
                                remuneraciones: $scope.addedConceptos,
                                observaciones: $scope.observaciones
                            });
    
                            liquidacion.$save(function (response) {
                                if (response._id) {
                                    $mdDialog.hide();
                                    $state.go('home.viewSaldo', {
                                        empleadoId: $scope.rrhh._id,
                                        displayName: $scope.rrhh.userLogin.displayName,
                                        centroDeCosto: $scope.rrhh.userLogin.centroDeCosto
                                    }, {reload: true}
                                );
                                }
                            }, function (errorResponse) {
                                $scope.error = errorResponse.data.message;
                            });
                        } else {
                            $scope.error = 'La primer fecha no puede ser mayor que la segunda';
                        }
                    } else {
                        $scope.error = 'Por favor agregar las liquidaciones';
                    }
                } else {
                    $scope.error = 'Por favor seleccione personal';
                }
            };
    
            $scope.clickUpdate = function () {
                if ($scope.rrhh !== undefined) {
                    if ($scope.totalLiqudacion !== 0) {
                        if ($scope.fechaDeLiquidacion <= $scope.fechaDeLiquidacion2) {
                            var liquidacion = $scope.liquidacion;
                            liquidacion.empleado = $scope.rrhh;
                            liquidacion.enterprise = $scope.rrhh.enterprise;
                            liquidacion.created = new Date();
                            liquidacion.fechaDeLiquidacion = $scope.fechaDeLiquidacion;
                            liquidacion.fechaDeLiquidacion2 = $scope.fechaDeLiquidacion2;
                            liquidacion.total = $scope.totalLiqudacion;
                            liquidacion.remuneraciones = $scope.addedConceptos;
                            liquidacion.observaciones = $scope.observaciones;
    
                            $http.put('/api/liquidaciones/' + liquidacion._id, liquidacion)
                                .then(function(response) {
                                    $state.go('home.liquidaciones', {
                                        empleadoId: $scope.rrhh._id,
                                        displayName: $scope.rrhh.userLogin.displayName,
                                        centroDeCosto: $scope.rrhh.userLogin.centroDeCosto
                                    });
                                }).catch(function (errorResponse) {
                                    $scope.error = errorResponse.data.message;
                                });
                        } else {
                            $scope.error = 'La primer fecha no puede ser mayor que la segunda';
                        }
                    } else {
                        $scope.error = 'Por favor agregar las liquidaciones';
                    }
                } else {
                    $scope.error = 'Por favor seleccione personal';
                }
            };
        }
    }
})();