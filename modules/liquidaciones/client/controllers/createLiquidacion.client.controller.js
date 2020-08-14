'use strict';

// Comprobantes controller
angular.module('liquidaciones').controller('LiquidacionCreateController', ['user', '$state', '$filter', '$scope', '$http', '$stateParams', 'Empleados', 'Authentication', 'Liquidaciones',
    function (user, $state, $filter, $scope, $http, $stateParams, Empleados, Authentication, Liquidaciones) {

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

        $scope.searchTextChangePersonal = function (text) {
            return $filter('filter')($scope.personal, {deleted: false, $: text});
        };

        $scope.searchTextChangeConcepto = function (text) {
            return $filter('filter')($scope.remuneraciones, {$: text});
        };

        $scope.selectedItemChange = function (item) {
            $scope.rrhh = item;
            $scope.remuneraciones = item && item.userLogin && item.userLogin.remuneraciones || [];
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
                                $state.go('home.liquidaciones', {
                                    empleadoId: $scope.rrhh._id,
                                    displayName: $scope.rrhh.userLogin.displayName,
                                    centroDeCosto: $scope.rrhh.userLogin.centroDeCosto
                                });
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
]);