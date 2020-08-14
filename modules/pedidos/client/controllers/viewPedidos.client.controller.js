angular.module('pedidos').controller('ViewPedidosController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Pedidos', 'Enterprises', '$mdBottomSheet', '$state', '$mdDialog', 'pedidos', 'tipoOrden', 'tipoPedido', 'Products', 'Condicionventas', 'Cajas',
    function ($scope, $rootScope, $stateParams, $location, Authentication, Pedidos, Enterprises, $mdBottomSheet, $state, $mdDialog, pedidos, tipoOrden, tipoPedido, Products, Condicionventas, Cajas) {
        $scope.authentication = Authentication;

        $scope.$watchCollection('authentication', function () {
            $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
        });

        $rootScope.pedidos = pedidos; // asigno los pedidos que ya busque en el resolve de las rutas
        $scope.tipoOrden = tipoOrden;
        $scope.tipoPedido = tipoPedido;

        //variables para habilitar editar productos
        $scope.verEdicion = [];
        $scope.verForm = false;

        //variable para chequear si ingreso un precio nuevo para un producto
        $scope.cambioPrecio = false;

        //variable para habilitar agregar productos
        $scope.formAdd = false;

        $scope.habilitarEditCondicion = false;

        //menu de botones
        $scope.selectedMode = 'md-scale';
        $scope.selectedDirection = 'left';

        $scope.rutaVolver = function () {
            // $state.go('home.pedidos', {"tipo": $rootScope.tipoPedido});
            history.back();
        };

        // Find existing Pedido
        $scope.findOne = function () {
            Pedidos.get({pedidoId: $stateParams.pedidoId}, function (res) {
                $scope.pedido = res;
                $rootScope.tipoPedido = $scope.pedido.tipoPedido;
            });
        };//end findOne

        //abre modal para confirmar/rechazar ordenes pendientes
        $scope.showConfirm = function (ev, item, n) {
            if (n == 1) {
                var confirm = $mdDialog.confirm()
                    .title('Aprobar Orden')
                    .content('¿Está seguro que desea aprobar esta orden?')
                    .ariaLabel('Lucky day')
                    .ok('Aprobar')
                    .cancel('Cancelar')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {
                    $scope.update(item, n);
                }, function () {
                    $scope.status = 'Cancelaste aprobar';
                });
            }
            else {
                if (n == 2) {
                    var confirm = $mdDialog.confirm()
                        .title('Rechazar Orden')
                        .content('¿Está seguro que desea rechazar esta orden?')
                        .ariaLabel('Lucky day')
                        .ok('Rechazar')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        $scope.update(item, n);
                    }, function () {
                        $scope.status = 'Cancelaste rechazar';
                    });
                }
            }
        }; //end show confirm

        //abre modal para eliminar productos de la orden creada
        $scope.showConfirm2 = function (ev, item, pedido) {
            var confirm = $mdDialog.confirm()
                .title('Eliminar productos')
                .content('¿Está seguro que desea eliminar este producto de la orden?')
                .ariaLabel('Lucky day')
                .ok('Eliminar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function () {
                $scope.quitarProducto(item, pedido);
            }, function () {
                // console.log('cancelaste eliminar');
            });
        }; //end showConfirm2

        // modal para aprobar presupuesto
        $scope.showAdvancedAprobar = function (ev, item) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/modules/pedidos/views/modalAprobar.client.view.html',
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
        }; //end showAdvanced

        // Cambia el estado del pedido
        $scope.update = function (item, n) {
            var pedido = item;
            if (n == 1) {
                pedido.estado = 'aprobada';
            }
            if (n == 2) {
                pedido.estado = 'rechazada';
            }


            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
             una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
             hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            if (this.enterprise !== undefined) {
                pedido.enterprise = this.enterprise._id
            } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) {
                pedido.enterprise = pedido.enterprise._id
            }
            ;
            if (this.tipoComprobante !== undefined) {
                pedido.tipoComprobante = this.tipoComprobante._id
            } else if (pedido.tipoComprobante !== undefined) {
                pedido.tipoComprobante = pedido.tipoComprobante._id
            }
            ;
            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) {
                    pedido.proveedor = $scope.proveedor._id
                } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) {
                    pedido.proveedor = pedido.proveedor._id
                }
                ;
            }
            else {
                if ($scope.cliente !== undefined) {
                    pedido.cliente = $scope.cliente._id
                } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) {
                    pedido.cliente = pedido.cliente._id
                }
                ;
            }
            if (this.condicionVenta !== undefined) {
                pedido.condicionVenta = this.condicionVenta._id
            } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) {
                pedido.condicionVenta = pedido.condicionVenta._id
            }
            ;
            if (this.caja !== undefined) {
                pedido.caja = this.caja._id
            } else if ((pedido.caja !== undefined) && (pedido.caja !== null)) {
                pedido.caja = pedido.caja._id
            }
            ;
            $scope.tipoPedido = $stateParams.tipo;
            if ($scope.tipoPedido === undefined) {
                $scope.tipoPedido = pedido.tipoPedido;
            }

            pedido.$update(function () {
                // $scope.montoTotal();
                // $state.go('home.pedidos', {"tipo": $scope.tipoPedido});
                // $state.go('home.pedidos', {"tipo": pedido.tipoPedido});
                history.back();
            }, function (errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        }; //end update

        //Habilita el form para editar productos
        $scope.habilitarEdicion = function (index) {
            $scope.verEdicion[index] = true;
        }//end habilitarEdicion

        //avisa que se ingreso un precio nuevo en un producto
        $scope.cambiarPrecio = function () {
            $scope.cambioPrecio = true;
            $scope.findProductos();
        } //end cambiarPrecio

        //calcula nuevos montos si edita precio/cantidad de un producto
        $scope.editProducto = function (p, pedido, index) {
            var impuestos = p.product.provider.impuesto1 + p.product.provider.impuesto2 + p.product.provider.impuesto3 + p.product.provider.impuesto4;
            var total = 0;
            var subtotal = 0;
            var desc = 0;
            var iva = 0;
            $scope.verEdicion = false;
            if (pedido.tipoPedido == 'compra') {
                p.subtotal = p.cantidad * p.product.costPerUnit;
            }
            else {
                p.subtotal = p.cantidad * p.product.unitPrice;
            }
            var descuento = (p.subtotal * p.descuento) / 100;
            p.total = p.subtotal - descuento;
            for (var i in pedido.products) {
                subtotal = subtotal + pedido.products[i].total;
                if (pedido.products[i].product.tax != 1) {
                    iva = iva + ((pedido.products[i].subtotal) * (pedido.products[i].product.tax) / 100)
                }
            }
            pedido.subtotal = subtotal;
            pedido.descuentoValor = (subtotal * pedido.descuentoPorcentaje) / 100;
            pedido.neto = subtotal - pedido.descuentoValor;
            var impuestosTotal = (pedido.neto * impuestos) / 100;
            pedido.totalImp = impuestosTotal;
            pedido.totalTax = iva;
            pedido.total = pedido.neto + pedido.totalTax + impuestosTotal;
            if (pedido.estado == 'pendiente evaluacion') {
                var n = 3;
            }
            if (pedido.estado == 'pendiente aprobacion') {
                var n = 5;
            }
            if (pedido.estado == 'borrador') {
                var n = 6;
            }
            $scope.verEdicion = [];
            $scope.updatePedido(pedido, n, p)
        }//end editProducto

        //edita la orden
        $scope.updatePedido = function (item, n, p) {
            if ($scope.cambioPrecio === true) {
                $scope.modificarPrecioProducto(p.product, item);
                $scope.cambioPrecio = false;
            }

            var pedido = item;

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
             una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
             hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            if (this.enterprise !== undefined) {
                pedido.enterprise = this.enterprise._id
            } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) {
                pedido.enterprise = pedido.enterprise._id
            }
            ;
            if (this.tipoComprobante !== undefined) {
                pedido.tipoComprobante = this.tipoComprobante._id
            } else if (pedido.tipoComprobante !== undefined) {
                pedido.tipoComprobante = pedido.tipoComprobante._id
            }
            ;
            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) {
                    pedido.proveedor = $scope.proveedor._id
                } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) {
                    pedido.proveedor = pedido.proveedor._id
                }
                ;
            }
            else {
                if ($scope.cliente !== undefined) {
                    pedido.cliente = $scope.cliente._id
                } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) {
                    pedido.cliente = pedido.cliente._id
                }
                ;
            }
            if (this.condicionVenta !== undefined) {
                pedido.condicionVenta = this.condicionVenta._id
            } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) {
                pedido.condicionVenta = pedido.condicionVenta._id
            }
            ;
            $scope.tipoPedido = $stateParams.tipo;
            pedido.$update(function () {
                // console.log('bien')
            }, function (errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        }; //end updatePedido

        //si cambio el precio de un producto, lo edita en bbdd
        $scope.modificarPrecioProducto = function (p, pedido) {
            for (var i in $scope.products) {
                if ($scope.products[i]._id === p._id) {
                    if (pedido.tipoPedido === 'compra') {
                        var cost = p.costPerUnit;
                        p = $scope.products[i];
                        var product = new Products({
                            _id: p._id,
                            name: p.name,
                            description: p.description,
                            code: p.code,
                            brandName: p.brandName,
                            unitPrice: cost,
                            costPerUnit: cost,
                            provider: p.provider._id,
                            quantityPerUnit: p.quantityPerUnit,
                            unitsInStock: p.unitsInStock,
                            idealStock: p.idealStock,
                            criticalStock: p.criticalStock,
                            unitsOnOrder: p.unitsOnOrder,
                            storedIn: p.storedIn,
                            metric: p.metric,
                            reseller: p.reseller,
                            esProducto: p.esProducto,
                            esMateriaPrima: p.esMateriaPrima,
                            esInsumo: p.esInsumo,
                            tax: p.tax,
                            enterprise: p.enterprise,
                            category1: p.category1,
                            category2: p.category2
                        });
                    }
                    else {
                        var precio = p.unitPrice;
                        p = $scope.products[i];
                        var product = new Products({
                            _id: p._id,
                            name: p.name,
                            description: p.description,
                            code: p.code,
                            brandName: p.brandName,
                            unitPrice: precio,
                            costPerUnit: p.costPerUnit,
                            provider: p.provider._id,
                            quantityPerUnit: p.quantityPerUnit,
                            unitsInStock: p.unitsInStock,
                            idealStock: p.idealStock,
                            criticalStock: p.criticalStock,
                            unitsOnOrder: p.unitsOnOrder,
                            storedIn: p.storedIn,
                            metric: p.metric,
                            reseller: p.reseller,
                            esProducto: p.esProducto,
                            esMateriaPrima: p.esMateriaPrima,
                            esInsumo: p.esInsumo,
                            tax: p.tax,
                            enterprise: p.enterprise,
                            category1: p.category1,
                            category2: p.category2
                        });
                    }

                    product.enterprise = product.enterprise._id;
                    if ((product.category1 !== undefined) && (product.category1 !== null)) {
                        product.category1 = product.category1._id
                    }
                    ;
                    if ((product.category2 !== undefined) && (product.category2 !== null)) {
                        product.category2 = product.category2 ? product.category2._id : undefined
                    }
                    ;
                    if ((product.provider !== undefined) && (product.provider !== null)) {
                        product.provider = product.provider._id
                    }
                    ;

                    product.$update(function (response) {
                        actualizarReferencias();
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }
            }
        } //end modificarPrecio

        //actualiza los productos por si cambio el precio de las MP que lo componen
        function actualizarReferencias() {
            for (var i in $scope.products) {
                if (($scope.products[i].esProducto == true) && ($scope.products[i].reseller == false) && ($scope.products[i].deleted == false)) {
                    if ($scope.products[i].produccion.length > 0) {
                        var product = $scope.products[i];
                        product.enterprise = product.enterprise._id;
                        product.category2 = product.category2._id;
                        product.provider = product.provider._id;
                        product.$update(function (data) {
                            console.log('update referencia ok');
                        }, function (errorResponse) {
                            console.log(errorResponse, 'error');
                            this.error = errorResponse.data.message;
                        });
                    }
                    ;
                }
            }
        };

        $scope.findProductos = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.products = Products.query({e: $scope.SEARCH.enterprise});
            }
        }; //end findProductos

        $scope.verAddProductos = function () {
            $scope.formAdd = true;
            $location.hash('agregarProd');
        }; //end verAddProductos

        $scope.sumarProductoCompra = function (producto, productoPedido, pedido) {
            if (producto !== undefined) {
                if (productoPedido !== undefined) {
                    if (productoPedido.cantidad !== undefined)
                        if (productoPedido.descuento == undefined) {
                            productoPedido.descuento = 0;
                        }
                    var impuestos = producto.provider.impuesto1 + producto.provider.impuesto2 + producto.provider.impuesto3 + producto.provider.impuesto4;
                    console.log(impuestos, 'impuestos');
                    $scope.formAdd = false;
                    var p = {
                        product: {},
                        cantidad: undefined,
                        descuento: 0,
                        total: undefined,
                        subtotal: undefined,
                        observaciones: undefined
                    };
                    var valorDescuento = (producto.costPerUnit * productoPedido.descuento) / 100;
                    var tax1, tax3, tax2 = 0;
                    var totalIva = 0;
                    p.product = producto;
                    p.cantidad = productoPedido.cantidad;
                    p.descuento = productoPedido.descuento;
                    p.observaciones = productoPedido.observaciones;
                    p.subtotal = producto.costPerUnit * productoPedido.cantidad;
                    p.total = (producto.costPerUnit * productoPedido.cantidad) - valorDescuento;
                    pedido.subtotal = pedido.subtotal + p.total;
                    if (pedido.descuentoPorcentaje !== 0) {
                        pedido.descuentoValor = (pedido.subtotal * pedido.descuentoValor) / pedido.descuentoPorcentaje;
                        pedido.neto = pedido.subtotal - pedido.descuentoValor;
                    }
                    else {
                        pedido.neto = pedido.subtotal;
                    }
                    if (producto.tax == 10.5) {
                        tax1 = parseFloat(p.subtotal * 10.5 / 100);
                        pedido.tax1 = parseFloat(pedido.tax1 + tax1);
                    }
                    if (producto.tax == 21) {
                        tax2 = parseFloat(p.subtotal * 21 / 100);
                        pedido.tax2 = parseFloat(pedido.tax2 + tax2);
                    }
                    if (producto.tax == 27) {
                        tax3 = parseFloat(p.subtotal * 27 / 100);
                        pedido.tax3 = parseFloat(pedido.tax3 + tax3);
                    }
                    var impuestosTotal = (pedido.neto * impuestos) / 100;
                    pedido.totalImp = impuestosTotal;
                    totalIva = pedido.tax1 + pedido.tax2 + pedido.tax3;
                    pedido.totalTax = totalIva;
                    pedido.total = pedido.neto + pedido.totalTax + impuestosTotal;
                    pedido.products.push(p);
                    $scope.updatePedido(pedido);
                }
                else {
                    $scope.errorCant = 'Se debe indicar una cantidad';
                }
            }
            else {
                $scope.errorProd = 'Se debe seleccionar un producto';
            }
        }; //end sumarProducto

        $scope.sumarProductoVenta = function (producto, productoPedido, pedido) {
            if (producto !== undefined) {
                if (productoPedido !== undefined) {
                    if (productoPedido.cantidad !== undefined)
                        if (productoPedido.descuento == undefined) {
                            productoPedido.descuento = 0;
                        }
                    $scope.formAdd = false;
                    var p = {
                        product: {},
                        cantidad: undefined,
                        descuento: 0,
                        total: undefined,
                        subtotal: undefined,
                        observaciones: undefined
                    };
                    var valorDescuento = (producto.unitPrice * productoPedido.descuento) / 100;
                    var tax1, tax3, tax2 = 0;
                    var totalIva = 0;
                    p.product = producto;
                    p.cantidad = productoPedido.cantidad;
                    p.descuento = productoPedido.descuento;
                    p.observaciones = productoPedido.observaciones;
                    p.subtotal = producto.unitPrice * productoPedido.cantidad;
                    p.total = (producto.unitPrice * productoPedido.cantidad) - valorDescuento;
                    pedido.subtotal = pedido.subtotal + p.total;
                    if (pedido.descuentoPorcentaje !== 0) {
                        pedido.descuentoValor = (pedido.subtotal * pedido.descuentoPorcentaje) / 100;
                        pedido.neto = pedido.subtotal - pedido.descuentoValor;
                    }
                    else {
                        pedido.neto = pedido.subtotal;
                    }
                    if (producto.tax == 10.5) {
                        tax1 = parseFloat(p.subtotal * 10.5 / 100);
                        pedido.tax1 = parseFloat(pedido.tax1 + tax1);
                    }
                    if (producto.tax == 21) {
                        tax2 = parseFloat(p.subtotal * 21 / 100);
                        pedido.tax2 = parseFloat(pedido.tax2 + tax2);
                    }
                    if (producto.tax == 27) {
                        tax3 = parseFloat(p.subtotal * 27 / 100);
                        pedido.tax3 = parseFloat(pedido.tax3 + tax3);
                    }
                    totalIva = pedido.tax1 + pedido.tax2 + pedido.tax3;
                    pedido.totalTax = totalIva;
                    pedido.total = pedido.neto + pedido.totalTax;
                    pedido.products.push(p);
                    $scope.updatePedido(pedido);
                }
                else {
                    $scope.errorCant = 'Se debe indicar una cantidad';
                }
            }
            else {
                $scope.errorProd = 'Se debe seleccionar un producto';
            }
        }; //end sumarProducto

        //borra productos de la orden
        $scope.quitarProducto = function (p, pedido) {
            var tipoPedido = pedido.tipoPedido;
            var subt = 0;
            var iva = 0;
            var descProd = 0; //descuento del producto
            var descGen = 0; //descuento del proveedor
            var tax1 = 0;
            var tax2 = 0;
            var tax3 = 0;
            var totalIva = 0;
            if (tipoPedido == 'compra') {
                descProd = parseFloat((p.product.costPerUnit * p.cantidad) * p.descuento / 100);
                subt = parseFloat((p.product.costPerUnit * p.cantidad) - descProd); //subtotal de solo ese prod
            }
            ;
            if (tipoPedido == 'venta') {
                descProd = parseFloat((p.product.unitPrice * p.cantidad) * p.descuento / 100);
                subt = parseFloat((p.product.unitPrice * p.cantidad) - descProd); //subtotal de solo ese prod
            }
            ;
            descGen = parseFloat((subt * pedido.descuentoPorcentaje) / 100);
            iva = p.product.tax;
            if (iva == 1) {
                console.log('iva incluido');
            }
            if (iva == 10.5) {
                tax1 = parseFloat(subt * 10.5 / 100);
                pedido.tax1 = parseFloat(pedido.tax1 - tax1);
            }
            if (iva == 21) {
                tax2 = parseFloat(subt * 21 / 100);
                pedido.tax2 = parseFloat(pedido.tax2 - tax2);
            }
            if (iva == 27) {
                tax3 = parseFloat(subt * 27 / 100);
                pedido.tax3 = parseFloat(pedido.tax3 - tax3);
            }
            pedido.neto = parseFloat(pedido.neto - (subt - descGen));
            pedido.subtotal = parseFloat(pedido.subtotal - subt);
            totalIva = (subt - descGen + tax1 + tax2 + tax3);
            pedido.descuentoValor = parseFloat(pedido.descuentoValor - descGen);
            pedido.total = pedido.total - totalIva;
            pedido.totalTax = pedido.totalTax - tax1 - tax2 - tax3;
            for (var i = 0; i < pedido.products.length; i++) {
                if (pedido.products[i]._id === p._id) {
                    pedido.products.splice(i, 1);
                }
            }
            if (pedido.estado == 'pendiente evaluacion') {
                var n = 3;
            }
            if (pedido.estado == 'pendiente aprobacion') {
                var n = 5;
            }
            if (pedido.estado == 'borrador') {
                var n = 6;
            }
            $scope.updatePedido(pedido, n, p);
        }; //end quitarProducto

        $scope.cambiarCondicion = function () {
            if ($scope.pedido.estado == 'pendiente aprobacion') {
                $scope.habilitarEditCondicion = true;
            }
        };

        $scope.findCondicionVenta = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.condiciones = Condicionventas.query({e: $scope.SEARCH.enterprise});
            }
        };//end find

        $scope.actualizarCondicion = function (c) {
            $scope.pedido.condicionVenta = c._id;
            var pedido = $scope.pedido;
            if (this.enterprise !== undefined) {
                pedido.enterprise = this.enterprise._id
            } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) {
                pedido.enterprise = pedido.enterprise._id
            }
            ;
            if (this.tipoComprobante !== undefined) {
                pedido.tipoComprobante = this.tipoComprobante._id
            } else if (pedido.tipoComprobante !== undefined) {
                pedido.tipoComprobante = pedido.tipoComprobante._id
            }
            ;
            if ($scope.cliente !== undefined) {
                pedido.cliente = $scope.cliente._id
            } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) {
                pedido.cliente = pedido.cliente._id
            }
            ;
            if (this.condicionVenta !== undefined) {
                pedido.condicionVenta = this.condicionVenta._id
            } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) {
                pedido.condicionVenta = pedido.condicionVenta._id
            }
            ;
            if (this.caja !== undefined) {
                pedido.caja = this.caja._id
            } else if ((pedido.caja !== undefined) && (pedido.caja !== null)) {
                pedido.caja = pedido.caja._id
            }
            ;
            pedido.$update(function () {
                console.log('actualice bien la condicion');
            }, function (errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        };

        function DialogController($scope, $mdDialog, item, $rootScope, Socket, Cajas) {


            $scope.item = item;


            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.finalizarPedido = function (item, fechaE) {
                if (fechaE !== undefined) {
                    item.myDate = fechaE;
                    item.myDateChanged = true;
                }
                var estado = 'aprobada';
                updatePedido(item, estado);
            }

            function updatePedido(pedido, estado) {
                pedido.estado = estado;

                pedido.enterprise = pedido.enterprise._id;
                pedido.tipoComprobante = pedido.tipoComprobante._id;
                if (pedido.cliente !== undefined) {
                    pedido.cliente = pedido.cliente._id
                }
                ;
                if (pedido.proveedor !== undefined) {
                    pedido.proveedor = pedido.proveedor._id
                }
                ;
                if (pedido.category1 !== undefined) {
                    pedido.category1 = pedido.category1._id
                }
                ;
                pedido.condicionVenta = pedido.condicionVenta._id;
                if (pedido.caja !== undefined) {
                    pedido.caja = pedido.caja._id;
                }

                $mdDialog.hide();
                Socket.emit('pedido.update', pedido);
                // $state.go('home.pedidos', {"tipo": pedido.tipoPedido});
                history.back();
            };
        }

    } //end function
]);	