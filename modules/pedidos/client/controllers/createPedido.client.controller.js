angular.module('pedidos').controller('CreatePedidosController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Pedidos', 'Enterprises', '$mdBottomSheet', '$state', '$mdDialog', 'pedidos', 'tipoOrden', 'tipoPedido', 'Comprobantes', 'Clients', 'Providers', 'Condicionventas', 'Products', 'Modal', 'Contacts', 'Taxconditions', 'Categories', 'Subs', 'Metrics', 'Cajas', '$filter', '$http',
    function ($scope, $rootScope, $stateParams, $location, Authentication, Pedidos, Enterprises, $mdBottomSheet, $state, $mdDialog, pedidos, tipoOrden, tipoPedido, Comprobantes, Clients, Providers, Condicionventas, Products, Modal, Contacts, Taxconditions, Categories, Subs, Metrics, Cajas, $filter, $http) {
        $scope.authentication = Authentication;
        $scope.impuesto = false;

        $scope.$watchCollection('authentication', function () {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            $scope.findComprobantes();
            $scope.findProveedores();
            $scope.findClientes();
            $scope.findProductos();
            $scope.findCondicionVenta();
            corroboraSiVieneDeStock();
            checkCliente();
        });

        $rootScope.$watchCollection('nuevoProveedor', function () {
            // console.log('watch de nuevo proveedor:', $rootScope.nuevoProveedor);
            if ($rootScope.nuevoProveedor !== undefined) {
                $scope.mostrar = true;
                $scope.proveedor = $rootScope.nuevoProveedor;
                $scope.selectedItemChange($scope.proveedor);
                $rootScope.nuevoProveedor = undefined;
            } else {
                $scope.mostrar = false;
            }
        });

        $rootScope.$watchCollection('nuevoCliente', function () {
            // console.log('watch de nuevo cliente: ', $rootScope.nuevoCliente);
            if ($rootScope.nuevoCliente !== undefined) {
                $scope.mostrar = true;
                $scope.cliente = $rootScope.nuevoCliente;
                $scope.selectedItemChangeClient($scope.cliente);
            } else {
                $scope.mostrar = false;
            }

            $rootScope.nuevoCliente = undefined;
        });

        $rootScope.$watchCollection('nuevaMateriaPrima', function () {
            // console.log('watch de nueva materia prima: ', $rootScope.nuevaMateriaPrima);
            if ($rootScope.nuevaMateriaPrima !== undefined) {
                $scope.mostrarMateria = true;
                $http({
                    method: 'GET',
                    url: ('/api/products/' + $rootScope.nuevaMateriaPrima._id),
                    params: {}
                })
                    .then(function (response) {
                        console.log(response.data);
                        $scope.producto = response.data;
                    }, function (response) {
                        console.log('error');
                    });
                // $scope.producto = $rootScope.nuevaMateriaPrima ;
                $scope.selectedItemChangeProduct($scope.producto);
            } else {
                $scope.mostrarMateria = false;
            }
        });

        $rootScope.$watchCollection('nuevoProducto', function () {
            if ($rootScope.nuevoProducto !== undefined) {
                $scope.producto = $rootScope.nuevoProducto;
                $scope.mostrarProd = true;
                $http({
                    method: 'GET',
                    url: ('/api/products/' + $rootScope.nuevoProducto._id),
                    params: {}
                })
                    .then(function (response) {
                        console.log(response.data);
                        $scope.producto = response.data;
                    }, function (response) {
                        console.log('error');
                    });
                $scope.selectedItemChangeProduct($scope.producto);
            } else {
                $scope.mostrarProd = false;
            }
        });

        $rootScope.pedidos = pedidos; // asigno los pedidos que ya busque en el resolve de las rutas
        $scope.tipoOrden = tipoOrden;
        $scope.tipoPedido = tipoPedido;

        var url = $location.$$url;

        //variable para filtrar productos por proveedor
        $scope.idProveedor = 0;

        $scope.isFocused = false;

        var created = new Date();
        $scope.created = new Date(created.setTime(created.getTime() + (3 * 60 * 60 * 1000)));

        $scope.buscaP = true;

        $scope.myDate = new Date();

        $scope.tipoComprobante = 'Pedido';

        $scope.productoPedido = { cantidad: undefined, descuento: undefined, observaciones: '' };

        $scope.deshabilitarProveedor = false;

        $scope.fromProveedor = false;

        $scope.productoEditado = [];
        $scope.todosPedidos = [];

        //variable que controla el select de productos/proveedores, etc
        $scope.minLengthProv = 0;

        //controla si el producto esta siendo ingresado para ver si lo borra o no al cambiar el proveedor
        $scope.tipeando = false;

        $scope.verAprobadas = 0;
        $scope.verRechazadas = 0;

        $scope.subtotal = 0;
        $scope.descuentoPorcentaje = 0;
        $scope.descuentoValor = 0;
        $scope.neto = 0;
        $scope.tax1 = 0;
        $scope.tax2 = 0;
        $scope.tax3 = 0;
        $scope.imp1 = 0;
        $scope.imp2 = 0;
        $scope.imp3 = 0;
        $scope.imp4 = 0;
        $scope.totalImp = 0;
        $scope.totalTax = 0;

        $scope.selectedMode = 'md-scale';
        $scope.selectedDirection = 'left';

        $scope.rutaVolver = function () {
            $state.go('home.pedidos', { "tipo": $scope.tipoPedido });
        };

        $scope.initAutocomplete = function () {
            $scope.findProductos();
        }; // end initAutocomplete

        function checkCliente() {
            if ($scope.authentication.user.roles[0] == 'cliente') {
                $http({
                    method: 'GET',
                    url: ('/api/clients/'),
                    params: {}
                })
                    .then(function (response) {
                        var clientes = response.data;
                        $scope.clienteUsuario = $filter('filter')(clientes, function (item) {
                            return item.userLogin === $scope.authentication.user._id;
                        });
                        calculoDescuentoCliente();
                    }, function (response) {
                        console.log('error');
                    });
            }
        }

        function calculoDescuentoCliente() {
            $scope.descuentoPorcentaje = $scope.clienteUsuario[0].discountRate;
            if ($scope.subtotal == 0) {
                return 0;
            } else {
                $scope.descuentoValor = $scope.subtotal * $scope.descuentoPorcentaje / 100;
                $scope.neto = $scope.subtotal - $scope.descuentoValor;
                $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
            }
        }

        function corroboraSiVieneDeStock() {
            if ($rootScope.productosAPedir !== undefined) {
                if($rootScope.providerStock !== undefined){
                    $scope.provider = $rootScope.providerStock;
                }
                $rootScope.productosAgregados = $rootScope.productosAPedir;
                var total = 0;
                for (var i = $rootScope.productosAgregados.length - 1; i >= 0; i--) {
                    var resultado = calcularSubtotal($rootScope.productosAgregados[i], 'compra');
                    total = total + resultado;
                }
                $scope.total = parseFloat(total) + $scope.totalTax;
                $scope.selectedItemChange($rootScope.providerStock);
            } else {
                $rootScope.productosAgregados = [];
                $scope.total = parseFloat(0);
            }
        } //end corroboraVieneStock

        //calculo de numero de comprobante
        $scope.actualizarN = function () {
            $scope.numero = parseInt($scope.tipoComprobante.ultimoNumero) + 1;
            var comprobante = $scope.tipoComprobante.name;
            if (comprobante == "Factura A" || comprobante == "Factura B" || comprobante == "Factura C") {
                $scope.impuesto = true;
            } else {
                $scope.impuesto = false;
            }
        }; //end actualizarN

        //Trae el % de descuento del proveedor seleccionado, y vuelve a calcular valores si el % cambio

        $scope.descProveedor = function () {
            if (($scope.proveedor !== null) && ($scope.proveedor !== undefined)) {
                $scope.idProveedor = $scope.proveedor._id;
                $scope.errorProv = undefined;
            } else {
                $scope.idProveedor = 0;
            }
            if ((this.producto !== undefined) && (this.producto !== null) && ($scope.tipeando === false)) {
                this.producto = undefined;
                $scope.textToSearch2 = undefined;
            }
        }; //end descProveedor

        //Trae el % de descuento para el cliente seleccionado, y vuelve a calcular valores si el % cambio
        $scope.descCliente = function () {
            $scope.errorCliente = undefined;
            $scope.mostrarForm = true;
            $scope.mostrarProductosC = false;
            $scope.mostrarProductosP = false;
            $scope.mostrarProductosC = !($scope.cliente.productosAsociados.length == 0);
            $scope.descuentoPorcentaje = $scope.cliente.discountRate;
            if ($scope.subtotal == 0) {
                return 0;
            } else {
                $scope.descuentoValor = $scope.subtotal * $scope.descuentoPorcentaje / 100;
                $scope.neto = $scope.subtotal - $scope.descuentoValor;
                $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
                $scope.totalTax = $scope.tax1 + $scope.tax2 + $scope.tax3;
            }
        }; //end descCliente

        //agrega producto seleccionado de la lista de productos frecuentes
        $scope.agregar = function (item) {
            $scope.producto = item;
            item = undefined;
        }; //end agregar

        //autocomplete para seleccionar productos p/ cliente
        $scope.searchTextChangeProduct = function (text) {
            var lowercaseQuery = angular.lowercase(text);
            $scope.productosNombre = $filter('filter')($scope.products, { name: text });
        }; //end search

        //autocomplete para seleccionar productos p/ proveedor
        $scope.searchTextChangeProduct2 = function (text) {
            $scope.tipeando = true;
            var lowercaseQuery = angular.lowercase(text);
            if ($scope.idProveedor === 0) {
                $scope.filtrados = $filter('filter')($scope.products, function (item) {
                    return (item.esMateriaPrima === true || item.esInsumo === true);
                })
            } else {
                if ($scope.products !== undefined && $scope.products !== null) {
                    $scope.filtrados = $filter('filter')($scope.products, function (item) {
                        return (item.esMateriaPrima === true || item.esInsumo === true) && (item.provider._id === $scope.idProveedor);
                    })
                } else {
                    console.log('[+] no hay lista de productos para filtrar!!!', $scope.products);
                }

            }
            return $scope.filtroProductos = $filter('filter')($scope.filtrados, { name: text });
        }; //end search

        //selecciona prodcuto elegido
        $scope.selectedItemChangeProduct = function (item) {
            $scope.errorProd = undefined;
            $scope.mensajeP = undefined;
            $scope.producto = item;
            if ($scope.producto !== null) {
                document.getElementById('cantProd').focus();
            }
            if ($scope.tipoPedido === 'compra') {
                if ((this.proveedor === null) || (this.proveedor === undefined)) {
                    if (($scope.producto !== null) && ($scope.producto !== undefined)) {
                        this.proveedor = $scope.producto.provider;
                        $scope.proveedor = $scope.producto.provider;
                    }
                }
            }
        }; //end selected item

        function n_with_zeroes(number, length) {
            var my_string = '' + number;
            while (my_string.length < length) {
                my_string = '0' + my_string;
            }
            return my_string;
        } //end n_with_zeroes

        //si presiona enter
        $scope.sendProduct = function ($event, productoPedido, producto) {
            if (($event.keyCode === 13) || ($event.type === 'click')) {
                $event.preventDefault();
                $scope.isFocused = false;
                if ((producto === null) || (producto === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un producto valido';
                } else {
                    if ($scope.tipoPedido === 'venta') {
                        if ((productoPedido.cantidad === null) || (productoPedido.cantidad === undefined) || (producto.unitsInStock <= 0)) {
                            if (producto.unitsInStock <= 0) {
                                $scope.mensajeP = 'Â¡Atencion! El stock disponible es ' + producto.unitsInStock;
                                $scope.agregarProducto(producto, productoPedido);
                            } else {
                                if ((productoPedido.cantidad === null) || (productoPedido.cantidad === undefined)) {
                                    $scope.mensajeP = 'No seleccionaste una cantidad para el producto';
                                }
                            }
                        } else {
                            $scope.controlStock(producto);
                            if ($scope.stockD == true) {
                                $scope.agregarProducto(producto, productoPedido);
                            } else {
                                $scope.stockD = false;
                                $scope.mensajeP = undefined;
                                $scope.producto = producto;
                                $scope.agregarProducto(producto, productoPedido);
                            }
                        }
                    } else {
                        $scope.mensajeP = undefined;
                        if (productoPedido === undefined) {
                            productoPedido = { cantidad: 0 }
                        }
                        if ((productoPedido.cantidad === null) || (productoPedido.cantidad === undefined) || (productoPedido.cantidad === 0)) {
                            $scope.mensajeP = 'No seleccionaste una cantidad para el producto';
                        } else {
                            $scope.mensajeP = undefined;
                            $scope.agregarProducto(producto, productoPedido);
                        }
                    }
                }
            }
        }; //end sendProduct

        $scope.controlStock = function (p) {
            $scope.mensajeP = undefined;
            if ($scope.productoPedido.cantidad > p.unitsInStock) {
                $scope.stockD = true;
                $scope.productoPedido.cantidad = p.unitsInStock;
            } else {
                $scope.stockD = false;
            }
        }; //end controlStock

        //Agrega a un arreglo los productos que va seleccionando
        $scope.agregarProducto = function (producto, productoPedido) {
            $scope.deshabilitarProveedor = true;
            $scope.deshabilitarCliente = true;
            $scope.clicked = false;
            $scope.errorProd = undefined;
            var tipoPedido = this.tipoPedido;
            var p = {
                product: {},
                cantidad: undefined,
                descuento: undefined,
                total: undefined,
                subtotal: undefined,
                observaciones: undefined
            };
            if (producto != undefined) {
                producto.price = 0;
                if(tipoPedido != 'compra'){
                    for (var i = 0; i < producto.catPrice.length; i++) {
                        if (producto.catPrice[i].category == $scope.cliente.category1.category) {
                            producto.price = producto.catPrice[i].price;
                        }
                    }
                }
                
                if (producto.total == undefined) {
                    producto.total = 0;
                }
                p.product = producto;
                p.cantidad = productoPedido.cantidad;
                if (productoPedido.descuento == undefined) {
                    p.descuento = 0;
                } else {
                    p.descuento = productoPedido.descuento;
                }
                if (productoPedido.observaciones == undefined) {
                    p.observaciones = '';
                } else {
                    p.observaciones = productoPedido.observaciones;
                }
                p.total = 0;
                p.subtotal = 0;
                var resultado = calcularSubtotal(p, tipoPedido);
                p.total = p.total + resultado;
                $rootScope.productosAgregados.push(p);
                this.producto = undefined;
                $scope.producto = undefined;
                productoPedido = undefined;
                p = undefined;
                $scope.productoPedido = { cantidad: undefined, descuento: undefined, observaciones: '' };
                this.productoCompra.cantidad = undefined;
                this.productoCompra.descuento = undefined;
                this.productoCompra.observaciones = undefined;
                $scope.selectedProduct = [];
                $scope.selectedItem = null;
                $scope.textToSearch2 = '';
                $scope.stockD = false;
                document.getElementById("buscaP").focus();
                document.getElementById("buscaP").value = '';
            } else {
                return 0;
            }
        }; //end agregar Producto

        //autocomplete
        $scope.selectedProduct = [];
        $scope.selectedItem = null;
        $scope.textToSearch2 = null;

        var calcularSubtotal = function (p, pedido) {
            if (pedido == 'compra') {
                if ($scope.provider !== undefined) {
                    var prov = $scope.provider;
                    $scope.fromProveedor = true;
                } else {
                    var prov = $rootScope.nuevoProveedor;
                }
            }
            var total = 0;
            var descuentoPorcentaje = p.descuento;
            if (pedido == 'compra') {
                var precio = parseFloat(p.product.costPerUnit);
            } else {
                var precio = parseFloat(p.product.price);
            }
            var cant = parseFloat(p.cantidad);
            var subtotal = parseFloat(precio * cant); //subtotal de producto sin descuentos
            var descuentoValor = subtotal * descuentoPorcentaje / 100; //valor del descuento del producto
            p.subtotal = subtotal;
            total = subtotal - descuentoValor; //total producto con descuento incluido
            $scope.subtotal = $scope.subtotal + total;
            $scope.descuentoValor = $scope.subtotal * $scope.descuentoPorcentaje / 100;
            $scope.neto = $scope.subtotal - $scope.descuentoValor;
            if (p.product.tax == 10.5) {
                $scope.tax1 = $scope.tax1 + (total * 10.5 / 100);
            }
            if (p.product.tax == 21) {
                $scope.tax2 = $scope.tax2 + (total * 21 / 100);
            }
            if (p.product.tax == 27) {
                $scope.tax3 = $scope.tax3 + total * 27 / 100;
            }
            if (pedido == 'compra') {
                if (prov.impuesto1 !== 0) {
                    $scope.imp1 = $scope.imp1 + total * prov.impuesto1 / 100;
                }
                if (prov.impuesto2 !== 0) {
                    $scope.imp2 = $scope.imp2 + total * prov.impuesto2 / 100;
                }
                if (prov.impuesto3 !== 0) {
                    $scope.imp3 = $scope.imp3 + total * prov.impuesto3 / 100;
                }
                if (prov.impuesto4 !== 0) {
                    $scope.imp4 = $scope.imp4 + total * prov.impuesto4 / 100;
                }
                var totalI = $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
                $scope.totalImp = Math.round(totalI * 100) / 100;
            }
            $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3 + $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
            $scope.totalTax = $scope.tax1 + $scope.tax2 + $scope.tax3;
            return total;
        } //end calcularSubtotal

        $scope.cantProductos = function () {
            if ($rootScope.productosAgregados.length > 0) {
                return true;
            }
        } //end cantProductos

        $scope.clickSubmit = function (n) {
            $scope.clicked = true;
            $scope.create(n);
        }; //end clickSubmit

        // Create new Pedido
        $scope.create = function (n) {
            if ($scope.clicked === true) {
                // if(($scope.caja !== undefined) && ($scope.caja !== '')){
                if (($scope.numero !== undefined) && ($scope.numero !== '')) {
                    if (($scope.tipoComprobante !== undefined) && ($scope.tipoComprobante !== '')) {
                        if (($scope.tipoPedido !== undefined) && ($scope.tipoPedido !== '')) {
                            if ($scope.tipoPedido === 'compra') {
                                if ($scope.productosAgregados.length !== 0) {
                                    if (($scope.proveedor !== undefined) || (this.proveedor != undefined) || ($rootScope.nuevoProveedor !== undefined)) {
                                        if (($scope.condicionVenta !== undefined) && ($scope.condicionVenta !== '')) {
                                            if (($scope.proveedor !== undefined) || (this.proveedor != undefined) || ($rootScope.nuevoProveedor !== undefined)) {
                                                if (this.proveedor !== undefined) {
                                                    var proveedor = this.proveedor;
                                                } else {
                                                    var proveedor = $rootScope.nuevoProveedor;
                                                }

                                                if (n === 1) {
                                                    var state = 'borrador';
                                                } else {
                                                    var state = 'pendiente evaluacion';
                                                }
                                                var pedido = new Pedidos({
                                                    numero: this.numero,
                                                    tipoPedido: this.tipoPedido,
                                                    tipoComprobante: $scope.tipoComprobante,
                                                    estado: state,
                                                    puesto: $scope.authentication.user.puesto ? $scope.authentication.user.puesto : undefined,
                                                    products: $rootScope.productosAgregados,
                                                    category1: $scope.category1 ? $scope.category1._id : undefined,
                                                    proveedor: proveedor._id,
                                                    observaciones: this.observaciones,
                                                    subtotal: this.subtotal,
                                                    descuentoPorcentaje: this.descuentoPorcentaje,
                                                    descuentoValor: this.descuentoValor,
                                                    neto: this.neto,
                                                    tax1: this.tax1,
                                                    tax2: this.tax2,
                                                    tax3: this.tax3,
                                                    totalTax: this.totalTax,
                                                    totalImp: this.totalImp,
                                                    total: this.total,
                                                    myDate: this.myDate,
                                                    created: $scope.created,
                                                    condicionVenta: this.condicionVenta._id,
                                                    enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
                                                });

                                                $scope.numero = undefined;
                                                $scope.tipoComprobante = undefined;
                                                $scope.productosAgregados = undefined;
                                                $scope.proveedor = undefined;
                                                $scope.condicionVenta = undefined;
                                            }
                                        } else {
                                            $scope.errorCondicion = 'Se debe seleccionar una condicion de compra';
                                        }
                                    } else {
                                        $scope.errorProveedor = 'Se debe seleccionar un proveedor';
                                    }
                                } else {
                                    $scope.errorProd = 'Se deben seleccionar productos para la orden de compra';
                                }
                            } else {
                                if ($scope.productosAgregados.length !== 0) {
                                    if (($scope.cliente !== undefined) && ($scope.cliente !== null)) {
                                        if (($scope.condicionVenta !== undefined) && ($scope.condicionVenta !== '')) {
                                            if (n === 1) {
                                                var state = 'borrador';
                                            } else {
                                                var state = 'pendiente evaluacion';
                                            }
                                            $scope.created = new Date($scope.created.setTime($scope.created.getTime() + (3 * 60 * 60 * 1000)));
                                            var pedido = new Pedidos({
                                                numero: parseInt(this.numero),
                                                tipoPedido: this.tipoPedido,
                                                tipoComprobante: this.tipoComprobante,
                                                estado: state,
                                                category1: this.category1 ? this.category1._id : undefined,
                                                puesto: $scope.authentication.user.puesto,
                                                impuesto: $scope.impuesto,
                                                products: $rootScope.productosAgregados,
                                                cliente: $scope.cliente._id,
                                                delivery: this.delivery,
                                                observaciones: this.observaciones,
                                                subtotal: this.subtotal,
                                                descuentoPorcentaje: this.descuentoPorcentaje,
                                                descuentoValor: this.descuentoValor,
                                                neto: this.neto,
                                                tax1: this.tax1,
                                                tax2: this.tax2,
                                                tax3: this.tax3,
                                                totalTax: this.totalTax,
                                                total: this.total,
                                                myDate: this.myDate,
                                                created: $scope.created,
                                                condicionVenta: this.condicionVenta._id,
                                                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
                                            });
                                            $scope.numero = undefined;
                                            $scope.tipoComprobante = undefined;
                                            $scope.productosAgregados = undefined;
                                            $scope.cliente = undefined;
                                            $scope.condicionVenta = undefined;
                                        } else {
                                            $scope.errorCondicion = 'Se debe seleccionar una condicion de venta';
                                        }
                                    } else {
                                        $scope.errorCliente = 'Se debe seleccionar un cliente';
                                    }
                                } else {
                                    $scope.errorProd = 'Se deben seleccionar productos para la orden de venta';
                                }
                            }

                            if (pedido !== undefined) {
                                pedido.$save(function (response) {
                                    if (response._id) {
                                        pedido._id = response._id;
                                        $rootScope.pedidos.unshift(pedido);
                                    }

                                    $state.go('home.pedidos', { "tipo": $scope.tipoPedido });

                                    // Clear form fields
                                    $scope.numero = 0;
                                    $scope.tipoPedido = '';
                                    $scope.tipoComprobante = '';
                                    $scope.observaciones = '';
                                    $scope.subtotal = 0;
                                    $scope.descuentoPorcentaje = 0;
                                    $scope.descuentoValor = 0;
                                    $scope.neto = 0;
                                    $scope.tax1 = 0;
                                    $scope.tax2 = 0;
                                    $scope.tax3 = 0;
                                    $scope.total = 0;
                                    $scope.condicionVenta = '';

                                    //destruir los $rootScope

                                    $rootScope.nuevoProveedor = undefined;
                                    $rootScope.nuevoCliente = undefined;
                                    $rootScope.nuevaMateriaPrima = undefined;
                                    $rootScope.nuevoProducto = undefined;
                                    $rootScope.provider = undefined;


                                }, function (errorResponse) {
                                    $scope.error = errorResponse.data.message;
                                });
                            }

                        } else {
                            $scope.errorPedido = 'Se debe seleccionar un tipo de orden';
                        }

                    } else {
                        $scope.errorTipoComprobante = 'Se debe seleccionar un tipo de Comprobante';
                    }

                } else {
                    $scope.errorNumero = 'Se debe indicar un numero para la orden';
                }

            } else {
                //controlar que no se cree con el enter
            }

        }; //end create

        $scope.crearPedidoCliente = function () {
            var clienteUsuario = $scope.clienteUsuario[0];
            $scope.created = new Date($scope.created.setTime($scope.created.getTime() + (3 * 60 * 60 * 1000)));
            var pedido = new Pedidos({
                tipoPedido: 'venta',
                tipoComprobante: clienteUsuario.comprobante._id,
                estado: 'pendiente evaluacion',
                impuesto: $scope.impuesto,
                category1: clienteUsuario.category1._id,
                products: $rootScope.productosAgregados,
                cliente: clienteUsuario._id,
                delivery: false,
                observaciones: this.observaciones,
                subtotal: this.subtotal,
                descuentoPorcentaje: this.descuentoPorcentaje,
                descuentoValor: this.descuentoValor,
                neto: this.neto,
                tax1: this.tax1,
                tax2: this.tax2,
                tax3: this.tax3,
                totalTax: this.totalTax,
                total: this.total,
                myDate: this.myDate,
                created: $scope.created,
                condicionVenta: clienteUsuario.condicionPago._id,
                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
            });

            pedido.$save(function (response) {
                if (response._id) {
                    pedido._id = response._id;
                    $rootScope.pedidos.unshift(pedido);
                }

                $state.go('home.pedidos', { "tipo": $scope.tipoPedido });

                // Clear form fields
                $scope.numero = 0;
                $scope.tipoPedido = '';
                $scope.tipoComprobante = '';
                $scope.observaciones = '';
                $scope.subtotal = 0;
                $scope.descuentoPorcentaje = 0;
                $scope.descuentoValor = 0;
                $scope.neto = 0;
                $scope.tax1 = 0;
                $scope.tax2 = 0;
                $scope.tax3 = 0;
                $scope.total = 0;
                $scope.condicionVenta = '';

                //destruir los $rootScope

                $rootScope.nuevoProveedor = undefined;
                $rootScope.nuevoCliente = undefined;
                $rootScope.nuevaMateriaPrima = undefined;
                $rootScope.nuevoProducto = undefined;
                $rootScope.provider = undefined;


            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        //saca carteles de error cuando cambia de compra a venta y al reves
        $scope.apagarAvisos = function () {
            $scope.errorPedido = undefined;
            $scope.errorCliente = undefined;
            $scope.errorProveedor = undefined;
            $scope.errorProd = undefined;
            $scope.errorCondicion = undefined;
        }; //end apagarAvisos

        //Habilita form para editar producto
        $scope.editar = function (index) {
            $scope.productoEditado[index] = true;
        }; //end editar

        //edita un producto
        $scope.editarProducto = function (index, p) {
            if (tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) {
                    var prov = $scope.proveedor
                } else {
                    var prov = $rootScope.nuevoProveedor;
                }
            }
            var tipoPedido = this.tipoPedido;
            var subt = 0;
            var tax1 = 0;
            var tax2 = 0;
            var tax3 = 0;
            if (tipoPedido == 'venta') {
                var descuento = p.product.price * p.descuento / 100;
                p.subtotal = p.cantidad * p.product.price;
                p.total = p.cantidad * (p.product.price - descuento);
            }

            if (tipoPedido == 'compra') {
                var descuento = p.product.costPerUnit * p.descuento / 100;
                p.subtotal = p.cantidad * p.product.costPerUnit;
                p.total = p.cantidad * (p.product.costPerUnit - descuento);
            }

            $rootScope.productosAgregados[index] = p;
            for (var i = 0; i < $rootScope.productosAgregados.length; i++) {
                subt = subt + $rootScope.productosAgregados[i].total;
                var iva = $rootScope.productosAgregados[i].product.tax;
                if (iva == 10.5) {
                    tax1 = tax1 + $rootScope.productosAgregados[i].total * 10.5 / 100;
                }
                if (iva == 21) {
                    tax2 = tax2 + $rootScope.productosAgregados[i].total * 21 / 100;
                }
                if (iva == 27) {
                    tax3 = tax3 + $rootScope.productosAgregados[i].total * 27 / 100;
                }
            }
            $scope.descuentoValor = subt * $scope.descuentoPorcentaje / 100;
            $scope.subtotal = subt;
            $scope.neto = subt - $scope.descuentoValor;
            $scope.tax1 = tax1;
            $scope.tax2 = tax2;
            $scope.tax3 = tax3;
            var prov = $scope.proveedor;
            if (tipoPedido == 'compra') {
                if (prov.impuesto1 !== 0) {
                    $scope.imp1 = $scope.neto * prov.impuesto1 / 100;
                }
                if (prov.impuesto2 !== 0) {
                    $scope.imp2 = $scope.neto * prov.impuesto2 / 100;
                }
                if (prov.impuesto3 !== 0) {
                    $scope.imp3 = $scope.neto * prov.impuesto3 / 100;
                }
                if (prov.impuesto4 !== 0) {
                    $scope.imp4 = $scope.neto * prov.impuesto4 / 100;
                }
                var totalI = $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
                $scope.totalImp = Math.round(totalI * 100) / 100;
            }

            $scope.totalTax = tax1 + tax2 + tax3;
            $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3 + $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
            this.p = undefined;
            $scope.productoEditado[index] = false;
        }; //end editarProducto

        //Elimina un producto del arreglo de productos
        $scope.borrarProducto = function (producto) {
            if ($scope.tipoPedido == 'compra') {
                // var prov = producto.product.provider
                if ($scope.proveedor !== undefined) {
                    var prov = $scope.proveedor
                } else {
                    var prov = $rootScope.nuevoProveedor;
                }
                var totalImpuesto = prov.impuesto1 + prov.impuesto2 + prov.impuesto3 + prov.impuesto4;
                var restoImpuesto = producto.total * totalImpuesto / 100;
            } else {
                var restoImpuesto = 0;
            }
            var tipoPedido = this.tipoPedido;
            var subt = 0;
            var iva;
            var descProd = 0; //descuento del producto
            var descGen; //descuento del proveedor
            var tax1 = 0;
            var tax2 = 0;
            var tax3 = 0;
            var totalIva;
            var totalI;
            if ($scope.tipoPedido == 'compra') {
                descProd = parseFloat((producto.product.costPerUnit * producto.cantidad) * producto.descuento / 100);
                subt = parseFloat((producto.product.costPerUnit * producto.cantidad) - descProd); //subtotal de solo ese prod
            }
            if ($scope.tipoPedido == 'venta') {
                descProd = parseFloat((producto.product.price * producto.cantidad) * producto.descuento / 100);
                subt = parseFloat((producto.product.price * producto.cantidad) - descProd); //subtotal de solo ese prod
            }

            descGen = parseFloat((subt * $scope.descuentoPorcentaje) / 100);
            iva = producto.product.tax;
            if (iva == 10.5) {
                tax1 = parseFloat(subt * 10.5 / 100);
                $scope.tax1 = parseFloat($scope.tax1 - tax1);
            }
            if (iva == 21) {
                tax2 = parseFloat(subt * 21 / 100);
                $scope.tax2 = parseFloat($scope.tax2 - tax2);
            }
            if (iva == 27) {
                tax3 = parseFloat(subt * 27 / 100);
                $scope.tax3 = parseFloat($scope.tax3 - tax3);
            }
            $scope.neto = Number(parseFloat($scope.neto - (subt - descGen)).toFixed(4));
            $scope.subtotal = parseFloat($scope.subtotal - subt);
            totalIva = (subt - descGen + tax1 + tax2 + tax3);
            $scope.descuentoValor = parseFloat($scope.descuentoValor - descGen);
            if ($scope.tipoPedido == 'compra') {
                if (prov.impuesto1 !== 0) {
                    $scope.imp1 = $scope.neto * prov.impuesto1 / 100;
                }
                if (prov.impuesto2 !== 0) {
                    $scope.imp2 = $scope.neto * prov.impuesto2 / 100;
                }
                if (prov.impuesto3 !== 0) {
                    $scope.imp3 = $scope.neto * prov.impuesto3 / 100;
                }
                if (prov.impuesto4 !== 0) {
                    $scope.imp4 = $scope.neto * prov.impuesto4 / 100;
                }
                totalI = $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
            } else {
                totalI = 0;
            }
            var restar = totalIva + restoImpuesto;
            $scope.total = $scope.total - restar;
            $scope.totalTax = $scope.totalTax - tax1 - tax2 - tax3;
            $scope.totalImp = Math.round(totalI * 100) / 100;
            $scope.remove(producto);
            // $rootScope.productosAgregados.splice(producto, 1);
            if ($rootScope.productosAgregados.length == 0) {
                $scope.deshabilitarProveedor = false;
                $scope.deshabilitarCliente = false;
            }
        }; //end borrarProducto

        // Remove existing Producto
        $scope.remove = function (producto) {

            for (var i in $rootScope.productosAgregados) {
                if ($rootScope.productosAgregados[i] === producto) {
                    $rootScope.productosAgregados.splice(i, 1);
                }
            }
        }; //end remove


        //autocomplete para seleccionar proveedor
        $scope.searchTextChange = function (text) {
            var lowercaseQuery = angular.lowercase(text);
            return $filter('filter')($scope.proveedores, { name: text });
        }; //end searchText

        $scope.sendProvider = function ($event, provider) {
            if ($event.keyCode === 13) {
                $event.preventDefault();
                if ((provider === null) || (provider === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un proveedor valido';
                } else {
                    $scope.proveedor = provider;
                }
            }
        }; //end sendProvider


        function asyncCondicionventas() {
            var deferred = $q.defer();
            setTimeout(function () {
                $http({
                    method: 'GET',
                    url: ('/api/condicionventas/'),
                    params: { e: $scope.SEARCH.enterprise }
                })
                    .then(function (response) {
                        $scope.condicionVentas = response.data;
                    }, function (response) {
                        console.log('error');
                    });
                if ($scope.condicionVentas !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        } //end async

        $scope.selectedItemChange = function (item) {
            if ((item !== null) && (item !== undefined)) {
                $scope.idProveedor = item._id;
            }
            $scope.proveedor = item;
            $rootScope.provider = item;
            $scope.descProveedor();
            $scope.tipeando = false;
            //asigno por defecto los campos asociados al proveedor en los select
            if (($scope.proveedor !== undefined) && ($scope.proveedor !== null)) {
                if (($scope.proveedor.condicionPago !== undefined) && ($scope.proveedor.condicionPago !== null)) {
                    var promise = $http({
                        method: 'GET',
                        url: ('/api/condicionventas/'),
                        params: { e: $scope.SEARCH.enterprise }
                    });
                    promise.then(function (response) {
                        $scope.condicionVentas = response.data;
                        for (var i = 0; i < $scope.condicionVentas.length; i++) {
                            if (($scope.proveedor.condicionPago._id !== undefined) && ($scope.proveedor.condicionPago._id !== null) && ($scope.condicionVentas[i]._id == $scope.proveedor.condicionPago._id)) {
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            } else if ($scope.condicionVentas[i]._id == $scope.proveedor.condicionPago) {
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            }
                        }
                    });
                }
            } else {
                $scope.condicionVenta = undefined;
            }
        }; //end selectedItem

        //autocomplete para seleccionar cliente
        $scope.searchTextChangeClient = function (text) {
            var lowercaseQuery = angular.lowercase(text);
            return $filter('filter')($scope.clientes, { name: text });
        }; //endSelectedItem

        $scope.sendClient = function ($event, client) {
            if ($event.keyCode === 13) {
                $event.preventDefault();
                if ((client === null) || (client === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un cliente valido';
                } else {
                    $scope.cliente = client;
                }

            }
        }; //end sendClient

        $scope.selectedItemChangeClient = function (item) {
            $scope.cliente = item;
            //asigno por defecto los campos asociados al cliente en los select
            if (($scope.cliente !== undefined) && ($scope.cliente !== null)) {
                $rootScope.productosAgregados = [];
                $scope.total = parseFloat(0);
                if ($scope.cliente.condicionPago !== undefined) {
                    var promise = $http({
                        method: 'GET',
                        url: ('/api/condicionventas/'),
                        params: { e: $scope.SEARCH.enterprise }
                    });
                    promise.then(function (response) {
                        $scope.condicionVentas = response.data;
                        for (var i = 0; i < $scope.condicionVentas.length; i++) {
                            if (($scope.cliente.condicionPago !== undefined) && ($scope.cliente.condicionPago !== null)) {
                                if ($scope.condicionVentas[i]._id == $scope.cliente.condicionPago._id) {
                                    $scope.condicionVenta = $scope.condicionVentas[i];
                                }
                                // console.log('coincidio', $scope.condicionVentas[i]);
                            } else if ($scope.condicionVentas[i]._id == $scope.cliente.condicionPago) {
                                // console.log('coincidio', $scope.condicionVentas[i]);
                                $scope.condicionVenta = $scope.condicionVentas[i];
                            }
                        }
                    });
                }
                $scope.findProductos();
                $scope.descCliente();
            }
        }; //end selectedItem

        $scope.minLengthProv = 0;

        $scope.showAdvanced = function (ev) {
            $scope.minLengthProv = 1;
            $scope.textToSearch = undefined;
            Modal.setTipo($scope.tipoPedido);
            $scope.findContacts();
            $scope.findCategories();
            $scope.findTaxConditions();
            Modal.setEmpresa($scope.SEARCH.enterprise);
            $mdDialog.show({
                controller: CrearController,
                templateUrl: '/modules/pedidos/views/create.client.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) {
                    $scope.minLengthProv = 0;
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.minLengthProv = 0;
                    $scope.status = 'You cancelled the dialog.';
                });
        }; //end showAdvanced

        $scope.minLengthProv = 0;

        $scope.showAdvancedProduct = function (ev) {
            $scope.minLengthProd = 1;
            $scope.textToSearch2 = undefined;
            Modal.setTipo($scope.tipoPedido);
            $scope.findProveedores();
            $scope.findCategories();
            $scope.findSubs();
            $scope.findMetrics();
            $scope.findSubcategories();
            $scope.findTaxes();
            Modal.setEmpresa($scope.SEARCH.enterprise);
            $mdDialog.show({
                controller: CrearController,
                templateUrl: '/modules/pedidos/views/create.product.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) {
                    $scope.minLengthProd = 0;
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.minLengthProd = 0;
                    $scope.status = 'You cancelled the dialog.';
                });
        }; //end showAdvancedProduct

        $scope.findEnterprises = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise });
            }
        }; //end find

        $scope.findTipoComprobante = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.tipoComprobante = Comprobantes.query({ e: $scope.SEARCH.enterprise });
            }
        }; //end find

        $scope.findClientes = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.clientes = Clients.query({ e: $scope.SEARCH.enterprise });
            }
        }; //end find

        $scope.findCondicionVenta = function () {
            if ($scope.SEARCH !== undefined) {
                // $scope.condicionVentas = Condicionventas.query({ e: $scope.SEARCH.enterprise });
                var promise = $http({
                    method: 'GET',
                    url: ('/api/condicionventas/'),
                    params: { e: $scope.SEARCH.enterprise }
                });
                promise.then(function (response) {
                    $scope.condicionVentas = response.data;
                    // console.log($scope.condicionVentas);
                    Modal.setCondicionesVentas($scope.condicionVentas);
                });
            }
        }; //end find

        $scope.findProductos = function () {
            if ($scope.tipoPedido === 'compra') {
                if ($scope.SEARCH !== undefined) {
                    $scope.products = Products.query({ e: $scope.SEARCH.enterprise });
                    $scope.productosNombre = $scope.products;
                }
            } else {
                // if pedido type = venta
                if ($scope.cliente) {
                    if ($scope.SEARCH !== undefined) {
                        $scope.products = Products.query({ e: $scope.SEARCH.enterprise, c: $scope.cliente.category1.category });
                        $scope.productosNombre = $scope.products;
                    }
                }
            }
        }; //end find

        $scope.findComprobantes = function () {
            if ($scope.SEARCH !== undefined) {
                var promise = $http({
                    method: 'GET',
                    url: ('/api/comprobantes/'),
                    params: { e: $scope.SEARCH.enterprise }
                });
                promise.then(function (response) {
                    $scope.comprobantes = response.data;
                    for (var i in $scope.comprobantes) {
                        if ($scope.comprobantes[i].name === 'Pedido') {
                            $scope.tipoComprobante = $scope.comprobantes[i];
                            $scope.numero = n_with_zeroes(parseInt($scope.tipoComprobante.ultimoNumero) + 1, 8);
                            var pedido = new Pedidos({
                                numero: $scope.numero,

                                tipoComprobante: $scope.tipoComprobante,

                                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
                            });
                            pedido.$save(function (response) {
                                if (response._id) {
                                    pedido._id = response._id;
                                    $rootScope.pedidos.unshift(pedido);
                                }

                            }, function (errorResponse) {
                                $scope.error = errorResponse.data.message;
                            });
                        }
                    }
                    Modal.setComprobantes($scope.comprobantes);
                });
            }
        }; //end find

        $scope.findCajas = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.cajas = Cajas.query({ e: $scope.SEARCH.enterprise });
            }
        }; //end find

        $scope.findContacts = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.contacts = Contacts.query({ e: $scope.SEARCH.enterprise });
                Modal.setContactos($scope.contacts);
            }

        }; //end find

        $scope.findCategories = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.categories = Categories.query({ e: $scope.SEARCH.enterprise });
                Modal.setCategorias($scope.categories);
            }
        }; //end find

        $scope.findCategoriesVenta = function () {
            if ($scope.SEARCH !== undefined) {
                Categories.query({ e: $scope.SEARCH.enterprise }, function (data) {
                    //console.log('DATA: ', data);
                    $scope.categories = $filter('filter')(data, function (item) {
                        return (item.type1 === 'Centro de Costo');
                    });
                    //console.log('categorias: ', $scope.categories);
                    Modal.setCategorias($scope.categories);
                });


            }
        }; //end find

        $scope.findTaxConditions = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.taxconditions = Taxconditions.query({ e: $scope.SEARCH.enterprise });
                Modal.setCondiciones($scope.taxconditions);
            }

        }; //end find

        $scope.findSubs = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise });
                Modal.setSubs($scope.subs);
            }
        }; //end find

        $scope.findSubcategories = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.subcategorias = Categories.query({ e: $scope.SEARCH.enterprise });
                Modal.setSubcategorias($scope.subcategorias);
            }
        }; //end find

        $scope.findProveedores = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
                Modal.setProveedores($scope.proveedores);
            }
        }; //end find

        $scope.findTaxes = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.taxes = [{ value: 1, name: 'Iva incluido en el costo' }, { value: 10.5, name: '10.50%' }, {
                    value: 21,
                    name: '21.00%'
                }, { value: 27, name: '27.00%' }];
                Modal.setTaxes($scope.taxes);
            }

        }; //end find

        $scope.findMetrics = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.metrics = Metrics.query();
                Modal.setMetrics($scope.metrics);
            }
        }; //end find

        function CrearController($scope, $mdDialog, Modal, Providers, Clients, Products) {
            // console.log(Modal.getTipo());
            if (Modal.getTipo() == 'compra') {
                $scope.tipo = 'Proveedor';
                if (($rootScope.provider !== undefined) && ($rootScope.provider !== null)) {
                    $scope.provider = $rootScope.provider.name;
                }
                $scope.categories2 = ['Materia Prima', 'Insumo'];
            } else {
                $scope.tipo = 'Cliente';
                $scope.categories2 = ['Productos Terminados'];
            }
            $scope.contacts = Modal.getContactos();
            $scope.categories = Modal.getCategorias();
            // $scope.categories2 = [ 'Materia Prima', 'Insumo'];
            $scope.subcategorias = Modal.getSubcategorias();
            $scope.taxconditions = Modal.getCondiciones();
            $scope.comprobantes = Modal.getComprobantes();
            $scope.subs = Modal.getSubs();
            $scope.proveedores = Modal.getProveedores();
            $scope.taxes = Modal.getTaxes();
            $scope.metrics = Modal.getMetrics();
            $scope.condicionPagos = Modal.getCondicionesVentas();
            $scope.taxconditions2 = ['Consumidor Final', 'Responsable Inscripto'];
            $scope.banco = { name: undefined, account: undefined, cbu: undefined, identity: undefined };
            $scope.creditLimit = 0;
            $scope.discountRate = 0;
            $scope.country = 'Argentina';
            $scope.city = 'La Plata';
            $scope.region = 'Buenos Aires';
            $scope.postalCode = '1900';
            $scope.quantityPerUnit = 0;
            $scope.unitsInStock = 0;
            $scope.idealStock = 0;
            $scope.criticalStock = 0;
            $scope.unitPrice = 0;
            $scope.costPerUnit = 0;
            $scope.condicionPago = 'Efectivo';
            $scope.taxcondition = 'Consumidor Final';

            var marker, map;
            $scope.$on('mapInitialized', function (evt, evtMap) {
                map = evtMap;
                marker = map.markers[0];
            });

            $scope.types = "['address']";

            $scope.placeChanged2 = function () {
                $scope.errorDir = undefined;
                $scope.place = this.getPlace();
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };

            $scope.mostrarFormResponsable = function () {
                $scope.errorName = undefined;
                $scope.formResponsableInscripto = false;
                $scope.formResponsableInscripto = this.taxcondition === 'Responsable Inscripto';
            }; //end mostrarForm

            // Create new Provider
            $scope.crearProveedor = function () {
                console.log(this.taxconditionProv, 'tax');
                console.log(this.condicionPagoProv, 'condicion');
                var empresa = Modal.getEmpresa();
                if (this.name !== undefined) {
                    if (this.address !== undefined) {
                        var latitud = $scope.place.geometry.location.lat();
                        var longitud = $scope.place.geometry.location.lng();
                        if (this.category1 !== undefined) {
                            if (this.taxconditionProv !== undefined) {
                                if (this.condicionPagoProv !== undefined) {
                                    if (this.comprobante !== undefined) {
                                        // Create new Provider object
                                        var provider = new Providers({
                                            name: this.name,
                                            creditLimit: this.creditLimit ? this.creditLimit : 0,
                                            fiscalNumber: this.fiscalNumber ? this.fiscalNumber : 0,
                                            condicionPago: this.condicionPagoProv ? this.condicionPagoProv._id : undefined,
                                            comprobante: this.comprobante ? this.comprobante._id : undefined,
                                            banco: this.banco,
                                            taxCondition: this.taxconditionProv ? this.taxconditionProv._id : undefined,
                                            discountRate: this.discountRate ? this.discountRate : 0,
                                            costCenter: this.costCenter ? this.costCenter : undefined,
                                            paymentMethod: this.paymentMethod ? this.paymentMethod : undefined,
                                            contacts: this.contact ? this.contact._id : undefined,
                                            country: this.country,
                                            city: this.city,
                                            region: this.region ? this.region : undefined,
                                            postalCode: this.postalCode,
                                            address: this.address,
                                            phone: this.phone ? this.phone : undefined,
                                            loc: [latitud, longitud],
                                            //fax: this.fax,
                                            web: this.web ? this.web : 0,
                                            enterprise: empresa,
                                            category1: this.category1 ? this.category1._id : undefined
                                            //sub: this.sub._id || undefined
                                        });
                                        // Redirect after save
                                        provider.$save(function (response) {
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
                                            $rootScope.nuevoProveedor = provider;
                                            console.log($rootScope.nuevoProveedor);
                                        }, function (errorResponse) {
                                            $scope.error = errorResponse.data.message;
                                        });
                                    } else {
                                        $scope.errorComprobante = 'Indicar el tipo de comprobante'
                                    }
                                } else {
                                    $scope.errorCondicion = 'Indicar condicion de pago'
                                }
                            } else {
                                $scope.errorTax = 'Indicar la condicion de iva'
                            }
                        } else {
                            $scope.errorCategory = 'Indicar la categoria';
                        }
                    } else {
                        $scope.errorDir = 'Indicar la direccion';
                    }
                } else {
                    $scope.errorNameProv = 'Indicar la razÃ³n social';
                }
            }; //end crearProveedor

            // Create new Cliente
            $scope.crearCliente = function () {
                for (var i in $scope.taxconditions) {
                    if ($scope.taxconditions[i].name === this.taxcondition) {
                        var condicionIva = $scope.taxconditions[i];
                    }
                };
                var empresa = Modal.getEmpresa();
                var tempContact = [];
                var prod = [];
                if (this.name !== undefined) {
                    if ($scope.place !== undefined) {
                        var latitud = $scope.place.geometry.location.lat();
                        var longitud = $scope.place.geometry.location.lng();
                        var client = new Clients({
                            name: this.name ? this.name : this.razonSocial,
                            apellido: this.apellido ? this.apellido : undefined,
                            // razonSocial: this.razonSocial ? this.razonSocial : undefined,
                            creditLimit: this.creditLimit ? this.creditLimit : 0,
                            fiscalNumber: this.fiscalNumber ? this.fiscalNumber : 0,
                            // taxCondition: condicionIva._id,
                            condicionPago: this.condicionPago ? this.condicionPago._id : undefined,
                            taxCondition: condicionIva ? condicionIva._id : undefined,
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
                        client.$save(function (response) {
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
                            console.log('nuevoCliente: ', $rootScope.nuevoCliente);
                        }, function (errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                    } else {
                        $scope.errorDir = 'Se debe indicar una direccion';
                    }
                } else {
                    if ($scope.formResponsableInscripto === true) {
                        $scope.errorName = 'Se debe indicar la Razon Social';
                    } else {
                        $scope.errorName = 'Se debe indicar un nombre';
                    }
                }
            }; //end 

            $scope.eliminarMensajeError = function () {
                $scope.errorName = undefined;
                $scope.errorDir = undefined;
                $scope.errorNameProv = undefined;
                $scope.errorComprobante = undefined;
                $scope.errorCondicion = undefined;
                $scope.errorTax = undefined;
                $scope.errorCategory = undefined;
            }; //end eliminarMensajesError

            $scope.crearMateriaPrima = function () {
                var esMp = false;
                var esI = false;
                for (var i in $scope.categories) {
                    if ($scope.categories[i].name === this.category1) {
                        var categoria = $scope.categories[i];
                    }
                }
                if (categoria.name === 'Insumo') {
                    esI = true;
                } else {
                    esMp = true;
                }
                for (var i in $scope.taxes) {
                    if ($scope.taxes[i].name === this.tax) {
                        var valorTax = $scope.taxes[i].value
                    }
                }
                if ($rootScope.provider === undefined) {
                    for (var i in $scope.proveedores) {
                        if ($scope.proveedores[i].name === this.provider) {
                            var idProveedorModal = $scope.proveedores[i]._id
                        }
                    }
                } else {
                    var idProveedorModal = $rootScope.provider._id
                }
                var empresa = Modal.getEmpresa();
                if (this.code !== undefined) {
                    if (this.name !== undefined) {
                        if (this.costPerUnit !== undefined) {
                            if (this.tax !== undefined) {
                                if (this.sub !== undefined) {
                                    if (categoria.name !== undefined) {
                                        if (this.category2 !== undefined) {
                                            if (idProveedorModal !== undefined) {
                                                var product = new Products({
                                                    name: this.name,
                                                    description: this.description,
                                                    code: this.code,
                                                    //picture: this.picture || undefined,
                                                    brandName: this.brandName ? this.brandName : undefined,
                                                    // unitPrice: this.unitPrice,
                                                    costPerUnit: this.costPerUnit,
                                                    // sku: this.sku,
                                                    discontinued: this.discontinued,
                                                    provider: idProveedorModal,
                                                    quantityPerUnit: this.quantityPerUnit,
                                                    unitsInStock: this.unitsInStock,
                                                    idealStock: this.idealStock,
                                                    criticalStock: this.criticalStock,
                                                    unitsOnOrder: this.unitsOnOrder,
                                                    storedIn: this.storedIn,
                                                    metric: this.metric ? this.metric : 'u.',
                                                    reseller: this.reseller,
                                                    visible: this.visible,
                                                    esInsumo: esI,
                                                    esMateriaPrima: esMp,
                                                    tax: this.tax ? valorTax : undefined,
                                                    enterprise: empresa,
                                                    sub: this.sub ? this.sub._id : undefined,
                                                    category1: categoria._id,
                                                    category2: this.category2 ? this.category2._id : undefined,
                                                });

                                                // Redirect after save
                                                product.$save(function (response) {

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
                                                    $rootScope.nuevaMateriaPrima = product;
                                                    console.log($rootScope.nuevaMateriaPrima);

                                                }, function (errorResponse) {
                                                    $scope.error = errorResponse.data.message;
                                                });
                                            } else {
                                                $scope.errorProv = 'Se debe elegir un proveedor';
                                            }
                                        } else {
                                            $scope.errorCategory = 'Se debe indicar la subcategoria del producto';
                                        }
                                    } else {
                                        $scope.errorCategoria = 'Indicar la categoria'
                                    }
                                } else {
                                    $scope.errorSub = 'Indicar UEN'
                                }
                            } else {
                                $scope.errorIva = 'Se debe indicar el iva';
                            }
                        } else {
                            $scope.errorCost = 'Se debe indicar el costo';
                        }
                    } else {
                        $scope.errorName = 'Se debe indicar el nombre del producto';
                    }
                } else {
                    $scope.errorCode = 'Se debe indicar el codigo del producto';
                }
            }; //end crearMateriaPrima

            $scope.borrarErrores = function () {
                $scope.errorCode = undefined;
                $scope.errorName = undefined;
                $scope.errorCost = undefined;
                $scope.errorIva = undefined;
                $scope.errorSub = undefined;
                $scope.errorCategoria = undefined;
                $scope.errorCategory = undefined
                $scope.errorProv = undefined;
            } //end borrarErrores


            $scope.crearProducto = function () {
                var esProd = false;
                for (var i in $scope.categories) {
                    if ($scope.categories[i].name === this.category1) {
                        var categoria = $scope.categories[i];
                    }
                }
                if (categoria.name === 'Productos Terminados') {
                    esProd = true;
                }
                for (var i in $scope.taxes) {
                    if ($scope.taxes[i].name === this.tax) {
                        var valorTax = $scope.taxes[i].value
                    }
                }
                var empresa = Modal.getEmpresa();
                if (this.code !== undefined) {
                    if (this.name !== undefined) {
                        if (this.costPerUnit !== undefined) {
                            if (this.tax !== undefined) {
                                if (this.sub !== undefined) {
                                    if (categoria.name !== undefined) {
                                        if (this.category2 !== undefined) {
                                            if (this.provider !== undefined) {
                                                var product = new Products({
                                                    name: this.name,
                                                    description: this.description,
                                                    code: this.code,
                                                    //picture: this.picture || undefined,
                                                    brandName: this.brandName ? this.brandName : 0,
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
                                                    category1: categoria._id,
                                                    category2: this.category2 ? this.category2._id : undefined,
                                                });

                                                // Redirect after save
                                                product.$save(function (response) {

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

                                                }, function (errorResponse) {
                                                    $scope.error = errorResponse.data.message;
                                                });
                                            } else {
                                                $scope.errorProv = 'Se debe elegir un proveedor';
                                            }
                                        } else {
                                            $scope.errorCategory = 'Se debe indicar la subcategoria del producto';
                                        }
                                    } else {
                                        $scope.errorCategoria = 'Indicar la categoria'
                                    }
                                } else {
                                    $scope.errorSub = 'Indicar UEN'
                                }
                            } else {
                                $scope.errorIva = 'Se debe indicar el iva';
                            }
                        } else {
                            $scope.errorCost = 'Se debe indicar el costo';
                        }
                    } else {
                        $scope.errorName = 'Se debe indicar el nombre del producto';
                    }
                } else {
                    $scope.errorCode = 'Se debe indicar el codigo del producto';
                }
            }; //end CrearProducto

        } //end CrearController

    } //end function        
]);