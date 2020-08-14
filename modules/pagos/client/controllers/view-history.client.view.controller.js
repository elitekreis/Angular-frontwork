'use strict';

// Comprobantes controller
angular.module('pagos').controller('HistoryViewController', ['$stateParams', '$state', 'user', 'Authentication', '$mdDialog', '$scope', 'pago', 'servicios', 'Cajas', 'CostosindirectosService', 'Empleados', 'Impuestos', '$rootScope',"ServiceNavigation","PagosService",
    function ($stateParams, $state, user, authentication, $mdDialog, $scope, pago, servicios, Cajas, CostosindirectosService, Empleados, Impuestos, $rootScope,ServiceNavigation,PagosService) {

        // asignacion de modelos
        var global = this;
        this.user = user;
        this.pago = pago;
        this.servicios = servicios;
        this.waiting = false;
        this.movimientos = [];
        this.movimientosList = [];
        this.pagoType = null;
        this.openMenu = openMenu;
        this.showConfirm = showConfirm;
        var originatorEv;
        // asignacion de funciones
     
        this.findMovimientos = findMovimientos;
        this.showAlert = showAlert;
        this.showDialogPago = showDialogPago;
        this.findMovimientos(pago);

        if ($stateParams.servicosId !== '') {
            this.pagoType = 'costosIndirectos';
        } else if ($stateParams.impuestosId !== '') {
            this.pagoType = 'impuestos';
        } else if ($stateParams.empleadoId !== '') {
            this.pagoType = 'personal';
            this.displayName = $stateParams.displayName;
            this.centroDeCosto = $stateParams.centroDeCosto;
            Empleados.get({empleadoId: $stateParams.empleadoId}, function (response) {
                $scope.empleado = response;
            });
        }

        console.log(pago)
        this.serviceDetailList = pago;
        //alert(localStorage.getItem('serviceName'))
        this.serviceName = localStorage.getItem('serviceName');
        this.showComfirmServiceDetail = showComfirmServiceDetail;

         var self = this;

        $rootScope.$broadcast('hide nav',true);

        $scope.rutaVolver = function() {
            history.back();
        };

        function openMenu($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        }

        // definicion de funciones

        function findMovimientos(pago) {
            this.waiting = true;
            this.movimientosList = pago;
            this.waiting = false;
        }

        $scope.callAddPago = function ($event, item) {
            $rootScope.$emit("callAddPago", {event: $event, item: item});
        };

        function showAlert(ev, obs) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(obs)
                .ariaLabel('Alert Dialog Demo')
                .targetEvent(ev)
                .ok('Cerrar')
            );
        }

        function showComfirmServiceDetail (ev,item) {
          var confirm = $mdDialog.confirm()
              .title('¿Eliminar la pago?')
              .ariaLabel('Lucky day')
              .targetEvent(ev)
              .ok('Aceptar')
              .cancel('Cancelar'); 
          $mdDialog.show(confirm).then(function () {
              deleteServiceDetail(item);
          }, function () {
              //cancelo
          });
        }

       
        function deleteServiceDetail(item) {
          var strToArr = $stateParams.servicosId.split("/");         
          PagosService.query({e: user.enterprise._id,type: "deleteService",id:item.id,serviceId: strToArr[0]},function(data){  
            console.log(data);       
            self.serviceDetailList = data;
          });          
        }

        function showConfirm(ev, item) {
          var confirm = $mdDialog.confirm()
            .title('¿Eliminar la pago?')
            .ariaLabel('Lucky day')
            .targetEvent(ev)
            .ok('Aceptar')
            .cancel('Cancelar');
          $mdDialog.show(confirm).then(function () {
            deletePago(item);
          }, function () {
            //cancelo
          });
        }

        function deletePago(item) {
            if (item) {
                item.deleted = true;
                item.$update(function () {               // code for update pago
                    var total = 0;
                    var cheques = 0;
                    var efectivo = 0;
                    Cajas.get({cajaId: item.cajaD}, function (caja) {
                        caja.total = caja.total + item.montoE + item.montoC;
                        
                        caja.cheques = caja.cheques + item.montoC;
                        caja.efectivo = caja.efectivo + item.montoE;

                        caja.enterprise = caja.enterprise._id;
                        item.cajaD = caja;
                        caja.$update(function () {
                            if ($stateParams.impuestosId !== '') {
                              Impuestos.get({impuestoId: item.impuestos._id}, function (impuesto) {
                                  impuesto.total = impuesto.total - (item.montoE + item.montoC);
                                  impuesto.$update(function () {
                                      $state.go('home.viewImpuesto', {centroDeCosto: item.impuestos.centroDeCosto});
                                  }, function (errorResponse) {
                                      console.log('costo error');
                                  });
                              });
                            } else if ($stateParams.empleadoId !== '') {
                                console.log("liquid");
                            } else {
                                servicios.pagoAcumulados = servicios.pagoAcumulados - (item.montoC + item.montoE);
                                servicios.$update(function () {           //  minus pago amount from servicios
                                    CostosindirectosService.get({costosindirectoId: servicios.costosindirectos}, function (costo) {
                                        total = costo.total - (item.montoC + item.montoE);
                                        costo.total = total;
                                        costo.enterprise = costo.enterprise.id;
                                        costo.$update(function () {
                                            $state.go('home.viewPago', {servicosId: $stateParams.servicosId});
                                        }, function (errorResponse) {
                                            console.log(errorResponse);
                                        });
                                    });
                                }, function (errorResponse) {
                                    console.log('servicios error');
                                });
                            }
                        }, function (errorResponse) {
                            console.log('caja error');
                        });

                    });
                }, function (errorResponse) {
                    console.log('pago error');
                });
            }
        }

        function showDialogPago($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/edit-pago.client.view.html',
                locals: {
                    item: item,
                    user: global.user
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        } //end showDialog
        // fin actualizaciones en tiempo real.
        function DialogController($scope, $mdDialog, item, user, PagosService, $filter, ServiciosService, Cajas, CostosindirectosService) {
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watchCollection('ServiciosService', function () {
                $scope.findPago();
            });

            $scope.$watchCollection('Cajas', function () {
                $scope.findCajas();
            });


            $scope.mostrar = true;

            $scope.item = item;
            $scope.caja = item.cajaD;
            //$scope.
            $scope.costCenterAgregados = [];

            $scope.montoE = item.montoE;
            $scope.montoC = item.montoC;
            $scope.observaciones = item.observaciones;
            $scope.pagoDate = new Date(item.pagoDate);

            $scope.errorCaja = undefined;

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

            $scope.serviciosIDArray = [];
            //devuelve todas la Servicios

            $scope.findPago = function () {
              $scope.pagos = PagosService.query({e: user.enterprise._id});
            };

            $scope.editFactura = function($event,item) {
              if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
               
                CostosindirectosService.get({costosindirectoId: servicios.costosindirectos}, function (costo) {
                  costo.facturaEdit = item;
                  costo.$update(function (data) {
                      console.log(data)
                      self.serviceDetailList = costo.operacion;
                      console.log('costo updated');
                      
                  }, function (errorResponse) {
                      console.log(errorResponse);
                  });
                
                  
                    /*costo.total = (diffMontoE != 0) ? costo.total + diffMontoE : costo.total;
                    costo.total = (diffMontoC != 0) ? costo.total + diffMontoC : costo.total;
                    costo.enterprise = costo.enterprise.id;
                    costo.$update(function () {
                        console.log('costo updated');
                        $state.go('home.viewPago', {servicosId: $stateParams.servicosId});
                    }, function (errorResponse) {
                        console.log(errorResponse);
                    });*/
                });
              }
            } 


            $scope.editPago = function ($event, values) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces
                        var diffMontoE = $scope.montoE - item.montoE;
                        var diffMontoC = $scope.montoC - item.montoC;
                        item.montoE = (diffMontoE != 0) ? item.montoE + diffMontoE : item.montoE;
                        item.montoC = (diffMontoC != 0) ? item.montoC + diffMontoC : item.montoC;
                        item.saldo = (diffMontoE != 0) ? item.saldo - diffMontoE : item.saldo;
                        item.saldo = (diffMontoC != 0) ? item.saldo - diffMontoC : item.saldo;
                        item.pagoDate = $scope.pagoDate;
                        item.observaciones = $scope.observaciones;

                        item.$update(function () {
                            Cajas.get({cajaId: item.cajaD}, function (caja) {
                                caja.total = (diffMontoE != 0) ? caja.total - diffMontoE : caja.total;
                                caja.total = (diffMontoC != 0) ? caja.total - diffMontoC : caja.total;
                                caja.cheques = (diffMontoC != 0) ? caja.cheques - diffMontoC : caja.cheques;
                                caja.efectivo = (diffMontoE != 0) ? caja.efectivo - diffMontoE : caja.efectivo;
                                caja.enterprise = caja.enterprise.id;
                                item.cajaD = caja;
                                caja.$update(function () {
                                    console.log('caja updated');
                                    if ($stateParams.impuestosId !== '') {
                                        Impuestos.get({impuestoId: item.impuestos._id}, function (impuesto) {
                                            impuesto.total = impuesto.total + (diffMontoE || 0) + (diffMontoC || 0);
                                            impuesto.$update(function () {
                                                $state.go('home.viewImpuesto', {centroDeCosto: item.impuestos.centroDeCosto});
                                            }, function (errorResponse) {
                                                console.log('costo error');
                                            });
                                        });
                                    } else {
                                        servicios.pagoAcumulados = (diffMontoE != 0) ? servicios.pagoAcumulados + diffMontoE : servicios.pagoAcumulados;
                                        servicios.pagoAcumulados = (diffMontoC != 0) ? servicios.pagoAcumulados + diffMontoC : servicios.pagoAcumulados;
                                        servicios.$update(function () {           //  minus pago amount from servicios                                            
                                            CostosindirectosService.get({costosindirectoId: servicios.costosindirectos}, function (costo) {
                                                costo.total = (diffMontoE != 0) ? costo.total + diffMontoE : costo.total;
                                                costo.total = (diffMontoC != 0) ? costo.total + diffMontoC : costo.total;
                                                costo.enterprise = costo.enterprise.id;
                                                costo.$update(function () {
                                                    console.log('costo updated');
                                                    $state.go('home.viewPago', {servicosId: $stateParams.servicosId});
                                                }, function (errorResponse) {
                                                    console.log(errorResponse);
                                                });
                                            });
                                        }, function (errorResponse) {
                                            console.log('servicios error');
                                        });
                                    }
                                }, function (errorResponse) {
                                    console.log('caja error');
                                });

                            });

                        }, function (error) {
                            console.log(error);
                        });
                        $mdDialog.hide();
                    }
                    else {
                        $scope.errorCaja = 'Se debe seleccionar la caja origin'
                    }
                }
            };          //agrega puestos en el edit de caja


            //funcion que rendondea a 2 decimales
            function roundToTwo(num) {
                return +(Math.round(num + "e+2") + "e-2");
            }

            $scope.pagosAcumulados = item.pagoAcumulados;
            $scope.addPagoAcumulados = function (value) {
                $scope.errorCaja = false;
                if ($scope.caja) {
                    if ($scope.caja.efectivo + item.montoE >= value) {
                        $scope.montoE = value;
                        $scope.pagosAcumulados = item.pagoAcumulados + $scope.montoC + $scope.montoE;
                    } else {
                        $scope.errorCaja = 'amount is not available in selected caja';
                    }
                } else {
                    $scope.errorCaja = 'Se debe seleccionar la caja origin';
                }
            };
            
            $scope.addCheque = function (value) {
                $scope.errorCaja = false;
                if ($scope.caja) {
                    if ($scope.caja.cheques >= value) {
                        $scope.montoC = value;
                        $scope.pagosAcumulados = item.pagoAcumulados + $scope.montoC + $scope.montoE;

                    } else {
                        $scope.errorCaja = 'amount is not available in selected caja';
                    }
                } else {
                    $scope.errorCaja = 'Se debe seleccionar la caja origin';
                }
            }

        }
    }
]);
