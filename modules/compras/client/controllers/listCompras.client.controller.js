'use strict';

// Compras controller
angular.module('compras').controller('ListComprasController', ['$scope', '$rootScope', '$http', '$stateParams', '$location', 'user', 'Enterprises', '$mdDialog', '$q', '$state', 'Compras', 'comprasPendientes', 'comprasPendientesRecepcion', 'comprasFinalizadas', 'comprasPendienteEvaluacion', 'comprasPendienteAprobacion', 'comprasAnuladas', 'Socket', '$anchorScroll', 'BottomSheetService', 'ComprasExtra', 'Pedidos', 'PedidosExtra', '$timeout',
    function($scope, $rootScope, $http, $stateParams, $location, user, Enterprises, $mdDialog, $q, $state, Compras, comprasPendientes, comprasPendientesRecepcion, comprasFinalizadas, comprasPendienteEvaluacion, comprasPendienteAprobacion, comprasAnuladas, Socket, $anchorScroll, BottomSheetService, ComprasExtra, Pedidos, PedidosExtra, $timeout) {

        $scope.tabParams = $state.params.tab;
        switch ($state.params.tab) {
            case 'pendiente_evaluacion':
                $scope.pendiente_evaluacion = true;
                break;
            case 'realizada':
                $scope.realizada = true;
                break;
            case 'recibidos':
                $scope.recibidos = true;
                break;
            case 'finalizada':
                $scope.finalizada = true;
                break;
            case 'anulada':
                $scope.anulada = true;
            default:
                $scope.pendiente_evaluacion = true;
        }

        var cambio = this;

        this.user = user;
        this.comprasPendientes = comprasPendientes;
        // this.comprasPendientesPago = comprasPendientesPago;
        this.comprasPendientesRecepcion = comprasPendientesRecepcion;
        this.comprasPendienteEvaluacion = comprasPendienteEvaluacion;
        this.comprasPendienteAprobacion = comprasPendienteAprobacion;
        this.comprasFinalizadas = comprasFinalizadas;
        this.comprasAnuladas = comprasAnuladas;
        this.totalPendientesPR = 0;
        this.totalPendientesPago = 0;
        this.totalPendientesRecepcion = 0;
        this.totalFinalizadas = 0;
        this.totalAnuladas = 0;
        this.totalPendienteEvaluacion = 0;
        this.theDate = new Date();
        this.currentPage = 0;
        // definicion de funciones disponibles para la vista
        this.update = update;
        this.evaluarPendienteEvaluacion = evaluarPendienteEvaluacion;
        this.montoTotal = montoTotal;
        this.showConfirm = showConfirm;
        this.showConfirmRecepcion = showConfirmRecepcion;
        this.showAdvanced = showAdvanced;
        this.showAdvancedRecibidos = showAdvancedRecibidos;
        this.extraerCompra = extraerCompra;
        this.printIt = printIt;
        this.extraerListado = extraerListado;
        this.refresh = refresh;
        //this.getPage = getPage;
        this.borrarCompra = borrarCompra;

        this.montoTotal(comprasPendientes, comprasPendientesRecepcion, comprasFinalizadas, comprasAnuladas, comprasPendienteEvaluacion, comprasPendienteAprobacion);

        this.showBottomSheetAnulada = showBottomSheetAnulada;
        this.showBottomSheetFinalizada = showBottomSheetFinalizada;
        this.showBottomSheetRealizada = showBottomSheetRealizada;
        this.showBottomSheetRecebidos = showBottomSheetRecebidos;
        this.showBottomSheetPendienteEvaluacion = showBottomSheetPendienteEvaluacion;


        this.finalTemp = [];
        this.finalCount = 0;
        this.cancelTemp = [];
        this.cancelCount = 0;
        this.receiptTemp = [];
        this.receiptCount = 0;
        this.realTemp = [];
        this.realCount = 0;
        cambio.realStart = null;
        cambio.receiptStart = null;
        cambio.finalStart = null;
        cambio.cancelStart = null;

        cambio.realStart1 = null;
        cambio.realLimit1 = null
        cambio.realCount1 = 0;
        cambio.realTemp1 = [];

        cambio.realStart2 = null;
        cambio.realLimit2 = null
        cambio.realCount2 = 0;
        cambio.realTemp2 = [];

        cambio.loadmorePendienteEvaluacion = function() {
            if (cambio.searchCompras == '' || cambio.searchCompras == undefined) {
                cambio.loadingReal1 = true;
                cambio.realLimit1 = cambio.comprasPendienteEvaluacion.length < 40 ? 40 : 20;
                PedidosExtra.loadMore(cambio.user.enterprise.enterprise, 'compra', 'pendiente evaluacion', cambio.realStart1, cambio.realLimit1).then(
                    angular.bind(cambio, function(data) {
                        $timeout(function() {
                            if (cambio.comprasPendienteEvaluacion) {
                                if (cambio.realCount1 === 1 && cambio.realTemp1.length !== 0) {
                                    cambio.comprasPendienteEvaluacion = cambio.realTemp1.slice();
                                } else {
                                    cambio.comprasPendienteEvaluacion = cambio.comprasPendienteEvaluacion.concat(cambio.realTemp1);
                                }
                            }

                            if (data.data.length === 0 || (cambio.realTemp1.length === 0 && cambio.realCount1 > 2))
                                cambio.doneReal1 = true;

                            cambio.realTemp1 = Pedidos.query({
                                e: cambio.user.enterprise.enterprise,
                                tipoPedido: 'compra',
                                estado: 'pendiente evaluacion',
                                p: cambio.realCount1,
                                pcount: cambio.realLimit1
                            });
                            cambio.realCount1++;
                            cambio.loadingReal1 = false;
                            cambio.realStart1 = cambio.comprasPendienteEvaluacion.length ? cambio.comprasPendienteEvaluacion[cambio.comprasPendienteEvaluacion.length - 1].created : null;
                        }, 1000)
                    })
                )
            }
        };

        cambio.loadmorePendienteAprobacion = function() {
            if (cambio.searchCompras == '' || cambio.searchCompras == undefined) {
                cambio.loadingReal2 = true;
                cambio.realLimit2 = cambio.comprasPendienteAprobacion.length < 40 ? 40 : 20;
                PedidosExtra.loadMore(cambio.user.enterprise.enterprise, 'compra', 'pendiente aprobacion', cambio.realStart2, cambio.realLimit2).then(
                    angular.bind(cambio, function(data) {
                        $timeout(function() {
                            if (cambio.comprasPendienteAprobacion) {
                                if (cambio.realCount2 === 1 && cambio.realTemp2.length !== 0) {
                                    cambio.comprasPendienteAprobacion = cambio.realTemp2.slice();
                                } else {
                                    cambio.comprasPendienteAprobacion = cambio.comprasPendienteAprobacion.concat(cambio.realTemp1);
                                }
                            }

                            if (data.data.length === 0 || (cambio.realTemp2.length === 0 && cambio.realCount2 > 2))
                                cambio.doneReal2 = true;

                            cambio.realTemp2 = Pedidos.query({
                                e: cambio.user.enterprise.enterprise,
                                tipoPedido: 'compra',
                                estado: 'pendiente aprobacion',
                                p: cambio.realCount2,
                                pcount: cambio.realLimit2
                            });
                            cambio.realCount2++;
                            cambio.loadingReal2 = false;
                            cambio.realStart2 = cambio.comprasPendienteAprobacion.length ? cambio.comprasPendienteAprobacion[cambio.comprasPendienteAprobacion.length - 1].created : null;
                        }, 1000)
                    })
                )
            }
        };

        cambio.loadmoreReal = function() {
            if (cambio.searchCompras == '' || cambio.searchCompras == undefined) {
                cambio.loadingReal = true;
                cambio.realLimit = cambio.comprasPendientes.length < 40 ? 40 : 20;
                ComprasExtra.loadMore(cambio.user.enterprise.enterprise, 'Pendiente de pago y recepcion', cambio.comprasPendientes.length ? cambio.comprasPendientes[cambio.comprasPendientes.length - 1].created : null, cambio.realLimit).then(
                    angular.bind(cambio, function(data) {
                        $timeout(function() {
                            if (cambio.comprasPendientes) {
                                if (cambio.realCount === 1 && cambio.realTemp.length != 0) {
                                    cambio.comprasPendientes = cambio.realTemp.slice();
                                } else {
                                    cambio.comprasPendientes = cambio.comprasPendientes.concat(cambio.realTemp);
                                }
                            }

                            if (data.data.length === 0 || (cambio.realTemp.length === 0 && cambio.realCount > 2))
                                cambio.doneReal = true;

                            cambio.realTemp = Compras.query({
                                e: cambio.user.enterprise.enterprise,
                                estado: "Pendiente de pago y recepcion",
                                p: cambio.realCount,
                                pcount: cambio.realLimit
                            });
                            cambio.realCount++;
                            cambio.realStart =
                                cambio.loadingReal = false;
                        }, 1000)
                    })
                )
            }
        };

        cambio.loadmoreReceipt = function() {
            if (cambio.searchCompras == '' || cambio.searchCompras == undefined) {
                cambio.loadingReceipt = true;
                cambio.receiptLimit = cambio.comprasPendientesRecepcion.length < 40 ? 40 : 20;
                ComprasExtra.loadMore(cambio.user.enterprise.enterprise, 'Pendiente de recepcion', cambio.receiptStart, cambio.receiptLimit).then(
                    angular.bind(cambio, function(data) {
                        $timeout(function() {
                            if (cambio.comprasPendientesRecepcion) {
                                if (cambio.receiptCount === 1 && cambio.receiptTemp.length != 0) {
                                    cambio.comprasPendientesRecepcion = cambio.receiptTemp.slice();
                                } else {
                                    cambio.comprasPendientesRecepcion = cambio.comprasPendientesRecepcion.concat(cambio.receiptTemp);
                                }
                            }

                            if (data.data.length === 0 || (cambio.receiptTemp.length === 0 && cambio.receiptCount > 2))
                                cambio.doneReceipt = true;

                            cambio.receiptTemp = Compras.query({
                                e: cambio.user.enterprise.enterprise,
                                estado: 'Pendiente de recepcion',
                                p: cambio.receiptCount,
                                pcount: cambio.receiptLimit
                            });
                            cambio.receiptCount++;
                            cambio.receiptStart = cambio.comprasPendientesRecepcion.length ? cambio.comprasPendientesRecepcion[cambio.comprasPendientesRecepcion.length - 1].created : null;
                            cambio.loadingReceipt = false;
                        }, 1000)
                    })
                )
            }
        };

        cambio.loadmoreFinal = function() {
            if (cambio.searchCompras == '' || cambio.searchCompras == undefined) {
                cambio.loadingFinal = true;
                cambio.finalLimit = cambio.comprasFinalizadas.length < 40 ? 40 : 20;
                ComprasExtra.loadMore(cambio.user.enterprise.enterprise, 'Finalizada', cambio.finalStart, cambio.finalLimit).then(
                    angular.bind(cambio, function(data) {
                        $timeout(function() {
                            if (cambio.comprasFinalizadas) {
                                if (cambio.finalCount === 1 && cambio.finalTemp.length != 0) {
                                    cambio.comprasFinalizadas = cambio.finalTemp.slice();
                                } else {
                                    cambio.comprasFinalizadas = cambio.comprasFinalizadas.concat(cambio.finalTemp);
                                }
                            }

                            if (data.data.length === 0 || (cambio.finalTemp.length === 0 && cambio.finalCount > 2))
                                cambio.doneFinal = true;

                            cambio.finalTemp = Compras.query({
                                e: cambio.user.enterprise.enterprise,
                                estado: 'Finalizada',
                                p: cambio.finalCount,
                                pcount: cambio.finalLimit
                            });
                            cambio.finalCount++;
                            cambio.finalStart = cambio.comprasFinalizadas.length ? cambio.comprasFinalizadas[cambio.comprasFinalizadas.length - 1].created : null;
                            cambio.loadingFinal = false;
                        }, 1000)
                    })
                )
            }
        };

        cambio.loadmoreCancel = function() {
            if (cambio.searchCompras == '' || cambio.searchCompras == undefined) {
                cambio.loadingCancel = true;
                cambio.cancelLimit = cambio.comprasAnuladas.length < 40 ? 40 : 20;
                ComprasExtra.loadMore(cambio.user.enterprise.enterprise, 'Anulada', cambio.cancelStart, cambio.cancelLimit).then(
                    angular.bind(cambio, function(data) {
                        $timeout(function() {
                            if (cambio.comprasAnuladas) {
                                if (cambio.cancelCount === 1 && cambio.cancelTemp.length != 0) {
                                    cambio.comprasAnuladas = cambio.cancelTemp.slice();
                                } else {
                                    cambio.comprasAnuladas = cambio.comprasAnuladas.concat(cambio.cancelTemp);
                                }
                            }

                            if (data.data.length === 0 || (cambio.cancelTemp.length === 0 && cambio.cancelCount > 2))
                                cambio.doneCancel = true;

                            cambio.cancelTemp = Compras.query({
                                e: cambio.user.enterprise.enterprise,
                                estado: 'Anulada',
                                p: cambio.cancelCount,
                                pcount: cambio.cancelLimit
                            });
                            cambio.cancelCount++;
                            cambio.cancelStart = cambio.comprasAnuladas.length ? cambio.comprasAnuladas[cambio.comprasAnuladas.length - 1].created : null;
                            cambio.loadingCancel = false;
                        }, 1000)
                    })
                )
            }
        };

        /*Search Process*/
        cambio.searchComprasProcess = function() {
            if (cambio.searchCompras != '') {
                switch (cambio.selectedTab) {
                    case 'real1':
                        searchReal1();
                        searchReal2();
                        break;
                    case 'real':
                        searchReal();
                        break;
                    case 'reciept':
                        searchReceipt();
                        break;
                    case 'final':
                        searchFinal();
                        break;
                    case 'cancel':
                        searchCancel();
                    default:
                }
            } else {
                refresh();
            }
        };

        cambio.searchComprasProcessDefault = function() {
            if (cambio.searchCompras == '') {
                refresh();
            }
        };

        function searchReal1() {
            cambio.loadingReal1 = true;
            var searchString = cambio.searchCompras;
            PedidosExtra.search(cambio.user.enterprise.enterprise, 'compra', 'pendiente evaluacion', searchString).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            cambio.comprasPendienteEvaluacion = data.data;
                            cambio.loadingReal1 = false;
                        })
                    }, 1000)
                })
            )
        }

        function searchReal2() {
            cambio.loadingReal2 = true;
            var searchString = cambio.searchCompras;
            PedidosExtra.search(cambio.user.enterprise.enterprise, 'compra', 'pendiente aprobacion', searchString).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            cambio.comprasPendienteAprobacion = data.data;
                            cambio.loadingReal2 = false;
                        })
                    }, 1000)
                })
            )
        }

        function searchReal() {
            cambio.loadingReal = true;
            var searchString = cambio.searchCompras;
            ComprasExtra.search(cambio.user.enterprise.enterprise, 'Pendiente de pago y recepcion', searchString).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            cambio.comprasPendientes = data.data;
                            console.log(data.data)
                            cambio.loadingReal = false;
                            console.log(cambio.loadingReal)
                        })
                    }, 1000)
                })
            )
        }

        function searchReceipt() {
            cambio.loadingReceipt = true;
            var searchString = cambio.searchCompras;
            ComprasExtra.search(cambio.user.enterprise.enterprise, 'Pendiente de recepcion', searchString).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            console.log(data);
                            cambio.comprasPendientesRecepcion = data.data;
                            cambio.loadingReceipt = false;
                        })
                    }, 1000)
                })
            )
        }

        function searchCancel() {
            cambio.loadingCancel = true;
            var searchString = cambio.searchCompras;
            ComprasExtra.search(cambio.user.enterprise.enterprise, 'Anulada', searchString).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            console.log(data);
                            cambio.comprasAnuladas = data.data;
                            cambio.loadingCancel = false;
                        })
                    }, 1000)
                })
            )
        }

        function searchFinal() {
            cambio.loadingFinal = true;
            var searchString = cambio.searchCompras;
            ComprasExtra.search(cambio.user.enterprise.enterprise, 'Finalizada', searchString).then(
                angular.bind(cambio, function(data) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            console.log(data);
                            cambio.comprasFinalizadas = data.data;
                            cambio.loadingFinal = false;
                        })
                    }, 1000)
                })
            )
        }

        // actualizar modelos de dato de pedidos
        function refresh() {
            cambio.comprasPendientes = Compras.query({
                e: cambio.user.enterprise.enterprise,
                estado: 'Pendiente de pago y recepcion',
                p: 0,
                pcount: 20
            });
            // this.comprasPendientesPago = Compras.query({e: this.user.enterprise.enterprise, estado: 'Pendiente de pago2', p: 0, pcount: 20 });
            cambio.comprasPendientesRecepcion = Compras.query({
                e: cambio.user.enterprise.enterprise,
                estado: 'Pendiente de recepcion',
                p: 0,
                pcount: 20
            });
            cambio.comprasFinalizadas = Compras.query({
                e: cambio.user.enterprise.enterprise,
                estado: 'Finalizada',
                p: 0,
                pcount: 20
            });
            cambio.comprasAnuladas = Compras.query({
                e: cambio.user.enterprise.enterprise,
                estado: 'Anulada',
                p: 0,
                pcount: 20
            });

            cambio.comprasPendienteEvaluacion = Pedidos.query({
                e: cambio.user.enterprise.enterprise,
                tipoPedido: 'compra',
                estado: 'pendiente evaluacion',
                p: 0,
                pcount: 20
            });

            cambio.comprasPendienteAprobacion = Pedidos.query({
                e: cambio.user.enterprise.enterprise,
                tipoPedido: 'compra',
                estado: 'pendiente aprobacion',
                p: 0,
                pcount: 20
            });
        }

        // Obtener datos paginados del backend
        /*function getPage(pagina, cantidad) {
         if (pagina < 0) {
         pagina = 0;
         }
         ;
         this.currentPage = pagina;
         this.comprasPendientes = Compras.query({
         e: this.user.enterprise.enterprise,
         estado: 'Pendiente de pago y recepcion',
         p: pagina,
         pcount: cantidad
         });
         // this.comprasPendientesPago = Compras.query({e: this.user.enterprise.enterprise, estado: 'Pendiente de pago2', p: pagina, pcount: cantidad });
         this.comprasPendientesRecepcion = Compras.query({
         e: this.user.enterprise.enterprise,
         estado: 'Pendiente de recepcion',
         p: pagina,
         pcount: cantidad
         });
         this.comprasFinalizadas = Compras.query({
         e: this.user.enterprise.enterprise,
         estado: 'Finalizada',
         p: pagina,
         pcount: cantidad
         });
         this.comprasAnuladas = Compras.query({
         e: this.user.enterprise.enterprise,
         estado: 'Anulada',
         p: pagina,
         pcount: cantidad
         });
         };*/

        function showConfirm(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Anular Compra')
                .content('¿Está seguro que desea anular esta compra?')
                .ariaLabel('Lucky day')
                .ok('Anular')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(angular.bind(this, function() {
                item.prevEstado = item.estado;
                item.estado = 'Anulada';
                cambio.update(item);
            }), function() {
                console.log('cancelaste anular');
            });
        }; //end showConfirm

        function showConfirmRecepcion(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Finalizar la compra')
                .content('¿Finalizar la compra?')
                .ariaLabel('Lucky day')
                .ok('Aceptar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(angular.bind(this, function() {
                item.estado = 'Finalizada';
                cambio.update(item);
            }), function() {
                console.log('cancelaste cerrar');
            });
        }; //showConfirmRecepcion

        function borrarCompra(compra) {
            console.log(compra);
            compra.$remove();
            if (compra.estado == 'Finalizada') {
                for (var i in comprasFinalizadas) {
                    if (comprasFinalizadas[i] === compra) {
                        comprasFinalizadas.splice(i, 1);
                    }
                }
            } else {
                for (var i in comprasAnuladas) {
                    if (comprasAnuladas[i] === compra) {
                        comprasAnuladas.splice(i, 1);
                    }
                }
            }
        }
        $scope.sampleAction = function(name, puesto) {
            switch (name) {
                case 'libre':
                    puesto.llamado = true;
                    break;

                case 'ocupado':
                    puesto.llamado = false;
                    break;


            }
            cambio.update(puesto);
        };

        function update(item) {

            var compra = item;

            if (this.enterprise !== undefined) {
                compra.enterprise = this.enterprise._id
            } else if ((compra.enterprise !== undefined) && (compra.enterprise !== null)) {
                compra.enterprise = compra.enterprise._id
            }

            if (this.tipoComprobante !== undefined) {
                compra.tipoComprobante = this.tipoComprobante._id
            } else if ((compra.tipoComprobante !== undefined) && (compra.tipoComprobante !== null)) {
                compra.tipoComprobante = compra.tipoComprobante._id
            }

            if ($scope.proveedor !== undefined) {
                compra.proveedor = $scope.proveedor._id
            } else if ((compra.proveedor !== undefined) && (compra.proveedor !== null)) {
                compra.proveedor = compra.proveedor._id
            };
            if (this.condicionVenta !== undefined) {
                compra.condicionVenta = this.condicionVenta._id
            } else if ((compra.condicionVenta !== undefined) && (compra.condicionVenta !== null)) {
                compra.condicionVenta = compra.condicionVenta._id
            }

            compra.$update(function() {
                // $scope.montoTotal();
                // $state.go('home.pedidos', {"tipo": $scope.tipoPedido});
                console.log("Tenekj");
                console.log(compra);
                Socket.emit('compra.update', compra)
            }, function(errorResponse) {
                // $scope.error = errorResponse.data.message;
            });

        } //end Update

        // actualizaciones en tiempo real.

        Socket.on('compras.update', angular.bind(this, function(message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                //this.cajas = Cajas.query({e: this.user.enterprise.enterprise})
                //.$promise.then(angular.bind(this, function(data){
                //console.log('cajas:', data);
                this.refresh();
                //montoTotal(cambio.pedidosRealizados, cambio.pedidosAprobados, cambio.pedidosBorrador, cambio.pedidosRechazados);
                //}));
            }
        }));

        function evaluarPendienteEvaluacion(item, n) {
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
                $state.go('home.viewPedido', { pedidoId: item._id });

            }, function(errorResponse) {
                console.log(errorResponse, 'error repsonse');
            });
        } //end evaluar

        Socket.on('pedido.update', angular.bind(this, function(message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                this.refresh();
            }
        }));

        //abre modal para confirmar/rechazar ordenes pendientes
        function showConfirmPendienteEvaluacion(ev, item, n) {
            if (n == 1) {
                var confirm = $mdDialog.confirm()
                    .title('Aprobar Orden')
                    .content('¿Está seguro que desea aprobar esta orden?')
                    .ariaLabel('Lucky day')
                    .ok('Aprobar')
                    .cancel('Cancelar')
                    .targetEvent(ev);

                $mdDialog.show(confirm).then(function() {
                    cambio.evaluarPendienteEvaluacion(item, n);
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
                        cambio.evaluarPendienteEvaluacion(item, n);
                    }, function() {
                        $scope.status = 'Cancelaste rechazar';
                    });
                }
            }
        }

        function extraerPedidoPendienteEvaluacion(item, n) {
            var promise = asyncAsignarPedido(item);
            promise.then(function(response) {
                // console.log(response);
                if (n == 1) {
                    printIt();
                } else {
                    printItAprobado();
                }

            });
        }

        function montoTotal(comprasPendientes, comprasPendientesRecepcion, comprasFinalizadas, comprasAnuladas, comprasPendienteEvaluacion, comprasPendienteAprobacion) {

            comprasPendientes.$promise.then(angular.bind(this, function(data) {
                this.totalPendientesPR = 0;
                for (var i in data) {
                    if (data[i].deleted === false) {
                        this.totalPendientesPR = this.totalPendientesPR + data[i].total
                    }
                }
            }));

            comprasPendientesRecepcion.$promise.then(angular.bind(this, function(data) {
                this.totalPendientesRecepcion = 0;
                for (var i in data) {
                    if (data[i].deleted === false) {
                        this.totalPendientesRecepcion = this.totalPendientesRecepcion + data[i].total
                    }
                }
            }));

            comprasFinalizadas.$promise.then(angular.bind(this, function(data) {
                this.totalFinalizadas = 0;
                for (var i in data) {
                    if (data[i].deleted === false) {
                        this.totalFinalizadas = this.totalFinalizadas + data[i].total
                    }
                }
            }));

            comprasAnuladas.$promise.then(angular.bind(this, function(data) {
                this.totalAnuladas = 0;
                for (var i in data) {
                    if (data[i].deleted === false) {
                        this.totalAnuladas = this.totalAnuladas + data[i].total
                    }
                }
            }));

            comprasPendienteEvaluacion.$promise.then(angular.bind(this, function(data) {
                this.totalPendienteEvaluacion = 0;
                for (var i in data) {
                    if (data[i].deleted === false) {
                        this.totalPendienteEvaluacion = this.totalPendienteEvaluacion + data[i].total
                    }
                }
            }));
            comprasPendienteAprobacion.$promise.then(angular.bind(this, function(data) {
                for (var i in data) {
                    if (data[i].deleted === false) {
                        this.totalPendienteEvaluacion = this.totalPendienteEvaluacion + data[i].total
                    }
                }
            }));
        }; //end montoTotal


        function showAdvanced(ev, item) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/modules/compras/views/modal.client.view.html',
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

        function showAdvancedRecibidos(ev, item) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/modules/compras/views/modalPagar.client.view.html',
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
                    $http.post('/api/impuestos/updateTotal', {
                        month: (new Date()).getMonth(),
                        year: (new Date()).getFullYear()
                    });
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        } //end showAdvanced

        $scope.scrollTo = function(id) {
            console.log('scrolll');
            $location.hash(id);
            $anchorScroll();
        };

        //****PARA LA EXTRACCION DEL PDF

        function extraerCompra(item) {
            var promise = asyncAsignarCompra(item);
            promise.then(function(response) {
                printIt();
            });
        } //end extraerCompra

        function extraerListado(n) {
            if (n === 1) {
                printItListado();
            }

            if (n === 2) {
                printItListadoRecibir();
            }

            if (n === 3) {
                printItListadoPagar();
            }

            if (n === 4) {
                printItListadoFin();
            }


        }

        function asyncAsignarCompra(item) {
            var deferred = $q.defer();
            $scope.compra = item;
            setTimeout(function() {
                if ($scope.compra !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        } //end asyncAsignarCompra

        function printIt() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-compra').value;
            var c = document.getElementById('printing-data-compra').innerHTML;
            window.frames["print_frame_compra"].document.title = 'IM - Compra';
            window.frames["print_frame_compra"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_compra"].window.focus();
            window.frames["print_frame_compra"].window.print();
        } //end printIt

        function printItListado() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-listado').value;
            var c = document.getElementById('printing-data-listado').innerHTML;
            window.frames["print_frame_listado"].document.title = 'IM - Pedidos Realizados ';
            window.frames["print_frame_listado"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_listado"].window.focus();
            window.frames["print_frame_listado"].window.print();
        } //end printIt

        function printItListadoRecibir() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-recibir').value;
            var c = document.getElementById('printing-data-recibir').innerHTML;
            window.frames["print_frame_recibir"].document.title = 'IM - Pedidos a Recibir ';
            window.frames["print_frame_recibir"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_recibir"].window.focus();
            window.frames["print_frame_recibir"].window.print();
        } //end printIt

        function printItListadoPagar() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-pagar').value;
            var c = document.getElementById('printing-data-pagar').innerHTML;
            window.frames["print_frame_pagar"].document.title = 'IM - Pedidos a Pagar ';
            window.frames["print_frame_pagar"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_pagar"].window.focus();
            window.frames["print_frame_pagar"].window.print();
        } //end printIt

        function printItListadoFin() {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-fin').value;
            var c = document.getElementById('printing-data-fin').innerHTML;
            window.frames["print_frame_fin"].document.title = 'IM - Pedidos Finalizados ';
            window.frames["print_frame_fin"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_fin"].window.focus();
            window.frames["print_frame_fin"].window.print();
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
                    name: 'edit',
                    label: 'Estado',
                    icon: 'call_made'
                },
                {
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
                    case 'edit':
                        showAdvanced($event, item);
                        break;
                    case 'view':
                        $state.go('home.viewCompra', { compraId: item._id });
                        break;
                    case 'remove':
                        showConfirm($event, item);
                        break;
                    case 'print':
                        extraerCompra(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        function showBottomSheetPendienteEvaluacion($event, item) {

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

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'approve':
                        showConfirmPendienteEvaluacion($event, item, 1);
                        break;
                    case 'view1':
                        evaluarPendienteEvaluacion(item, 5);
                        break;
                    case 'view2':
                        $state.go('home.viewPedido', { pedidoId: item._id });
                        break;
                    case 'clear':
                        showConfirmPendienteEvaluacion($event, item, 2);
                        break;
                    case 'print':
                        extraerPedidoPendienteEvaluacion(item, 1);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        }

        function showBottomSheetRecebidos($event, item) {

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


            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'finalize':
                        showAdvancedRecibidos($event, item);
                        break;
                    case 'view':
                        $state.go('home.viewCompra', { compraId: item._id });
                        break;
                    case 'remove':
                        showConfirm($event, item);
                        break;
                    case 'print':
                        extraerCompra(item);
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

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'view':
                        $state.go('home.viewCompra', { compraId: item._id });
                        break;
                    case 'remove':
                        borrarCompra(item);
                        break;
                    case 'print':
                        extraerCompra(item);
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

            BottomSheetService.sheet($event, buttons, function(err, clicked) {
                if (err) return console.log('canceled', err);

                switch (clicked) {
                    case 'view':
                        $state.go('home.viewCompra', { compraId: item._id });
                        break;
                    case 'remove':
                        borrarCompra(item);
                        break;
                    case 'print':
                        extraerCompra(item);
                        break;
                    default:
                        console.log('something went wrong')
                }
            })

        } //end showBottomSheet

        // TABLA PAGINACION

        /*$scope.selected = [];

         $scope.query = {
         order: 'created',
         limit: 15,
         page: 1
         };

         var page = 1;
         var limit = 15;

         $scope.logPagination = function (page, limit) {
         console.log('page: ', page);
         console.log('limit: ', limit);
         };

         $scope.logOrder = function (order) {
         console.log('order: ', order);
         };*/

        // FIN TABLA PAGINACION


        function DialogController($scope, $mdDialog, item, $rootScope, Socket, Cajas) {

            $scope.itemElegido = false;
            $scope.habilitarFecha = false;
            $scope.habilitarFechaPago = false;

            $scope.item = item; //es la venta que tengo que actualizar

            $scope.error = undefined;
            $scope.errorCaja = undefined;

            $scope.elegido = function(n) {
                $scope.error = undefined;
                $scope.itemElegido = true;
                $scope.habilitarFecha = true;
                if (n === 2) {
                    $scope.habilitarFechaPago = true;
                } else {
                    $scope.habilitarFechaPago = false;
                }
            };

            $scope.hide = function() {
                $scope.itemElegido = false;
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $scope.itemElegido = false;
                $mdDialog.cancel();
            };

            $scope.findCajas = function() {
                $scope.cajas = Cajas.query({ e: item.enterprise._id });
            }

            $scope.actualizarCompra = function(data) {
                if ($scope.itemElegido === true) {
                    var compra = $scope.item;

                    if (data === 'pagado') { //el nuevo recibido
                        var estado = 'Pendiente de recepcion';
                        if (this.fechaRecepcion !== undefined) {
                            $scope.error = undefined;
                            compra.fechaRecepcion = this.fechaRecepcion;
                            updateCompra(compra, estado);
                        } else {
                            $scope.error = 'Debe seleccionar la fecha de recepcion del pedido';
                        }
                    }
                    if (data === 'recibido2') {
                        var estado = 'Pendiente de pago2';
                        updateCompra(compra, estado);
                    }
                    if (data === 'pYr2') {
                        var estado = 'Finalizada';
                        updateCompra(compra, estado);
                    }
                    if (data === 'pYr') {
                        var estado = 'Finalizada';
                        if (this.fechaRecepcion !== undefined) {
                            $scope.error = undefined;
                            compra.fechaRecepcion = this.fechaRecepcion;
                            if (this.fechaPago !== undefined) {
                                $scope.error = undefined;
                                compra.fechaPago = this.fechaPago;
                                if ($scope.item.condicionVenta.name !== 'Cuenta Corriente') {
                                    if (this.caja !== undefined) {
                                        compra.caja = this.caja;
                                        updateCompra(compra, estado);
                                    } else {
                                        $scope.errorCaja = 'Debe seleccionar la caja';
                                    }
                                } else {
                                    compra.caja = undefined;
                                }
                            } else {
                                $scope.error = 'Debe seleccionar la fecha de pago del pedido';
                            }
                        } else {
                            $scope.error = 'Debe seleccionar la fecha de recepcion del pedido';
                        }

                    }
                }
            }; //end actualizarCompra

            $scope.finalizarCompra = function(item) {
                var estado = 'Finalizada';
                if ($scope.item.condicionVenta.name !== 'Cuenta Corriente') {
                    if (this.caja !== undefined) {
                        item.created = new Date();
                        item.caja = this.caja._id;
                        updateCompra(item, estado);
                    } else {
                        $scope.errorCaja = 'Debe seleccionar la caja';
                    }
                } else {
                    item.caja = undefined;
                    updateCompra(item, estado);
                }
            };

            function updateCompra(compra, estado) {

                compra.estado = estado;

                compra.enterprise = compra.enterprise._id;
                compra.tipoComprobante = compra.tipoComprobante._id;
                compra.proveedor = compra.proveedor._id;
                compra.condicionVenta = compra.condicionVenta._id;
                if (compra.category !== undefined) {
                    compra.category == compra.category._id
                };

                $mdDialog.hide();
                console.log("Comprice");
                console.log(compra);
                Socket.emit('compra.update', compra);
            };

            $scope.habilitarActualizar = function() {
                $scope.itemElegido = true;
                $scope.errorFecha = undefined;
            }; //end habilitarActualizar

            $scope.actualizarCompraRecepcion = function() {
                if ($scope.itemElegido === true) {
                    var compra = $scope.item;

                    compra.estado = 'Finalizada';
                    if (this.recibida !== undefined) {
                        compra.fechaRecepcion = this.recibida;
                    } else {
                        $scope.errorFecha = 'Seleccionar la fecha de recibo de compra';
                    }

                    //  la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
                    // una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
                    // hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id
                    compra.enterprise = compra.enterprise._id;
                    compra.tipoComprobante = compra.tipoComprobante._id;
                    compra.proveedor = compra.proveedor._id;
                    compra.condicionVenta = compra.condicionVenta._id;

                    compra.$update(function() {
                        $mdDialog.hide();
                        location.reload(true);
                        $location.path('compras');
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                } else {
                    $scope.errorFecha = 'Seleccionar la fecha de recibo de compra';
                }
            }; //end actualizarCompraRecepcion

        }; //end DialogController

    } //end function
]);