'use strict';

// Comprobantes controller
angular.module('sucursales').controller('SucursalesViewController', ['user', 'sucursal', '$mdDialog', 'cajas', 'Socket', 'Cajas',
    function(user, sucursal, $mdDialog, cajas, Socket, Cajas) {

        // asignacion de modelos
        this.user = user;
        this.sucursal = sucursal;
        this.cajas = cajas;
        console.log("Tele");

        this.arrayCajas = [];
        var originatorEv;
        this.editing = false;

        this.selectedMode = 'md-scale';
        this.selectedDirection = 'up';

        // asignacion de funciones

        this.showDialog = showDialog;
        this.showDialogTransferencia = showDialogTransferencia;
        this.showDialogArqueo = showDialogArqueo;
        this.findUsuarios = findUsuarios;
        this.openMenu = openMenu;
        this.showConfirm = showConfirm;
        this.editingCaja = editingCaja;
        this.editCaja = editCaja;
        this.showDialogPuestos = showDialogPuestos;
        this.findFromArray = findFromArray;

        this.findUsuarios(cajas);

        // definicion de funciones

        function findFromArray(array, object) {

            if (!array) return false;
            if (!object) return false;

            var checker = false;

            array.forEach(function(entry) {
                if (entry._id === object._id) checker = true;
            })

            return checker;
        }

        function findUsuarios(cajas) {
            if ((this.user.roles[0] !== 'admin') && (this.user.roles[0] !== 'groso')) {
                cajas.$promise.then(angular.bind(this, function(data) {
                    for (var i in data) {                       
                        if (data[i].puestos !== undefined) {
                            if (data[i].puestos.length !== 0) {
                                for (var j in data[i].puestos) {
                                    if (data[i].puestos[j]._id === user.puesto) {
                                        this.arrayCajas.push(data[i]);
                                    }
                                }
                            }
                        }
                    }
                }));
            } else {
                this.arrayCajas = cajas;
            }
        };

        function showDialog($event, item) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    templateUrl: 'modules/cajas/views/create-caja.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function showDialogTransferencia($event, item) {
            $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/transferencias/views/create-transferencia.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function showDialogArqueo($event, item) {
            $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/arqueos/views/create-arqueo.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function showDialogPuestos($event, item) {
            $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/sucursales/views/add-puesto.client.view.html',
                    locals: {
                        item: item,
                        user: this.user
                    },
                    controller: DialogController
                })
                .then(function(answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function() {
                    //$scope.alert = 'You cancelled the dialog.';
                });;
        }; //end showDialog

        function openMenu($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        function showConfirm(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la caja?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                deleteCaja(item);
            }, function() {
                //cancelo
            });
        };

        function deleteCaja(item) {
            if (item) {
                item.$remove();

                for (var i in cajas) {
                    if (cajas[i] === item) {
                        cajas.splice(i, 1);
                    }
                }
            } else {
                cajas.$remove(function() {

                });
            }
        };

        //habilito edicion
        function editingCaja(item) {
            this.editing = item;
        };

        //edita nombre de la caja
        function editCaja(item) {
            this.editing = false;
            item.enterprise = item.enterprise._id;
            for (var i in item.puestos) {
                item.puestos[i] = item.puestos[i]._id;
            };
            item.$update(function() {
                console.log('todo ok');
            }, function(errorResponse) {
                console.log('error');
            });
        };


        // actualizaciones en tiempo real.

        Socket.on('sucursal.update', angular.bind(this, function(message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                this.cajas = Cajas.query({ e: this.user.enterprise.enterprise })
                    .$promise.then(angular.bind(this, function(data) {
                        //console.log('cajas:', data);
                        this.findUsuarios(data);
                    }));
            }
        }));

        // fin actualizaciones en tiempo real.
        function DialogController($scope, $mdDialog, item, user, Puestos, Cajas, Transferencias, Arqueos, $filter, $location, Socket) {

            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces

            $scope.$watchCollection('Cajas', function() {
                $scope.findCajas();
                $scope.findCajasTotal();
                $scope.findTransferencias();
                $scope.findArqueos();
            });

            $scope.operaciones = [{
                id: 3,
                name: 'Ajustes'
            }, {
                id: 1,
                name: 'Apertura de Caja'
            }, {
                id: 2,
                name: 'Cierre de Caja'
            }];

            $scope.efectivo = item.efectivo;
            $scope.cheques = item.cheques;
            $scope.credito = item.credito;
            $scope.debito = item.debito;
            $scope.dolares = item.dolares;
            $scope.totalCaja = item.total;
            $scope.efectivoAjuste = 0;
            $scope.chequeAjuste = 0;
            $scope.creditoAjuste = 0;
            $scope.debitoAjuste = 0;
            $scope.dolaresAjuste = 0;

            $scope.mostrar = true;

            $scope.item = item;
            $scope.puestosAgregados = [];

            $scope.montoE = 0;
            $scope.montoC = 0;
            $scope.montoD = 0;
            $scope.montoTD = 0;
            $scope.montoTC = 0;
            $scope.newSaldo = roundToTwo(item.total);

            $scope.errorCaja = undefined;

            $scope.closeDialog = function() {
                $mdDialog.hide();
            };

            $scope.findPuestos = function() {
                $scope.puestos = Puestos.query({ e: user.enterprise._id });
            };

            //esta funcion es para seleccionar la caja destino en la transferencia, y que no aparezca la caja origen
            $scope.findCajas = function() {
                Cajas.query({ e: user.enterprise._id }, function(data) {
                    $scope.cajas = $filter('filter')(data, function(item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };
            $scope.cajasIDArray = [];
            // function for get caja id array of sucursals
            /*			$scope.findCajaID = function(){
            				console.log("in cajas function");
            				Cajas.query({ e: user.enterprise._id }, function(data){
            					for (var i in data ) {
            						if(data[i].sucursal == $scope.item._id && data[i].deleted == false){
            							$scope.cajasIDArray.push(data[i]._id);
            						}
            					}
            					var sucursal = $scope.item;					
            					sucursal.cajas = $scope.cajasIDArray;
            					sucursal.$update(function() {
            						console.log('sucursal ok');
            					}, function(errorResponse) {
            						console.log('sucursal error');
            					});

            				});

            			};
            */ //devuelve todas la cajas
            $scope.findCajasTotal = function() {
                $scope.cajasTotal = Cajas.query({ e: user.enterprise._id });
            };

            $scope.findTransferencias = function() {
                $scope.transferencias = Transferencias.query({ e: user.enterprise._id });
            };

            $scope.findArqueos = function() {
                $scope.arqueos = Arqueos.query({ e: user.enterprise._id });
            };

            $scope.addEfectivo = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoE = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoC - $scope.montoTD - $scope.montoTC - $scope.montoD);
            };

            $scope.addCheque = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoC = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTD - $scope.montoTC - $scope.montoD);
            };

            $scope.addTarCre = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoTC = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTD - $scope.montoC - $scope.montoD);
            };

            $scope.addtarDeb = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoTD = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTC - $scope.montoC - $scope.montoD);
            };

            $scope.addDolares = function(value) {
                $scope.errorCaja = undefined;
                $scope.montoD = value;

                $scope.newSaldo = roundToTwo($scope.item.total - value - $scope.montoE - $scope.montoTC - $scope.montoC - $scope.montoTD);
            };

            //funcion que rendondea a 2 decimales
            function roundToTwo(num) {
                return +(Math.round(num + "e+2") + "e-2");
            };

            $scope.createCaja = function($event) {

                $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces
                var c = { caja: {} };
                var name = 'Caja '
                var num = $scope.cajasTotal.length + 1;
                var res = name.concat(num);

                var caja = {
                    name: res,
                    descripcion: this.descripcion,
                    puestos: $scope.puestosAgregados,
                    sucursal: $scope.item._id,
                    enterprise: user.enterprise._id
                };

                var sucursal = $scope.item;
                sucursal.enterprise = sucursal.enterprise._id;

                Socket.emit('caja.create', caja);
                $mdDialog.hide();
                Cajas.query({ e: user.enterprise._id }, function(data) {
                    for (var i in data) {
                        if (data[i].sucursal == $scope.item._id && data[i].deleted == false) {
                            $scope.cajasIDArray.push(data[i]._id);
                        }
                    }
                    sucursal.cajas = $scope.cajasIDArray;
                    sucursal.$update(function() {
                        console.log('sucursal ok');
                    }, function(errorResponse) {
                        console.log('sucursal error');
                    });

                });
            };
            //agrega puestos en el create de caja
            $scope.agregarPuesto = function(puesto) {
                var ok = false;
                if ((puesto !== undefined) && (puesto !== null)) {
                    for (var i in $scope.puestosAgregados) {
                        if ($scope.puestosAgregados[i]._id === puesto._id) {
                            var ok = true;
                        }
                    }
                    if (!ok) {
                        $scope.puestosAgregados.push(puesto);
                    }
                }
            };

            //agrega puestos en el edit de caja
            $scope.addPuestoCaja = function(puesto) {

                var ok = false;
                if ((puesto !== undefined) && (puesto !== null)) {
                    for (var i in item.puestos) {
                        if (item.puestos[i]._id === puesto._id) {
                            var ok = true;
                        }
                    }
                    if (!ok) {
                        item.puestos.push(puesto);
                    }
                }
            }

            //borrar puestos elegidos cuando esta creando una caja
            $scope.borrarPuesto = function(item) {
                if (item) {

                    for (var i in $scope.puestosAgregados) {
                        if ($scope.puestosAgregados[i] === item) {
                            $scope.puestosAgregados.splice(i, 1);
                        }
                    }
                } else {
                    console.log('ningun puesto');
                }
            };

            //borra puestos en el editar de cajas
            $scope.suprimirPuesto = function(p) {
                if (p) {

                    for (var i in item.puestos) {
                        if (item.puestos[i]._id === p._id) {
                            item.puestos.splice(i, 1);
                        }
                    }
                } else {
                    console.log('ningun puesto');
                }
            };
            $scope.transType = "";
            //acepta la edicion de agregar/quitar puestos de una caja
            $scope.editPuestosCaja = function(item) {
                item.enterprise = item.enterprise._id;
                for (var i in item.puestos) {
                    item.puestos[i] = item.puestos[i]._id;
                }
                item.$update(function() {
                    console.log('todo ok');
                    $mdDialog.hide();
                }, function(errorResponse) {
                    console.log('error');
                });
            }
            $scope.changeTrans = function() {
                console.log($scope.transType);
                // $scope.montoE = 0;
                // $scope.montoC = 0;
                // $scope.montoD = 0;
                // $scope.montoTC = 0;
                // $scope.montoTD = 0;



            }

            $scope.createTransferencia = function($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var newSaldoDestino = $scope.caja.total + $scope.montoE + $scope.montoC + $scope.montoD + $scope.montoTD + $scope.montoTC;

                        var numero = $scope.transferencias.length + 1;

                        var transferencia = {
                            numero: numero,
                            cajaO: item._id,
                            cajaD: $scope.caja._id,
                            montoE: $scope.montoE,
                            montoC: $scope.montoC,
                            montoD: $scope.montoD,
                            montoTD: $scope.montoTD,
                            montoTC: $scope.montoTC,

                            saldo: $scope.newSaldo,
                            saldoDestino: newSaldoDestino,
                            observaciones: $scope.observaciones,
                            enterprise: user.enterprise._id
                        };
                        console.log(transferencia);
                        Socket.emit('transferencia.create', transferencia);
                        $mdDialog.hide();
                    } else {
                        $scope.errorCaja = 'Se debe seleccionar la caja destino'
                    }
                }
            };

            $scope.createArqueo = function($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if ($scope.operacion !== undefined) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var ajuste = $scope.efectivoAjuste + $scope.chequeAjuste + $scope.creditoAjuste + $scope.debitoAjuste + $scope.dolaresAjuste;

                        var numero = $scope.arqueos.length + 1;

                        var arqueo = {
                            caja: item._id,
                            numero: numero,
                            operacion: $scope.operacion,
                            observaciones: $scope.observaciones,
                            efectivo: $scope.efectivo,
                            cheques: $scope.cheques,
                            debito: $scope.debito,
                            credito: $scope.credito,
                            dolares: $scope.dolares,
                            efectivoAjuste: $scope.efectivoAjuste,
                            chequeAjuste: $scope.chequeAjuste,
                            debitoAjuste: $scope.debitoAjuste,
                            creditoAjuste: $scope.creditoAjuste,
                            dolaresAjuste: $scope.dolaresAjuste,
                            ajuste: ajuste,
                            total: $scope.totalCaja,
                            enterprise: user.enterprise._id
                        };

                        Socket.emit('arqueo.create', arqueo);
                        $mdDialog.hide();
                    } else {
                        $scope.errorOperacion = 'Se debe indicar la operacion'
                    }
                }
            };

            $scope.addAjuste = function(tipo) {
                if (tipo == 'efectivo') {
                    $scope.efectivo = item.efectivo + $scope.efectivoAjuste;
                } else {
                    if (tipo == 'cheque') {
                        $scope.cheques = item.cheques + $scope.chequeAjuste;
                    } else {
                        if (tipo == 'credito') {
                            $scope.credito = item.credito + $scope.creditoAjuste;
                        } else {
                            if (tipo == 'debito') {
                                $scope.debito = item.debito + $scope.debitoAjuste;
                            } else {
                                if (tipo == 'dolares') {
                                    $scope.dolares = item.dolares + $scope.dolaresAjuste;
                                }
                            }
                        }
                    }
                }
                $scope.totalCaja = $scope.efectivo + $scope.cheques + $scope.credito + $scope.debito + $scope.dolares;
            }
        }
    }
]);