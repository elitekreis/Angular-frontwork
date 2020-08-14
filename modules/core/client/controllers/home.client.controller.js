'use strict';

angular.module('core').controller('HomeController', ['$scope', '$rootScope', 'Authentication', '$state', '$mdBottomSheet', '$mdSidenav', '$mdUtil', 'Menu', 'FindUserById', 'Areas', '$http', 'Puestos', '$stateParams', 'ShowAreaInfo', '$mdDialog', 'Tareas', 'Users', '$filter', '$timeout', 'Empleados', 'Actividades','ServiceNavigation',
    function ($scope, $rootScope, Authentication, $state, $mdBottomSheet, $mdSidenav, $mdUtil, Menu, FindUserById, Areas, $http, Puestos, $stateParams, ShowAreaInfo, $mdDialog, Tareas, Users, $filter, $timeout, Empleados, Actividades,ServiceNavigation) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function () {
            if ($scope.authentication.user !== undefined) {
                $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
                $scope.findTareas();
            }
        });

        $rootScope.$watchCollection('estadoActualParams', function () {
            if ($rootScope.estadoActualParams !== undefined) {
                $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
            }
        });

        //console.log($scope.authentication.user);

        if (!$scope.authentication.user) {
            $state.transitionTo('authentication.signin');
        }
        var vm = this;

        //functions for menu-link and menu-toggle
        vm.isOpen = isOpen;
        vm.toggleOpen = toggleOpen;
        vm.autoFocusContent = false;
        vm.menu = Menu;

        //gets the list of sub nav for display in the view
        $rootScope.$on("nav change",function(val){
            //console.log(JSON.parse(window.localStorage.getItem("subNav")))
            $rootScope.titles = ServiceNavigation.getNav();
        })

        $rootScope.$on('hide nav',function(val){
            $rootScope.titles = [];
        })
        
        $rootScope.$broadcast("nav change",true);
        vm.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };


        function isOpen(section) {
            return Menu.isSectionSelected(section);
        }

        function toggleOpen(section) {
            Menu.toggleSelectSection(section);
        }

        $scope.toggle = toggleSidenav('left');

        function toggleSidenav(navID) {
            var debounceFn = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 300);
            return debounceFn;
        }

        $scope.showBottomSheet = function ($event) {
            var template = '';
            switch ($rootScope.estadoActual) {
                case 'home.enterprises':
                    template = 'modules/enterprises/views/create-enterprise.client.view.html';
                    break;

                case 'home.products':
                    $state.go('home.createProduct', $rootScope.estadoActualParams);
                    break;

                case 'home.viewProduct':
                    $state.go('home.createProduct', $rootScope.estadoActualParams);
                    break;

                case 'home.editProduct':
                    $state.go('home.createProduct', $rootScope.estadoActualParams);
                    break;

                case 'home.editValores':
                    $state.go('home.editValores', $rootScope.estadoActualParams);
                    break;

                case 'home.categories':
                    $state.go('home.createCategory');
                    // template = 'modules/categories/views/create-category.client.view.html';
                    break;

                case 'home.viewCategory':
                    $state.go('home.createCategory');
                    // template = 'modules/categories/views/create-category.client.view.html';
                    break;

                case 'home.editCategory':
                    $state.go('home.createCategory');
                    // template = 'modules/categories/views/create-category.client.view.html';
                    break;

                case 'home.subs':
                    template = 'modules/subs/views/create-sub.client.view.html';
                    break;

                case 'home.viewSub':
                    template = 'modules/subs/views/create-sub.client.view.html';
                    break;

                case 'home.editSub':
                    template = 'modules/subs/views/create-sub.client.view.html';
                    break;

                case 'home.tareas':
                    template = 'modules/tareas/views/create-tarea.client.view.html';
                    break;

                case 'home.viewTarea':
                    template = 'modules/tareas/views/create-tarea.client.view.html';
                    break;

                case 'home.editTarea':
                    template = 'modules/tareas/views/create-tarea.client.view.html';
                    break;

                case 'home.finanzas':
                    template = 'modules/finanzas/views/list-finanzas.client.view.html';
                    break;

                case 'home.viewFinanza':
                    template = 'modules/finanzas/views/view-finanza.client.view.html';
                    break;

                case 'home.editComprobante':
                    template = 'modules/finanzas/views/create-finanza.client.view.html';
                    break;

                case 'home.viewTarea':
                    template = 'modules/tareas/views/create-tarea.client.view.html';
                    break;

                case 'home.editTarea':
                    template = 'modules/tareas/views/create-tarea.client.view.html';
                    break;

                case 'home.clients':
                    // template = 'modules/_clients/views/create-client.client.view.html';
                    $state.go('home.createClient');
                    break;

                case 'home.viewClient':
                    $state.go('home.createClient');
                    // template = 'modules/_clients/views/create-client.client.view.html';
                    break;

                case 'home.editClient':
                    template = 'modules/_clients/views/create-client.client.view.html';
                    break;

                case 'home.providers':
                    $state.go('home.createProvider');
                    break;

                case 'home.viewProvider':
                    $state.go('home.createProvider');
                    break;

                case 'home.editProvider':
                    $state.go('home.createProvider');
                    break;

                case 'home.contacts':
                    $state.go('home.createContact');
                    break;

                case 'home.viewContact':
                    template = 'modules/contacts/views/create-contact.client.view.html';
                    break;

                case 'home.editContact':
                    template = 'modules/contacts/views/create-contact.client.view.html';
                    break;

                case 'home.taxConditions':
                    template = 'modules/taxconditions/views/create-taxcondition.client.view.html';
                    break;

                case 'home.viewTaxCondition':
                    template = 'modules/taxconditions/views/create-taxcondition.client.view.html';
                    break;

                case 'home.editTaxCondition':
                    template = 'modules/taxconditions/views/create-taxcondition.client.view.html';
                    break;

                case 'home.condicionVentas':
                    $state.go('home.createCondicionventa');
                    break;

                case 'home.viewCondicionVenta':
                    template = 'modules/condicionventas/views/create-condicionventa.client.view.html';
                    break;

                case 'home.editCondicionVenta':
                    template = 'modules/condicionventas/views/create-condicionventa.client.view.html';
                    break;

                case 'home.comprobantes':
                    //template = 'modules/comprobantes/views/create-comprobante.client.view.html';
                    $state.go('home.createComprobante');
                    break;

                case 'home.viewComprobante':
                    template = 'modules/comprobantes/views/create-comprobante.client.view.html';
                    break;

                case 'home.costcenters':
                    template = 'modules/costcenters/views/create-costcenter.client.view.html';
                    break;

                case 'home.viewCostcenter':
                    template = 'modules/costcenters/views/create-costcenter.client.view.html';
                    break;

                case 'home.editCostcenter':
                    template = 'modules/costcenters/views/create-costcenter.client.view.html';
                    break;

                case 'home.createVenta':
                    $state.go('home.createVenta');
                    break;

                case 'home.ventasMostrador':
                    $state.go('home.ventasMostrador');
                    break;

                case 'home.compras':
                    $state.go('home.createCompra');
                    break;

                case 'home.viewCompra':
                    $state.go('home.createCompra');
                    break;

                case 'home.editCompra':
                    $state.go('home.createCompra');
                    break;

                case 'home.ventas':
                    $state.go('home.createVenta');
                    break;

                case 'home.viewVenta':
                    $state.go('home.createVenta');
                    break;

                case 'home.editVenta':
                    $state.go('home.createVenta');
                    break;

                case 'home.personal':
                    $state.go('home.createPersonal');
                    break;

                case 'home.viewPersona':
                    $state.go('home.createPersonal');
                    break;

                case 'home.editPersona':
                    $state.go('home.createPersonal');
                    break;

                case 'home.empleados':
                    $state.go('home.createPersonal');
                    break;

                case 'home.pedidos':
                    $state.go('home.createPedido', $rootScope.estadoActualParams);
                    break;

                case 'home.viewPedido':
                    $state.go('home.createPedido', $rootScope.estadoActualParams);
                    break;

                case 'home.editPedido':
                    $state.go('home.createPedido', $rootScope.estadoActualParams);
                    break;

                case 'home.finanzas':
                    $state.go('home.createFinanza', $rootScope.estadoActualParams);
                    break;

                case 'home.viewFinanza':
                    $state.go('home.createFinanza', $rootScope.estadoActualParams);
                    break;

                case 'home.sucursales':
                    $state.go('home.createSucursal');
                    break;

                case 'home.cajas':
                    $state.go('home.createCaja');
                    break;

                case 'home.procesos':
                    $state.go('home.createProceso');
                    break;

                case 'home.viewProceso':
                    $state.go('home.createProceso');
                    break;

                case 'home.editProceso':
                    $state.go('home.createProceso');
                    break;

                case 'home.procedimientos':
                    template = 'modules/procedimientos/views/create-procedimiento.client.view.html';
                    break;

                case 'home.viewProcedimiento':
                    template = 'modules/procedimientos/views/create-procedimiento.client.view.html';
                    break;

                case 'home.editProcedimiento':
                    template = 'modules/procedimientos/views/edit-procedimiento.client.view.html';
                    break;

                case 'home.rrhh':
                    $state.go('home.createArea');
                    break;

                case 'home.area':
                    $state.go('home.createArea');
                    break;

                case 'home.viewArea':
                    $state.go('home.createArea');
                    break;

                case 'home.editArea':
                    $state.go('home.createArea');
                    break;

                case 'home.puesto':
                    $state.go('home.createPuesto');
                    break;

                case 'home.viewPuesto':
                    $state.go('home.createPuesto');
                    break;

                case 'home.editPuesto':
                    $state.go('home.createPuesto');
                    break;

                case 'home.viewImpuesto':
                    $state.go('home.createImpuesto');
                    break;

                case 'home.remuneraciones':
                    $state.go('home.createRemuneracione');
                    break;

                case 'home.viewRemuneracione':
                    $state.go('home.createRemuneracione');
                    break;

                case 'home.editRemuneracione':
                    $state.go('home.createRemuneracione');
                    break;

                case 'home.listEmpleado':
                    $state.go('home.createEmpleado');
                    break;

                case 'home.liquidaciones':
                    $state.go('home.createLiquidacion', {empleadoId: $rootScope.empleadoId});
                    break;

                case 'home.actividades':
                    $state.go('home.actividades');
                    break;

                default:
                    template = '';
                    break;

            }

            if (template === '') {
                // console.log('No existe un estado configurado para esta acción!');
                // console.log($rootScope.estadoActual);
            } else {
                //console.log('estadoactual: ', $rootScope.estadoActual);
                $mdBottomSheet.show({
                    templateUrl: template,
                    // controller: 'ListBottomSheetCtrl',
                    targetEvent: $event
                }).then(function (clickedItem) {
                    //$mdBottomSheet.hide();
                    /*console.log('por aqui ando');*/
                });
            }
            ;
        };

        $scope.backButtom = function ($event) {
            if (($stateParams.back !== undefined) && ($stateParams.tipo !== undefined)) {
                $rootScope.estadoActualParams.tipo = $stateParams.tipo;
                $state.go($stateParams.back, $rootScope.estadoActualParams);
            } else {
                if (($rootScope.estadoActual == 'home.viewProduct') || ($rootScope.estadoActual == 'home.editProduct')) {
                    if ($rootScope.tipoProducto !== undefined) {
                        switch ($rootScope.tipoProducto) {
                            case 'p':
                                $rootScope.estadoActualParams.tipo = 'p';
                                break;
                            case 'm':
                                $rootScope.estadoActualParams.tipo = 'm';
                                break;
                            case 'i':
                                $rootScope.estadoActualParams.tipo = 'i';
                                break;
                        }
                    } else {
                        console.log("[+] rootScope.tipoProducto es indefinido");
                    }
                } else if (($rootScope.estadoActual == 'home.viewPedido') || ($rootScope.estadoActual == 'home.editPedido')) {
                    if ($rootScope.tipoPedido !== undefined) {
                        switch ($rootScope.tipoPedido) {
                            case 'venta':
                                $rootScope.estadoActualParams.tipo = 'venta';
                                // console.log($rootScope.estadoActualParams);
                                break;
                            case 'compra':
                                $rootScope.estadoActualParams.tipo = 'compra';
                                // console.log($rootScope.estadoActualParams);
                                break;
                        }
                    }
                }
                else if (($rootScope.estadoActual == 'home.viewFinanza') || ($rootScope.estadoActual == 'home.editFinanza')) {
                    if ($rootScope.tipoFinanza !== undefined) {
                        switch ($rootScope.tipoFinanza) {
                            case 'debe':
                                $rootScope.estadoActualParams.tipo = 'debe';
                                break;
                            case 'haber':
                                $rootScope.estadoActualParams.tipo = 'haber';
                                // console.log($rootScope.estadoActualParams);
                                break;
                        }
                    }
                }
                // console.log($rootScope.estadoActualParams, 'estado actual params');
                $state.go($rootScope.prevState, $rootScope.estadoActualParams);
            }
        };

        $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            switch (to.name) {
                case('home.createPedido'):
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    if (toParams.tipo !== undefined) {
                        var tipo = toParams.tipo.charAt(0).toUpperCase() + toParams.tipo.slice(1);
                        $rootScope.tituloActual = to.titulo + ' ' + 'De' + ' ' + tipo;
                    } else {
                        $rootScope.tituloActual = to.titulo;
                    }
                    if ($scope.authentication.user.roles[0] === 'cliente') {
                        $rootScope.tituloActual = 'Nuevo Pedido'
                    }
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    // console.log($rootScope.tituloActual);
                    break;
                case('home.pedidos'):
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    if (toParams.tipo !== undefined) {
                        var tipo = toParams.tipo.charAt(0).toUpperCase() + toParams.tipo.slice(1);
                        if (tipo == 'Compra') {
                            $rootScope.tituloActual = 'Compras';
                        } else {
                            $rootScope.tituloActual = 'Ventas';
                        }
                        if ($scope.authentication.user.roles[0] === 'cliente') {
                            $rootScope.tituloActual = 'Pedidos'
                        }
                    } else {
                        $rootScope.tituloActual = to.titulo;
                    }
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    // console.log($rootScope.tituloActual);
                    break;
                case('home.finanzas'):
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    if (toParams.tipo !== undefined) {
                        if (toParams.tipo == 'debe') {
                            $rootScope.tituloActual = 'Cuentas a pagar';
                        } else {
                            $rootScope.tituloActual = 'Cuentas a cobrar';
                        }
                    } else {
                        $rootScope.tituloActual = to.titulo;
                    }
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    // console.log($rootScope.tituloActual);
                    break;
                case('home.stock'):
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;

                    if (toParams.tipo !== undefined) {
                        if (toParams.tipo == 'p') {
                            $rootScope.tituloActual = 'Stock de Productos';
                        } else {
                            $rootScope.tituloActual = 'Stock de Materias Primas';
                        }
                    } else {
                        $rootScope.tituloActual = to.titulo;
                    }
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    console.log($rootScope.tituloActual);
                    break;
                case('home.viewFinanza'):
                    if (toParams.tipo == 'debe') {
                        $rootScope.tituloActual = 'Cuentas a pagar';
                    } else if (toParams.tipo == 'haber') {
                        $rootScope.tituloActual = 'Cuentas a cobrar';
                    }
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    break;
                case('home.products'):
                    if (toParams.tipo == 'm') {
                        $rootScope.tituloActual = 'Materia Prima';
                    } else if (toParams.tipo == 'i') {
                        $rootScope.tituloActual = 'Insumos';
                    } else if (toParams.tipo == 'p') {
                        $rootScope.tituloActual = 'Productos';
                    }
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    break;
                case('home.createProduct'):
                    if (toParams.tipo == 'm') {
                        $rootScope.tituloActual = 'Creacion De Materia Prima';
                    } else if (toParams.tipo == 'i') {
                        $rootScope.tituloActual = 'Creacion De Insumo';
                    } else if (toParams.tipo == 'p') {
                        $rootScope.tituloActual = 'Creacion De Producto';
                    }
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    break;
                case('home.viewProduct'):
                    if (toParams.tipo == 'm') {
                        $rootScope.tituloActual = 'Creacion De Materia Prima';
                    } else if (toParams.tipo == 'i') {
                        $rootScope.tituloActual = 'Creacion De Insumo';
                    } else if (toParams.tipo == 'p') {
                        $rootScope.tituloActual = 'Producto';
                    }
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    break;
                case('home.editProduct'):
                    //if(toParams.tipo=='m'){
                    if (fromParams.tipo == 'm') {
                        $rootScope.tituloActual = 'Editar Materia Prima';
                        $rootScope.tipoProducto = 'm';
                    } else if (fromParams.tipo == 'i') {
                        $rootScope.tituloActual = 'Editar Insumo';
                        $rootScope.tipoProducto = 'i';
                    } else if (fromParams.tipo == 'p') {
                        $rootScope.tituloActual = 'Editar Producto';
                        $rootScope.tipoProducto = 'p';
                    }
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = fromParams;
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    break;
                default:
                    $rootScope.tituloActual = to.titulo;
                    $rootScope.estadoActual = to.name;
                    $rootScope.estadoActualParams = toParams;
                    $rootScope.prevState = to.prevState;
                    $rootScope.newButton = to.newButton;
                    break;
            }
            ;
        });

        //asigna el puesto de trabajo al rootScope
        $http({
            method: 'GET',
            url: ('/api/users/byId'),
            params: {userId: $scope.authentication.user._id}
        })
            .then(function (response) {
                /*console.log('user', response.data);
                console.log('puesto', response.data.puesto);*/
                if ((response.data.puesto !== null) && (response.data.puesto !== undefined)) {
                    Puestos.get({puestoId: response.data.puesto._id}, function (res) {
                        $rootScope.puesto = res;
                    }, function (err) {

                    });
                }

            }, function (response) {
                console.log('error');
            });

        $scope.showAdvancedArea = function (ev) {
            var areaActive = ev.toElement.id;
            // console.log('value:', areaActive);
            ShowAreaInfo.setArea($scope.puesto.area._id);
            $mdDialog.show({
                controller: AreaModalController,
                templateUrl: '/modules/areas/views/view-area.client.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.showDialog = function ($event, item) {
            var parentEl = angular.element(document.body);
            var template = 'modules/tareas/views/create-tarea.client.view.html';
            $mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: template,
                locals: {
                    item: item,
                    SEARCH: $scope.SEARCH
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        }; //end showDialod

        $scope.showDialogActividad = function ($event) {
            console.log($scope.authentication.user._id);
            $http.post('/api/empleados/user', {
                user: $scope.authentication.user._id
            }).then(function(empleado) {
                $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/actividades/views/create-actividad.client.view.html',
                    locals: {
                        item: empleado.data[0]
                    },
                    controller: ActividadDialogController
                });
            })
        };

        $rootScope.arrayTareas = [];
        $rootScope.arrayTareasAsignadas = [];

        $scope.findTareas = function () {
            $rootScope.arrayTareas = [];
            $rootScope.arrayTareasAsignadas = [];
            if ($scope.SEARCH !== undefined) {
                $scope.tareas = Tareas.query({e: $scope.SEARCH.enterprise});
                $timeout(function () {
                    $rootScope.arrayTareas = $filter('filter')($scope.tareas, function (item) {
                        return ((item.usuario._id === $scope.authentication.user._id) && (item.deleted === false));
                    });
                    $rootScope.arrayTareasAsignadas = $filter('filter')($scope.tareas, function (item) {
                        return ((item.user._id === $scope.authentication.user._id) && (item.deleted === false) && (item.forMe === false));
                    });
                }, 5000)
            }
        };

        $scope.findUsuarios = function () {
            if ($scope.SEARCH !== undefined) {
                $rootScope.usuarios = Users.query({e: $scope.SEARCH.enterprise});
            }
        };

        $scope.update = function (item) {
            var tarea = item;
            tarea.$update(function () {
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        }; //end update

        $scope.borrarRealizadas = function (n) {
            if (n == 1) {
                for (var i in $rootScope.arrayTareas) {
                    if ($rootScope.arrayTareas[i].realizado == true) {
                        $rootScope.arrayTareas[i].deleted = true;
                        $scope.update($rootScope.arrayTareas[i]);
                        $rootScope.arrayTareas.splice(i, 1);
                    }
                }
            }
            else {
                for (var i in $rootScope.arrayTareasAsignadas) {
                    if ($rootScope.arrayTareasAsignadas[i].realizado == true) {
                        $rootScope.arrayTareasAsignadas[i].deleted = true;
                        $scope.update($rootScope.arrayTareasAsignadas[i]);
                        $rootScope.arrayTareasAsignadas.splice(i, 1);
                    }
                }
            }
        }; //end borrarRealizadas

        function DialogController($scope, $rootScope, $mdDialog, $timeout, item, SEARCH, Tareas, Users, Authentication) {

            $scope.prioridad = false;

            $scope.findUsers = function () {
                if (SEARCH !== undefined) {
                    $scope.usuarios = Users.query({e: SEARCH.enterprise});
                }
            };

            $scope.borrarError = function () {
                $scope.errorTarea = undefined;
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.create = function ($event) {
                var autoAsignado = false;
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.descripcion != undefined) && ($scope.descripcion != null)) {
                        if (($scope.user != undefined) && ($scope.user != null)) {
                            if ($scope.user._id === Authentication.user._id) {
                                autoAsignado = true;
                            }
                            var tarea = new Tareas({
                                descripcion: $scope.descripcion,
                                prioridad: $scope.prioridad,
                                usuario: $scope.user._id,
                                forMe: autoAsignado,
                                enterprise: SEARCH.enterprise
                            });

                            if (tarea.usuario === Authentication.user._id) {
                                tarea.user = $scope.user.displayName;
                                $rootScope.arrayTareas.push(tarea);
                                tarea.user = undefined;
                            }
                            else {
                                if (tarea.forMe === false) {
                                    tarea.usuario = $scope.user.displayName;
                                    ;
                                    $rootScope.arrayTareasAsignadas.push(tarea);
                                    tarea.usuario = $scope.user._id;
                                }
                            }

                            // Redirect after save
                            tarea.$save(function (response) {
                                // Clear form fields
                                $scope.closeDialog();
                                //$mdBottomSheet.hide();
                            }, function (errorResponse) {
                                $scope.error = errorResponse.data.message;
                            });
                        }
                        else {
                            $scope.errorTarea = 'Se debe indicar la persona a asignar la tarea';
                        }
                    }
                    else {
                        $scope.errorTarea = 'Se debe indicar la descripcion de la tarea';
                    }
                }
                ;
            }; //end Create

        };//end DialogController

        function ActividadDialogController($scope, $mdDialog, $state, item) {
            $scope.item = item;
            $scope.item.name = item.userLogin.displayName;

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.createActividad = function ($event, item) {
                var actividad = new Actividades({
                    enterprise: item.enterprise,
                    operacion: $scope.operacion,
                    observaciones: $scope.observaciones,
                    empleado: item._id
                });

                actividad.$save(function () {
                    $scope.closeDialog();
                    $state.go('home.welcome', {}, {reload: true})
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };
        }

        function AreaModalController($scope, $mdDialog, ShowAreaInfo) {
            // console.log('area modal');
            var areaActive = ShowAreaInfo.getArea();
            // console.log(areaActive);
            $http({
                method: 'GET',
                url: ('/api/findAreaById'),
                params: {areaId: areaActive}
            })
                .then(function (response) {
                    $scope.areaActive = response.data;
                    // console.log($scope.areaActive);
                    $scope.parent = $scope.areaActive.parent;
                    $http({
                        method: 'GET',
                        url: ('/api/puestoByAreaId'),
                        params: {areaId: $scope.areaActive._id}
                    })
                        .then(function (res) {
                            if (res.data[0] == null) {
                                $scope.puestosActive = null;
                            } else {
                                $scope.puestosActive = res.data;
                            }
                            // console.log('puestos', $scope.puestosActive);
                        }, function (response) {
                            console.log('error');
                        });
                }, function (response) {
                    console.log('error');
                });
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        };


    }
]);
