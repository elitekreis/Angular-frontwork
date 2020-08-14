angular.module('pedidos').controller('ListPedidosController', ['$scope', '$rootScope', '$stateParams', '$location', 'user', 'Enterprises', '$mdBottomSheet', '$state', '$mdDialog', 'pedidosRealizados', 'pedidosBorrador', 'pedidosAprobados', 'pedidosRechazados', 'pedidosEvaluacion', 'tipoOrden', 'tipoPedido', '$q', 'Pedidos', 'Socket', 'ventasPendientesEntrega', 'ventasFinalizadas', 'ventasPendientes', 'BottomSheetService', 'PedidosExtra',
    function($scope, $rootScope, $stateParams, $location, user, Enterprises, $mdBottomSheet, $state, $mdDialog, pedidosRealizados, pedidosBorrador, pedidosAprobados, pedidosRechazados, pedidosEvaluacion, tipoOrden, tipoPedido, $q, Pedidos, Socket, ventasPendientesEntrega, ventasFinalizadas, ventasPendientes, BottomSheetService, PedidosExtra) {

        $scope.tabParams = $state.params.tab;

        switch ($state.params.tab) {
            case 'realizada':
                $scope.realizada = true;
                break;
            case 'aprobadas':
                $scope.aprobadas = true;
                break;
            case 'borrador':
                $scope.borrador = true;
                break;
            case 'rechazadas':
                $scope.rechazadas = true;
            default:
                $scope.realizada = true;
        }

        var cambio = this;

        this.user = user;
        //this.pedidos = pedidos;
        this.pedidosRealizados = pedidosRealizados;
        this.pedidosBorrador = pedidosBorrador;
        this.pedidosAprobados = pedidosAprobados;
        this.pedidosRechazados = pedidosRechazados;
        this.pedidosEvaluacion = pedidosEvaluacion;
        this.ventasPendientes = ventasPendientes;
        this.ventasPendientesEntrega = ventasPendientesEntrega;
        this.ventasFinalizadas = ventasFinalizadas;
        this.tipoOrden = tipoOrden;
        this.tipoPedido = tipoPedido;
        this.totalBorradorVenta = 0;
        this.totalBorradorCompra = 0;
        this.totalAprobadasCompra = 0;
        this.totalAprobadasVenta = 0;
        this.totalRechazadasCompra = 0;
        this.totalRechazadasVenta = 0;
        this.totalPendienteACompra = 0;
        this.totalPendienteAVenta = 0;
        this.totalPendienteECompra = 0;
        this.totalPendienteEVenta = 0;
        this.currentPage = 0;
        this.theDate = new Date();

        this.evaluar = evaluar;
        this.montoTotal = montoTotal;
        this.showConfirm = showConfirm;
        this.showAdvancedRecibidos = showAdvancedRecibidos;
        this.update = update;
        this.soloDomingos = soloDomingos;
        this.extraerPedido = extraerPedido;
        this.setNewData = setNewData;
        this.refresh = refresh;
        //this.getPage = getPage;
        this.borrarPedido = borrarPedido;

        this.showBottomSheetBorador = showBottomSheetBorador;
        this.showBottomSheetAprobadas = showBottomSheetAprobadas;
        this.showBottomSheetRechazados = showBottomSheetRechazados;
        this.showBottomSheetRealizadosCompra = showBottomSheetRealizadosCompra;
        this.showBottomSheetRealizadosVenta = showBottomSheetRealizadosVenta;

        this.montoTotal(pedidosEvaluacion, pedidosRealizados, pedidosAprobados, pedidosBorrador, pedidosRechazados);

        cambio.draftTemp = [];
        cambio.draftCount = 0;
        cambio.approvedTemp = [];
        cambio.approvedCount = 0;
        cambio.rejectedTemp = [];
        cambio.rejectedCount = 0;
        cambio.realTemp1 = [];
        cambio.realCount1 = 0;
        cambio.realTemp2 = [];
        cambio.realCount2 = 0;
        cambio.realStart1 = null;
        cambio.realStart2 = null;
        cambio.approvedStart = null;
        cambio.draftStart = null;
        cambio.approvedStart = null;
        cambio.rejectedStart = null;

        cambio.loadmoreReal1 = function() {
            cambio.loadingReal1 = true;
            cambio.realLimit1 = cambio.pedidosEvaluacion.length < 40 ? 40 : 20;
            PedidosExtra.loadMore(cambio.user.enterprise.enterprise, cambio.tipoPedido, 'pendiente evaluacion', cambio.realStart1, cambio.realLimit1).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        if (cambio.pedidosEvaluacion) {
                            if (cambio.realCount1 === 1 && cambio.realTemp1.length !== 0) {
                                cambio.pedidosEvaluacion = cambio.realTemp1.slice();
                            } else {
                                cambio.pedidosEvaluacion = cambio.pedidosEvaluacion.concat(cambio.realTemp1);
                            }
                        }

                        if (data.data.length === 0 || (cambio.realTemp1.length === 0 && cambio.realCount1 > 2))
                            cambio.doneReal1 = true;

                        cambio.realTemp1 = Pedidos.query({
                            e: cambio.user.enterprise.enterprise,
                            tipoPedido: cambio.tipoPedido,
                            estado: 'pendiente evaluacion',
                            p: cambio.realCount1,
                            pcount: cambio.realLimit1
                        });
                        cambio.realCount1++;
                        cambio.loadingReal1 = false;
                        cambio.realStart1 = cambio.pedidosEvaluacion.length ? cambio.pedidosEvaluacion[cambio.pedidosEvaluacion.length - 1].created : null;
                    }, 1000)
                })
            );
        };

        cambio.loadmoreReal2 = function() {
            cambio.loadingReal2 = true;
            cambio.realLimit2 = cambio.pedidosRealizados.length < 40 ? 40 : 20;
            PedidosExtra.loadMore(cambio.user.enterprise.enterprise, cambio.tipoPedido, 'pendiente aprobacion', cambio.realStart2, cambio.realLimit2).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        if (cambio.pedidosRealizados) {
                            if (cambio.realCount2 === 1 && cambio.realTemp2.length !== 0) {
                                cambio.pedidosRealizados = cambio.realTemp2.slice();
                            } else {
                                cambio.pedidosRealizados = cambio.pedidosRealizados.concat(cambio.realTemp2);
                            }
                        }

                        if (data.data.length === 0 || (cambio.realTemp2.length === 0 && cambio.realCount2 > 2))
                            cambio.doneReal2 = true;

                        cambio.realTemp2 = Pedidos.query({
                            e: cambio.user.enterprise.enterprise,
                            tipoPedido: cambio.tipoPedido,
                            estado: 'pendiente aprobacion',
                            p: cambio.realCount2,
                            pcount: cambio.realLimit2
                        });
                        cambio.realCount2++;
                        cambio.realStart2 = cambio.pedidosRealizados.length ? cambio.pedidosRealizados[cambio.pedidosRealizados.length - 1].created : null;
                        cambio.loadingReal2 = false;
                    }, 1000);
                })
            )
        };

        cambio.loadmoreApproved = function() {
            cambio.loadingApproved = true;
            cambio.approvedLimit = cambio.pedidosAprobados.length < 40 ? 40 : 20;
            PedidosExtra.loadMore(cambio.user.enterprise.enterprise, cambio.tipoPedido, 'aprobada', cambio.approvedStart, cambio.approvedLimit).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        if (cambio.pedidosAprobados) {
                            if (cambio.approvedCount === 1 && cambio.approvedTemp.length !== 0) {
                                cambio.pedidosAprobados = cambio.approvedTemp.slice();
                            } else {
                                cambio.pedidosAprobados = cambio.pedidosAprobados.concat(cambio.approvedTemp);
                            }
                        }

                        if (data.data.length === 0 || (cambio.approvedTemp.length === 0 && cambio.approvedCount > 2))
                            cambio.doneApproved = true;

                        cambio.approvedTemp = Pedidos.query({
                            e: cambio.user.enterprise.enterprise,
                            tipoPedido: cambio.tipoPedido,
                            estado: 'aprobada',
                            p: cambio.approvedCount,
                            pcount: cambio.approvedLimit
                        });
                        cambio.approvedCount++;
                        cambio.approvedStart = cambio.pedidosAprobados.length ? cambio.pedidosAprobados[cambio.pedidosAprobados.length - 1].created : null;
                        cambio.loadingApproved = false;
                    }, 1000);
                })
            )
        };

        cambio.loadmoreDraft = function() {
            cambio.loadingDraft = true;
            cambio.draftLimit = cambio.pedidosBorrador.length < 40 ? 40 : 20;
            PedidosExtra.loadMore(cambio.user.enterprise.enterprise, cambio.tipoPedido, 'borrador', cambio.draftStart, cambio.draftLimit).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        if (cambio.pedidosBorradors) {
                            if (cambio.draftCount === 1 && cambio.draftTemp.length !== 0)
                                cambio.pedidosBorradors = cambio.draftTemp.slice();
                            else
                                cambio.pedidosBorradors = cambio.pedidosBorradors.concat(cambio.draftTemp);
                        }

                        if (data.data.length === 0 || (cambio.draftTemp.length === 0 && cambio.draftCount > 2))
                            cambio.doneDraft = true;

                        cambio.draftTemp = Pedidos.query({
                            e: cambio.user.enterprise.enterprise,
                            tipoPedido: cambio.tipoPedido,
                            estado: 'borrador',
                            p: cambio.draftCount,
                            pcount: cambio.draftLimit
                        });
                        cambio.draftCount++;
                        cambio.draftStart = cambio.pedidosBorrador.length ? cambio.pedidosBorrador[cambio.pedidosBorrador.length - 1].created : null;
                        cambio.loadingDraft = false;
                    }, 1000);
                })
            )
        };

        cambio.loadmoreRejected = function() {
            cambio.loadingRejected = true;
            cambio.rejectedLimit = cambio.pedidosRechazados.length < 40 ? 40 : 20;
            PedidosExtra.loadMore(cambio.user.enterprise.enterprise, cambio.tipoPedido, 'rechazada', cambio.rejectedStart, cambio.rejectedLimit).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        if (cambio.pedidosRechazados) {
                            if (cambio.rejectedCount === 1 && cambio.rejectedTemp.length !== 0) {
                                cambio.pedidosRechazados = cambio.rejectedTemp.slice();
                            } else {
                                cambio.pedidosRechazados = cambio.pedidosRechazados.concat(cambio.rejectedTemp);
                            }
                        }

                        if (data.data.length === 0 || (cambio.rejectedTemp.length === 0 && cambio.rejectedCount > 2))
                            cambio.doneRejected = true;

                        cambio.rejectedTemp = Pedidos.query({
                            e: cambio.user.enterprise.enterprise,
                            tipoPedido: cambio.tipoPedido,
                            estado: 'rechazada',
                            p: cambio.rejectedCount,
                            pcount: cambio.rejectedLimit
                        });
                        cambio.rejectedCount++;
                        cambio.rejectedStart = cambio.pedidosRechazados.length ? cambio.pedidosRechazados[cambio.pedidosRechazados.length - 1].created : null;
                        cambio.loadingRejected = false;
                    }, 1000)
                })
            )
        };

        // actualizar modelos de dato de pedidos
        function refresh() {
            this.pedidosEvaluacion = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'pendiente evaluacion',
                p: 0,
                pcount: 20
            });
            this.pedidosRealizados = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'pendiente aprobacion',
                p: 0,
                pcount: 20
            });
            this.pedidosAprobados = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'aprobada',
                p: 0,
                pcount: 20
            });
            this.pedidosRechazados = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'rechazada',
                p: 0,
                pcount: 20
            });
            this.pedidosBorrador = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'borrador',
                p: 0,
                pcount: 20
            });

        }

        /*// Obtener datos paginados del backend
        function getPage(pagina, cantidad) {
            if (pagina < 0) {
                pagina = 0;
            }
            ;
            this.currentPage = pagina;
            this.pedidosEvaluacion = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'pendiente evaluacion',
                p: pagina,
                pcount: cantidad
            });
            this.pedidosRealizados = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'pendiente aprobacion',
                p: pagina,
                pcount: cantidad
            });
            this.pedidosAprobados = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'aprobada',
                p: pagina,
                pcount: cantidad
            });
            this.pedidosRechazados = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'rechazada',
                p: pagina,
                pcount: cantidad
            });
            this.pedidosBorrador = Pedidos.query({
                e: this.user.enterprise.enterprise,
                tipoPedido: this.tipoPedido,
                estado: 'borrador',
                p: pagina,
                pcount: cantidad
            });
        };*/

        //cambia de estado pendiente evaluacion a pendiente aprobacion
        function evaluar(item) {
            var pedido = item;
            pedido.estado = 'pendiente aprobacion';

            if (cambio.enterprise !== undefined) {
                pedido.enterprise = cambio.enterprise._id
            } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) {
                pedido.enterprise = pedido.enterprise._id
            }

            if (cambio.tipoComprobante !== undefined) {
                pedido.tipoComprobante = cambio.tipoComprobante._id
            } else if (pedido.tipoComprobante !== undefined) {
                pedido.tipoComprobante = pedido.tipoComprobante._id
            }

            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) {
                    pedido.proveedor = $scope.proveedor._id
                } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) {
                    pedido.proveedor = pedido.proveedor._id
                }

            } else {
                if ($scope.cliente !== undefined) {
                    pedido.cliente = $scope.cliente._id
                } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) {
                    pedido.cliente = pedido.cliente._id
                }

            }
            if (cambio.condicionVenta !== undefined) {
                pedido.condicionVenta = cambio.condicionVenta._id
            } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) {
                pedido.condicionVenta = pedido.condicionVenta._id
            }

            pedido.$update(function() {
                // console.log('pendiente aprobacion');
                $state.go('home.viewPedido', { pedidoId: item._id });
            }, function(errorResponse) {
                console.log(errorResponse, 'error repsonse');
            });
        } //end evaluar

        //abre modal para confirmar/rechazar ordenes pendientes
        function showConfirm(ev, item, n) {
            if (n == 1) {
                var confirm = $mdDialog.confirm()
                    .title('Aprobar Orden')
                    .content('¿Está seguro que desea aprobar esta orden?')
                    .ariaLabel('Lucky day')
                    .ok('Aprobar')
                    .cancel('Cancelar')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function() {
                    cambio.update(item, n);
                }, function() {
                    $scope.status = 'Cancelaste aprobar';
                });
            } else {
                if (n == 2) {
                    var confirm = $mdDialog.confirm()
                        .title('Rechazar Orden')
                        .content('¿Está seguro que desea rechazar esta orden?')
                        .ariaLabel('Lucky day')
                        .ok('Rechazar')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function() {
                        cambio.update(item, n);
                    }, function() {
                        $scope.status = 'Cancelaste rechazar';
                    });
                }
            }
        } //end show confirm

        //modal para aprobar presupuesto
        function showAdvancedRecibidos(ev, item) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/modules/pedidos/views/modalAprobar.client.view.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    resolve: {
                        item: function() {
                            return item;
                        }
                    }
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        } //end showAdvanced

        // definicion de funciones BottomSheet
        function showBottomSheetRealizadosCompra($event, item) {
            var buttons = [];
            if (item.estado != 'pendiente evaluacion' && this.user.roles[0] != 'compras') {
                buttons.push({
                    name: 'approve',
                    label: 'Aprobado',
                    icon: 'done'
                });
            }

            if (item.estado == 'pendiente evaluacion' && this.user.roles[0] != 'compras') {
                buttons.push({
                    name: 'view1',
                    label: 'Ver',
                    icon: 'visibility'
                });
            } else {
                buttons.push({
                    name: 'view2',
                    label: 'Ver',
                    icon: 'visibility'
                });
            }

            if (item.estado != 'pendiente evaluacion') {
                buttons.push({
                    name: 'clear',
                    label: 'Rechazar',
                    icon: 'delete'
                });
            }

            if ((cambio.user.roles[0] != 'compras') && (cambio.tipoOrden == 'venta')) {
                buttons.push({
                    name: 'print',
                    label: 'Imprimir',
                    icon: 'print'
                })
            }

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'approve':
                        showConfirm($event, item, 1);
                        break;
                    case 'view1':
                        evaluar(item);
                        break;
                    case 'view2':
                        $state.go('home.viewPedido', { pedidoId: item._id });
                        break;
                    case 'clear':
                        showConfirm($event, item, 2);
                        break;
                    case 'print':
                        extraerPedido(item, 1);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetRealizadosVenta($event, item) {
            var buttons = [];
            if (item.estado != 'pendiente evaluacion' && this.user.roles[0] != 'compras') {
                buttons.push({
                    name: 'approve',
                    label: 'Aprobado',
                    icon: 'done'
                });
            }

            if (item.estado == 'pendiente evaluacion' && this.user.roles[0] != 'compras') {
                buttons.push({
                    name: 'view1',
                    label: 'Ver',
                    icon: 'visibility'
                });
            } else {
                buttons.push({
                    name: 'view2',
                    label: 'Ver',
                    icon: 'visibility'
                });
            }

            if (item.estado != 'pendiente evaluacion') {
                buttons.push({
                    name: 'clear',
                    label: 'Rechazar',
                    icon: 'delete'
                });
            }

            if ((cambio.user.roles[0] != 'compras') && (cambio.tipoOrden == 'venta')) {
                buttons.push({
                    name: 'print',
                    label: 'Imprimir',
                    icon: 'print'
                })
            }

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'approve':
                        showAdvancedRecibidos($event, item);
                        break;
                    case 'view1':
                        evaluar(item);
                        break;
                    case 'view2':
                        $state.go('home.viewPedido', { pedidoId: item._id });
                        break;
                    case 'clear':
                        showConfirm($event, item, 2);
                        break;
                    case 'print':
                        extraerPedido(item, 1);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetRechazados($event, item) {

            var buttons = [{
                    name: 'view',
                    label: 'Ver',
                    icon: 'visibility'
                },
                {
                    name: 'remove',
                    label: 'Anular',
                    icon: 'remove_circle'
                }
            ];

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'view':
                        $state.go('home.viewPedido', { pedidoId: item._id });
                        break;
                    case 'remove':
                        borrarPedido(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetAprobadas($event, item) {

            var buttons = [{
                    name: 'view',
                    label: 'Ver',
                    icon: 'visibility'
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

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'view':
                        $state.go('home.viewPedido', { pedidoId: item._id });
                        break;
                    case 'remove':
                        borrarPedido(item);
                        break;
                    case 'print':
                        extraerPedido(item, n = 2);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetBorador($event, item) {
            var buttons = [];
            if ((this.user.roles[0] !== 'compras') && (this.user.roles[0] !== 'ventas') && ((this.user.roles[0] !== 'user') && (item.tipoPedido == 'compra') || (item.tipoPedido == 'venta'))) {
                buttons.push({
                    name: 'discard',
                    label: 'Descartar',
                    icon: 'close'
                });
                buttons.push({
                    name: 'evaluate',
                    label: 'Evaluar',
                    icon: 'call_made'
                })
            }

            buttons.push({
                name: 'view',
                label: 'Ver',
                icon: 'visibility'
            });

            buttons.push({
                name: 'remove',
                label: 'Anular',
                icon: 'delete'
            });

            // if ($rootScope.isMobile) {

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'evaluate':
                        showConfirm($event, item, n = 3);
                        break;
                    case 'discard':
                        showConfirm($event, item, n = 4);
                        break;
                    case 'view':
                        $state.go('home.viewPedido', { pedidoId: item._id });
                        break;
                    case 'remove':
                        borrarPedido(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        $scope.sampleAction = function(name, pedido) {
            switch (name) {
                case 'libre':
                    pedido.llamado = true;
                    break;

                case 'ocupado':
                    pedido.llamado = false;
                    break;


            }
            cambio.update(pedido, null);
        };

        // Cambia el estado del pedido
        function update(item, n) {
            console.log(angular.copy(item));
            var pedido = item;
            if (n == 1) {
                pedido.estado = 'aprobada';
            }
            if (n == 2) {
                pedido.estado = 'rechazada';
            }
            if (n == 3) {
                pedido.estado = 'pendiente evaluacion';
            }
            if (n == 4) {
                pedido.deleted = 'true';
            }
            if (n == 5) {
                pedido.estado = 'pendiente aprobacion';
            }
            if (n == 6) {
                pedido.estado = 'borrador';
            }

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
             una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
             hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            if (this.enterprise !== undefined) {
                pedido.enterprise = this.enterprise._id
            } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) {
                pedido.enterprise = pedido.enterprise._id
            };
            if (this.tipoComprobante !== undefined) {
                pedido.tipoComprobante = this.tipoComprobante._id
            } else if (pedido.tipoComprobante !== undefined) {
                pedido.tipoComprobante = pedido.tipoComprobante._id
            };
            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) {
                    pedido.proveedor = $scope.proveedor._id
                } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) {
                    pedido.proveedor = pedido.proveedor._id
                };
            } else {
                if ($scope.cliente !== undefined) {
                    pedido.cliente = $scope.cliente._id
                } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) {
                    pedido.cliente = pedido.cliente._id
                };
            }
            if (this.condicionVenta !== undefined) {
                pedido.condicionVenta = this.condicionVenta._id
            } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) {
                pedido.condicionVenta = pedido.condicionVenta._id
            };
            if (this.caja !== undefined) {
                pedido.caja = this.caja._id
            } else if ((pedido.caja !== undefined) && (pedido.caja !== null)) {
                pedido.caja = pedido.caja._id
            };
            $scope.tipoPedido = $stateParams.tipo;
            if ($scope.tipoPedido === undefined) {
                $scope.tipoPedido = pedido.tipoPedido;
            }

            pedido.$update(function() {
                cambio.refresh();
                cambio.montoTotal(cambio.pedidosRealizados, cambio.pedidosAprobados, cambio.pedidosBorrador, cambio.pedidosRechazados);
                $state.go('home.pedidos', { "tipo": $scope.tipoPedido });
                //Socket.emit('pedido.update', pedido);
            }, function(errorResponse) {
                // $scope.error = errorResponse.data.message;
            });

        } //end update

        Socket.on('pedido.update', angular.bind(this, function(message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                this.refresh();
                montoTotal(this.pedidosRealizados, this.pedidosAprobados, this.pedidosBorrador, this.pedidosRechazados);
            }
        }));

        //suma montos totales de las ordenes
        function montoTotal(pedidosEvaluacion, pedidosRealizados, pedidosAprobados, pedidosBorrador, pedidosRechazados) {

            if (pedidosEvaluacion !== undefined) {
                pedidosEvaluacion.$promise.then(angular.bind(this, function(data) {
                    this.totalPendienteECompra = 0;
                    this.totalPendienteEVenta = 0;
                    for (var i in data) {
                        if ((data[i].estado === 'pendiente evaluacion') && (data[i].tipoPedido === 'compra')) {
                            this.totalPendienteECompra = this.totalPendienteECompra + data[i].total
                        }
                        if ((data[i].estado === 'pendiente evaluacion') && (data[i].tipoPedido === 'venta')) {
                            this.totalPendienteEVenta = this.totalPendienteEVenta + data[i].total
                        }
                    }
                    this.totalPendientesCompra = this.totalPendienteECompra + this.totalPendienteACompra;
                    this.totalPendientesVenta = this.totalPendienteEVenta + this.totalPendienteAVenta;
                }));
            };

            if (pedidosRealizados !== undefined) {
                pedidosRealizados.$promise.then(angular.bind(this, function(data) {
                    this.totalPendienteACompra = 0;
                    this.totalPendienteAVenta = 0;
                    for (var i in data) {
                        if ((data[i].estado === 'pendiente aprobacion') && (data[i].tipoPedido === 'compra')) {
                            this.totalPendienteACompra = this.totalPendienteACompra + data[i].total
                        }
                        if ((data[i].estado === 'pendiente aprobacion') && (data[i].tipoPedido === 'venta')) {
                            this.totalPendienteAVenta = this.totalPendienteAVenta + data[i].total
                        }
                    }
                    this.totalPendientesCompra = this.totalPendienteECompra + this.totalPendienteACompra;
                    this.totalPendientesVenta = this.totalPendienteEVenta + this.totalPendienteAVenta;
                }));
            };

            if (pedidosAprobados !== undefined) {
                pedidosAprobados.$promise.then(angular.bind(this, function(data) {
                    this.totalAprobadasCompra = 0;
                    this.totalAprobadasVenta = 0;

                    for (var i in data) {

                        if ((data[i].estado === 'aprobada') && (data[i].tipoPedido === 'compra')) {
                            this.totalAprobadasCompra = this.totalAprobadasCompra + data[i].total
                        }
                        if ((data[i].estado === 'aprobada') && (data[i].tipoPedido === 'venta')) {
                            this.totalAprobadasVenta = this.totalAprobadasVenta + data[i].total
                        }
                    }
                }));
            };

            if (pedidosBorrador !== undefined) {
                pedidosBorrador.$promise.then(angular.bind(this, function(data) {
                    this.totalBorradorVenta = 0;
                    this.totalBorradorCompra = 0;

                    for (var i in data) {
                        if ((data[i].estado === 'borrador') && (data[i].tipoPedido === 'compra') && (data[i].deleted === false)) {
                            this.totalBorradorCompra = this.totalBorradorCompra + data[i].total
                        }
                        if ((data[i].estado === 'borrador') && (data[i].tipoPedido === 'venta') && (data[i].deleted === false)) {
                            this.totalBorradorVenta = this.totalBorradorVenta + data[i].total
                        }
                    }
                }));
            };

            if (pedidosRechazados !== undefined) {
                pedidosRechazados.$promise.then(angular.bind(this, function(data) {
                    this.totalRechazadasCompra = 0;
                    this.totalRechazadasVenta = 0;

                    for (var i in data) {

                        if ((data[i].estado === 'rechazada') && (data[i].tipoPedido === 'compra')) {
                            this.totalRechazadasCompra = this.totalRechazadasCompra + data[i].total
                        }
                        if ((data[i].estado === 'rechazada') && (data[i].tipoPedido === 'venta')) {
                            this.totalRechazadasVenta = this.totalRechazadasVenta + data[i].total
                        }
                    }
                }));
            };
        }; //end montoTotal

        function soloDomingos(date) {
            var day = date.getDay();
            return day === 4;
        };

        function setNewData(date) {
            // console.log('[+] setNewData fired!');
            var today = this.theDate;
            var first = new Date(today.getFullYear(), 0, 1);
            var theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
            var year = today.getFullYear();
            // calculo semana start
            var target = today;
            var dayNr = (today.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var jan4 = new Date(target.getFullYear(), 0, 4);
            var dayDiff = (target - jan4) / 86400000;
            var weekNr = 1 + Math.ceil(dayDiff / 7);

            // console.log('[+] this.theDate: ', year + '-' + weekNr);
            this.pedidos = Pedidos.query({
                e: this.user.enterprise.enterprise,
                w: weekNr,
                y: year
            }, angular.bind(this, function(data) {
                this.montoTotal(data);
            }))
        };

        function borrarPedido(pedido) {
            pedido.$remove();
            if (pedido.estado == 'aprobada') {
                for (var i in pedidosAprobados) {
                    if (pedidosAprobados[i] === pedido) {
                        pedidosAprobados.splice(i, 1);
                    }
                }
            } else {
                if (pedido.estado == 'rechazada') {
                    for (var i in pedidosRechazados) {
                        if (pedidosRechazados[i] === pedido) {
                            pedidosRechazados.splice(i, 1);
                        }
                    }
                } else {
                    if (pedido.estado == 'borrador') {
                        for (var i in pedidosBorrador) {
                            if (pedidosBorrador[i] === pedido) {
                                pedidosBorrador.splice(i, 1);
                            }
                        }
                    }
                }
            }

        };

        //****PARA LA EXTRACCION DEL PDF

        function extraerPedido(item, n) {
            var promise = asyncAsignarPedido(item);
            promise.then(function(response) {
                // console.log(response);
                if (n == 1) {
                    printIt();
                } else {
                    printItAprobado();
                }

            });
        };

        function asyncAsignarPedido(item) {
            var deferred = $q.defer();
            $scope.pedido = item;
            setTimeout(function() {
                if ($scope.pedido !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        };

        function printIt() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-pedido').value;
            var c = document.getElementById('printing-data-pedido').innerHTML;
            window.frames["print_frame_pedido"].document.title = 'IM - Pedido';
            window.frames["print_frame_pedido"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_pedido"].window.focus();
            window.frames["print_frame_pedido"].window.print();
        };

        function printItAprobado() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-pedidoAprobado').value;
            var c = document.getElementById('printing-data-pedidoAprobado').innerHTML;
            window.frames["print_frame_pedidoAprobado"].document.title = 'IM - Pedidos Aprobados';
            window.frames["print_frame_pedidoAprobado"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_pedidoAprobado"].window.focus();
            window.frames["print_frame_pedidoAprobado"].window.print();
        };

        function httpGet(theUrl) {
            var xmlHttp = null;
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        };

        function DialogController($scope, $mdDialog, item, $rootScope, Socket, Cajas) {

            $scope.item = item;
            $scope.errorCaja = undefined;

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.findCajas = function() {
                $scope.cajas = Cajas.query({ e: item.enterprise._id });
            };

            $scope.finalizarPedido = function(item, fechaE) {
                if (fechaE !== undefined) {
                    item.myDate = fechaE;
                    item.myDateChanged = true;
                }
                var estado = 'aprobada';
                updatePedido(item, estado);
            }

            function updatePedido(pedido, estado) {
                pedido.estado = estado;

                if (pedido.enterprise && pedido.enterprise._id) {
                    pedido.enterprise = pedido.enterprise._id;
                }
                if (pedido.tipoComprobante && pedido.tipoComprobante._id) {
                    pedido.tipoComprobante = pedido.tipoComprobante._id;
                }
                if (pedido.cliente && pedido.cliente._id) {
                    pedido.cliente = pedido.cliente._id
                };
                if (pedido.proveedor && pedido.proveedor._id) {
                    pedido.proveedor = pedido.proveedor._id
                };
                if (pedido.category1 && pedido.category1._id) {
                    pedido.category1 = pedido.category1._id
                };
                pedido.condicionVenta = pedido.condicionVenta._id;
                if (pedido.caja && pedido.caja._id) {
                    pedido.caja = pedido.caja._id;
                }

                $mdDialog.hide();
                Socket.emit('pedido.update', pedido);
            };
        }

        //****FIN EXTRACCION DEL PDF

    } //end function
]);