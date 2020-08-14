'use strict';

// Pedidos controller
angular.module('pedidos').controller('PedidosController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Pedidos', 'Enterprises', 'Comprobantes', 'Condicionventas', 'Products', 'Providers', 'Clients', '$mdBottomSheet', '$state', '$mdDialog', '$timeout', '$http', '$filter', 'Modal', 'Contacts', 'Taxconditions', 'Categories', 'Subs', 'Metrics', '$q', 'pedidos', 'tipoOrden', 'tipoPedido',
    function($scope, $rootScope, $stateParams, $location, Authentication, Pedidos, Enterprises, Comprobantes, Condicionventas, Products, Providers, Clients, $mdBottomSheet, $state, $mdDialog, $timeout, $http, $filter, Modal, Contacts, Taxconditions, Categories, Subs, Metrics, $q, pedidos, tipoOrden, tipoPedido) {
        $scope.authentication = Authentication;

        $rootScope.pedidos = pedidos; // asigno los pedidos que ya busque en el resolve de las rutas
        $scope.tipoOrden = tipoOrden;
        $scope.tipoPedido = tipoPedido;

        // $rootScope.$watchCollection('pedidos', function(){
        // 	console.log('pedidos:', pedidos);
        // 	$scope.filtrarPedidos();
        // });

        var url = $location.$$url;

        //variable para filtrar productos por proveedor
        $scope.idProveedor = 0;

        $scope.isFocused = false;

        var created = new Date();
        $scope.created = new Date(created.setTime(created.getTime() + (3 * 60 * 60 * 1000)));

        $scope.buscaP = true;

        $scope.cambioPrecio = false;

        $scope.initAutocomplete = function() {
            $scope.findProductos();
        };

        $scope.nuevoProveedor = Modal.getProveedor();
        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function() {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            //$scope.find();
            // $scope.findComprobante();
            $scope.findComprobantes();
            $scope.findAll();
            // $scope.findAllView();
            $scope.findProveedores();
            $scope.findClientes();
            $scope.findProductos();
            $scope.findCondicionVenta();
            corroboraSiVieneDeStock();
            // var promise = asyncCondicionventas();
            // promise.then(function(greeting) {
            // 	Modal.setCondicionesVentas($scope.condicionVentas);
            // }, function(reason) {
            // 	console.log('Failed: ' + reason);
            // });
        });

        $rootScope.$watchCollection('nuevoProveedor', function() {
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

        $rootScope.$watchCollection('nuevoCliente', function() {
            // console.log('watch de nuevo cliente: ', $rootScope.nuevoCliente);
            if ($rootScope.nuevoCliente !== undefined) {
                $scope.mostrar = true;
                $scope.cliente = $rootScope.nuevoCliente;
                $scope.selectedItemChangeClient($scope.cliente);
            } else {
                $scope.mostrar = false;
            };
        });

        $rootScope.$watchCollection('nuevaMateriaPrima', function() {
            // console.log('watch de nueva materia prima: ', $rootScope.nuevaMateriaPrima);
            if ($rootScope.nuevaMateriaPrima !== undefined) {
                $scope.mostrarMateria = true;
                $http({
                        method: 'GET',
                        url: ('/api/products/' + $rootScope.nuevaMateriaPrima._id),
                        params: {}
                    })
                    .then(function(response) {
                        console.log(response.data);
                        $scope.producto = response.data;
                    }, function(response) {
                        console.log('error');
                    });
                console.log($scope.producto);
                // $scope.producto = $rootScope.nuevaMateriaPrima ;
                $scope.selectedItemChangeProduct($scope.producto);
            } else {
                $scope.mostrarMateria = false;
            };
        });

        $rootScope.$watchCollection('nuevoProducto', function() {
            console.log('watch de nuevo producto: ', $rootScope.nuevoProducto);
            if ($rootScope.nuevoProducto !== undefined) {
                $scope.producto = $rootScope.nuevoProducto;
                $scope.mostrarProd = true;
                $http({
                        method: 'GET',
                        url: ('/api/products/' + $rootScope.nuevoProducto._id),
                        params: {}
                    })
                    .then(function(response) {
                        console.log(response.data);
                        $scope.producto = response.data;
                    }, function(response) {
                        console.log('error');
                    });
                console.log($scope.producto);
                $scope.selectedItemChangeProduct($scope.producto);
            } else {
                $scope.mostrarProd = false;
            };
        });

        $scope.myDate = new Date();

        $scope.tipoComprobante = 'Pedido';

        //para que muestre el form de elegir productos solo si eligio proveedor/cliente
        $scope.mostrarForm = false;

        //para que muestre el form para agregar productos en una orden creada
        $scope.verForm = false;
        $scope.verEdicion = [];

        $scope.productoPedido = { cantidad: undefined, descuento: undefined, observaciones: '' };

        //para que muestre el form de elegir productos solo si eligio proveedor/cliente
        $scope.mostrarForm = false;

        //deshabilita el select de proveedor/cliente cuando se agregan productos a la orden
        $scope.deshabilitarProveedor = false;
        $scope.deshabilitarCliente = false;

        //variable para filtrar productos por proveedor
        $scope.idProveedor = 0;

        $scope.productoEditado = [];
        $scope.todosPedidos = [];

        //controla si el producto esta siendo ingresado para ver si lo borra o no al cambiar el proveedor
        $scope.tipeando = false;

        //se pone en true cuando se elige un proveedor para mostrar sus productos asociados
        $scope.mostrarProductosP = false;
        $scope.mostrarProductosC = false;

        $scope.verAprobadas = 0;
        $scope.verRechazadas = 0;

        $scope.subtotal = 0;
        $scope.descuentoPorcentaje = 0;
        $scope.descuentoValor = 0;
        $scope.neto = 0;
        $scope.tax1 = 0;
        $scope.tax2 = 0;
        $scope.tax3 = 0;
        $scope.totalTax = 0;

        function corroboraSiVieneDeStock() {
            if ($rootScope.productosAPedir !== undefined) {
                $rootScope.productosAgregados = $rootScope.productosAPedir;
                var total = 0;
                for (var i = $rootScope.productosAgregados.length - 1; i >= 0; i--) {
                    var resultado = calcularSubtotal($rootScope.productosAgregados[i], 'compra');
                    console.log(resultado);
                    total = total + resultado;
                };
                $scope.total = parseFloat(total) + $scope.totalTax;
                $scope.selectedItemChange($rootScope.providerStock);
            } else {
                $rootScope.productosAgregados = [];
                $scope.total = parseFloat(0);
            }
        };

        //calculo de numero de comprobante
        $scope.actualizarN = function() {
            $scope.numero = parseInt($scope.tipoComprobante.ultimoNumero) + 1;
        };

        //abre modal para eliminar productos de la orden creada (en view pedido)
        $scope.showConfirm2 = function(ev, item, pedido) {
            var confirm = $mdDialog.confirm()
                .title('Eliminar productos')
                .content('¿Está seguro que desea eliminar este producto de la orden?')
                .ariaLabel('Lucky day')
                .ok('Eliminar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.quitarProducto(item, pedido);
            }, function() {
                console.log('cancelaste eliminar');
            });
        };


        //borra productos de una orden creada (en view pedido)
        $scope.quitarProducto = function(p, pedido) {
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
            };
            if (tipoPedido == 'venta') {
                descProd = parseFloat((p.product.unitPrice * p.cantidad) * p.descuento / 100);
                subt = parseFloat((p.product.unitPrice * p.cantidad) - descProd); //subtotal de solo ese prod
            };
            descGen = parseFloat((subt * pedido.descuentoPorcentaje) / 100);
            iva = p.product.tax;
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
            $scope.updateOrden(pedido);
        };

        // actualiza orden creada si se eliminaron o agregaron productos (en view pedido)
        $scope.updateOrden = function(pedido) {

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
            una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
            hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            if (pedido.enterprise !== undefined) { pedido.enterprise = pedido.enterprise._id } else { pedido.enterprise = pedido.enterprise._id };
            if (pedido.tipoComprobante !== undefined) { pedido.tipoComprobante = pedido.tipoComprobante._id } else if ((pedido.tipoComprobante !== undefined) && (pedido.tipoComprobante !== null)) { pedido.tipoComprobante = pedido.tipoComprobante._id };
            if (pedido.tipoPedido == 'compra') {
                if (pedido.proveedor !== undefined) { pedido.proveedor = pedido.proveedor._id } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) { pedido.proveedor = pedido.proveedor._id };
            } else {
                if (pedido.cliente !== undefined) { pedido.cliente = pedido.cliente._id } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) { pedido.cliente = pedido.cliente._id };
            }
            if (pedido.condicionVenta !== undefined) { pedido.condicionVenta = pedido.condicionVenta._id } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) { pedido.condicionVenta = pedido.condicionVenta._id };
            if (pedido.category1 !== undefined) { pedido.category1 = pedido.category1._id } else if ((pedido.category1 !== undefined) && (pedido.category1 !== null)) { pedido.category1 = pedido.category1._id };

            pedido.$update(function() {
                $location.path('pedidos/view/' + pedido._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
            $scope.verForm = false;
        };

        //Habilita el form para agregar productos a una orden existente (en view pedido)
        $scope.habilitarForm = function(pedido) {
            $scope.verForm = true;
            if (pedido.tipoPedido === 'compra') {
                $scope.provId = pedido.proveedor._id;
            }
        };

        //Habilita el form para editar productos de una orden existente (en view pedido)
        $scope.habilitarEdicion = function(index) {
            $scope.verEdicion[index] = true;
        }

        //oculto formularios de agregar productos / editar productos en view pedido
        $scope.cancelarEdiciones = function() {
            $scope.verForm = false;
            $scope.verEdicion = false;
        }

        $scope.cambiarPrecio = function() {
            $scope.cambioPrecio = true;
        }

        $scope.editProducto = function(p, pedido, index) {
            console.log(p.product.provider.impuesto1);
            // var impuestos = p.product.provider
            var total = 0;
            var subtotal = 0;
            var desc = 0;
            var iva = 0;
            $scope.verEdicion = false;
            p.subtotal = p.cantidad * p.product.costPerUnit;
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
            pedido.totalTax = iva;
            pedido.total = pedido.neto + pedido.totalTax;
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
        }

        $scope.modificarPrecioProducto = function(p) {
            // $rootScope.products = $scope.products;
            for (var i in $scope.products) {
                if ($scope.products[i]._id === p._id) {
                    var cost = p.costPerUnit;
                    p = $scope.products[i];
                    var product = new Products({
                        _id: p._id,
                        name: p.name,
                        description: p.description,
                        code: p.code,
                        //picture: this.picture || undefined,
                        brandName: p.brandName,
                        unitPrice: cost,
                        costPerUnit: cost,
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
                    if ((product.sub !== undefined) && (product.sub !== null)) { product.sub = product.sub._id };
                    if ((product.category1 !== undefined) && (product.category1 !== null)) { product.category1 = product.category1._id };
                    if ((product.category2 !== undefined) && (product.category2 !== null)) { product.category2 = product.category2 ? product.category2._id : undefined };
                    if ((product.provider !== undefined) && (product.provider !== null)) { product.provider = product.provider._id };
                    // if ((product.tax!==undefined)&&(product.tax!==null)) { product.tax = product.tax };
                    // if ((product.metric!==undefined)&&(product.metric!==null)){ product.metric = product.metric };
                    // console.log(product, 'product');

                    product.$update(function(response) {
                        console.log('actualice bien');
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                }
            }
        }

        $scope.updatePedido = function(item, n, p) {

            if ($scope.cambioPrecio === true) {
                $scope.modificarPrecioProducto(p.product);
                $scope.cambioPrecio = false;
            }

            var pedido = item;
            if (n == 1) {
                pedido.estado = 'aprobada'
            }
            if (n == 2) {
                pedido.estado = 'rechazada'
            }
            if (n == 3) {
                pedido.estado = 'pendiente evaluacion'
            }
            if (n == 4) {
                pedido.deleted = 'true'
            }
            if (n == 5) {
                pedido.estado = 'pendiente aprobacion'
            }
            if (n == 6) {
                pedido.estado = 'borrador'
            }

            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
            una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
            hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            if (this.enterprise && this.enterprise._id) { pedido.enterprise = this.enterprise._id } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) { pedido.enterprise = pedido.enterprise._id };
            if (this.tipoComprobante && this.tipoComprobante._id) { pedido.tipoComprobante = this.tipoComprobante._id } else if (pedido.tipoComprobante !== undefined) { pedido.tipoComprobante = pedido.tipoComprobante._id };
            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor && $scope.proveedor._id) { pedido.proveedor = $scope.proveedor._id } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) { pedido.proveedor = pedido.proveedor._id };
            } else {
                if ($scope.cliente && $scope.cliente._id) { pedido.cliente = $scope.cliente._id } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) { pedido.cliente = pedido.cliente._id };
            }
            if (this.condicionVenta && this.condicionVenta._id) { pedido.condicionVenta = this.condicionVenta._id } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) { pedido.condicionVenta = pedido.condicionVenta._id };
            if (this.category1 && this.category1._id) { pedido.category1 = this.category1._id } else if ((pedido.category1 !== undefined) && (pedido.category1 !== null)) { pedido.category1 = pedido.category1._id };

            $scope.tipoPedido = $stateParams.tipo;
            pedido.$update(function() {
                // console.log('bien')
            }, function(errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        };


        //Agrega productos a una orden existente (en view pedido)
        $scope.sumarProducto = function(producto, productoPedido, pedido) {
            $scope.clicked = false;
            $scope.errorProd = undefined;
            var tipoPedido = pedido.tipoPedido;
            var p = { product: {}, cantidad: undefined, descuento: undefined, total: undefined, subtotal: undefined, observaciones: undefined };
            if (producto != undefined) {
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
                var resultado = recalcularSubtotal(p, tipoPedido, pedido);
                p.total = p.total + resultado;
                pedido.products.push(p);
                $scope.updateOrden(pedido);
                productoPedido = undefined;
                producto = undefined;
                p = undefined;
                $scope.productoPedido = { cantidad: undefined, descuento: undefined, observaciones: '' };
                $scope.stockD = false;
            } else {
                return 0;
            }
            $scope.updateOrden(pedido);
        };

        //calcula valores en una orden ya creada (en view pedido)
        var recalcularSubtotal = function(p, tipo, pedido) {
            var total = 0;
            var descuentoPorcentaje = p.descuento;
            if (tipo == 'compra') {
                var precio = parseFloat(p.product.costPerUnit);
            } else {
                var precio = parseFloat(p.product.unitPrice);
            }
            var cant = parseFloat(p.cantidad);
            var subtotal = parseFloat(precio * cant); //subtotal de producto sin descuentos
            var descuentoValor = subtotal * descuentoPorcentaje / 100; //valor del descuento del producto
            p.subtotal = subtotal;
            total = subtotal - descuentoValor; //total producto con descuento incluido
            pedido.subtotal = pedido.subtotal + total;
            pedido.descuentoValor = pedido.subtotal * pedido.descuentoPorcentaje / 100;
            pedido.neto = pedido.subtotal - pedido.descuentoValor;
            if (p.product.tax == 10.5) {
                pedido.tax1 = pedido.tax1 + (total * 10.5 / 100);
            }
            if (p.product.tax == 21) {
                pedido.tax2 = pedido.tax2 + (total * 21 / 100);
            }
            if (p.product.tax == 27) {
                pedido.tax3 = pedido.tax3 + total * 27 / 100;
            }
            pedido.total = pedido.neto + pedido.tax1 + pedido.tax2 + pedido.tax3;
            pedido.totalTax = pedido.tax1 + pedido.tax2 + pedido.tax3;
            return total;
        }

        //Trae el % de descuento del proveedor seleccionado, y vuelve a calcular valores si el % cambio

        $scope.descProveedor = function() {
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
        };

        //Trae el % de descuento para el cliente seleccionado, y vuelve a calcular valores si el % cambio
        $scope.descCliente = function() {
            $scope.errorCliente = undefined;
            $scope.mostrarForm = true;
            $scope.mostrarProductosC = false;
            $scope.mostrarProductosP = false;
            if ($scope.cliente.productosAsociados.length == 0) {
                $scope.mostrarProductosC = false;
            } else {
                $scope.mostrarProductosC = true;
            }
            $scope.descuentoPorcentaje = $scope.cliente.discountRate;
            if ($scope.subtotal == 0) {
                return 0;
            } else {
                $scope.descuentoValor = $scope.subtotal * $scope.descuentoPorcentaje / 100;
                $scope.neto = $scope.subtotal - $scope.descuentoValor;
                $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
                $scope.totalTax = $scope.tax1 + $scope.tax2 + $scope.tax3;
            }
        };

        //agrega producto seleccionado de la lista de productos frecuentes
        $scope.agregar = function(item) {
            $scope.producto = item;
            item = undefined;
        };

        //si presiona enter
        $scope.sendProduct = function($event, productoPedido, producto) {
            if ($event.keyCode === 13) {
                $event.preventDefault();
                $scope.isFocused = true;
                if ((producto === null) || (producto === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un producto valido';
                } else {
                    if ($scope.tipoPedido === 'venta') {
                        if ((productoPedido.cantidad === null) || (productoPedido.cantidad === undefined) || (producto.unitsInStock === 0)) {
                            if (producto.unitsInStock === 0) {
                                $scope.mensajeP = 'No hay stock disponible';
                            } else {
                                if ((productoPedido.cantidad === null) || (productoPedido.cantidad === undefined)) {
                                    $scope.mensajeP = 'No seleccionaste una cantidad para el producto';
                                }
                            }
                        } else {
                            $scope.controlStock(producto);
                            if ($scope.stockD == true) {
                                /*console.log('no tengo suficiente stock');*/
                                //no hay suficiente stock
                            } else {
                                $scope.stockD == false;
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
                };
            }
        };

        $scope.controlStock = function(p) {
            /*console.log('entre control de stock');
            console.log(p, 'producto que llega');*/
            $scope.mensajeP = undefined;
            if ($scope.productoPedido.cantidad > p.unitsInStock) {
                console.log(p.unitsInStock, 'unidades en stock del producto')
                $scope.stockD = true;
                $scope.productoPedido.cantidad = p.unitsInStock;
            } else {
                $scope.stockD = false;
            }
            // console.log($scope.stockD, 'stockD');
        };

        //Agrega a un arreglo los productos que va seleccionando
        $scope.agregarProducto = function(producto, productoPedido) {
            $scope.deshabilitarProveedor = true;
            $scope.deshabilitarCliente = true;
            $scope.clicked = false;
            $scope.errorProd = undefined;
            var tipoPedido = this.tipoPedido;
            var p = { product: {}, cantidad: undefined, descuento: undefined, total: undefined, subtotal: undefined, observaciones: undefined };
            if (producto != undefined) {
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
        };

        $scope.reverse = function(array) {
            var copy = [].concat(array);
            return copy.reverse();
        }

        //autocomplete
        $scope.selectedProduct = [];
        $scope.selectedItem = null;
        $scope.textToSearch2 = null;

        var calcularSubtotal = function(p, pedido) {
            var total = 0;
            var descuentoPorcentaje = p.descuento;
            if (pedido == 'compra') {
                var precio = parseFloat(p.product.costPerUnit);
            } else {
                var precio = parseFloat(p.product.unitPrice);
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
            $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
            $scope.totalTax = $scope.tax1 + $scope.tax2 + $scope.tax3;
            return total;
        }

        $scope.cantProductos = function() {
            if ($rootScope.productosAgregados.length > 0) { return true; }
        }

        $scope.clickSubmit = function(n) {
            // console.log(n, 'n');
            $scope.clicked = true;
            $scope.create(n);
        };

        // Create new Pedido
        $scope.create = function(n) {
            if ($scope.clicked === true) {
                // console.log(this.category1, 'cat');
                console.log("##################");
                console.log($scope.authentication);
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
                                                };
                                                if (n === 1) {
                                                    var state = 'borrador';
                                                } else {
                                                    var state = 'pendiente evaluacion';
                                                }
                                                // console.log(state, 'state');
                                                var pedido = new Pedidos({
                                                    numero: this.numero,
                                                    tipoPedido: this.tipoPedido,
                                                    tipoComprobante: this.tipoComprobante,
                                                    estado: state,
                                                    products: $rootScope.productosAgregados,
                                                    category1: this.category1 ? this.category1._id : undefined,
                                                    puesto: $scope.authentication.user.puesto,
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
                                                    total: this.total,
                                                    myDate: this.myDate,
                                                    created: $scope.created,
                                                    condicionVenta: this.condicionVenta._id,
                                                    enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
                                                });
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
                                pedido.$save(function(response) {
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


                                }, function(errorResponse) {
                                    $scope.error = errorResponse.data.message;
                                });

                            }
                        } else {
                            $scope.errorPedido = 'Se debe seleccionar un tipo de orden';
                        };
                    } else {
                        $scope.errorTipoComprobante = 'Se debe seleccionar un tipo de Comprobante';
                    };
                } else {
                    $scope.errorNumero = 'Se debe indicar un numero para la orden';
                };
            } else {
                //controlar que no se cree con el enter
            };
        };

        //saca carteles de error cuando cambia de compra a venta y al reves
        $scope.apagarAvisos = function() {
            $scope.errorPedido = undefined;
            $scope.errorCliente = undefined;
            $scope.errorProveedor = undefined;
            $scope.errorProd = undefined;
            $scope.errorCondicion = undefined;
        }

        //Habilita form para editar producto
        $scope.editar = function(index) {
            $scope.productoEditado[index] = true;
        }

        //edita un producto
        $scope.editarProducto = function(index, p) {
            var tipoPedido = this.tipoPedido;
            var subt = 0;
            var tax1 = 0;
            var tax2 = 0;
            var tax3 = 0;
            if (tipoPedido == 'venta') {
                var descuento = p.product.unitPrice * p.descuento / 100;
                p.subtotal = p.cantidad * p.product.unitPrice;
                p.total = p.cantidad * (p.product.unitPrice - descuento);
            };
            if (tipoPedido == 'compra') {
                var descuento = p.product.costPerUnit * p.descuento / 100;
                p.subtotal = p.cantidad * p.product.costPerUnit;
                p.total = p.cantidad * (p.product.costPerUnit - descuento);
            };
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
            $scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
            this.p = undefined;
            $scope.productoEditado[index] = false;
        };

        //Elimina un producto del arreglo de productos
        $scope.borrarProducto = function(producto) {
            var tipoPedido = this.tipoPedido;
            var subt = 0;
            var iva = 0;
            var descProd = 0; //descuento del producto
            var descGen = 0; //descuento del proveedor
            var tax1 = 0;
            var tax2 = 0;
            var tax3 = 0;
            var totalIva = 0;
            if (tipoPedido == 'compra') {
                descProd = parseFloat((producto.product.costPerUnit * producto.cantidad) * producto.descuento / 100);
                subt = parseFloat((producto.product.costPerUnit * producto.cantidad) - descProd); //subtotal de solo ese prod
            };
            if (tipoPedido == 'venta') {
                descProd = parseFloat((producto.product.unitPrice * producto.cantidad) * producto.descuento / 100);
                subt = parseFloat((producto.product.unitPrice * producto.cantidad) - descProd); //subtotal de solo ese prod
            };
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
            $scope.neto = parseFloat($scope.neto - (subt - descGen));
            $scope.subtotal = parseFloat($scope.subtotal - subt);
            totalIva = (subt - descGen + tax1 + tax2 + tax3);
            $scope.descuentoValor = parseFloat($scope.descuentoValor - descGen);
            $scope.total = $scope.total - totalIva;
            $scope.totalTax = $scope.totalTax - tax1 - tax2 - tax3;
            $rootScope.productosAgregados.splice(producto, 1);
            if ($rootScope.productosAgregados.length == 0) {
                $scope.deshabilitarProveedor = false;
                $scope.deshabilitarCliente = false;
            }
        };

        // Remove existing Pedido
        $scope.remove = function(pedido) {
            if (pedido) {
                pedido.$remove();

                for (var i in $scope.pedidos) {
                    if ($scope.pedidos[i] === pedido) {
                        $scope.pedidos.splice(i, 1);
                    }
                }
            } else {
                $scope.pedido.$remove(function() {
                    $location.path('pedidos');
                });
            }
        };


        //abre modal para confirmar/rechazar ordenes pendientes
        $scope.showConfirm = function(ev, item, n) {
            if (n == 1) {
                var confirm = $mdDialog.confirm()
                    .title('Aprobar Orden')
                    .content('¿Está seguro que desea aprobar esta orden?')
                    .ariaLabel('Lucky day')
                    .ok('Aprobar')
                    .cancel('Cancelar')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function() {
                    $scope.update(item, n);
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
                        $scope.update(item, n);
                    }, function() {
                        $scope.status = 'Cancelaste rechazar';
                    });
                } else {
                    if (n == 3) {
                        console.log('entre 3');
                        var confirm = $mdDialog.confirm()
                            .title('Evaluar Orden')
                            .content('¿Está seguro que desea enviar la orden a evaluar?')
                            .ariaLabel('Lucky day')
                            .ok('Evaluar')
                            .cancel('Cancelar')
                            .targetEvent(ev);
                        $mdDialog.show(confirm).then(function() {
                            $scope.update(item, n);
                        }, function() {
                            $scope.status = 'Cancelaste evaluar';
                        });
                    } else {
                        if (n == 4) {
                            console.log('entre 4');
                            var confirm = $mdDialog.confirm()
                                .title('Descartar Orden')
                                .content('¿Está seguro que desea descartar esta orden?')
                                .ariaLabel('Lucky day')
                                .ok('Descartar')
                                .cancel('Cancelar')
                                .targetEvent(ev);
                            $mdDialog.show(confirm).then(function() {
                                $scope.update(item, n);
                            }, function() {
                                $scope.status = 'Cancelaste descartar';
                            });
                        }
                    }
                }
            }
        };

        $scope.evaluar = function(item) {
            var pedido = item;
            pedido.estado = 'pendiente aprobacion';

            if (this.enterprise !== undefined) { pedido.enterprise = this.enterprise._id } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) { pedido.enterprise = pedido.enterprise._id };
            if (this.tipoComprobante !== undefined) { pedido.tipoComprobante = this.tipoComprobante._id } else if (pedido.tipoComprobante !== undefined) { pedido.tipoComprobante = pedido.tipoComprobante._id };
            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) { pedido.proveedor = $scope.proveedor._id } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) { pedido.proveedor = pedido.proveedor._id };
            } else {
                if ($scope.cliente !== undefined) { pedido.cliente = $scope.cliente._id } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) { pedido.cliente = pedido.cliente._id };
            }
            if (this.condicionVenta !== undefined) { pedido.condicionVenta = this.condicionVenta._id } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) { pedido.condicionVenta = pedido.condicionVenta._id };
            if ($scope.category1 !== undefined) { pedido.category1 = $scope.category1._id } else if ((pedido.category1 !== undefined) && (pedido.category1 !== null)) { pedido.category1 = pedido.category1._id };
            pedido.$update(function() {
                // console.log('pendiente aprobacion');
            }, function(errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        }

        // Cambia el estado del pedido
        $scope.update = function(item, n) {
            var pedido = item;
            if (n == 1) {
                pedido.estado = 'aprobada';
                for (var i in $scope.filtro) {
                    if ($scope.filtro[i]._id === pedido._id) {
                        $scope.filtro.splice(i, 1);
                    }
                }
            }
            if (n == 2) {
                pedido.estado = 'rechazada';
                for (var i in $scope.filtro) {
                    if ($scope.filtro[i]._id === pedido._id) {
                        $scope.filtro.splice(i, 1);
                    }
                }
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

            // for (var i in $scope.filtro){
            // 	if ($scope.filtro[i]._id === pedido._id){
            // 		$scope.filtro.splice(i,1);
            // 	}
            // }


            /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
            una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
            hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

            if (this.enterprise !== undefined) { pedido.enterprise = this.enterprise._id } else if ((pedido.enterprise !== undefined) && (pedido.enterprise !== null)) { pedido.enterprise = pedido.enterprise._id };
            if (this.tipoComprobante !== undefined) { pedido.tipoComprobante = this.tipoComprobante._id } else if (pedido.tipoComprobante !== undefined) { pedido.tipoComprobante = pedido.tipoComprobante._id };
            if (item.tipoPedido == 'compra') {
                if ($scope.proveedor !== undefined) { pedido.proveedor = $scope.proveedor._id } else if ((pedido.proveedor !== undefined) && (pedido.proveedor !== null)) { pedido.proveedor = pedido.proveedor._id };
            } else {
                if ($scope.cliente !== undefined) { pedido.cliente = $scope.cliente._id } else if ((pedido.cliente !== undefined) && (pedido.cliente !== null)) { pedido.cliente = pedido.cliente._id };
            }
            if (this.condicionVenta !== undefined) { pedido.condicionVenta = this.condicionVenta._id } else if ((pedido.condicionVenta !== undefined) && (pedido.condicionVenta !== null)) { pedido.condicionVenta = pedido.condicionVenta._id };
            if ($scope.category1 !== undefined) { pedido.category1 = $scope.category1._id } else if ((pedido.category1 !== undefined) && (pedido.category1 !== null)) { pedido.category1 = pedido.category1._id };
            $scope.tipoPedido = $stateParams.tipo;
            if ($scope.tipoPedido === undefined) {
                $scope.tipoPedido = pedido.tipoPedido;
            }


            pedido.$update(function() {

                $state.go('home.pedidos', { "tipo": $scope.tipoPedido });
            }, function(errorResponse) {
                // $scope.error = errorResponse.data.message;
            });
        };

        //suma montos totales de las ordenes
        $scope.montoTotal = function() {
            $scope.totalBorradorVenta = 0;
            $scope.totalBorradorCompra = 0;
            $scope.totalAprobadasCompra = 0;
            $scope.totalAprobadasVenta = 0;
            $scope.totalRechazadasCompra = 0;
            $scope.totalRechazadasVenta = 0;
            $scope.totalPendienteACompra = 0;
            $scope.totalPendienteAVenta = 0;
            $scope.totalPendienteECompra = 0;
            $scope.totalPendienteEVenta = 0;
            for (var i = 0; i < $rootScope.pedidos.length; i++) {
                if (($rootScope.pedidos[i].estado === 'borrador') && ($rootScope.pedidos[i].tipoPedido === 'compra') && ($rootScope.pedidos[i].deleted === false)) {
                    $scope.totalBorradorCompra = $scope.totalBorradorCompra + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'borrador') && ($rootScope.pedidos[i].tipoPedido === 'venta') && ($rootScope.pedidos[i].deleted === false)) {
                    $scope.totalBorradorVenta = $scope.totalBorradorVenta + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'pendiente evaluacion') && ($rootScope.pedidos[i].tipoPedido === 'compra')) {
                    $scope.totalPendienteECompra = $scope.totalPendienteECompra + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'pendiente evaluacion') && ($rootScope.pedidos[i].tipoPedido === 'venta')) {
                    $scope.totalPendienteEVenta = $scope.totalPendienteEVenta + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'pendiente aprobacion') && ($rootScope.pedidos[i].tipoPedido === 'compra')) {
                    $scope.totalPendienteACompra = $scope.totalPendienteACompra + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'pendiente aprobacion') && ($rootScope.pedidos[i].tipoPedido === 'venta')) {
                    $scope.totalPendienteAVenta = $scope.totalPendienteAVenta + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'aprobada') && ($rootScope.pedidos[i].tipoPedido === 'compra')) {
                    $scope.totalAprobadasCompra = $scope.totalAprobadasCompra + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'aprobada') && ($rootScope.pedidos[i].tipoPedido === 'venta')) {
                    $scope.totalAprobadasVenta = $scope.totalAprobadasVenta + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'rechazada') && ($rootScope.pedidos[i].tipoPedido === 'compra')) {
                    $scope.totalRechazadasCompra = $scope.totalRechazadasCompra + $rootScope.pedidos[i].total
                }
                if (($rootScope.pedidos[i].estado === 'rechazada') && ($rootScope.pedidos[i].tipoPedido === 'venta')) {
                    $scope.totalRechazadasVenta = $scope.totalRechazadasVenta + $rootScope.pedidos[i].total
                }
            }
            $scope.totalPendientesCompra = $scope.totalPendienteECompra + $scope.totalPendienteACompra;
            $scope.totalPendientesVenta = $scope.totalPendienteEVenta + $scope.totalPendienteAVenta;
        };

        $scope.findAll = function() {
            $scope.find();
            $scope.findTipoPedido();
        }

        $scope.find = function() {
            $scope.filtrarPedidos();
            var promise = asyncPedidos();
            promise.then(function(response) {
                $scope.montoTotal();
            });
        };

        function asyncPedidos(item) {
            var deferred = $q.defer();
            setTimeout(function() {
                if ($rootScope.pedidos !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        };

        $scope.filtrarPedidos = function() {
            $timeout(function() {
                $scope.filtro = $filter('filter')($rootScope.pedidos, function(item) {
                        return (item.estado === 'pendiente evaluacion' || item.estado === 'pendiente aprobacion');
                    })
                    //console.log($scope.filtro, 'filtrados');
                return $scope.filtro;
            }, 1000)
        };


        $scope.findTipoPedido = function() {
            $scope.tipoPedidos = [$stateParams.tipo];
        };

        $scope.findEnterprises = function() {
            if ($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise }); }
        };

        $scope.findTipoComprobante = function() {
            if ($scope.SEARCH !== undefined) { $scope.tipoComprobante = Comprobantes.query({ e: $scope.SEARCH.enterprise }); }
        };


        $scope.findClientes = function() {
            if ($scope.SEARCH !== undefined) {
                var promise = $http({
                    method: 'GET',
                    url: ('/api/clients'),
                    params: { e: $scope.SEARCH.enterprise }
                });

                promise.then(function(response) {
                    $scope.clientes = response.data;
                    for (var i = 0; i < $scope.clientes.length; i++) {
                        if ($scope.clientes[i].name === "Consumidor Final") {}
                        $scope.cliente = $scope.clientes[i];
                    }
                });
            }
        };

        $scope.findCondicionVenta = function() {
            if ($scope.SEARCH !== undefined) {
                // $scope.condicionVentas = Condicionventas.query({ e: $scope.SEARCH.enterprise });
                var promise = $http({ method: 'GET', url: ('/api/condicionventas/'), params: { e: $scope.SEARCH.enterprise } });
                promise.then(function(response) {
                    $scope.condicionVentas = response.data;
                    // console.log($scope.condicionVentas);
                    Modal.setCondicionesVentas($scope.condicionVentas);
                });
            }
        };

        $scope.findProductos = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.products = Products.query({ e: $scope.SEARCH.enterprise });
                $scope.productosNombre = $scope.products;
            }
        };

        function n_with_zeroes(number, length) {
            var my_string = '' + number;
            while (my_string.length < length) {
                my_string = '0' + my_string;
            }
            return my_string;
        }

        // Find a list of Comprobantes
        $scope.findComprobantes = function() {
            if ($scope.SEARCH !== undefined) {
                var promise = $http({ method: 'GET', url: ('/api/comprobantes/'), params: { e: $scope.SEARCH.enterprise } });
                promise.then(function(response) {
                    $scope.comprobantes = response.data;
                    for (var i in $scope.comprobantes) {
                        if ($scope.comprobantes[i].name === 'Pedido') {
                            $scope.tipoComprobante = $scope.comprobantes[i];
                            $scope.numero = n_with_zeroes(parseInt($scope.tipoComprobante.ultimoNumero) + 1, 8);
                        }
                    }
                    Modal.setComprobantes($scope.comprobantes);
                });
            }
        };

        $scope.findAllView = function() {
            $scope.findTipoPedido();
            $scope.findOne();
            $scope.montoTotal();
        };

        // Find existing Pedido
        $scope.findOne = function() {
            Pedidos.get({ pedidoId: $stateParams.pedidoId }, function(res) {
                $scope.pedido = res;
                $rootScope.tipoPedido = $scope.pedido.tipoPedido;
            });
        };

        //autocomplete para seleccionar proveedor
        $scope.searchTextChange = function(text) {
            var lowercaseQuery = angular.lowercase(text);
            return $filter('filter')($scope.proveedores, { name: text });
        };

        $scope.sendProvider = function($event, provider) {
            if ($event.keyCode === 13) {
                $event.preventDefault();
                if ((provider === null) || (provider === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un proveedor valido';
                } else {
                    $scope.proveedor = provider;
                }
            }
        };


        function asyncCondicionventas() {
            var deferred = $q.defer();
            setTimeout(function() {
                $http({
                        method: 'GET',
                        url: ('/api/condicionventas/'),
                        params: { e: $scope.SEARCH.enterprise }
                    })
                    .then(function(response) {
                        $scope.condicionVentas = response.data;
                    }, function(response) {
                        console.log('error');
                    });
                if ($scope.condicionVentas !== undefined) {
                    deferred.resolve('Hello');
                } else {
                    deferred.reject('Greeting');
                }
            }, 1000);
            return deferred.promise;
        }

        $scope.selectedItemChange = function(item) {
            if ((item !== null) && (item !== undefined)) {
                $scope.idProveedor = item._id;
            }
            $scope.proveedor = item;
            $rootScope.provider = item;
            $scope.descProveedor();
            $scope.tipeando = false;
            //asigno por defecto los campos asociados al proveedor en los select
            // console.log($scope.proveedor);
            if ($scope.proveedor !== undefined) {
                if ($scope.proveedor.condicionPago !== undefined) {
                    var promise = $http({ method: 'GET', url: ('/api/condicionventas/'), params: { e: $scope.SEARCH.enterprise } });
                    promise.then(function(response) {
                        $scope.condicionVentas = response.data;
                        for (var i = 0; i < $scope.condicionVentas.length; i++) {
                            if (($scope.proveedor.condicionPago._id !== undefined) && ($scope.proveedor.condicionPago._id !== null) && ($scope.condicionVentas[i]._id == $scope.proveedor.condicionPago._id)) {
                                $scope.condicionVenta = $scope.condicionVentas[i];
                                // console.log('coincidio', $scope.condicionVenta);
                            } else if ($scope.condicionVentas[i]._id == $scope.proveedor.condicionPago) {
                                $scope.condicionVenta = $scope.condicionVentas[i];
                                // console.log('coincidio', $scope.condicionVenta);
                            }
                        }
                    });
                }
            }
        };

        //autocomplete para seleccionar cliente
        $scope.searchTextChangeClient = function(text) {
            var lowercaseQuery = angular.lowercase(text);
            return $filter('filter')($scope.clientes, { name: text });
        };

        $scope.sendClient = function($event, client) {
            if ($event.keyCode === 13) {
                $event.preventDefault();
                if ((client === null) || (client === undefined)) {
                    $scope.mensajeP = 'No seleccionaste un cliente valido';
                } else {
                    $scope.cliente = client;
                };
            }
        };

        $scope.selectedItemChangeClient = function(item) {
            $scope.cliente = item;
            //asigno por defecto los campos asociados al cliente en los select
            if (($scope.cliente !== undefined) && ($scope.cliente !== null)) {
                if ($scope.cliente.condicionPago !== undefined) {
                    var promise = $http({ method: 'GET', url: ('/api/condicionventas/'), params: { e: $scope.SEARCH.enterprise } });
                    promise.then(function(response) {
                        $scope.condicionVentas = response.data;
                        console.log($scope.condicionVentas, 'condicion ventas');
                        for (var i = 0; i < $scope.condicionVentas.length; i++) {
                            if ($scope.cliente.condicionPago !== undefined) {
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
                $scope.descCliente();
            }
        };

        //autocomplete para seleccionar productos p/proveedor o client
        $scope.searchTextChangeProduct = function(text) {
            var lowercaseQuery = angular.lowercase(text);
            $scope.productosNombre = $filter('filter')($scope.products, { name: text });
        };


        $scope.searchTextChangeProduct2 = function(text) {
            $scope.tipeando = true;
            var lowercaseQuery = angular.lowercase(text);
            if ($scope.idProveedor === 0) {
                $scope.filtrados = $filter('filter')($scope.products, function(item) {
                    return (item.esMateriaPrima === true || item.esInsumo === true);
                })
            } else {
                if ($scope.products !== undefined && $scope.products !== null) {
                    $scope.filtrados = $filter('filter')($scope.products, function(item) {
                        //console.log('[+] en el filtro1: ', $scope.products);
                        //console.log('[+] en el filtro2: ', item);
                        return (item.esMateriaPrima === true || item.esInsumo === true) && (item.provider._id === $scope.idProveedor);
                    })
                } else {
                    console.log('[+] no hay lista de productos para filtrar!!!', $scope.products);
                }

            }
            // console.log($scope.filtrados, 'filtrados');
            return $scope.filtroProductos = $filter('filter')($scope.filtrados, { name: text });
        };


        $scope.selectedItemChangeProduct = function(item) {
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
        };

        $scope.minLengthProv = 0;

        $scope.showAdvanced = function(ev) {
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
                .then(function(answer) {
                    $scope.minLengthProv = 0;
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.minLengthProv = 0;
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.minLengthProd = 0;

        $scope.showAdvancedProduct = function(ev) {
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
                .then(function(answer) {
                    $scope.minLengthProd = 0;
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.minLengthProd = 0;
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.findContacts = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.contacts = Contacts.query({ e: $scope.SEARCH.enterprise });
                Modal.setContactos($scope.contacts);
            };
        };

        $scope.findCategories = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.categories = Categories.query({ e: $scope.SEARCH.enterprise });
                Modal.setCategorias($scope.categories);
            }
        };

        $scope.findCategoriesVenta = function() {
            if ($scope.SEARCH !== undefined) {
                Categories.query({ e: $scope.SEARCH.enterprise }, function(data) {
                    //console.log('DATA: ', data);
                    $scope.categories = $filter('filter')(data, function(item) {
                        return (item.type1 === 'venta' || item.type1 === 'producto venta');
                    });
                    //console.log('categorias: ', $scope.categories);
                    Modal.setCategorias($scope.categories);
                });


            }
        };
        // Find a list of Taxconditions
        $scope.findTaxConditions = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.taxconditions = Taxconditions.query({ e: $scope.SEARCH.enterprise });
                Modal.setCondiciones($scope.taxconditions);
            };
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

        $scope.findProveedores = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
                Modal.setProveedores($scope.proveedores);
            }
        };

        $scope.findTaxes = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.taxes = [{ value: 1, name: 'Iva incluido en el costo' }, { value: 10.5, name: '10.50%' }, { value: 21, name: '21.00%' }, { value: 27, name: '27.00%' }];
                Modal.setTaxes($scope.taxes);
            };
        };

        $scope.findMetrics = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.metrics = Metrics.query();
                Modal.setMetrics($scope.metrics);
            }
        };

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
            $scope.$on('mapInitialized', function(evt, evtMap) {
                map = evtMap;
                marker = map.markers[0];
            });

            $scope.types = "['address']";

            $scope.placeChanged2 = function() {
                $scope.errorDir = undefined;
                $scope.place = this.getPlace();
            };

            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
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
            }

            // Create new Provider
            $scope.crearProveedor = function() {
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
                                            category1: this.category1 ? this.category1._id : undefined,
                                            //sub: this.sub._id || undefined
                                        });
                                        // Redirect after save
                                        provider.$save(function(response) {
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
                                        }, function(errorResponse) {
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
                    $scope.errorNameProv = 'Indicar la razón social';
                }
            };

            // Create new Cliente
            $scope.crearCliente = function() {
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
                            console.log('nuevoCliente: ', $rootScope.nuevoCliente);
                        }, function(errorResponse) {
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
            };

            $scope.eliminarMensajeError = function() {
                $scope.errorName = undefined;
                $scope.errorDir = undefined;
                $scope.errorNameProv = undefined;
                $scope.errorComprobante = undefined;
                $scope.errorCondicion = undefined;
                $scope.errorTax = undefined;
                $scope.errorCategory = undefined;
            };



            $scope.crearMateriaPrima = function() {
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
                                                    $rootScope.nuevaMateriaPrima = product;
                                                    console.log($rootScope.nuevaMateriaPrima);

                                                }, function(errorResponse) {
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
            };

            $scope.borrarErrores = function() {
                $scope.errorCode = undefined;
                $scope.errorName = undefined;
                $scope.errorCost = undefined;
                $scope.errorIva = undefined;
                $scope.errorSub = undefined;
                $scope.errorCategoria = undefined;
                $scope.errorCategory = undefined
                $scope.errorProv = undefined;
            }


            $scope.crearProducto = function() {
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
            };
        }

    }
]);