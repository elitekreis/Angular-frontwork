'use strict';

// Stocks controller
angular.module('stocks', ['infinite-scroll']).controller('StocksController', ['$scope', '$rootScope', '$stateParams', '$location', '$timeout', 'Authentication', 'Stocks', 'Products', 'Enterprises', '$mdBottomSheet', '$mdDialog', 'StockFactory', '$filter', '$state', 'costCenters', 'Providers', 'categories',
    function ($scope, $rootScope, $stateParams, $location, $timeout, Authentication, Stocks, Products, Enterprises, $mdBottomSheet, $mdDialog, StockFactory, $filter, $state, costCenters, Providers, categories) {
        $scope.authentication = Authentication;
        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function () {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            $scope.find();
            $scope.findProveedores();
        });

        $scope.tipoProducto = $stateParams.tipo;
        $rootScope.productosAPedir = [];
        $rootScope.products = [];

        $scope.filtroActivo = false;
        $scope.productsLength = 0;

        $scope.greenItems = [];
        $scope.yellowItems = [];
        $scope.redItems = [];
        $scope.costCenter = [];
        $scope.show_category = [];
        $scope.show_provider = [];
        $scope.categories = categories;
        $scope.catProducts = [];
        $scope.provProducts = [];
        $scope.currentTab = 0;
        $scope.currentChildTab = 0;
        $scope.status = [];

        $scope.$watchCollection('tipoProducto', function () {
            console.log('tipoProducto');
            if ($scope.tipoProducto === 'p') {
                $scope.daFilter = { esProducto: true };
                $scope.title = 'Stock de productos';
                $scope.esProducto = true;
                $scope.esMateriaPrima = false;
                $scope.esInsumo = false;
            } else if ($scope.tipoProducto === 'm') {
                $scope.daFilter = { esMateriaPrima: true, esInsumo: true };
                $scope.title = 'Stock de materia prima e insumos';
                $scope.esMateriaPrima = true;
                $scope.esProducto = false;
                $scope.esInsumo = false;
            } else if ($scope.tipoProducto === 'i') {
                $scope.daFilter = { esInsumo: true };
                $scope.title = 'Stock de insumos';
                $scope.esMateriaPrima = false;
                $scope.esProducto = false;
                $scope.esInsumo = true;
            } else {
                // do nothing... bad request
            }
        });

        $scope.filtrarProveedores = function (proveedor) {
            console.log('filtrarProveedores');
            $scope.nombreProveedorFiltro = proveedor.name;
            $scope.idProveedorFiltro = proveedor._id;
            $rootScope.nuevoProveedor = proveedor;
            $scope.filtroActivo = true;
        };

        $scope.eliminarFiltro = function () {
            console.log('eliminarFiltro');
            $scope.nombreProveedorFiltro = undefined;
            $scope.filtroActivo = false;
            $scope.setStatus('');
        };

        // Create new Stock
        $scope.create = function (action, reference) {
            console.log(action, 'action');
            if (action == undefined || action === null) {
                return console.log('No se especificó una acción al intentar modificar stock');
            }
            // Create new Stock object
            var stock = new Stocks({
                action: action,
                amount: this.stockToAdd,
                product: $scope.item,
                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                reference: reference || undefined,
                observations: this.observations
            });

            // Redirect after save
            stock.$save(function (response) {
                //$location.path('stocks/' + response._id);

                // Clear form fields
                $scope.closeDialog();

                //$mdBottomSheet.hide();
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Stock
        $scope.remove = function (stock) {
            if (stock) {
                stock.$remove();

                for (var i in $scope.stocks) {
                    if ($scope.stocks[i] === stock) {
                        $scope.stocks.splice(i, 1);
                    }
                }
            } else {
                $scope.stock.$remove(function () {
                    $location.path('stocks');
                });
            }
        };

        // Update existing Stock
        $scope.update = function () {
            var stock = $scope.stock;

            stock.$update(function () {
                $location.path('stocks');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Products
        $scope.find = function () {
            if ($scope.SEARCH !== undefined) {
                // $rootScope.products = Products.query({ e: $scope.SEARCH.enterprise }, function(data){
                // 	$scope.greenItems = $filter('filter')($rootScope.products, {
                // 		esProducto: ($scope.daFilter.esProducto === true),
                // 		esMateriaPrima: ($scope.daFilter.esMateriaPrima === true),
                // 		esInsumo: ($scope.daFilter.esInsumo === true),
                // 		stockState: {
                // 			color: 'green'
                // 		}
                // 	});
                // 	$scope.yellowItems = $filter('filter')($rootScope.products, {
                // 		esProducto: ($scope.daFilter.esProducto === true),
                // 		esMateriaPrima: ($scope.daFilter.esMateriaPrima === true),
                // 		esInsumo: ($scope.daFilter.esInsumo === true),
                // 		stockState: {
                // 			color: 'yellow'
                // 		}
                // 	});
                // 	$scope.redItems = $filter('filter')($rootScope.products, {
                // 		esProducto: ($scope.daFilter.esProducto === true),
                // 		esMateriaPrima: ($scope.daFilter.esMateriaPrima === true),
                // 		esInsumo: ($scope.daFilter.esInsumo === true),
                // 		stockState: {
                // 			color: 'red'
                // 		}
                // 	});
                // });

                if ($scope.costCenter.length > 0) {
                    Products.query({ e: $scope.SEARCH.enterprise, p: 0, pcount: 40 }, function (data) {

                        console.log('find() product query : ' + $scope.SEARCH.enterprise + "," + data.length);
                        for (var i = 0; i < $scope.costCenter.length; i++) {
                            $scope.greenItems[i][0] = $filter('filter')(data, function (item) {
                                switch ($scope.tipoProducto) {
                                    //console.log('obteniendo data:', $scope.tipoProducto);
                                    case 'p':
                                        return (item.esProducto === true) && (item.stockState.color === 'green') && (item.deleted === false);
                                        break;

                                    case 'm':
                                        return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'green') && (item.deleted === false);
                                        break;
                                    default:

                                }
                            });
                            $scope.yellowItems[i][0] = $filter('filter')(data, function (item) {
                                switch ($scope.tipoProducto) {
                                    //console.log('obteniendo data:', $scope.tipoProducto);
                                    case 'p':
                                        return (item.esProducto === true) && (item.stockState.color === 'yellow') && (item.deleted === false);
                                        break;

                                    case 'm':
                                        return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'yellow') && (item.deleted === false);
                                        break;
                                    default:

                                }
                            });
                            $scope.redItems[i][0] = $filter('filter')(data, function (item) {
                                switch ($scope.tipoProducto) {
                                    //console.log('obteniendo data:', $scope.tipoProducto);
                                    case 'p':
                                        return (item.esProducto === true) && (item.stockState.color === 'red') && (item.deleted === false);
                                        break;

                                    case 'm':
                                        return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'red') && (item.deleted === false);
                                        break;
                                    default:

                                }
                            });

                            // $rootScope.products[i] = $filter('filter')(data, function (item) {
                            //     switch ($scope.tipoProducto) {
                            //         //console.log('obteniendo data:', $scope.tipoProducto);
                            //         case 'p':
                            //             return item.esProducto === true;
                            //             break;

                            //         case 'm':
                            //             return item.esMateriaPrima === true || item.esInsumo === true;
                            //             break;
                            //         default:

                            //     }
                            // });
                        }
                    });
                }
            }

        };

        $scope.$watchCollection('greenItems', function () {
            console.log('greenItems');
            if ($scope.greenItems !== undefined) {
                //console.log('green: ', $scope.greenItems.length)
            }

        });

        $scope.$watchCollection('redItems', function () {
            console.log('redItems');
            if ($scope.redItems !== undefined) {
                //console.log('red: ', $scope.redItems.length)
            }

        });

        $scope.$watchCollection('yellowItems', function () {
            console.log('yellowItems');
            if ($scope.yellowItems !== undefined) {
                //console.log('yellow: ', $scope.yellowItems.length)
            }

        });

        $scope.cambiar = function (producto) {
            console.log('cambiar');
            // $location.path('pedidos/create?tipo=compra');
            $rootScope.nuevoProducto = producto;
            console.log($rootScope.nuevoProducto, 'nuevo producto');
            $state.go('home.createPedido', { "tipo": "compra" });
        };

        $scope.cambioCheckbox = function (item) {
            console.log('cambioCheckbox');
            var product = angular.copy(item);
            if (item.checkbox == true) {
                var cant = 1;
                delete product["checkbox"];
                var idxStock = getStockByCostCenter($scope.costCenter[$scope.currentTab]._id, product);
                if (idxStock != null && product.stocks[idxStock] !== undefined) {
                    if (product.stocks[idxStock].idealStock !== undefined) {
                        if (product.stocks[idxStock].idealStock > product.stocks[idxStock].unitsInStock) {
                            cant = product.stocks[idxStock].idealStock - product.stocks[idxStock].unitsInStock;
                        }
                    }
                }
                var tot = cant * product.costPerUnit;
                var p = { product: product, cantidad: cant, descuento: 0, total: tot, subtotal: tot, observaciones: '' };
                $rootScope.productosAPedir.push(p);
                $rootScope.providerStock = product.provider;
            } else {
                for (var i = $rootScope.productosAPedir.length - 1; i >= 0; i--) {
                    if ($rootScope.productosAPedir[i].product._id == item._id) {
                        $rootScope.productosAPedir.splice(i, 1);
                    }
                }
            }
            // console.log($rootScope.productosAPedir);
            // console.log($rootScope.providerStock);
        };

        $scope.verProd = function (item) {
            console.log('verProd');
            // console.log('id', item._id);
            $location.path('productos/view/' + item._id).search({ back: 'home.stock', tipo: $stateParams.tipo });
        };

        $scope.setStatus = function (s) {
            console.log('setStatus');
            if (s !== '') {
                //console.log('cambio a ', s);
                $scope.status[$scope.currentTab][$scope.currentChildTab] = { stockState: { color: s } };
            } else {
                //console.log('filtro eliminado ');
                $scope.status[$scope.currentTab][$scope.currentChildTab] = undefined;
            }
            $scope.numberToDisplay = 17;

        };

        // Find existing Stock
        $scope.findOne = function () {
            console.log('findOne');
            $scope.stock = Stocks.get({
                stockId: $stateParams.stockId
            });
        };

        $scope.findProveedores = function () {
            console.log('findProveedores');
            if ($scope.SEARCH !== undefined) {
                $scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
            }
        };

        $scope.showDialog = showDialog;

        function loadmoreProducts() {
            console.log('loadmoreProducts');
            $scope.loadingFinal = true;

            if (!$scope.doneFinal) {
                setTimeout(function () {
                    Products.query({ e: $scope.SEARCH.enterprise, p: $scope.productsLength, pcount: 30 }, function (data) {

                        if (data.length === 0) {
                            $scope.doneFinal = true;
                            return;
                        }

                        $scope.productsLength += data.length;
                        console.log('load more data lenth : ' + data.length);

                        for (var i = 0; i < $scope.costCenter.length; i++) {
                            var greenItems = $filter('filter')(data, function (item) {
                                switch ($scope.tipoProducto) {
                                    //console.log('obteniendo data:', $scope.tipoProducto);
                                    case 'p':
                                        return (item.esProducto === true) && (getStockState(item, i).color === 'green') && (item.deleted === false);
                                        break;

                                    case 'm':
                                        return (item.esMateriaPrima === true || item.esInsumo === true) && (getStockState(item, i).color === 'green') && (item.deleted === false);
                                        break;
                                    default:

                                }
                            });

                            $scope.greenItems[i][0] = $scope.greenItems[i][0].concat(greenItems);

                            var yellowItems = $filter('filter')(data, function (item) {
                                switch ($scope.tipoProducto) {
                                    //console.log('obteniendo data:', $scope.tipoProducto);
                                    case 'p':
                                        return (item.esProducto === true) && (getStockState(item, i).color === 'yellow') && (item.deleted === false);
                                        break;

                                    case 'm':
                                        return (item.esMateriaPrima === true || item.esInsumo === true) && (getStockState(item, i).color === 'yellow') && (item.deleted === false);
                                        break;
                                    default:

                                }
                            });
                            $scope.yellowItems[i][0] = $scope.yellowItems[i][0].concat(yellowItems);

                            var redItems = $filter('filter')(data, function (item) {
                                switch ($scope.tipoProducto) {
                                    //console.log('obteniendo data:', $scope.tipoProducto);
                                    case 'p':
                                        return (item.esProducto === true) && (getStockState(item, i).color === 'red') && (item.deleted === false);
                                        break;

                                    case 'm':
                                        return (item.esMateriaPrima === true || item.esInsumo === true) && (getStockState(item, i).color === 'red') && (item.deleted === false);
                                        break;
                                    default:

                                }
                            });
                            $scope.redItems[i][0] = $scope.redItems[i][0].concat(redItems);

                            var products = $filter('filter')(data, function (item) {
                                console.log('obteniendo data:', $scope.tipoProducto);
                                switch ($scope.tipoProducto) {
                                    case 'p':
                                        if (item.esProducto === true) {
                                            item.stockState = getStockState(item, i);
                                            return true;
                                        }
                                        break;

                                    case 'm':
                                        if (item.esMateriaPrima === true || item.esInsumo === true) {
                                            item.stockState = getStockState(item, i);
                                            return true;
                                        }
                                        break;
                                    default:

                                }
                            });
                            // console.log()
                            
                                $rootScope.products[i] = $rootScope.products[i].concat(angular.copy(products));
                                // console.log($rootScope.products[i]);
                            
                        }

                        $scope.loadingFinal = false;
                        loadmoreProducts();
                    });
                }, 500);
            }
            // console.log($rootScope.products);
        }

        function showDialog($event, item, action) {
            console.log('showDialog');
            var parentEl = angular.element(document.body);
            var template = '';
            switch (action) {
                case 'agregar':
                    template = 'modules/stocks/views/add-stock.client.view.html';
                    break;

                case 'suprimir':
                    template = 'modules/stocks/views/remove-stock.client.view.html';
                    break;

                case 'pedido':
                    template = 'modules/pedidos/views/create-pedido.client.view.html';
                    break;

                case 'pedido recibido':
                    template = 'modules/stocks/views/received-stock.client.view.html';
                    break;

                default:
                    template = 'modules/stocks/views/add-stock.client.view.html'
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: template,
                locals: {
                    item: item,
                    SEARCH: $scope.SEARCH,
                    action: action,
                    costCenter: $scope.costCenter[$scope.currentTab]._id,
                    currentTab: $scope.currentTab
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    $scope.find();
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        } //end showDialod


        function DialogController($scope, $mdDialog, item, SEARCH, action, costCenter, currentTab, Stocks, StockFactory) {

            console.log('DialogController');
            $scope.botonApagado = false;

            $scope.item = item;
            $scope.SEARCH = SEARCH;
            $scope.errorStock = undefined;
            $scope.create = function (action, $event, reference) {
                // console.log(this.stockToAdd);
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if ((this.stockToAdd != undefined) && (this.stockToAdd != null) && (this.stockToAdd != '')) {
                        if (action == undefined || action === null) {
                            return console.log('No se especificó una acción al intentar modificar stock');
                        }
                        $scope.botonApagado = true;
                        // Create new Stock object
                        var stock = new Stocks({
                            action: action,
                            amount: this.stockToAdd,
                            product: $scope.item._id,
                            enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                            reference: reference || undefined,
                            observations: this.observations,
                            costCenter: costCenter
                        });

                        // console.log(stock, 'stock');
                        // Redirect after save
                        stock.$save(function (response) {
                            //$location.path('stocks/' + response._id);

                            var idxStock = getStockByCostCenter(costCenter, item);
                            if (idxStock != null) {
                                item.stocks[idxStock].unitsInStock = response.newValue;
                            }
                            getStockState(item, currentTab);
                            // Clear form fields
                            $scope.closeDialog();

                            //$mdBottomSheet.hide();
                        }, function (errorResponse) {
                            $scope.closeDialog();
                            $scope.error = errorResponse.data.message;
                        });
                    }
                    else {
                        if (action == 'agregar') {
                            $scope.errorStock = 'Debe indicar el stock a agregar';
                        }
                        else {
                            $scope.errorStock = 'Debe indicar el stock a suprimir';
                        }
                    }
                }
            };

            $scope.registerOrder = function (order) {
                console.log('registerOrder');
                if (order == undefined || order === null) {
                    return console.log('No se especificó una acción al intentar modificar stock');
                }
                // Create new Stock object
                var stock = new Stocks({
                    action: 'pedido recibido',
                    amount: order.amount,
                    product: $scope.item,
                    enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                    received: true,
                    reference: order._id || undefined,
                    observations: 'Pedido con id ' + order._id + 'recibido!'
                });

                // Redirect after save
                stock.$save(function (response) {
                    //$location.path('stocks/' + response._id);

                    // Clear form fields
                    $scope.closeDialog();

                    //$mdBottomSheet.hide();
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            // Find a list of Stock
            $scope.findStock = function (product) {
                console.log('findStock');
                if ($scope.SEARCH !== undefined) {
                    StockFactory.getStockOrdersForProduct(product, $scope.SEARCH.enterprise)
                        .success(function (data) {
                            // OK
                            $scope.stocks = data;
                        })
                        .error(function (error) {
                            // FUCK!
                            console.error('Fuck!!! -> ', error);
                        });
                    console.log('sock: ', $scope.stocks)
                }
            };

            $scope.action = action;

            $scope.closeDialog = function () {
                console.log('closeDialog');
                $mdDialog.hide();
            };

            $scope.add = function (value1, value2) {
                console.log('add');
                //console.log('add fired!' +  $scope.newValue);
                $scope.newValue = value1 + value2;
                $scope.errorStock = undefined;
            };

            $scope.sup = function (value1, value2) {
                console.log('sup');
                //console.log('sup fired!');
                $scope.newValue = value1 - value2;
                $scope.errorStock = undefined;
            };
        }

        $scope.initCostCenters = function () {
            console.log('initCostCenters');
            $timeout(function () {
                $scope.costCenter = $filter('filter')(costCenters, { deleted: false });
                for (var i = 0; i < $scope.costCenter.length; i++) {
                    $scope.show_category[i] = true;
                    $scope.show_provider[i] = true;
                    $scope.greenItems[i] = [];
                    $scope.yellowItems[i] = [];
                    $scope.redItems[i] = [];
                    for (var j = 0; j < 2; j++) {
                        $scope.greenItems[i][j] = [];
                        $scope.yellowItems[i][j] = [];
                        $scope.redItems[i][j] = [];
                    }
                    $rootScope.products[i] = [];
                    $scope.catProducts[i] = [];
                    $scope.provProducts[i] = [];
                    $scope.categories = $filter('filter')(categories, function (item) {
                        if ($scope.tipoProducto == 'p') {
                            return item.type1 === 'Producto';
                        }
                        else if ($scope.tipoProducto == 'm') {
                            return item.type1 === 'Materia Prima';
                        }
                    });
                    $scope.status[i] = [];
                }
                loadmoreProducts();
            }, 200);
        }


        // $scope.tab_Index[$scope.currentTab] = 0;
        // $scope.currentTab = 0;
        // $scope.flag = false;
        $scope.tab_Index = [];
        $scope.showloading = false;
        $scope.setCurrentTab = function (index) {
            console.log('setCurrentTab');
            $scope.currentTab = index;
            // angular.element(document.querySelector(".myChildTab0"))
            // var queryResult = element[0].querySelector('.myChildTab0');
            // var wrappedQueryResult = angular.element(queryResult);

            // console.log(angular.element(document.querySelector(".myChildTab0")));
            // console.log($(".myChildTab0"));
            // console.log($scope.products);
            if ($filter('filter')($scope.proveedores, { deleted: false }).length > 10 && $scope.tab_Index[index] == 2) {
                $timeout(function () {
                    $scope.currentTab = index;
                }, 500);
            }
            else if ($filter('filter')($scope.categories, { deleted: false }).length > 10 && $scope.tab_Index[index] == 0) {
                $timeout(function () {
                    $scope.currentTab = index;
                }, 500);
            }
            else if ($scope.tab_Index[index] == 1) {
                $scope.showloading = true;
                $timeout(function () {
                    $scope.showloading = false;
                    $scope.currentTab = index;
                }, 2000);
                // $timeout(function () {
                //     $scope.showloading = false;
                //     // $scope.tab_Index[$scope.currentTab] = index;
                // }, 1500);
            }
            else {
                $scope.currentTab = index;
            }
            $scope.numberToDisplay = 17;
            // $scope.currentChildTab = 0;
            // if($scope.currentChildTab)
            // if ($filter('filter')($scope.proveedores, {deleted: false}).length > 10 && index == 2)
            // {
            //     $timeout(function(){
            //         $scope.showlist[$scope.currentTab] = true;
            //     }, 500);
            // }
        }

        $scope.setCurrentChildTab = function (index) {
            console.log('setCurrentChildTab');

            $scope.currentChildTab = index;
            if ($filter('filter')($scope.proveedores, { deleted: false }).length > 10 && index == 2) {
                $timeout(function () {
                    $scope.tab_Index[$scope.currentTab] = index;
                }, 500);
            }
            else if ($filter('filter')($scope.categories, { deleted: false }).length > 10 && index == 0) {
                $timeout(function () {
                    $scope.tab_Index[$scope.currentTab] = index;
                }, 500);
            }
            else if (index == 1) {
                $scope.showloading = true;
                $timeout(function () {
                    $scope.showloading = false;
                    $scope.tab_Index[$scope.currentTab] = index;
                    // $scope.flag = true;
                }, 1000);
                // $timeout(function () {
                //     $scope.showloading = false;
                //     // $scope.tab_Index[$scope.currentTab] = index;
                // }, 1500);
            }
            else {
                $scope.tab_Index[$scope.currentTab] = index;
            }
            $scope.numberToDisplay = 17;

        }

        $scope.onClickCategory = function (item) {

            $scope.current_item = item;
            $scope.catProducts[$scope.currentTab] = $filter('filter')($rootScope.products[$scope.currentTab], { category2: { category: item._id } });

            $scope.greenItems[$scope.currentTab][1] = $filter('filter')($scope.catProducts[$scope.currentTab], function (item) {
                return item.stockState.color == 'green' && item.deleted == false;
            });

            $scope.yellowItems[$scope.currentTab][1] = $filter('filter')($scope.catProducts[$scope.currentTab], function (item) {
                return item.stockState.color == 'yellow' && item.deleted == false;
            });

            $scope.redItems[$scope.currentTab][1] = $filter('filter')($scope.catProducts[$scope.currentTab], function (item) {
                return item.stockState.color == 'red' && item.deleted == false;
            });

            $scope.show_category[$scope.currentTab] = false;
            $scope.numberToDisplay = 17;
        }

        $scope.onClickProvider = function (item) {
            console.log('onClickProvider');
            $scope.current_item_provider = item;
            $scope.provProducts[$scope.currentTab] = $filter('filter')($rootScope.products[$scope.currentTab], { provider: { provider: item._id } });

            $scope.greenItems[$scope.currentTab][2] = $filter('filter')($scope.provProducts[$scope.currentTab], function (item) {
                return item.stockState.color == 'green' && item.deleted == false;
            });

            $scope.yellowItems[$scope.currentTab][2] = $filter('filter')($scope.provProducts[$scope.currentTab], function (item) {
                return item.stockState.color == 'yellow' && item.deleted == false;
            });

            $scope.redItems[$scope.currentTab][2] = $filter('filter')($scope.provProducts[$scope.currentTab], function (item) {
                return item.stockState.color == 'red' && item.deleted == false;
            });

            $scope.show_provider[$scope.currentTab] = false;
            $scope.numberToDisplay = 17;
        }

        $scope.backToCategory = function (tabIndex) {
            console.log('backToCategory');
            $scope.show_category[tabIndex] = true;
        }

        $scope.backToProvider = function (tabIndex) {
            console.log('backToProvider');
            $scope.show_provider[tabIndex] = true;
        }

        function getStockState(item, tabIndex) {
            // console.log('getStockState');
            var idxStock = getStockByCostCenter($scope.costCenter[tabIndex]._id, item);
            if (idxStock != null) {
                if (item.stocks[idxStock].unitsInStock <= item.stocks[idxStock].criticalStock) {
                    return { color: 'red', percentage: (item.stocks[idxStock].unitsInStock * 100) / item.stocks[idxStock].idealStock, stock: item.stocks[idxStock] };
                } else if (item.stocks[idxStock].unitsInStock >= item.stocks[idxStock].idealStock) {
                    return { color: 'green', percentage: 100, stock: item.stocks[idxStock] };
                } else {
                    return { color: 'yellow', percentage: (item.stocks[idxStock].unitsInStock * 100) / item.stocks[idxStock].idealStock, stock: item.stocks[idxStock] };
                }
            }
            return { color: 'yellow', percentage: 0, stock: { unitsInStock: 0, idealStock: 0, criticalStock: 0 } };
        };

        //joker's add
        function getStockByCostCenter(id, product) {
            // console.log('getStockByCostCenter');
            if (product.stocks != null) {
                for (var i = 0; i < product.stocks.length; i++) {
                    if (product.stocks[i].costCenter == id) {
                        return i;
                    }
                }
            }
            return null;
        }

        //fei's add

        $scope.numberToDisplay = 14;
        $scope.loadMore = function () {

            switch ($scope.currentChildTab) {
                case 0:
                    if ($scope.numberToDisplay + 3 < $scope.catProducts[$scope.currentTab].length) {
                        $scope.numberToDisplay += 3;
                    } else {
                        $scope.numberToDisplay = $scope.catProducts[$scope.currentTab].length;
                    }
                    break;
                case 1:
                    if ($scope.numberToDisplay + 3 < $scope.products[$scope.currentTab].length) {
                        $scope.numberToDisplay += 3;
                    } else {
                        $scope.numberToDisplay = $scope.products[$scope.currentTab].length;
                    }
                    break;
                case 2:
                    if ($scope.numberToDisplay + 3 < $scope.provProducts[$scope.currentTab].length) {
                        $scope.numberToDisplay += 3;
                    } else {
                        $scope.numberToDisplay = $scope.provProducts[$scope.currentTab].length;
                    }
                    break;
                default:
                    break;
            }
        };

    }
]);







