angular.module('compras').controller('ViewCompraController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Compras', 'Enterprises', 'Products', '$mdBottomSheet', '$state', '$mdDialog', 'compras', 'compra', '$q', 'HistorialCompras', '$http', 'productos',
    function ($scope, $rootScope, $stateParams, $location, Authentication, Compras, Enterprises, Products, $mdBottomSheet, $state, $mdDialog, compras, compra, $q, HistorialCompras, $http, productos) {
        $scope.authentication = Authentication;

        $scope.$watchCollection('authentication', function () {
            $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
            $scope.findOne();
        });

        $rootScope.compras = compras; // asigno los pedidos que ya busque en el resolve de las rutas
        $scope.compra = compra;

        if(compra.historal == undefined) {
            $scope.historialCompra = compra;
        }        

        $scope.productos = productos;

        $scope.comprobanteEditado = false;
        $scope.modoEdicion = false;
        $scope.modoEdicion2 = false;

        $scope.selectedMode = 'md-scale';
        $scope.selectedDirection = 'left';
    

        // para editar por primera vez
        $scope.activarEdicion = function (compra) {
            $scope.modoEdicion = true;
            $scope.compraVerificada = angular.copy(compra);
            
            if($scope.compraVerificada.fechaRecepcion != undefined){
                var fechaRecepcionDate = new Date($scope.compraVerificada.fechaRecepcion); 
                $scope.compraVerificada.fechaRecepcion = fechaRecepcionDate;
            }
            
            $location.hash('verificacion');
        }; //end activarEdicion

        // para editar la compra verificada
        $scope.activarNuevaEdicion = function (compra) {
            $scope.compraVerificada = angular.copy(compra);
            $scope.modoEdicion2 = true;
        }; //end activarEdicion

        $scope.cerrarEdicion = function (compra) {
            $scope.modoEdicion = false;
            $scope.compraVerificada = undefined;
        }; //end cerrarEdicion

        $scope.cerrarNuevaEdicion = function () {
            $scope.modoEdicion2 = false;
            $scope.compraVerificada = undefined;
        }; //end cerrarEdicion

        $scope.updateCompra = function () {

            $scope.modoEdicion2 = false;
            var compra = $scope.compraVerificada;

            if (compra.enterprise !== undefined) {
                compra.enterprise = compra.enterprise._id
            }
            if (compra.tipoComprobante !== undefined) {
                compra.tipoComprobante = compra.tipoComprobante._id
            }
            if (compra.proveedor !== undefined) {
                compra.proveedor = compra.proveedor._id
            }
            if (compra.condicionVenta !== undefined) {
                compra.condicionVenta = compra.condicionVenta._id
            }

            modificarPrecioProducto(compra);

            compra.$update(function () {
                $scope.findOne();
                $scope.compraVerificada = undefined;
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.eliminarProducto = function (p) {
            for (var i in $scope.compraVerificada.products) {
                if ($scope.compraVerificada.products[i].product._id == p.product._id) {
                    $scope.compraVerificada.products.splice(i, 1);
                }
            }
            console.log($scope.compraVerificada, 'compra');
            $scope.calcularTotalesVerificacion();
        };

        $scope.sumarProductoCompra = function (producto, productoPedido) {
            if (producto !== undefined) {
                if (productoPedido !== undefined) {
                    if (productoPedido.cantidad !== undefined)
                        if (productoPedido.descuento == undefined) {
                            productoPedido.descuento = 0;
                        }
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
                    $scope.compraVerificada.products.push(p);
                    $scope.calcularTotalesVerificacion();
                    $scope.producto = undefined;
                    $scope.productoPedido.cantidad = undefined;
                    $scope.productoPedido.descuento = undefined;
                    $scope.productoPedido.observaciones = undefined;
                }
                else {
                    $scope.errorCant = 'Se debe indicar una cantidad';
                }
            }
            else {
                $scope.errorProd = 'Se debe seleccionar un producto';
            }
        }; //end sumarProducto

        $scope.showConfirm = function (ev, item, n) {
            switch (n) {
                case 1:
                    var confirm = $mdDialog.confirm()
                        .title('Anular Compra')
                        .content('¿Está seguro que desea anular esta compra?')
                        .ariaLabel('Lucky day')
                        .ok('Anular')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        item.estado = 'Anulada';
                        $scope.update(item);
                        $scope.montoTotal();
                    }, function () {
                        console.log('cancelaste anular');
                    });
                    break;
                case 2:
                    var confirm = $mdDialog.confirm()
                        .title('Finalizar Compra')
                        .content('¿Confirmar cierre de la compra?')
                        .ariaLabel('Lucky day')
                        .ok('Aceptar')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        $scope.update(item);
                        $scope.montoTotal();
                    }, function () {
                        console.log('cancelaste pagar');
                    });
                    break;
                case 3:
                    var confirm = $mdDialog.confirm()
                        .title('Guardar Cambios')
                        .content('¿Está seguro que ha terminado?')
                        .ariaLabel('Lucky day')
                        .ok('Guardar')
                        .cancel('Volver')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        $scope.historialDeCompra();
                    }, function () {
                        console.log('cancelaste verificar');
                    });
                    break;
            }
        }; //end showConfirm

        $scope.showAdvanced = function (ev, item) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/modules/compras/views/modal.client.view.html',
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

        $scope.showAdvancedRecibidos = function (ev, item) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/modules/compras/views/modalPagar.client.view.html',
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
                    // $scope.scrollTo('fin');
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        }; //end showAdvanced

        $scope.update = function (item) {
            var compra = item;

            if (this.enterprise !== undefined) {
                compra.enterprise = this.enterprise._id;
            } else if ((compra.enterprise !== undefined) && (compra.enterprise !== null)) {
                compra.enterprise = compra.enterprise._id;
            }
            ;
            if (this.tipoComprobante !== undefined) {
                compra.tipoComprobante = this.tipoComprobante._id;
            } else if ((compra.tipoComprobante !== undefined) && (compra.tipoComprobante !== null)) {
                compra.tipoComprobante = compra.tipoComprobante._id;
            }
            ;
            if (this.proveedor !== undefined) {
                compra.proveedor = $scope.proveedor._id;
            } else if ((compra.proveedor !== undefined) && (compra.proveedor !== null)) {
                compra.proveedor = compra.proveedor._id;
            }
            ;
            if (this.condicionVenta !== undefined) {
                compra.condicionVenta = this.condicionVenta._id;
            } else if ((compra.condicionVenta !== undefined) && (compra.condicionVenta !== null)) {
                compra.condicionVenta = compra.condicionVenta._id;
            }

            compra.$update(function () {
                $location.path('compras');
                /*$location.path('compras/' + compra._id);*/
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
                console.log($scope.error);
            });
        }; //end update

        $scope.montoTotal = function () {
            $scope.totalPendientesPR = 0;
            $scope.totalPendientesPago = 0;
            $scope.totalPendientesRecepcion = 0;
            $scope.totalFinalizadas = 0;
            $scope.totalAnuladas = 0;
            for (var i = 0; i < $scope.compras.length; i++) {
                if (($scope.compras[i].estado === 'Pendiente de pago y recepcion') && ($scope.compras[i].deleted === false)) {
                    $scope.totalPendientesPR = $scope.totalPendientesPR + $scope.compras[i].total;
                }
                if (($scope.compras[i].estado === 'Pendiente de pago2') && ($scope.compras[i].deleted === false)) {
                    $scope.totalPendientesPago = $scope.totalPendientesPago + $scope.compras[i].total;
                }
                if (($scope.compras[i].estado === 'Pendiente de recepcion') && ($scope.compras[i].deleted === false)) {
                    $scope.totalPendientesRecepcion = $scope.totalPendientesRecepcion + $scope.compras[i].total;
                }
                if (($scope.compras[i].estado === 'Finalizada') && ($scope.compras[i].deleted === false)) {
                    $scope.totalFinalizadas = $scope.totalFinalizadas + $scope.compras[i].total;
                }
                if (($scope.compras[i].estado === 'Anulada') && ($scope.compras[i].deleted === false)) {
                    $scope.totalAnuladas = $scope.totalAnuladas + $scope.compras[i].total;
                }
            }
        }; //end montoTotal

        $scope.historialDeCompra = function () {
            //creo un historial de compra y lo guardo en la bbdd
            var historialCompra = new HistorialCompras({
                compra: $scope.historialCompra,
            });

            // Redirect after save
            historialCompra.$save(function (response) {
                // console.log('se creo el historial con id:', response._id);

                // actualizo la modificacion de la compra despues de guardar el historial
                $scope.modoEdicion = false;
                var compra = $scope.compraVerificada;

                if(compra.historial == undefined) {
                    compra.historial = response;
                }
                
                compra.estado = 'Pendiente de recepcion'; //es el tab recibidos

                /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
                 una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
                 hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

                if (compra.enterprise !== undefined) {
                    compra.enterprise = compra.enterprise._id
                }
                if (compra.tipoComprobante !== undefined) {
                    compra.tipoComprobante = compra.tipoComprobante._id
                }
                if (compra.proveedor !== undefined) {
                    compra.proveedor = compra.proveedor._id
                }
                if (compra.condicionVenta !== undefined) {
                    compra.condicionVenta = compra.condicionVenta._id
                }
                if (compra.caja !== undefined) {
                    compra.caja = compra.caja._id
                }
                if (compra.category !== undefined) {
                    compra.category = compra.category._id
                }

                modificarPrecioProducto(compra);

                compra.$update(function () {
                    $scope.findOne();
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

                compra.historial = response;
                $scope.compraVerificada = null;
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        }; //end historialDeCompra

        $scope.findOne = function () {
            Compras.get({compraId: $stateParams.compraId}, function (res) {
                $scope.compra = res;
                if ($scope.compra.historial !== undefined) {
                    $http({
                        method: 'GET',
                        url: '/api/users/byId',
                        params: {userId: $scope.compra.historial.modificadoPor}
                    }).then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        $scope.usuarioDeHistorial = response.data;
                    }, function errorCallback(err) {
                        console.log('Error' + err);
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            });
            $scope.historialCompra = Compras.get({
                compraId: $stateParams.compraId
            });
        }; //end findOne

        //modifica productos de una compra ya verificada
        $scope.modificoProducto = function (p) {
            actualizarValoresProducto(p);
            $scope.calcularTotalesVerificacion();
        }; //end modificoProducto

        function actualizarValoresProducto(p) {
            for (var i = 0; i < $scope.compraVerificada.products.length; i++) {
                if ($scope.compraVerificada.products[i]._id == p._id) {
                    console.log($scope.compraVerificada.products[i], 'compra verificada');
                    var total = 0;
                    var desc = $scope.compraVerificada.products[i].descuento * $scope.compraVerificada.products[i].product.costPerUnit / 100;
                    var descTotal = desc * $scope.compraVerificada.products[i].cantidad;
                    total = $scope.compraVerificada.products[i].product.costPerUnit * $scope.compraVerificada.products[i].cantidad;
                    $scope.compraVerificada.products[i].total = total - descTotal;
                    $scope.compraVerificada.products[i].subtotal = total;
                }
            }
        } //end actualizarValoresProducto

        // calcular totales de compra verificada
        $scope.calcularTotalesVerificacion = function () {
            var imp1 = $scope.compraVerificada.proveedor.impuesto1;
            var imp2 = $scope.compraVerificada.proveedor.impuesto2;
            var imp3 = $scope.compraVerificada.proveedor.impuesto3;
            var imp4 = $scope.compraVerificada.proveedor.impuesto4;
            var sub = 0;
            var totTax1 = 0;
            var totTax2 = 0;
            var totTax3 = 0;
            var descP = 0;
            var i;
            var tax1 = [];
            var tax2 = [];
            var tax3 = [];
            if ($scope.compraVerificada.descuentoPorcentaje !== undefined) {
                descP = parseFloat($scope.compraVerificada.descuentoPorcentaje);
            }
            for (i = 0; i < $scope.compraVerificada.products.length; i++) {
                //descuentos
                if ($scope.compraVerificada.products[i].descuento === undefined) {
                    $scope.compraVerificada.products[i].descuento = 0;
                }
                if (($scope.compraVerificada.products[i].cantidad === undefined) || ($scope.compraVerificada.products[i].cantidad === null)) {
                    $scope.compraVerificada.products[i].cantidad = 0;
                }
                if ($scope.compraVerificada.products[i].product.costPerUnit === undefined) {
                    $scope.compraVerificada.products[i].product.costPerUnit = 0;
                }
                var desc = parseFloat($scope.compraVerificada.products[i].descuento) * $scope.compraVerificada.products[i].product.costPerUnit / 100;
                var finalPrice = parseFloat($scope.compraVerificada.products[i].product.costPerUnit) - desc;
                var additionalIva = parseFloat($scope.compraVerificada.products[i].product.tax) * parseFloat(finalPrice) / 100;
                if (parseFloat($scope.compraVerificada.products[i].product.tax) === 10.5) {
                    tax1.push(additionalIva * parseFloat($scope.compraVerificada.products[i].cantidad));
                }
                if (parseFloat($scope.compraVerificada.products[i].product.tax) === 21) {
                    tax2.push(additionalIva * parseFloat($scope.compraVerificada.products[i].cantidad));
                }
                if (parseFloat($scope.compraVerificada.products[i].product.tax) === 27) {
                    tax3.push(additionalIva * parseFloat($scope.compraVerificada.products[i].cantidad));
                }
                sub = sub + parseFloat($scope.compraVerificada.products[i].cantidad) * finalPrice;
            }
            if (tax1.length > 0) {
                for (i = 0; i < tax1.length; i++) {
                    totTax1 = totTax1 + parseFloat(tax1[i]);
                }
            }
            if (tax2.length > 0) {
                for (i = 0; i < tax2.length; i++) {
                    totTax2 = totTax2 + parseFloat(tax2[i]);
                }
            }
            if (tax3.length > 0) {
                for (i = 0; i < tax3.length; i++) {
                    totTax3 = totTax3 + parseFloat(tax3[i]);
                }
            }
            $scope.compraVerificada.subtotal = sub;
            var descV = sub * descP / 100;
            var d = $scope.compraVerificada.descuentoPorcentaje * $scope.compraVerificada.subtotal / 100;
            $scope.compraVerificada.descuentoValor = d;
            $scope.compraVerificada.neto = $scope.compraVerificada.subtotal - d;
            var total1 = $scope.compraVerificada.neto * imp1 / 100;
            var total2 = $scope.compraVerificada.neto * imp2 / 100;
            var total3 = $scope.compraVerificada.neto * imp3 / 100;
            var total4 = $scope.compraVerificada.neto * imp4 / 100;
            $scope.compraVerificada.totalImp = Math.round((total1 + total2 + total3 + total4) * 100) / 100;
            $scope.compraVerificada.tax1 = totTax1;
            $scope.compraVerificada.tax2 = totTax2;
            $scope.compraVerificada.tax3 = totTax3;
            $scope.compraVerificada.totalTax = totTax1 + totTax2 + totTax3;
            $scope.compraVerificada.total = Math.round(($scope.compraVerificada.neto + totTax1 + totTax2 + totTax3 + $scope.compraVerificada.totalImp) * 100) / 100;
        }; //end calcularTotalesV

        //cambia el costo del producto en bbdd cuando se cambia en una compra
        function modificarPrecioProducto(compra) {

            for (var i in compra.products) {
                for (var j in $scope.productos) {
                    if ((compra.products[i].product._id) == $scope.productos[j]._id) {
                        if (compra.products[i].product.costPerUnit != $scope.productos[j].costPerUnit) {
                            $scope.productos[j].costPerUnit = compra.products[i].product.costPerUnit;
                            var product = $scope.productos[j];
                            product.enterprise = product.enterprise._id;
                            product.category2 = product.category2._id;
                            product.provider = product.provider._id;
                            product.$update(function (response) {
                                actualizarReferencias();
                            }, function (errorResponse) {
                                console.log(errorResponse, 'error');
                                $scope.error = errorResponse.data.message;
                            });
                        }

                    }
                }
            }
        } //end modificarPrecioProducto

        //actualiza los productos por si cambio el precio de las MP que lo componen
        function actualizarReferencias() {
            for (var i in $scope.productos) {
                if (($scope.productos[i].esProducto == true) && ($scope.productos[i].reseller == false) && ($scope.productos[i].deleted == false)) {
                    if ($scope.productos[i].produccion.length > 0) {
                        var product = $scope.productos[i];
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
                }
            }
        }

        $scope.findProductos = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.products = Products.query({e: $scope.SEARCH.enterprise});
            }
        }; //end findProductos

        //****PARA LA EXTRACCION DEL PDF

        $scope.extraerCompra = function (item) {
            var promise = asyncAsignarCompra(item);
            promise.then(function (response) {
                $scope.printIt();
            });
        }; //end extraerCompra

        function asyncAsignarCompra(item) {
            var deferred = $q.defer();
            $scope.compra = item;
            setTimeout(function () {
                if ($scope.compra !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        } //end asyncAsignarCompra

        $scope.printIt = function () {
            var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-compra').value;
            var c = document.getElementById('printing-data-compra').innerHTML;
            window.frames["print_frame_compra"].document.title = 'IM - Compra';
            window.frames["print_frame_compra"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_compra"].window.focus();
            window.frames["print_frame_compra"].window.print();
        }; //end printIt

        function httpGet(theUrl) {
            var xmlHttp = null;
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        } //end httpGet

        //****FIN EXTRACCION DEL PDF

        function DialogController($scope, $mdDialog, item, Ventas, Cajas, Socket, $state) {

            $scope.itemElegido = false;
            $scope.habilitarFecha = false;

            $scope.item = item; //es la venta que tengo que actualizar

            $scope.findCajas = function () {
                $scope.cajas = Cajas.query({e: item.enterprise._id});
            };

            $scope.elegido = function (n) {
                $scope.error = undefined;
                $scope.itemElegido = true;
                $scope.habilitarFecha = true;
                $scope.habilitarFechaPago = n === 2;
            };

            $scope.hide = function () {
                $scope.itemElegido = false;
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $scope.itemElegido = false;
                $mdDialog.cancel();
            };

            $scope.finalizarCompra = function (item) {
                var estado = 'Finalizada';
                if ($scope.item.condicionVenta.name !== 'Cuenta Corriente') {
                    if (this.caja !== undefined) {
                        item.caja = this.caja._id;
                        updateCompra(item, estado);
                    }
                    else {
                        $scope.errorCaja = 'Debe seleccionar la caja';
                    }
                }
                else {
                    item.caja = undefined;
                    updateCompra(item, estado);
                }
            };

            $scope.actualizarCompra = function (data) {
                if ($scope.itemElegido === true) {
                    var compra = $scope.item;
                    var estado = "";

                    if (data === 'pagado') { //el nuevo recibido
                        estado = 'Pendiente de recepcion';
                        if (this.fechaRecepcion !== undefined) {
                            $scope.error = undefined;
                            compra.fechaRecepcion = this.fechaRecepcion;
                            updateCompra(compra, estado);
                        }
                        else {
                            $scope.error = 'Debe seleccionar la fecha de recepcion del pedido';
                        }
                    }
                    if (data === 'pYr2') {
                        estado = 'Finalizada';
                        updateCompra(compra, estado);
                    }
                    if (data === 'pYr') {
                        estado = 'Finalizada';
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
                                    }
                                    else {
                                        $scope.errorCaja = 'Debe seleccionar la caja';
                                    }
                                }
                                else {
                                    compra.caja = undefined;
                                }
                            }
                            else {
                                $scope.error = 'Debe seleccionar la fecha de pago del pedido';
                            }
                        }
                        else {
                            $scope.error = 'Debe seleccionar la fecha de recepcion del pedido';
                        }

                    }
                }
            }; //end actualizarCompra

            function updateCompra(compra, estado) {

                compra.estado = estado;

                compra.enterprise = compra.enterprise._id;
                compra.tipoComprobante = compra.tipoComprobante._id;
                compra.proveedor = compra.proveedor._id;
                compra.condicionVenta = compra.condicionVenta._id;
                if (compra.category !== undefined) {
                    compra.category = compra.category._id
                }
                ;

                $mdDialog.hide();
                Socket.emit('compra.update', compra);
                $state.go('home.compras');
            }

            // Socket.on('compra.update', angular.bind(this, function(message) {
            // 	$state.go('home.compras');
            // }));

            $scope.habilitarActualizar = function () {
                $scope.itemElegido = true;
                $scope.errorFecha = undefined;
            }; //end habilitarActualizar

            $scope.actualizarCompraRecepcion = function () {
                if ($scope.itemElegido === true) {
                    var compra = $scope.item;

                    compra.estado = 'Finalizada';
                    if (this.recibida !== undefined) {
                        compra.fechaRecepcion = this.recibida;
                    }
                    else {
                        $scope.errorFecha = 'Seleccionar la fecha de recibo de compra';
                    }

                    //  la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
                    // una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
                    // hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id
                    compra.enterprise = compra.enterprise._id;
                    compra.tipoComprobante = compra.tipoComprobante._id;
                    compra.proveedor = compra.proveedor._id;
                    compra.condicionVenta = compra.condicionVenta._id;

                    compra.$update(function () {
                        $mdDialog.hide();
                        location.reload(true);
                        $location.path('compras');
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }
                else {
                    $scope.errorFecha = 'Seleccionar la fecha de recibo de compra';
                }
            }; //end actualizarCompraRecepcion

        }//end DialogController

    } //end function
]);
