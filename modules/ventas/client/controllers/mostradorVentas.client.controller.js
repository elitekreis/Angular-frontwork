'use strict';

// Comprobantes controller
angular.module('ventas').controller('VentasMostradorController', ['$scope', '$rootScope', '$state', '$http', '$filter', '$q', 'Authentication', 'Cajas', 'Categories', 'Condicionventas', 'Enterprises', 'Modal', 'Ventas', 'user',
    function($scope, $rootScope, $state, $http, $filter, $q, Authentication, Cajas, Categories, Condicionventas, Enterprises, Modal, Ventas, user) {

        $scope.authentication = Authentication;
        $scope.impuesto = false;

        $scope.$watchCollection('authentication', function() {
            $scope.find();
            $scope.findCategories();
            $scope.findProducts();
            $scope.findClients();
            $scope.findCajas();
            Condicionventas.query({ e: $scope.user.enterprise.enterprise }, function(res) {
                $scope.condicionVentas = res;
                Modal.setCondicionesVentas($scope.condicionVentas);
            });
            $scope.findComprobantes();
        });
        $scope.$watchCollection('condicionVenta', function() {
            if ($scope.condicionVenta)

                $scope.verCondicionVenta($scope.condicionVenta)
            console.log($scope.condicionVenta);

        });

        var global = this;

        this.productList = [];
        this.itemList = {};
        this.total = 0;

        $scope.user = user;
        $scope.elegirCaja = true;
        $scope.tax1 = [];
        $scope.tax2 = [];
        $scope.tax3 = [];
        $scope.productosDeVenta = [];

        $scope.descuento_porcentaje = 0;
        $scope.descuento_valor = 0;
        $scope.vistaTotal = 0;
        $scope.vistaSubtotal = 0;
        $scope.vistaNeto = 0;
        $scope.vistaTax1 = 0;
        $scope.vistaTax2 = 0;
        $scope.vistaTax3 = 0;
        $scope.botonApagado = false;
        $scope.mensajeSinVentas = false;
        $scope.mostrarUltimaVenta = false;
        $scope.minLengthClient = 0;

        var created = new Date();
        $scope.created = new Date(created.setTime(created.getTime() + (3 * 60 * 60 * 1000)));

        // Fills the select input list with enterprises (used only if you are groso)
        $scope.findEnterprises = function() {
            $scope.enterprises = Enterprises.query();
        };

        // Fills the select input list with product items
        $scope.findProducts = function() {
            global.productList = [];
            if($scope.client){
                var promise = $http({
                    method: 'GET',
                    url: ('/api/products/mostrador/'),
                    params: {
                        e: $scope.user.enterprise.enterprise,
                        c: $scope.client.category1.category
                    }
                });
                promise.then(function(response) {
                    for (var p = 0; p < response.data.length; p++) {
                        response.data[p].price = 0;
                        for(var m=0; m < response.data[p].catPrice.length; m++){
                            if(response.data[p].catPrice[m].category == $scope.client.category1.category){
                                response.data[p].price = response.data[p].catPrice[m].price;
                            }
                        }
                        
                        if (global.productList[response.data[p].category2.name])
                            global.productList[response.data[p].category2.name].push(response.data[p]);
                        else {
                            global.productList[response.data[p].category2.name] = [];
                            global.productList[response.data[p].category2.name].push(response.data[p]);
                        }
                    }
                });
            }
        };

        // Fills the select input list with comprobantes
        $scope.findComprobantes = function() {
            var promise = $http({
                method: 'GET',
                url: ('/api/comprobantes/mostrador/'),
                params: {
                    e: $scope.user.enterprise.enterprise,
                    exclude: 'Pedido'
                }
            });
            promise.then(function(response) {
                $scope.comprobantes = response.data;
                Modal.setComprobantes($scope.comprobantes);
            });
        };

        // Fills the select input list with categories
        $scope.findCategories = function() {
            var promise = $http({
                method: 'GET',
                url: ('/api/categories/mostrador/'),
                params: {
                    e: $scope.user.enterprise.enterprise
                }
            });
            promise.then(function(response) {
                $scope.categories = response.data;
            });
        };

        // Fills the select input list with categories
        $scope.findCategories2 = function() {
            Categories.query({ e: $scope.user.enterprise.enterprise }, function(data) {
                $scope.categories2 = $filter('filter')(data, function(item) {
                    return item.type1 === 'Tipo de Venta';
                });
                Modal.setCategorias($scope.categories2);
            });
        };

        // Find a list of Clients
        $scope.findClients = function() {
            var promise = $http({
                method: 'GET',
                url: ('/api/clients'),
                params: { e: $scope.user.enterprise.enterprise }
            });

            promise.then(function(response) {
                $scope.clients = response.data;
                for (var i = 0; i < $scope.clients.length; i++) {
                    if ($scope.clients[i].name === "Consumidor Final")
                        $scope.client = $scope.clients[i];
                }
            });
        };

        // Fills the select input list with cajas
        $scope.findCajas = function() {
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
        };

        // Find a list of Ventas
        $scope.find = function() {
            $rootScope.nuevoCliente = undefined;
            asyncVentas();
        };

        function asyncVentas() {
            $scope.ventas = Ventas.query({ e: $scope.user.enterprise.enterprise });
            var deferred = $q.defer();
            setTimeout(function() {
                if ($scope.ventas !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        }

        // Searches for clients in the list
        $scope.searchTextChangeClients = function(text) {
            return $filter('filter')($scope.clients, { name: angular.lowercase(text) });
        };

        $scope.selectedItemChange = function(item) {
            $scope.mensajeCli = undefined;
            $scope.client = item;
            $scope.ultimaVenta = [];
            if (true || $scope.ventaRecordada === true) {
                $scope.productosDeVenta = [];
                global.itemList = {};
                $scope.calcularTotales();
            }
            $scope.mensajeSinVentas = false;
            if (($scope.client !== undefined) && ($scope.client !== null)) {
                var promise = null;
                if (($scope.client.condicionPago !== undefined) && ($scope.client.condicionPago !== null)) {
                    promise = $http({
                        method: 'GET',
                        url: ('/api/condicionventas'),
                        params: { e: $scope.user.enterprise.enterprise }
                    });
                    promise.then(function(response) {
                        $scope.condicionVentas = response.data;
                        for (var i = 0; i < $scope.condicionVentas.length; i++) {
                            if (($scope.client.condicionPago._id !== undefined) && ($scope.client.condicionPago._id !== null) && ($scope.condicionVentas[i]._id == $scope.client.condicionPago._id)) {
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            } else if ($scope.condicionVentas[i]._id == $scope.client.condicionPago) {
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            }
                        }
                    });
                }

                if (($scope.client.comprobante !== undefined) && ($scope.client.comprobante !== null)) {
                    promise = $http({
                        method: 'GET',
                        url: ('/api/comprobantes'),
                        params: { e: $scope.user.enterprise.enterprise }
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
                $scope.findProducts();                
                $scope.mostrarUltimaVenta = true;
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

        // Adds products to the list
        $scope.addToList = function(product) {
            console.log(global.itemList);
            if (global.itemList.hasOwnProperty(product.name)) {
                global.itemList[product.name] += 1;
                for (var i = 0; i < $scope.productosDeVenta.length; i++) {
                    if ($scope.productosDeVenta[i].product.name === product.name) {
                        $scope.productosDeVenta.splice(i, 1);
                        break;
                    }
                }
            } else {
                global.itemList[product.name] = 1;
            }

            $scope.mensajeProd = undefined;
            $scope.productosDeVenta.push({
                product: product,
                cantidad: global.itemList[product.name],
                total: parseFloat(global.itemList[product.name]) * parseFloat(product.price)
            });
            $scope.calcularTotales();

            global.total = global.total + parseFloat(product.price);
        };

        // Removes products from the list
        $scope.removeFromList = function(productName) {
            var product = null;
            if (global.itemList.hasOwnProperty(productName)) {
                for (var i = 0; i < $scope.productosDeVenta.length; i++) {
                    if ($scope.productosDeVenta[i].product.name === productName) {
                        product = $scope.productosDeVenta[i].product;
                        $scope.productosDeVenta.splice(i, 1);
                        break;
                    }
                }
                if (global.itemList[productName] > 1) {
                    global.itemList[productName] -= 1;
                    $scope.productosDeVenta.push({
                        product: product,
                        cantidad: global.itemList[productName],
                        total: parseFloat(global.itemList[productName]) * parseFloat(product.price)
                    });
                } else {
                    delete global.itemList[productName];
                }

                global.total = global.total - parseFloat(product.price);
                $scope.vistaNeto = $scope.vistaNeto - parseFloat(product.price);
            }
        };

        $scope.roundTotal = function(num) {
            return parseInt(num * 100) / 100;
        };

        $scope.verCondicionVenta = function(c) {
            $scope.mensajeCond = undefined;
            if (c.name == 'Cuenta Corriente') {
                $scope.elegirCaja = false;
                $scope.caja = undefined;
            } else {
                $scope.elegirCaja = true;
            }
        };

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

        $scope.calcularTotales = function() {
            var sub = 0;
            var totTax1 = 0;
            var totTax2 = 0;
            var totTax3 = 0;
            var i;
            $scope.tax1 = [];
            $scope.tax2 = [];
            $scope.tax3 = [];
            for (i = 0; i < $scope.productosDeVenta.length; i++) {
                //descuentos
                if ($scope.productosDeVenta[i].descuento === undefined) {
                    $scope.productosDeVenta[i].descuento = 0;
                }
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
            var d = $scope.descuento_porcentaje * $scope.vistaSubtotal / 100;
            $scope.descuento_valor = d;

            $scope.vistaNeto = $scope.vistaSubtotal - d;
            $scope.vistaTax1 = totTax1;
            $scope.vistaTax2 = totTax2;
            $scope.vistaTax3 = totTax3;
            // $scope.vistaTotal = $scope.vistaNeto + $scope.vistaTax1 + $scope.vistaTax2 + $scope.vistaTax3;
            $scope.vistaTotal = $scope.vistaNeto;
        };

        function printFinalizada(item) {
            $http({
                method: 'POST',
                url: ('/api/ventas/print/'),
                data: {
                    storeName: user.storeName,
                    orden: item
                }
            });
        }

        $scope.clickSubmit = function() {
            $scope.botonApagado = true;
            $scope.clicked = true;
            $scope.create();
        };

        // Create new Venta
        $scope.create = function() {
            if ($scope.clicked === true) {
                if ($scope.productosDeVenta.length !== 0) {
                    if (($scope.client !== undefined) && ($scope.client !== '') && ($scope.client !== null)) {
                        if (($scope.tipoComprobante !== undefined) && ($scope.tipoComprobante !== '')) {
                            if (($scope.condicionVenta !== undefined) && ($scope.condicionVenta !== '')) {
                                var totalTax = $scope.vistaTax1 + $scope.vistaTax2 + $scope.vistaTax3;
                                // var total = $scope.vistaNeto + totalTax;
                                var total = $scope.vistaNeto;
                                var venta = null;
                                if ($scope.condicionVenta.name == 'Cuenta Corriente') {
                                    $scope.mensajeError = undefined;
                                    // Create new Venta object
                                    $scope.calcularTotales();
                                    venta = new Ventas({
                                        created: $scope.created,
                                        caja: undefined,
                                        tipoComprobante: this.tipoComprobante,
                                        comprobante: this.comprobante,
                                        enterprise: this.enterprise ? this.enterprise._id : $scope.user.enterprise.enterprise,
                                        puesto: $scope.authentication.user.puesto,
                                        category1: this.category1 ? this.category1._id : undefined,
                                        cliente: $scope.client,
                                        impuesto: $scope.impuesto,
                                        condicionVenta: this.condicionVenta,
                                        products: $scope.productosDeVenta,
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
                                        venta = new Ventas({
                                            created: $scope.created,
                                            caja: this.caja,
                                            tipoComprobante: this.tipoComprobante,
                                            comprobante: this.comprobante,
                                            enterprise: this.enterprise ? this.enterprise._id : $scope.user.enterprise.enterprise,
                                            category1: this.category1 ? this.category1._id : undefined,
                                            puesto: $scope.authentication.user.puesto,
                                            cliente: $scope.client,
                                            impuesto: $scope.impuesto,
                                            condicionVenta: this.condicionVenta,
                                            products: $scope.productosDeVenta,
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
        };

        function n_with_zeroes(number, length) {
            var my_string = '' + number;
            while (my_string.length < length) {
                my_string = '0' + my_string;
            }
            return my_string;
        }

        function createVenta(venta) {

            printFinalizada(venta);

            venta.user = $scope.authentication.user._id;
            venta.$save(function(response) {
                if (response._id) {
                    $http.post('/api/impuestos/updateTotal', {
                        month: (new Date()).getMonth(),
                        year: (new Date()).getFullYear()
                    })

                    $scope.find();
                    $scope.ventas.push(venta);
                }

                $state.go($state.current, {}, { reload: true });
                // Clear form fields
                $scope.name = '';
                $scope.producto = '';
            }, function(errorResponse) {
                console.log('errorResponse', errorResponse);
            });

            $scope.clicked = false;
        }
    }
]);