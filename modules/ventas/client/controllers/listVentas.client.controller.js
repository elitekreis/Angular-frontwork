'use strict';

// Ventas controller
angular.module('ventas').controller('ListVentasController', ['$scope', '$state', '$http', '$stateParams', '$location', 'user', '$rootScope', '$mdBottomSheet', '$mdDialog', '$q', '$filter', 'Ventas', 'Socket', 'BottomSheetService', 'VentasExtra',
    function ($scope, $state, $http, $stateParams, $location, user, $rootScope, $mdBottomSheet, $mdDialog, $q, $filter, Ventas, Socket, BottomSheetService, VentasExtra) {

        $scope.tabParams = $state.params.tab;

        switch ($state.params.tab) {
            case 'realizada':
                $scope.realizada = true;
                break;
            case 'proceso':
                $scope.proceso = true;
                break;
            case 'finalizada':
                $scope.finalizada = true;
                break;
            case 'anulada':
                $scope.anulada = true;
            default:
                $scope.realizada = true;
        }

        var cambio = this;

        // definicion de modelos disponibles para la vista
        this.user = user;
        // this.ventasPendientes = ventasPendientes;
        // this.ventasPendientesPago = ventasPendientesPago;
        // this.ventasPendientesEntrega = ventasPendientesEntrega;
        // this.ventasFinalizadas = ventasFinalizadas;
        // this.ventasAnuladas = ventasAnuladas;

        this.ventasPendientes = [];
        this.ventasPendientesPago = [];
        this.ventasPendientesEntrega = [];
        this.ventasFinalizadas = [];
        this.ventasAnuladas = [];

        this.verVentasFecha = false;
        this.totalPendientesPA = 0;
        this.totalPendientesPago = 0;
        this.totalPendientesEntrega = 0;
        this.totalFinalizadas = 0;
        this.totalAnuladas = 0;
        this.theDate = new Date();
        this.currentPage = 0;

        this.ventasFinalizadas = [];
        this.arrayFechas = [];
        this.fechasFiltro = [];

        // definicion de funciones disponibles para la vista
        //this.filtrarVentas = filtrarVentas;
        this.mostrarDetalle = mostrarDetalle;
        this.showAdvanced = showAdvanced;
        this.showAdvancedFinalizar = showAdvancedFinalizar;
        this.showConfirmAnular = showConfirmAnular;
        this.showConfirmEntrega = showConfirmEntrega;
        this.showConfirmPago = showConfirmPago;
        this.cambiarEstadoVenta = cambiarEstadoVenta;
        this.extraerVenta = extraerVenta;
        this.printIt = printIt;
        this.refresh = refresh;
        this.borrarVenta = borrarVenta;

        // asignacion de funciones
        this.showBottomSheetRealizada = showBottomSheetRealizada;
        this.showBottomSheetProceso = showBottomSheetProceso;
        this.showBottomSheetFinalizada = showBottomSheetFinalizada;
        this.showBottomSheetAnulada = showBottomSheetAnulada;

        this.startReal = true;
        this.startFinal = true;
        this.startProcess = true;
        this.startCancel = true;

        this.loadmoreReal = function () {
            cambio.loadingReal = true;
            cambio.startReal = false;
            VentasExtra.loadMore(cambio.user.enterprise.enterprise, 'Pendiente de pago y entrega', cambio.ventasPendientes.length ? cambio.ventasPendientes[cambio.ventasPendientes.length - 1].created : null, cambio.ventasPendientes.length < 40 ? 40 : 20).then(
                angular.bind(cambio, function (data) {
                    cambio.ventasPendientes = cambio.ventasPendientes.concat(data.data);
                    cambio.loadingReal = false;
                    cambio.startFinal = false;
                    if (data.data.length === 0) cambio.doneReal = true;
                })
            )
        };

        this.loadmoreFinal = function () {            
            cambio.loadingFinal = true;
            VentasExtra.loadMore(cambio.user.enterprise.enterprise, 'Finalizada', cambio.ventasFinalizadas.length ? cambio.ventasFinalizadas[cambio.ventasFinalizadas.length - 1].created : null, cambio.ventasFinalizadas.length < 40 ? 40 : 20).then(
                angular.bind(cambio, function (data) {
                    cambio.ventasFinalizadas = cambio.ventasFinalizadas.concat(data.data);
                    cambio.loadingFinal = false;
                    cambio.startFinal = false;
                    if (data.data.length === 0) cambio.doneFinal = true;
                })
            )
        };

        this.loadmoreProcess = function () {
            cambio.loadingProcess = true;
            VentasExtra.loadMore(cambio.user.enterprise.enterprise, 'Pendiente de entrega', cambio.ventasPendientesEntrega.length ? cambio.ventasPendientesEntrega[cambio.ventasPendientesEntrega.length - 1].created : null, cambio.ventasPendientesEntrega.length < 40 ? 40 : 20).then(
                angular.bind(cambio, function (data) {

                    cambio.ventasPendientesEntrega = cambio.ventasPendientesEntrega.concat(data.data);
                    cambio.loadingProcess = false;
                    cambio.startProcess = false;
                    if (data.data.length === 0) cambio.doneProcess = true;
                })
            )
        };

        this.loadmoreCancel = function () {
            cambio.loadingCancel = true;
            VentasExtra.loadMore(this.user.enterprise.enterprise, 'Anulada', this.ventasAnuladas.length ? this.ventasAnuladas[this.ventasAnuladas.length - 1].created : null, this.ventasAnuladas.length < 40 ? 40 : 20).then(
                angular.bind(this, function (data) {

                    cambio.ventasAnuladas = cambio.ventasAnuladas.concat(data.data);
                    cambio.loadingCancel = false;
                    cambio.startCancel = false;
                    if (data.data.length === 0) cambio.doneCancel = true;
                })
            )
        };

        // actualizar modelos de dato de pedidos
        function refresh() {
            this.ventasPendientes = Ventas.query({
                e: this.user.enterprise.enterprise,
                estado: 'Pendiente de pago y entrega',
                p: 0,
                pcount: 20
            });
            this.ventasPendientesPago = Ventas.query({
                e: this.user.enterprise.enterprise,
                estado: 'Pendiente de pago2',
                p: 0,
                pcount: 20
            });
            this.ventasPendientesEntrega = Ventas.query({
                e: this.user.enterprise.enterprise,
                estado: 'Pendiente de entrega',
                p: 0,
                pcount: 20
            });
            this.ventasFinalizadas = Ventas.query({
                e: this.user.enterprise.enterprise,
                estado: 'Finalizada',
                p: 0,
                pcount: 20
            });
            this.ventasAnuladas = Ventas.query({
                e: this.user.enterprise.enterprise,
                estado: 'Anulada',
                p: 0,
                pcount: 20
            });
        }

        // // Obtener datos paginados del backend
        // function getPage (pagina, cantidad) {
        // 	console.log('pagina cantidad', pagina, cantidad)
        // 	// console.log('[+] pagina solicitada:', pagina);
        // 	if (pagina < 0) {
        // 		pagina = 0;
        // 	};
        // 	this.currentPage = pagina;
        // 	this.ventasPendientes = Ventas.query({e: this.user.enterprise.enterprise, estado: 'Pendiente de pago y entrega', p: pagina, pcount: cantidad });
        // 	this.ventasPendientesPago = Ventas.query({e: this.user.enterprise.enterprise, estado: 'Pendiente de pago2', p: pagina, pcount: cantidad });
        // 	this.ventasPendientesEntrega = Ventas.query({e: this.user.enterprise.enterprise, estado: 'Pendiente de entrega', p: pagina, pcount: cantidad });
        // 	this.ventasFinalizadas = Ventas.query({e: this.user.enterprise.enterprise, estado: 'Finalizada', p: pagina, pcount: cantidad });
        // 	this.ventasAnuladas = Ventas.query({e: this.user.enterprise.enterprise, estado: 'Anulada', p: pagina, pcount: cantidad });
        // };


        function existeFecha(venta) {
            for (var i in this.arrayFechas) {
                if (this.arrayFechas[i] === venta.filterDate.day) {
                    return true;
                }
            }
            return false;
        }

        function mostrarDetalle(i) {
            if (this.verVentasFecha === false) {
                this.verVentasFecha = true;
            } else {
                this.verVentasFecha = false;
            }
        }

        function showAdvanced(ev, item) {
            console.log(item);
            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/modules/ventas/views/modal.client.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        } //end showAdvanced

        //modal para aprobar presupuesto
        function showAdvancedFinalizar(ev, item) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/modules/ventas/views/modalAprobar.client.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        } //end showAdvanced

        //abre modal para anular y cerrar ventas
        function showConfirmAnular(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Anular Venta')
                .content('¿Está seguro que desea anular esta venta?')
                .ariaLabel('Lucky day')
                .ok('Aceptar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(angular.bind(this, function () {
                cambio.cambiarEstadoVenta('Anulada', item);
            }), function () {
                console.log('cancelaste anular');
            });
        } //end showConfirmAnular

        function showConfirmEntrega(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Finalizar venta')
                .content('¿Está seguro que desea finalizar esta venta?')
                .ariaLabel('Lucky day')
                .ok('Aceptar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(angular.bind(this, function () {
                cambio.cambiarEstadoVenta('Finalizada', item);
            }), function () {
                console.log('cancelaste cerrar');
            });
        } //end showConfirmEntrega

        function showConfirmPago(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Pagar venta')
                .content('¿Está seguro que desea pagar esta venta?')
                .ariaLabel('Lucky day')
                .ok('Aceptar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(angular.bind(this, function () {
                cambio.cambiarEstadoVenta('Finalizada', item);
            }), function () {
                console.log('cancelaste cerrar');
            });
        }

        // Cambiar estado Venta
        function cambiarEstadoVenta(estado, v) {
            var venta = v;
            venta.estado = estado;
            
            if (this.enterprise !== undefined) {
                venta.enterprise = this.enterprise._id
            } else {
                venta.enterprise = venta.enterprise._id
            }

            if (this.tipoComprobante !== undefined) {
                venta.tipoComprobante = this.tipoComprobante._id
            } else if ((venta.tipoComprobante !== undefined) && (venta.tipoComprobante !== null)) {
                venta.tipoComprobante = venta.tipoComprobante._id
            }
            if ((venta.cliente !== undefined) && (venta.cliente !== null)) {
                venta.cliente = venta.cliente._id
            } else if (this.client !== undefined) {
                venta.cliente = this.client._id
            }

            if (this.condicionVenta !== undefined) {
                venta.condicionVenta = this.condicionVenta._id
            } else if ((venta.condicionVenta !== undefined) && (venta.condicionVenta !== null)) {
                venta.condicionVenta = venta.condicionVenta._id
            }

            Socket.emit('venta.update', venta);

        } //end cambiarEstadoVenta

        Socket.on('ventas.update', angular.bind(this, function (message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                if (message.estado === 'Finalizada') {
                    $http.post('/api/impuestos/updateTotal',
                        {
                            month: (new Date()).getMonth(),
                            year: (new Date()).getFullYear()
                        }
                    );
                }
                this.refresh();
            }
        }));

        function borrarVenta(venta) {
            venta.$remove();
            if (venta.estado == 'Finalizada') {
                for (var i in ventasFinalizadas) {
                    if (ventasFinalizadas[i] === venta) {
                        ventasFinalizadas.splice(i, 1);
                    }
                }
            } else {
                for (var i in ventasAnuladas) {
                    if (ventasAnuladas[i] === venta) {
                        ventasAnuladas.splice(i, 1);
                    }
                }
            }

        }

        //****PARA LA EXTRACCION DEL PDF

        function extraerVenta(item) {
            var promise = asyncAsignarVenta(item);
            promise.then(angular.bind(this, function (response) {
                // console.log(response);
                cambio.printIt();
            }));
        } //end extraerVenta

        function asyncAsignarVenta(item) {
            var deferred = $q.defer();
            $scope.venta = item;
            setTimeout(function () {
                if ($scope.venta !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        } //end asyncAsignarVenta

        function printIt() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-venta').value;
            var c = document.getElementById('printing-data-venta').innerHTML;
            window.frames["print_frame_venta"].document.title = 'IM - Venta';
            window.frames["print_frame_venta"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_venta"].window.focus();
            window.frames["print_frame_venta"].window.print();
        } //end printIt

        function httpGet(theUrl) {
            var xmlHttp = null;
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        } //end httpGet

        //****FIN EXTRACCION DEL PDF

        // definicion de funciones BottomSheet
        function showBottomSheetRealizada($event, item) {

            var buttons = [{
                name: 'view',
                label: 'Ver',
                icon: 'visibility'
            },
                {
                    name: 'edit',
                    label: 'Estado',
                    icon: 'call_made'
                },
                {
                    name: 'remove',
                    label: 'Anular',
                    icon: 'remove_circle'
                },
                {
                    name: 'print',
                    label: 'Imprimir',
                    icon: 'print'
                }
            ];

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function (err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'edit':
                        showAdvanced($event, item);
                        break;
                    case 'view':
                        $state.go('home.viewVenta', {ventaId: item._id});
                        break;
                    case 'remove':
                        showConfirmAnular($event, item);
                        break;
                    case 'print':
                        extraerVenta(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetProceso($event, item) {

            var buttons = [{
                name: 'finalize',
                label: 'Finalizar',
                icon: 'done'
            },
                {
                    name: 'view',
                    label: 'Ver',
                    icon: 'visibility'
                },
                {
                    name: 'remove',
                    label: 'Anular',
                    icon: 'close'
                },
                {
                    name: 'print',
                    label: 'Imprimir',
                    icon: 'print'
                }
            ];

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function (err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'finalize':
                        showAdvancedFinalizar($event, item);
                        break;
                    case 'view':
                        $state.go('home.viewVenta', {ventaId: item._id});
                        break;
                    case 'remove':
                        showConfirmAnular($event, item);
                        break;
                    case 'print':
                        extraerVenta(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetFinalizada($event, item) {

            var buttons = [{
                name: 'view',
                label: 'Ver',
                icon: 'visibility'
            },
                {
                    name: 'remove',
                    label: 'Eliminar',
                    icon: 'remove_circle'
                },
                {
                    name: 'print',
                    label: 'Imprimir',
                    icon: 'print'
                }
            ];

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function (err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'view':
                        $state.go('home.viewVenta', {ventaId: item._id});
                        break;
                    case 'remove':
                        showConfirmAnular($event, item);
                        break;
                    case 'print':
                        extraerVenta(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetAnulada($event, item) {

            var buttons = [{
                name: 'view',
                label: 'Ver',
                icon: 'visibility'
            },
                {
                    name: 'print',
                    label: 'Imprimir',
                    icon: 'print'
                }
            ];

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function (err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'view':
                        $state.go('home.viewVenta', {ventaId: item._id});
                        break;
                    case 'print':
                        extraerVenta(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function DialogController($scope, $mdDialog, item, Ventas, Socket, Cajas) {

            $scope.item = item; //es la venta que tengo que actualizar

            $scope.seleccionCaja = false;

            $scope.findCajas = function () {
                $scope.cajas = [];
                Cajas.query({e: item.enterprise._id}, function (foundCaja) {
                    foundCaja.forEach(function (entry) {
                        if (entry.deleted === false) {
                            $scope.cajas.push(entry);
                        }
                    });

                    if ($scope.cajas.length === 1) {
                        $scope.caja = $scope.cajas[0];
                    }
                });
            };

            $scope.findCajas();

            $scope.finalizarVenta = function (item) {
                var estado = 'Finalizada';
                if (item.condicionVenta.name !== 'Cuenta Corriente') {
                    if (this.caja !== undefined) {
                        item.caja = this.caja;
                        updateVenta(item, estado);
                    } else {
                        $scope.errorCaja = 'Debe seleccionar la caja';
                    }
                } else {
                    item.caja = undefined;
                    updateVenta(item, estado);
                }
            };

            function updateVenta(venta, estado) {
                venta.estado = estado;

                venta.enterprise = venta.enterprise._id;
                venta.tipoComprobante = venta.tipoComprobante._id;
                if (venta.cliente && venta.cliente._id) {
                    venta.cliente = venta.cliente._id
                }
                if (venta.category1 && venta.category1._id) {
                    venta.category1 = venta.category1._id
                }
                venta.condicionVenta = venta.condicionVenta._id;
                if (venta.caja !== undefined) {
                    venta.caja = venta.caja._id;
                }

                $mdDialog.hide();
                Socket.emit('venta.update', venta);
            }

            $scope.montoTotal = function () {
                console.log('mototoal?????');
                Ventas.query({e: $scope.item.enterprise}, function () {
                    for (var i in $scope.$parent.ventas) {
                        if (($scope.ventas[i].estado === 'Pendiente de pago y entrega') && ($scope.ventas[i].deleted === false)) {
                            $scope.$parent.totalPendientesPA = $scope.$parent.totalPendientesPA + $scope.ventas[i].total;
                        }
                        if (($scope.ventas[i].estado === 'Pendiente de pago2') && ($scope.ventas[i].deleted === false)) {
                            $scope.$parent.totalPendientesPago = $scope.$parent.totalPendientesPago + $scope.ventas[i].total;
                        }
                        if (($scope.ventas[i].estado === 'Pendiente de entrega') && ($scope.ventas[i].deleted === false)) {
                            $scope.$parent.totalPendientesEntrega = $scope.$parent.totalPendientesEntrega + $scope.ventas[i].total;
                        }
                        if (($scope.ventas[i].estado === 'Finalizada') && ($scope.ventas[i].deleted === false)) {
                            $scope.$parent.totalFinalizadas = $scope.$parent.totalFinalizadas + $scope.ventas[i].total;
                            $scope.$parent.ventasFinalizadas.push($scope.ventas[i]);
                        }
                        if (($scope.ventas[i].estado === 'Anulada') && ($scope.ventas[i].deleted === false)) {
                            $scope.$parent.totalAnuladas = $scope.$parent.totalAnuladas + $scope.ventas[i].total;
                            // $scope.$parent.ventasFinalizadas.push($scope.ventas[i]);
                        }
                    }
                })
            }; //end montoTotal

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };

            $scope.habilitoCaja = function (n) {
                $scope.seleccionCaja = n;
            };

            $scope.actualizarVenta = function (data) {

                var venta = $scope.item;
                if (data === 'pagado') {
                    var estado = 'Pendiente de entrega';
                }
                if (data === 'entregado') {
                    var estado = 'Pendiente de pago2';
                }
                if (data === 'pYa') {
                    var estado = 'Finalizada';
                }

                venta.estado = estado;

                /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
                 una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
                 hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */
                venta.enterprise = venta.enterprise._id;
                if (venta.tipoComprobante !== undefined) {
                    venta.tipoComprobante = venta.tipoComprobante._id;
                }
                venta.cliente = venta.cliente._id;
                venta.condicionVenta = venta.condicionVenta._id;

                $mdDialog.hide();
                Socket.emit('venta.update', venta);

                // venta.$update(function() {
                // 	// $scope.montoTotal();
                // 	$mdDialog.hide();
                // 	if (data !== undefined){
                // 		location.reload(true);
                // 	}
                // 	// $location.path('ventas');
                // }, function(errorResponse) {
                // 	$scope.error = errorResponse.data.message;
                // });
            }; //end actualizarVenta

        } //end dialogController

    } //end function
]);