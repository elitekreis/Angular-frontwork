'use strict';

// Ventas controller
angular.module('ventas').controller('VentasController', ['$scope', '$stateParams', '$location', 'Authentication', 'Ventas', 'Comprobantes', 'Products', 'Enterprises', 'Condicionventas', '$mdBottomSheet', 'Clients', '$rootScope', '$state', '$filter', '$mdDialog', '$http', '$timeout', 'Modal', 'Categories', 'Subs', 'Metrics', 'Providers', 'Contacts', 'Taxconditions', '$window', '$q', 'Cajas', 'Socket',
    function($scope, $stateParams, $location, Authentication, Ventas, Comprobantes, Products, Enterprises, Condicionventas, $mdBottomSheet, Clients, $rootScope, $state, $filter, $mdDialog, $http, $timeout, Modal, Categories, Subs, Metrics, Providers, Contacts, Taxconditions, $window, $q, Cajas, Socket) {
        $scope.authentication = Authentication;
        $scope.impuesto = false;
        // watch for SEARCH to update value

        if (localStorage.getItem("search") !== undefined) {
            $scope.SEARCH = JSON.parse(localStorage.getItem("search"));
        }

        $scope.$watchCollection('authentication', function() {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            localStorage.setItem("search", JSON.stringify($scope.SEARCH));
            $scope.find();
            $scope.findClients();
            $scope.findCajas();
            Condicionventas.query({ e: $scope.SEARCH.enterprise }, function(res) {
                $scope.condicionVentas = res;
                Modal.setCondicionesVentas($scope.condicionVentas);
            });
            console.log($scope.condicionVenta);
            $scope.findComprobantes();
        });
        $scope.$watchCollection('condicionVenta', function() {
            if ($scope.condicionVenta)

                $scope.verCondicionVenta($scope.condicionVenta)
            console.log($scope.condicionVenta);

        });

        var created = new Date();
        $scope.created = new Date(created.setTime(created.getTime() - (2 * 3 * 60 * 60 * 1000)));

        // $scope.buscaVenta = true;

        $scope.selectedMode = 'md-scale';
        $scope.selectedDirection = 'up';

        $scope.botonApagado = false;

        $scope.rutaVolver = function() {
            $state.go('home.pedidos', { "tipo": 'venta' });
        };

        $scope.initAutocomplete = function() {
            $scope.findProductos();
        };

        //si el array contiene el elemento value
        function arrContains(array, value) {
            for (var j = 0; j < array.length; j++) {
                if (array[j] === value) {
                    return true;
                }
                return false;
            }
        }

        $rootScope.$watchCollection('nuevoProducto', function() {
            if ($rootScope.nuevoProducto !== undefined) {
                $scope.mostrarProducto = true;
                $http({
                        method: 'GET',
                        url: ('/api/products/' + $rootScope.nuevoProducto._id),
                        params: {}
                    })
                    .then(function(response) {
                        $scope.producto = response.data;
                    }, function(response) {
                        console.log('error');
                    });
                $scope.selectedItemChangeProduct($scope.producto);
            } else {
                $scope.mostrarProducto = false;
            }
        });

        $rootScope.$watchCollection('nuevoCliente', function() {
            if ($rootScope.nuevoCliente !== undefined) {
                $scope.mostrar = true;
                $scope.cliente = $rootScope.nuevoCliente;
                $scope.selectedItemChange($scope.cliente);
            } else {
                $scope.mostrar = false;
            }
        });

        $scope.user = $scope.authentication.user;
        $scope.productoVenta = { cantidad: undefined, descuento: undefined, observaciones: '' };
        $scope.mostrarPoductosFavoritos = true;
        $scope.productosDeVenta = [];

        $scope.tax1 = [];
        $scope.tax2 = [];
        $scope.tax3 = [];

        $scope.descuento_porcentaje = 0;
        $scope.descuento_valor = 0;
        $scope.vistaSubtotal = 0;
        $scope.vistaNeto = 0;
        $scope.vistaTax1 = 0;
        $scope.vistaTax2 = 0;
        $scope.vistaTax3 = 0;

        $scope.elegirCaja = true;

        $scope.isFocused = false;

        //si la condicion de venta es CC no debe elegir caja
        $scope.verCondicionVenta = function(c) {
            $scope.mensajeCond = undefined;
            if (c.name == 'Cuenta Corriente') {
                $scope.elegirCaja = false;
                // $scope.caja = undefined;
            } else {
                $scope.elegirCaja = true;
            }
        };

        //abre modal para anular y cerrar ventas
        $scope.showConfirmAnular = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Anular Venta')
                .content('¿Está seguro que desea anular esta venta?')
                .ariaLabel('Lucky day')
                .ok('Anular')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.cambiarEstadoVenta('Anulada', item);
            }, function() {
                console.log('cancelaste anular');
            });
        };

        $scope.showConfirmPago = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Pagar venta')
                .content('¿Está seguro que desea pagar esta venta?')
                .ariaLabel('Lucky day')
                .ok('Pagar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.cambiarEstadoVenta('Finalizada', item);
            }, function() {
                console.log('cancelaste cerrar');
            });
        };

        $scope.showConfirmEntrega = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Entregar venta')
                .content('¿Está seguro que desea entregar esta venta?')
                .ariaLabel('Lucky day')
                .ok('Entregar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.cambiarEstadoVenta('Finalizada', item);
            }, function() {
                console.log('cancelaste cerrar');
            });
        };

        function n_with_zeroes(number, length) {
            var my_string = '' + number;
            while (my_string.length < length) {
                my_string = '0' + my_string;
            }
            return my_string;
        }

        //calculo de numero de comprobante
        //actualizar N
        $scope.actualizarN = function() {
            $scope.letra_comprobante = $scope.tipoComprobante.letra;
            $scope.puntoVenta_comprobante = n_with_zeroes(parseInt($scope.tipoComprobante.puntoDeVenta), 4);
            $scope.comprobante = n_with_zeroes(parseInt($scope.tipoComprobante.ultimoNumero) + 1, 8);
            $scope.mensajeTipoC = undefined;
            var comprobante = $scope.tipoComprobante.name;

            if (comprobante == "Factura A" || comprobante == "Factura B" || comprobante == "Factura C") {
                $scope.impuesto = true;
            } else {
                $scope.impuesto = false;
            }
        };


        //Para la edición
        $scope.modoEditar = [];
        $scope.mostrarP = false;
        $scope.cambiarMostrarP = function() {
            if ($scope.mostrarP === false) {
                $scope.mostrarP = true;
            } else {
                $scope.mostrarP = false;
            }
        };
        $scope.editTrue = function(id, p) {
            $scope.modoEditar[id] = true;
            // console.log(p);
            // console.log($scope.modoEditar);
        };
        $scope.updateP = function(index, p) {
            var unitWithDiscount = parseFloat(p.product.unitPrice) - (parseFloat(p.descuento) * parseFloat(p.product.unitPrice) / 100);
            // console.log(unitWithDiscount);
            var sub = parseFloat(p.cantidad) * parseFloat(unitWithDiscount);
            // console.log(sub);
            p.total = sub;
            p.totalSinD = parseFloat(p.cantidad) * parseFloat(p.product.unitPrice);
            $scope.productosDeVenta[index] = p;
            $scope.modoEditar[index] = false;
            $scope.calcularTotales();
        };

        $scope.calcularTotales = function() {
            var sub = 0;
            var totTax1 = 0;
            var totTax2 = 0;
            var totTax3 = 0;
            var descP = 0;
            var i;
            $scope.tax1 = [];
            $scope.tax2 = [];
            $scope.tax3 = [];
            if ($scope.descuento_porcentaje !== undefined) {
                descP = parseFloat($scope.descuento_porcentaje);
            }
            for (i = 0; i < $scope.productosDeVenta.length; i++) {
                //descuentos
                if ($scope.productosDeVenta[i].descuento === undefined) {
                    $scope.productosDeVenta[i].descuento = 0;
                }
                //var desc = parseFloat($scope.productosDeVenta[i].descuento) * $scope.productosDeVenta[i].product.unitPrice / 100;
                //var finalPrice = $scope.productosDeVenta[i].product.unitPrice - desc;
                var desc = parseFloat($scope.productosDeVenta[i].descuento) * $scope.productosDeVenta[i].product.price / 100;
                var finalPrice = $scope.productosDeVenta[i].product.price - desc;
                var additionalIva = parseFloat(1 - (1 / (1 + $scope.productosDeVenta[i].product.tax / 100))) * parseFloat(finalPrice);
                if (parseFloat($scope.productosDeVenta[i].product.tax) === 10.5) {
                    $scope.tax1.push(additionalIva * parseFloat($scope.productosDeVenta[i].cantidad));
                }
                if (parseFloat($scope.productosDeVenta[i].product.tax) === 21.00) {
                    $scope.tax2.push(additionalIva * parseFloat($scope.productosDeVenta[i].cantidad));
                }
                if (parseFloat($scope.productosDeVenta[i].product.tax) === 27.00) {
                    $scope.tax3.push(additionalIva * parseFloat($scope.productosDeVenta[i].cantidad));
                }
                sub = sub + parseFloat($scope.productosDeVenta[i].cantidad) * finalPrice;
            }
            if ($scope.tax1.length > 0) {
                for (i = 0; i < $scope.tax1.length; i++) {
                    totTax1 = totTax1 + parseFloat($scope.tax1[i]);
                }
            }
            if ($scope.tax2.length > 0) {
                for (i = 0; i < $scope.tax2.length; i++) {
                    totTax2 = totTax2 + parseFloat($scope.tax2[i]);
                }
            }
            if ($scope.tax3.length > 0) {
                for (i = 0; i < $scope.tax3.length; i++) {
                    totTax3 = totTax3 + parseFloat($scope.tax3[i]);
                }
            }

            $scope.vistaSubtotal = sub;
            var descV = sub * descP / 100;
            var d = $scope.descuento_porcentaje * $scope.vistaSubtotal / 100;
            $scope.descuento_valor = d;

            $scope.vistaNeto = $scope.vistaSubtotal - d;
            $scope.vistaTax1 = totTax1;
            $scope.vistaTax2 = totTax2;
            $scope.vistaTax3 = totTax3;
            $scope.vistaTotal = $scope.vistaNeto;
        };

        $scope.clienteAsignado = function() {
            $scope.mensajeCli = undefined;
            $scope.descuento_porcentaje = $scope.client.discountRate;
            $scope.mostrarPoductosFavoritos = true;
            $scope.calcularTotales();
            // console.log($scope.client.productosAsociados);
        };

        $scope.asignarProducto = function(p) {
            $scope.stockD = false;
            $scope.producto = p;
            // console.log($scope.producto);
            // console.log('asigna proddd');
        };

        $scope.controlStock = function(p) {
            // console.log('cant', $scope.productoVenta.cantidad);
            // console.log('stock', p.unitsInStock);
            /*$scope.mensajeP = undefined;
             if ($scope.productoVenta.cantidad > p.unitsInStock) {
             $scope.stockD = true;
             $scope.productoVenta.cantidad = p.unitsInStock;
             } else {
             $scope.stockD = false;
             }*/
            var stockItem = $scope.getUserStock(p);
            if(stockItem != null){
                if ($scope.productoVenta.cantidad > stockItem.unitsInStock && $scope.productoVenta.cantidad > 0) {
                    $scope.stockD = true;
                } else {
                    $scope.stockD = false;
                }
            }
        };

        //joker's add
        $scope.getUserStock = function(p) {
            if(p != null && p.hasOwnProperty('stocks')){
                for(var i=0; i<p.stocks.length; i++){
                    if(p.stocks[i].costCenter == $scope.authentication.user.centroDeCosto){
                        return p.stocks[i];
                    }
                }
            }
            return null;
        };

        $scope.getUserUnitsStock = function(p) {
            if(p != null && p.hasOwnProperty('stocks')){
                for(var i=0; i<p.stocks.length; i++){
                    if(p.stocks[i].costCenter == $scope.authentication.user.centroDeCosto){
                        return p.stocks[i].unitsInStock;
                    }
                }
            }
            return 0;
        };

        // Create new Venta
        $scope.create = function() {
            if ($scope.clicked === true) {
                    if ($scope.productosDeVenta.length !== 0) {
                        if (($scope.client !== undefined) && ($scope.client !== '') && ($scope.client !== null)) {
                            if (($scope.tipoComprobante !== undefined) && ($scope.tipoComprobante !== '')) {
                                if (($scope.condicionVenta !== undefined) && ($scope.condicionVenta !== '')) {
                                    console.log($scope.impuesto);
                                    if ($scope.condicionVenta.name == 'Cuenta Corriente') {
                                        $scope.mensajeError = undefined;
                                        // Create new Venta object
                                        $scope.calcularTotales();
                                        var totalTax = $scope.vistaTax1 + $scope.vistaTax2 + $scope.vistaTax3;
                                        // var total = $scope.vistaNeto + totalTax;
                                        var total = $scope.vistaNeto;
                                        var productosParaAgregar = [];
                                        var venta = new Ventas({
                                            created: $scope.created,
                                            caja: undefined,
                                            tipoComprobante: this.tipoComprobante,
                                            comprobante: this.comprobante,
                                            enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                                            category1: this.category1 ? this.category1._id : undefined,
                                            puesto: $scope.authentication.user.puesto,
                                            myDate: $scope.myDate,
                                            cliente: $scope.client,
                                            impuesto: $scope.impuesto,
                                            delivery: this.delivery,
                                            condicionVenta: this.condicionVenta,
                                            products: $scope.productosDeVenta,
                                            observaciones: this.observaciones,
                                            subtotal: $scope.vistaSubtotal,
                                            descuentoPorcentaje: this.descuento_porcentaje,
                                            descuentoValor: $scope.vistaSubtotal * this.descuento_porcentaje / 100,
                                            neto: $scope.vistaNeto,
                                            tax1: $scope.vistaTax1,
                                            tax2: $scope.vistaTax2,
                                            tax3: $scope.vistaTax3,
                                            totalTax: totalTax,
                                            total: total
                                        });


                                        createVenta(venta);
                                    } else {
                                        if (($scope.caja !== undefined) && ($scope.caja !== '')) {
                                            $scope.mensajeError = undefined;
                                            // Create new Venta object
                                            $scope.calcularTotales();
                                            var totalTax = $scope.vistaTax1 + $scope.vistaTax2 + $scope.vistaTax3;
                                            // var total = $scope.vistaNeto + totalTax;
                                            var total = $scope.vistaNeto;
                                            var productosParaAgregar = [];
                                            var venta = new Ventas({
                                                created: $scope.created,
                                                caja: this.caja,
                                                tipoComprobante: this.tipoComprobante,
                                                comprobante: this.comprobante,
                                                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                                                category1: this.category1 ? this.category1._id : undefined,
                                                puesto: $scope.authentication.user.puesto,
                                                myDate: $scope.myDate,
                                                cliente: $scope.client,
                                                impuesto: $scope.impuesto,
                                                delivery: this.delivery,
                                                condicionVenta: this.condicionVenta,
                                                products: $scope.productosDeVenta,
                                                observaciones: this.observaciones,
                                                subtotal: $scope.vistaSubtotal,
                                                descuentoPorcentaje: this.descuento_porcentaje,
                                                descuentoValor: $scope.vistaSubtotal * this.descuento_porcentaje / 100,
                                                neto: $scope.vistaNeto,
                                                tax1: $scope.vistaTax1,
                                                tax2: $scope.vistaTax2,
                                                tax3: $scope.vistaTax3,
                                                totalTax: totalTax,
                                                total: total
                                            });
                                            createVenta(venta);
                                        } else {
                                            $scope.botonApagado = false;
                                            $scope.mensajeCaja = 'Debe elegir una caja';
                                        }
                                    }
                                } else {
                                    $scope.botonApagado = false;
                                    $scope.mensajeCond = 'No seleccionaste una condicion de venta';
                                }
                            } else {
                                $scope.botonApagado = false;
                                $scope.mensajeTipoC = 'No seleccionaste un tipo de comprobante';
                            }
                        } else {
                            $scope.botonApagado = false;
                            $scope.mensajeCli = 'No seleccionaste un cliente';
                        }
                    } else {
                        $scope.botonApagado = false;
                        $scope.mensajeProd = 'No seleccionaste productos para la venta';
                    }
            }
            //end if scope clicked
            else {
                console.log('no action');
                return;
                //prevent defaults
                //prevengo que se haga un submit cuando presiona enter
            }
        };

        function createVenta(venta) {
            console.log('----create venta----');
            console.log(venta);
            venta.user = $scope.authentication.user._id;
            venta.$save(function(response) {
                if (response._id) {
                    // $http.put('/api/cajas/updateTotal', { response });
                    $http.post('/api/impuestos/updateTotal', {
                        month: (new Date()).getMonth(),
                        year: (new Date()).getFullYear()
                    });

                    $scope.find();
                    $scope.ventas.push(venta);
                }
                // $scope.modificarCliente(productosParaAgregar);
                $state.go('home.ventas', { tab: 'finalizada' });
                // Clear form fields
                $scope.name = '';
                $scope.producto = '';
            }, function(errorResponse) {
                console.log('errorResponse', errorResponse);
            });

            $scope.clicked = false;
        }

        //si apreto el boton submit llama al create, si se acciono por enter no
        $scope.clickSubmit = function() {
            $scope.botonApagado = true;
            $scope.clicked = true;
            $scope.create();
        };

        // Remove existing Venta
        $scope.remove = function(venta) {
            if (venta) {
                venta.$remove();

                for (var i in $scope.ventas) {
                    if ($scope.ventas[i] === venta) {
                        $scope.ventas.splice(i, 1);
                    }
                }
            } else {
                $scope.venta.$remove(function() {
                    $location.path('ventas');
                });
            }
        };

        // Update existing Venta
        $scope.update = function() {
            var venta = $scope.venta;

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
             una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
             hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */
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
            if (this.client !== undefined) {
                venta.cliente = this.client._id
            } else if ((venta.cliente !== undefined) && (venta.cliente !== null)) {
                venta.cliente = venta.cliente._id
            };
            if (this.condicionVenta !== undefined) {
                venta.condicionVenta = this.condicionVenta._id
            } else if ((venta.condicionVenta !== undefined) && (venta.condicionVenta !== null)) {
                venta.condicionVenta = venta.condicionVenta._id
            };

            venta.$update(function() {
                $location.path('ventas/' + venta._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Cambiar estado Venta
        $scope.cambiarEstadoVenta = function(estado, v) {
            var venta = v;
            venta.estado = estado;

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
             una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
             hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */
            if (this.enterprise !== undefined) {
                venta.enterprise = this.enterprise._id
            } else {
                venta.enterprise = venta.enterprise._id
            };
            if (this.tipoComprobante !== undefined) {
                venta.tipoComprobante = this.tipoComprobante._id
            } else if ((venta.tipoComprobante !== undefined) && (venta.tipoComprobante !== null)) {
                venta.tipoComprobante = venta.tipoComprobante._id
            };
            if ((venta.cliente !== undefined) && (venta.cliente !== null)) {
                venta.cliente = venta.cliente._id
            } else if (this.client !== undefined) {
                venta.cliente = this.client._id
            };
            if (this.condicionVenta !== undefined) {
                venta.condicionVenta = this.condicionVenta._id
            } else if ((venta.condicionVenta !== undefined) && (venta.condicionVenta !== null)) {
                venta.condicionVenta = venta.condicionVenta._id
            };

            Socket.emit('venta.update', venta);
        };

        Socket.on('ventas.update', angular.bind(this, function(message) {
            console.log("MOZDA OVDE");
            $scope.montoTotal();
            $state.go('home.ventas');
        }));

        // Find a list of Ventas

        $scope.find = function() {
            $rootScope.nuevoCliente = undefined;
            var promise = asyncVentas();
            promise.then(function(response) {
                $scope.montoTotal();
            });
            // }
        };

        function asyncVentas(item) {
            if ($scope.SEARCH !== undefined) {
                $scope.ventas = Ventas.query({ e: $scope.SEARCH.enterprise });
            }
            var deferred = $q.defer();
            setTimeout(function() {
                if ($scope.ventas !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        };

        $scope.ventasFinalizadas = [];

        $scope.montoTotal = function() {
            $scope.totalPendientesPA = 0;
            $scope.totalPendientesPago = 0;
            $scope.totalPendientesEntrega = 0;
            $scope.totalFinalizadas = 0;
            $scope.totalAnuladas = 0;
            for (var i = 0; i < $scope.ventas.length; i++) {
                if (($scope.ventas[i].estado === 'Pendiente de pago y entrega') && ($scope.ventas[i].deleted === false)) {
                    $scope.totalPendientesPA = $scope.totalPendientesPA + $scope.ventas[i].total;
                }
                if (($scope.ventas[i].estado === 'Pendiente de pago2') && ($scope.ventas[i].deleted === false)) {
                    $scope.totalPendientesPago = $scope.totalPendientesPago + $scope.ventas[i].total;
                }
                if (($scope.ventas[i].estado === 'Pendiente de entrega') && ($scope.ventas[i].deleted === false)) {
                    $scope.totalPendientesEntrega = $scope.totalPendientesEntrega + $scope.ventas[i].total;
                }
                if (($scope.ventas[i].estado === 'Finalizada') && ($scope.ventas[i].deleted === false)) {
                    $scope.totalFinalizadas = $scope.totalFinalizadas + $scope.ventas[i].total;
                    $scope.ventasFinalizadas.push($scope.ventas[i]);
                }
                if (($scope.ventas[i].estado === 'Anulada') && ($scope.ventas[i].deleted === false)) {
                    $scope.totalAnuladas = $scope.totalAnuladas + $scope.ventas[i].total;
                    // $scope.ventasFinalizadas.push($scope.ventas[i]);
                }
            }
        };

        // Find existing Venta
        $scope.findOne = function() {
            // $rootScope.nuevoCliente = undefined;
            Ventas.get({ ventaId: $stateParams.ventaId }, function(res) {
                    $scope.venta = res;
                    var ptoVenta = n_with_zeroes(parseInt($scope.venta.tipoComprobante.puntoDeVenta), 4);
                    $scope.ptoVenta = ptoVenta;
                },
                function(err) {
                    //error
                }
            );
        };

        // Find a list of Comprobantes
        $scope.findComprobantes = function() {
            // $scope.comprobantes = Comprobantes.query();
            if ($scope.SEARCH !== undefined) {
                var promise = $http({
                    method: 'GET',
                    url: ('/api/comprobantes/'),
                    params: { e: $scope.SEARCH.enterprise }
                });
                promise.then(function(response) {
                    $scope.comprobantes = response.data;
                    for (var i in $scope.comprobantes) {
                        if ($scope.comprobantes[i].name === 'Pedido') {
                            $scope.comprobantes.splice(i, 1);
                        }
                    }
                    Modal.setComprobantes($scope.comprobantes);
                });
            }
        };

        // Find a list of Enterprises
        $scope.findEnterprises = function() {
            $scope.enterprises = Enterprises.query();
        };

        // Find a list of Products
        $scope.findProductos = function() {
            if(this.client !== undefined){
                if ($scope.SEARCH !== undefined) {
                    $scope.productos = Products.query({ e: $scope.SEARCH.enterprise, c: this.client.category1.category });
                } else {
                    $scope.productos = Products.query();
                }
                $scope.productosFilter = $scope.productos;
                $scope.selectedItemChangeProduct($scope.producto);
            }
        };

        // Find a list of CondicionVentas
        $scope.findCondicionesventas = function() {
            if ($scope.SEARCH !== undefined) {
                // $scope.condicionesVentas = Condicionventas.query();
                var promise = $http({
                    method: 'GET',
                    url: ('/api/condicionventas/'),
                    params: { e: $scope.SEARCH.enterprise }
                });
                promise.then(function(response) {
                    $scope.condicionVentas = response.data;
                    Modal.setCondicionesVentas($scope.condicionVentas);
                });
            }
        };

        // Find a list of Clients
        $scope.findClients = function() {
            if ($scope.SEARCH !== undefined) {
                var promise = $http({
                    method: 'GET',
                    url: ('/api/clients'),
                    params: { e: $scope.SEARCH.enterprise }
                });

                promise.then(function(response) {
                    $scope.clients = response.data;
                    for (var i = 0; i < $scope.clients.length; i++) {
                        if ($scope.clients[i].name === "Consumidor Final")
                            $scope.client = $scope.clients[i];
                    }
                });
            }
        };

        $scope.sendClient = function($event, client) {
            if ($event.keyCode === 13) {
                $event.preventDefault();
                if ((client === null) || (client === undefined)) {
                    $scope.mensajeC = 'No seleccionaste un cliente valido';
                } else {
                    $scope.client = client;
                    console.log('todo ok: ', client);
                }
            }
        };

        $scope.mostrarUltimaVenta = false;

        $scope.selectedItemChange = function(item, ev) {
            $scope.mensajeCli = undefined;
            $scope.client = item;
            if (true || $scope.ventaRecordada === true) {
                $scope.productosDeVenta = [];
                $scope.calcularTotales();
            }
            $scope.productosDeVenta = [];
            $scope.mensajeSinVentas = false;
            //asigno por defecto los campos asociados al cliente en los select
            if (($scope.client !== undefined) && ($scope.client !== null)) {
                if (($scope.client.condicionPago !== undefined) && ($scope.client.condicionPago !== null)) {
                    var promise = $http({
                        method: 'GET',
                        url: ('/api/condicionventas'),
                        params: { e: $scope.SEARCH.enterprise }
                    });
                    promise.then(function(response) {
                        $scope.condicionVentas = response.data;
                        for (var i = 0; i < $scope.condicionVentas.length; i++) {
                            if (($scope.client.condicionPago._id !== undefined) && ($scope.client.condicionPago._id !== null) && ($scope.condicionVentas[i]._id == $scope.client.condicionPago._id)) {
                                // console.log('coincidio', $scope.condicionVentas[i]);
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            } else if ($scope.condicionVentas[i]._id == $scope.client.condicionPago) {
                                // console.log('coincidio', $scope.condicionVentas[i]);
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            }
                        }
                        $scope.findProductos();
                        $scope.productosNombre = $scope.productos;
                        $scope.producto = null;
                        $scope.searchText2 = null;
                    });
                }
                if (($scope.client.comprobante !== undefined) && ($scope.client.comprobante !== null)) {
                    var promise = $http({
                        method: 'GET',
                        url: ('/api/comprobantes'),
                        params: { e: $scope.SEARCH.enterprise }
                    });
                    promise.then(function(response) {
                        $scope.comprobantes = response.data;
                        for (var i = 0; i < $scope.comprobantes.length; i++) {
                            if (($scope.client.comprobante._id !== undefined) && ($scope.client.comprobante._id !== null) && ($scope.comprobantes[i]._id == $scope.client.comprobante._id)) {
                                $scope.tipoComprobante = $scope.comprobantes[i];
                                $scope.actualizarN();
                            } else if ($scope.comprobantes[i]._id == $scope.client.comprobante) {
                                $scope.tipoComprobante = $scope.comprobantes[i];
                                $scope.actualizarN();
                            }
                        }
                    });
                }
                $scope.mostrarUltimaVenta = true;
            }
        };

        $scope.mensajeSinVentas = false;

        $scope.verUltimaVenta = function(client) {
            $scope.ultimaVenta = [];
            $scope.mostrarUltimaVenta = false;
            var idCliente = client._id;
            $scope.ultimaVenta = $filter('filter')($scope.ventas, function(item) {
                if ($scope.ventas.length !== 0) {
                    return (item.cliente.id === idCliente);
                }
            });

            if ($scope.ultimaVenta.length > 0) {
                if ($scope.productosDeVenta.length !== 0) {
                    $scope.productosDeVenta = [];
                    $scope.productosDeVenta = $scope.ultimaVenta[0].products;
                } else {
                    $scope.productosDeVenta = $scope.ultimaVenta[0].products;
                }
                this.descuento_porcentaje = 0;
                this.vistaTax1 = $scope.ultimaVenta[0].tax1;
                this.vistaTax2 = $scope.ultimaVenta[0].tax2;
                this.vistaTax3 = $scope.ultimaVenta[0].tax3;
                this.vistaSubtotal = $scope.ultimaVenta[0].subtotal;
                this.vistaNeto = $scope.ultimaVenta[0].subtotal;
                this.vistaTotal = $scope.ultimaVenta[0].total;
                $scope.ventaRecordada = true;
            } else {
                $scope.ventaRecordada = false;
                $scope.mensajeSinVentas = true;
            }
        };

        $scope.reverse = function(array) {
            var copy = [].concat(array);
            return copy.reverse();
        };

        $scope.selectedItemChangeProduct = function(item) {
            $scope.mensajeProd = undefined;
            $scope.producto = item;
            if($scope.producto!==null){
            	document.getElementById('inputCantidad').focus();
            }
        };

        //si presiona enter
        $scope.sendProduct = function($event, productoVenta, producto) {
            if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                $event.preventDefault();
                // $scope.isFocused = false;
                if ((producto === null) || (producto === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un producto valido';
                } else {
                    /*if ((productoVenta.cantidad === null) || (productoVenta.cantidad === undefined) || (producto.unitsInStock === 0)) {
                     if (producto.unitsInStock === 0) {
                     $scope.mensajeP = 'No hay stock disponible';
                     } else {
                     $scope.mensajeP = 'No seleccionaste una cantidad para el producto';
                     }
                     }*/
                    if ((productoVenta.cantidad === null) || (productoVenta.cantidad === undefined)) {
                        $scope.mensajeP = 'No seleccionaste una cantidad para el producto';
                    } else {
                        $scope.controlStock(producto);
                        $scope.stockD = false;
                        $scope.mensajeP = undefined;
                        $scope.producto = producto;
                        $scope.addProduct(producto, productoVenta);
                    }
                }
            }
        };

        // Add product to venta
        $scope.addProduct = function(producto, productoVenta) {
            $scope.mensajeProd = undefined;
            var p = {
                product: {},
                cantidad: undefined,
                descuento: undefined,
                total: undefined,
                observaciones: undefined
            };
            p.product = producto;
            p.product.price = 0;
            for(var i=0; i< p.product.catPrice.length; i++){
                if(p.product.catPrice[i].category == this.client.category1.category){
                    p.product.price = p.product.catPrice[i].price;
                }
            }
            if (producto != undefined) {
                // console.log(p, 'antes');
                if ((productoVenta.descuento === '') || (productoVenta.descuento === undefined)) {
                    p.descuento = '0';
                } else {
                    p.descuento = productoVenta.descuento;
                }
                if ((productoVenta.cantidad === '') || (productoVenta.cantidad === undefined)) {
                    p.cantidad = '0';
                } else {
                    p.cantidad = productoVenta.cantidad;
                }
                if (productoVenta.observaciones === undefined) {
                    p.observaciones = '';
                } else {
                    p.observaciones = productoVenta.observaciones;
                }
                //var unitWithDiscount = parseFloat(p.product.unitPrice) - (parseFloat(p.descuento) * parseFloat(p.product.unitPrice) / 100);
                //joker's change
                var unitWithDiscount = parseFloat(p.product.price) - (parseFloat(p.descuento) * parseFloat(p.product.price) / 100);
                // console.log(unitWithDiscount);
                var sub = parseFloat(p.cantidad) * parseFloat(unitWithDiscount);
                //joker's change
                //p.totalSinD = parseFloat(p.cantidad) * parseFloat(p.product.unitPrice);
                p.totalSinD = parseFloat(p.cantidad) * parseFloat(p.product.price);
                p.total = sub;
                $scope.productosDeVenta.splice(0,0,p);
                // $scope.productosDeVenta.push(p);
                $scope.calcularTotales();

                //pongo en vacios los campos de agregar prod
                productoVenta = undefined;
                p = undefined;
                $scope.productoVenta = { cantidad: undefined, descuento: undefined, observaciones: '' };
                $scope.selectedProduct = [];
                $scope.selectedItem = null;
                $scope.searchText2 = '';
                document.getElementById("buscaVenta").focus();
                // document.getElementById("buscaVenta").value = '';
            } else {
                return 0;
            }
        };

        // Eliminar product of venta
        $scope.eliminarProducto = function(index) {
            $scope.productosDeVenta.splice(index, 1);
            $scope.calcularTotales();
        };

        //autocomplete
        $scope.selectedProduct = [];
        $scope.selectedItem = null;

        //el texto ingresado
        $scope.searchText2 = null;

        /**
         * Create filter function for a query string
         */
        //filtro el arreglo de usuarios disponibles con los que coincidan con text
        $scope.searchTextChange = function(text) {
            var lowercaseQuery = angular.lowercase(text);
            $scope.productosFilter = $filter('filter')($scope.productos, { code: text });
        };

        $scope.searchTextChange2 = function(text) {
            var lowercaseQuery = angular.lowercase(text);
            $scope.productosNombre = $filter('filter')($scope.productos, { name: text });
        };

        $scope.searchTextChangeClients = function(text) {
            var lowercaseQuery = angular.lowercase(text);
            return $filter('filter')($scope.clients, { name: text });
        };

        $scope.round = function(total) {
            return '$' + parseFloat(total).toFixed(2);
        };

        $scope.minLengthClient = 0;

        $scope.showAdvancedClient = function(ev) {
            $scope.minLengthClient = 1;
            $scope.textToSearch = undefined;
            $scope.findContacts();
            $scope.findCategories();
            $scope.findTaxConditions();
            Modal.setEmpresa($scope.SEARCH.enterprise);
            $mdDialog.show({
                    controller: CrearController,
                    templateUrl: '/modules/ventas/views/create.client.view.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                })
                .then(function(answer) {
                    $scope.minLengthClient = 0;
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.minLengthClient = 0;
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.findContacts = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.contacts = Contacts.query({ e: $scope.SEARCH.enterprise });
                Modal.setContactos($scope.contacts);
            }

        };

        $scope.findCategories = function() {
            if ($scope.SEARCH !== undefined) {
                Categories.query({ e: $scope.SEARCH.enterprise }, function(data) {
                    $scope.categories = $filter('filter')(data, function(item) {
                        return item.type1 === 'Tipo de Venta';
                    });
                    Modal.setCategorias($scope.categories);
                });
            }
        };

        $scope.findCajas = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.cajas = [];
                Cajas.query({ e: $scope.user.enterprise.enterprise }, function(foundCaja) {
                    foundCaja.forEach(function(entry) {
                        if (entry.deleted === false) {
                            $scope.cajas.push(entry);
                        }

                        if (entry.puestos.length > 0 && user.puesto == entry.puestos[0]._id) {
                            $scope.caja = entry;
                        }
                    });

                    if ($scope.cajas.length === 1) {
                        $scope.caja = $scope.cajas[0]
                    }
                })
            }
        };

        // Find a list of Taxconditions
        $scope.findTaxConditions = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.taxconditions = Taxconditions.query({ e: $scope.SEARCH.enterprise });
                Modal.setCondiciones($scope.taxconditions);
            }

        };

        $scope.showAdvanced = function(ev, item) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/modules/ventas/views/modal.client.view.html',
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
        };

        $scope.minLength = 0;

        $scope.showAdvancedProduct = function(ev) {
            $scope.minLength = 1;
            $scope.searchText2 = undefined;
            $scope.findProveedores();
            $scope.findCategories();
            $scope.findSubs();
            $scope.findMetrics();
            $scope.findSubcategories();
            $scope.findTaxes();
            Modal.setEmpresa($scope.SEARCH.enterprise);
            $mdDialog.show({
                    controller: CrearController,
                    templateUrl: '/modules/ventas/views/create.product.view.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                })
                .then(function(answer) {
                    $scope.minLength = 0;
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.minLength = 0;
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.findProveedores = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
                Modal.setProveedores($scope.proveedores);
            }
        };

        // Find a list of SBUs
        $scope.findSubs = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise });
                Modal.setSubs($scope.subs);
            }
        };

        $scope.findSubcategories = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.subcategorias = Categories.query({ e: $scope.SEARCH.enterprise });
                Modal.setSubcategorias($scope.subcategorias);
            }
        };

        $scope.findTaxes = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.taxes = [{ value: 1, name: 'Iva incluido en el precio' }, {
                    value: 10.5,
                    name: '10.50%'
                }, { value: 21, name: '21.00%' }, { value: 27, name: '27.00%' }];
                Modal.setTaxes($scope.taxes);
            };
        };

        $scope.findMetrics = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.metrics = Metrics.query();
                Modal.setMetrics($scope.metrics);
            }
        };

        // PARA EDITAR PRODUCTOS EN VIEW Venta

        $scope.verEdicion = [];

        $scope.habilitarEdicion = function(index) {
                $scope.verEdicion[index] = true;
            } //end habilitarEdicion

        $scope.editProducto = function(p, venta, index) {
                var total = 0;
                var subtotal = 0;
                var desc = 0;
                var iva = 0;
                $scope.verEdicion = false;
                p.subtotal = p.cantidad * p.product.unitPrice;
                var descuento = (p.subtotal * p.descuento) / 100;
                p.total = p.subtotal - descuento;
                for (var i in venta.products) {
                    subtotal = subtotal + venta.products[i].total;
                    if (venta.products[i].product.tax != 1) {
                        iva = iva + ((venta.products[i].subtotal) * (1 - (1 / (1 + venta.products[i].product.tax / 100)))) // TODO: there might be issue in this code
                    }
                }
                venta.subtotal = subtotal;
                venta.descuentoValor = (subtotal * venta.descuentoPorcentaje) / 100;
                venta.neto = subtotal - venta.descuentoValor;
                venta.totalTax = iva;
                // venta.total = venta.neto + venta.totalTax;
                venta.total = venta.neto;
                $scope.verEdicion = [];
                $scope.updateVenta(venta, p)
            } //end editProducto

        $scope.updateVenta = function(item, p) {
            if ($scope.cambioPrecio === true) {
                $scope.modificarPrecioProducto(p.product, item);
                $scope.cambioPrecio = false;
            }

            var venta = item;

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
             una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
             hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            venta.enterprise = venta.enterprise._id;
            venta.tipoComprobante = venta.tipoComprobante._id;
            venta.cliente = venta.cliente._id;
            venta.condicionVenta = venta.condicionVenta._id;

            venta.$update(function() {}, function(errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        }; //end updateVenta

        $scope.cambiarPrecio = function() {
                $scope.cambioPrecio = true;
                $scope.findProductos();
            } //end cambiarPrecio

        $scope.modificarPrecioProducto = function(p, venta) {
                for (var i in $scope.productos) {
                    if ($scope.productos[i]._id === p._id) {
                        var precio = p.unitPrice;
                        p = $scope.productos[i];
                        var product = new Products({
                            _id: p._id,
                            name: p.name,
                            description: p.description,
                            code: p.code,
                            //picture: this.picture || undefined,
                            brandName: p.brandName,
                            unitPrice: precio,
                            costPerUnit: p.costPerUnit,
                            // sku: p.sku,
                            discontinued: p.discontinued,
                            provider: p.provider._id,
                            quantityPerUnit: p.quantityPerUnit,
                            unitsInStock: p.unitsInStock,
                            idealStock: p.idealStock,
                            criticalStock: p.criticalStock,
                            unitsOnOrder: p.unitsOnOrder,
                            storedIn: p.storedIn,
                            metric: p.metric,
                            reseller: p.reseller,
                            visible: p.visible,
                            esProducto: p.esProducto,
                            esMateriaPrima: p.esMateriaPrima,
                            esInsumo: p.esInsumo,
                            //rawMaterial: p.rawMaterial,
                            tax: p.tax,
                            enterprise: p.enterprise,
                            sub: p.sub._id,
                            category1: p.category1,
                            category2: p.category2
                        });

                        product.enterprise = product.enterprise._id;
                        if ((product.sub !== undefined) && (product.sub !== null)) {
                            product.sub = product.sub._id
                        };
                        if ((product.category1 !== undefined) && (product.category1 !== null)) {
                            product.category1 = product.category1._id
                        };
                        if ((product.category2 !== undefined) && (product.category2 !== null)) {
                            product.category2 = product.category2 ? product.category2._id : undefined
                        };
                        if ((product.provider !== undefined) && (product.provider !== null)) {
                            product.provider = product.provider._id
                        };

                        product.$update(function(response) {}, function(errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                    }
                }
            } //end modificarPrecio

        $scope.showConfirm2 = function(ev, item, venta) {
            var confirm = $mdDialog.confirm()
                .title('Eliminar productos')
                .content('¿Está seguro que desea eliminar este producto de la venta?')
                .ariaLabel('Lucky day')
                .ok('Eliminar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.quitarProducto(item, venta);
            }, function() {});
        }; //end showConfirm2

        $scope.quitarProducto = function(p, venta) {
            var subt = 0;
            var iva = 0;
            var descProd = 0; //descuento del producto
            var descGen = 0; //descuento del proveedor
            var tax1 = 0;
            var tax2 = 0;
            var tax3 = 0;
            var totalIva = 0;
            descProd = parseFloat((p.product.unitPrice * p.cantidad) * p.descuento / 100);
            subt = parseFloat((p.product.unitPrice * p.cantidad) - descProd); //subtotal de solo ese prod
            descGen = parseFloat((subt * venta.descuentoPorcentaje) / 100);
            iva = p.product.tax;
            if (iva == 1) {
                // console.log('iva incluido');
            }
            if (iva == 10.5) {
                tax1 = parseFloat(subt * (1 - 1 / (1 + 0.105)) / 100);
                venta.tax1 = parseFloat(venta.tax1 - tax1);
            }
            if (iva == 21) {
                tax2 = parseFloat(subt * (1 - 1 / (1 + 0.21)) / 100);
                venta.tax2 = parseFloat(venta.tax2 - tax2);
            }
            if (iva == 27) {
                tax3 = parseFloat(subt * (1 - 1 / (1 + 0.27)) / 100);
                venta.tax3 = parseFloat(venta.tax3 - tax3);
            }
            venta.neto = parseFloat(venta.neto - (subt - descGen));
            venta.subtotal = parseFloat(venta.subtotal - subt);
            totalIva = (subt - descGen + tax1 + tax2 + tax3);
            venta.descuentoValor = parseFloat(venta.descuentoValor - descGen);
            // venta.total = venta.total - totalIva;
            venta.total = venta.total;
            venta.totalTax = venta.totalTax - tax1 - tax2 - tax3;
            for (var i = 0; i < venta.products.length; i++) {
                if (venta.products[i]._id === p._id) {
                    venta.products.splice(i, 1);
                }
            }
            $scope.updateVenta(venta, p);
        }; //end quitarProducto

        // FIN EDITAR PRODUCTOS

        //****PARA LA EXTRACCION DEL PDF

        $scope.extraerVenta = function(item) {
            var promise = asyncAsignarVenta(item);
            promise.then(function(response) {
                // console.log(response);
                $scope.printIt();
            });
        };

        function asyncAsignarVenta(item) {
            var deferred = $q.defer();
            $scope.venta = item;
            setTimeout(function() {
                if ($scope.venta !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        }

        $scope.printIt = function() {
            // var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
            var b = document.getElementById('printing-css-venta').value;
            var c = document.getElementById('printing-data-venta').innerHTML;
            window.frames["print_frame_venta"].document.title = '•';
            // window.frames["print_frame_venta"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
            window.frames["print_frame_venta"].document.body.innerHTML = '<style>' + b + '</style>' + c;
            window.frames["print_frame_venta"].window.focus();
            window.frames["print_frame_venta"].window.print();
        };

        function httpGet(theUrl) {
            var xmlHttp = null;
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        }

        //****FIN EXTRACCION DEL PDF

        function DialogController($scope, $mdDialog, item, Ventas, $state, Cajas) {

            $scope.item = item; //es la venta que tengo que actualizar

            $scope.seleccionCaja = false;

            $scope.findCajas = function() {
                $scope.cajas = [];
                Cajas.query({ e: item.enterprise._id }, function(foundCaja) {
                    foundCaja.forEach(function(entry) {
                        if (entry.deleted === false) {
                            $scope.cajas.push(entry);
                        }
                    });

                    if ($scope.cajas.length === 1) {
                        $scope.caja = $scope.cajas[0]
                    }
                });
            };

            $scope.findCajas();

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };

            $scope.habilitoCaja = function(n) {
                $scope.seleccionCaja = n;
            };

            $scope.finalizarVenta = function(item) {
                console.log(item, 'itemmmmm');
                var estado = 'Finalizada'
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
                if (venta.cliente !== undefined) {
                    venta.cliente = venta.cliente._id
                }

                if (venta.category1 !== undefined) {
                    venta.category1 = venta.category1._id
                }

                venta.condicionVenta = venta.condicionVenta._id;
                if (venta.caja !== undefined) {
                    venta.caja = venta.caja._id;
                }

                $mdDialog.hide();
                venta.$update(function() {
                    $mdDialog.hide();
                    $state.go('home.ventas');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }


            $scope.actualizarVenta = function(data) {

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
                venta.tipoComprobante = venta.tipoComprobante._id;
                venta.cliente = venta.cliente._id;
                venta.condicionVenta = venta.condicionVenta._id;

                venta.$update(function() {
                    $mdDialog.hide();
                    $state.go('home.ventas');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

            };

        }

        function CrearController($scope, $mdDialog, Modal, Products, Clients, Categories) {

            $scope.contacts = Modal.getContactos();
            $scope.taxconditions = Modal.getCondiciones();
            $scope.comprobantes = Modal.getComprobantes();
            $scope.categories2 = ['Productos Terminados'];
            $scope.categories = Modal.getCategorias();
            $scope.subcategorias = Modal.getSubcategorias();
            $scope.subs = Modal.getSubs();
            $scope.proveedores = Modal.getProveedores();
            $scope.taxes = Modal.getTaxes();
            $scope.metrics = Modal.getMetrics();
            $scope.quantityPerUnit = 0;
            $scope.unitsInStock = 0;
            $scope.idealStock = 0;
            $scope.criticalStock = 0;
            $scope.unitPrice = 0;
            $scope.costPerUnit = 0;
            $scope.condicionPagos = Modal.getCondicionesVentas();
            $scope.taxconditions2 = ['Consumidor Final', 'Responsable Inscripto'];
            $scope.banco = { name: undefined, account: undefined, cbu: undefined, identity: undefined };
            $scope.creditLimit = 0;
            $scope.discountRate = 0;
            $scope.country = 'Argentina';
            $scope.city = 'La Plata';
            $scope.region = 'Buenos Aires';
            $scope.condicionPago = 'Efectivo';
            $scope.taxcondition = 'Consumidor Final';

            var marker, map;
            $scope.$on('mapInitialized', function(evt, evtMap) {
                map = evtMap;
                marker = map.markers[0];
            });

            $scope.types = "['address']";

            $scope.placeChanged = function() {
                $scope.errorDir = undefined;
                $scope.place = this.getPlace();
            };

            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function($event) {
                if ($event !== undefined) {
                    if ($event.keyCode == 0) {
                        $mdDialog.cancel();
                    }
                }
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };

            $scope.mostrarFormResponsable = function() {
                $scope.errorName = undefined;
                $scope.formResponsableInscripto = false;
                if (this.taxcondition === 'Responsable Inscripto') {
                    $scope.formResponsableInscripto = true;
                }
            };

            $scope.crearProducto = function($event) {
                if ($event.keyCode == 0) {
                    var esProd = false;
                    for (var i in $scope.categories) {
                        if ($scope.categories[i].name === 'Productos Terminados') {
                            var categoria = $scope.categories[i];
                            esProd = true;
                        }
                    }
                    // if (categoria.name === 'Productos Terminados'){
                    // 	esProd = true;
                    // }
                    if (this.tax !== undefined) {
                        for (var i in $scope.taxes) {
                            if ($scope.taxes[i].name === this.tax) {
                                var valorTax = $scope.taxes[i].value
                            }
                        }
                    }


                    var empresa = Modal.getEmpresa();
                    if (this.code !== undefined) {
                        if (this.name !== undefined) {
                            if (this.tax !== undefined) {
                                if (this.category2 !== undefined) {
                                    if (this.provider !== undefined) {
                                        if (this.sub !== undefined) {
                                            var product = new Products({
                                                name: this.name,
                                                description: this.description ? this.description : undefined,
                                                code: this.code,
                                                //picture: this.picture || undefined,
                                                brandName: this.brandName ? this.brandName : undefined,
                                                unitPrice: this.unitPrice,
                                                costPerUnit: this.costPerUnit,
                                                // sku: this.sku,
                                                discontinued: this.discontinued,
                                                provider: this.provider._id,
                                                quantityPerUnit: this.quantityPerUnit,
                                                unitsInStock: this.unitsInStock,
                                                idealStock: this.idealStock,
                                                criticalStock: this.criticalStock,
                                                unitsOnOrder: this.unitsOnOrder,
                                                storedIn: this.storedIn ? this.storedIn : undefined,
                                                metric: this.metric ? this.metric : 'u.',
                                                reseller: this.reseller,
                                                visible: this.visible,
                                                esProducto: esProd,
                                                tax: this.tax ? valorTax : undefined,
                                                enterprise: empresa,
                                                sub: this.sub._id,
                                                category1: categoria,
                                                category2: this.category2 ? this.category2._id : undefined
                                            });

                                            // Redirect after save
                                            product.$save(function(response) {

                                                // Clear form fields
                                                $scope.name = '';
                                                $scope.description = '';
                                                $scope.brandName = '';
                                                $scope.unitPrice = 0;
                                                $scope.costPerUnit = 0;
                                                $scope.sku = '';
                                                $scope.discontinued = false;
                                                $scope.quantityPerUnit = 1;
                                                $scope.unitsInStock = 0;
                                                $scope.unitsOnOrder = 0;
                                                $scope.visible = true;
                                                $scope.storedIn = '';
                                                $scope.metric = '';
                                                $scope.reseller = false;
                                                $scope.hide();
                                                $rootScope.nuevoProducto = product;
                                                console.log($rootScope.nuevoProducto);

                                            }, function(errorResponse) {
                                                $scope.error = errorResponse.data.message;
                                            });
                                        } else {
                                            $scope.errorSub = 'Se debe especificar la UEN para el producto';
                                        }
                                    } else {
                                        $scope.errorProv = 'Se debe elegir un proveedor';
                                    }
                                } else {
                                    $scope.errorCategory = 'Se debe especificar la categoria para el producto';
                                }
                            } else {
                                $scope.errorTax = 'Se debe especificar el iva para el producto';
                            }
                        } else {
                            $scope.errorName = 'Se debe indicar el nombre del producto';
                        }
                    } else {
                        $scope.errorCode = 'Se debe indicar el codigo del producto';
                    }
                }
            }; //end crearProducto

            $scope.borrarError = function() {
                $scope.errorCode = undefined;
                $scope.errorProv = undefined;
                $scope.errorName = undefined;
                $scope.errorTax = undefined;
                $scope.errorSub = undefined;
                $scope.errorCategory = undefined;
            }

            $scope.crearCliente = function($event) {
                if ($event.keyCode == 0) {
                    for (var i in $scope.taxconditions) {
                        if ($scope.taxconditions[i].name === this.taxcondition) {
                            var condicionIva = $scope.taxconditions[i];
                        }
                    };
                    if ((condicionIva.name === 'Consumidor Final') && (this.apellido === undefined)) {
                        var errorApellido = true;
                    } else {
                        var errorApellido = false;
                    }
                    // Create new Client object
                    var empresa = Modal.getEmpresa();
                    var tempContact = [];
                    var prod = [];
                    console.log(condicionIva);
                    if (this.name !== undefined) {
                        if (errorApellido !== true) {
                            if ($scope.place !== undefined) {
                                var latitud = $scope.place.geometry.location.lat();
                                var longitud = $scope.place.geometry.location.lng();
                                var client = new Clients({
                                    name: this.name ? this.name : this.razonSocial,
                                    apellido: this.apellido ? this.apellido : undefined,
                                    condicionPago: this.condicionPago ? this.condicionPago._id : undefined,
                                    comprobante: this.tipoComprobante ? this.tipoComprobante._id : undefined,
                                    taxCondition: condicionIva,
                                    creditLimit: this.creditLimit ? this.creditLimit : 0,
                                    fiscalNumber: this.fiscalNumber ? this.fiscalNumber : 0,
                                    discountRate: this.discountRate ? this.discountRate : 0,
                                    loc: [latitud, longitud],
                                    paymentMethod: this.paymentMethod ? this.paymentMethod : 0,
                                    contacts: this.contact ? [this.contact._id] : [],
                                    country: this.country,
                                    city: this.city,
                                    region: this.region ? this.region : undefined,
                                    turno: this.turno ? this.turno : undefined,
                                    postalCode: this.postalCode ? this.postalCode : 0,
                                    address: this.address,
                                    phone: this.phone,
                                    web: this.web ? this.web : undefined,
                                    category1: this.category ? this.category._id : undefined,
                                    enterprise: empresa,
                                    productosAsociados: prod
                                });
                                // Redirect after save
                                client.$save(function(response) {
                                    //$location.path('clients/' + response._id);
                                    // Clear form fields
                                    $scope.name = '';
                                    $scope.creditLimit = 0;
                                    $scope.fiscalNumber = '';
                                    $scope.discountRate = 0;
                                    $scope.contacts = [];
                                    $scope.country = '';
                                    $scope.city = '';
                                    $scope.region = '';
                                    $scope.postalCode = '';
                                    $scope.address = '';
                                    $scope.phone = '';
                                    $scope.fax = '';
                                    $scope.web = '';
                                    $scope.hide();
                                    $rootScope.nuevoCliente = client;

                                }, function(errorResponse) {
                                    $scope.error = errorResponse.data.message;
                                });
                            } else {
                                $scope.errorDir = 'Se debe indicar una direccion';
                            }
                        } else {
                            $scope.errorApellido = 'Se debe indicar el apellido del cliente';
                        }
                    } else {
                        if ($scope.formResponsableInscripto === true) {
                            $scope.errorNameClient = 'Se debe indicar la Razon Social';
                        } else {
                            $scope.errorNameClient = 'Se debe indicar un nombre';
                        }
                    }
                }
            }; //end crearCliente

            $scope.eliminarMensajeError = function() {
                $scope.errorNameClient = undefined;
                $scope.errorApellido = undefined;
            };
        };
    }
]);