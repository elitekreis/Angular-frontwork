'use strict';

// Puestos controller
angular.module('puestos',['dndLists']).controller('PuestosController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Puestos', 'Enterprises', 'Areas', 'Procesos', '$state', 'Users', 'Personas', '$mdDialog', '$mdBottomSheet', '$timeout', 'Procedimientos', 'Subs', '$http', 'Costcenters', '$filter',
    function($scope, $rootScope, $stateParams, $location, Authentication, Puestos, Enterprises, Areas, Procesos, $state, Users, Personas, $mdDialog, $mdBottomSheet, $timeout, Procedimientos, Subs, $http, Costcenters, $filter) {
        $scope.authentication = Authentication;
        $scope.models = [];
        $scope.personal = $stateParams["personal"];
        $scope.centrodecostoId = $stateParams.centroDeCosto;

        $scope.showProcedimientos = true;
        $scope.showInteractores = true;

        // Generate initial model
        for (var i = 1; i <= 3; ++i) {
            $scope.models.push({label: "Item A" + i});
            //$scope.models.lists.B.push({label: "Item B" + i});
        }

        // Model to JSON for demo purpose
        $scope.$watchCollection('models', function(model) {
            angular.toJson(model, true);
        }, true);
        $scope.$watchCollection('puesto.procedimientos', function(model) {
            angular.toJson(model, true);
        }, true);

        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function() {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            $scope.findAll();
            $scope.findAreas();
            $scope.findUsers();

            $scope.findProcesos();
            $scope.findProcedimientos();
            $scope.findInteractores();
        });

        $scope.nombreAreaFiltro = undefined;

        //arreglos para usar cuando crea un puesto nuevo
        $rootScope.procesosAgregados = [];
        $rootScope.interactoresAgregados = [];

        //arreglos para usar cuando edita un puesto
        $rootScope.procesosEdit = [];
        $rootScope.interactoresEdit = [];

        $scope.horarios = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
            "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
            "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"
        ];

        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };


        //cambia el estado del puesto
        $scope.sampleAction = function(name, puesto) {
            switch (name) {
                case 'libre':
                    puesto.estado = 'Libre';
                    break;

                case 'ocupado':
                    puesto.estado = 'Ocupado';
                    break;

                case 'no':
                    puesto.estado = 'Sin Especificar';
                    break;
            }
            $scope.updateEstado(puesto);
        };

        $scope.updateEstado = function(puesto) {
            if (this.enterprise !== undefined) { puesto.enterprise = this.enterprise._id } else if ((puesto.enterprise !== undefined) && (puesto.enterprise !== null)) { puesto.enterprise = puesto.enterprise._id };
            if (this.sub !== undefined) { puesto.sub = this.sub._id } else if ((puesto.sub !== undefined) && (puesto.sub !== null)) { puesto.sub = puesto.sub._id };

            puesto.$update(function() {}, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.filtrarAreas = function(area) {
            $scope.nombreAreaFiltro = area.name;
        };

        $scope.eliminarFiltro = function() {
            $scope.nombreAreaFiltro = undefined;
        };

        $scope.clickSubmit = function() {
            $scope.clicked = true;
            $scope.create();
        };

        $scope.submitEdit = function() {
            if (this.personal && this.personal.puesto) {
                if (confirm("it is already used by another personal are you sure to update so that it will replace for other user")) {
                    $scope.clickedEdit = true;
                    $scope.update();
                }
            } else {
                $scope.clickedEdit = true;
                $scope.update();
            }

        };

        // Create new Puesto
        $scope.create = function() {
            // Create new Puesto object
            if ($scope.clicked === true) {
                if (this.name !== undefined) {
                    // if (this.sub !== undefined){

                    if (this.area !== undefined) {
                        var puesto = new Puestos({
                            name: this.name,
                            area: this.area,
                            horarioE: this.horarioE ? this.horarioE : undefined,
                            horarioS: this.horarioS ? this.horarioS : undefined,
                            sueldo: this.sueldo ? this.sueldo : undefined,
                            porcentajeVentas: this.porcentajeVentas ? this.porcentajeVentas : undefined,
                            parent: this.parent ? this.parent : undefined,
                            procedimientos: $rootScope.procesosAgregados,
                            interaccion: $rootScope.interactoresAgregados,
                            responsabilidades: this.responsabilidades ? this.responsabilidades : undefined,
                            requerimientos: this.requerimientos ? this.requerimientos : undefined,
                            tareas: this.observaciones ? this.observaciones : undefined,
                            criterios: this.criterios ? this.criterios : undefined,
                            objetivos: this.objetivos ? this.objetivos : undefined,
                            enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                            centroDeCosto: this.centroDeCosto.id ? this.centroDeCosto.id : undefined,
                            // sub: this.sub ? this.sub._id : undefined
                        });

                        // Redirect after save
                        puesto.$save(function(response) {
                            /*$location.path('puestos/' + response._id);*/
                            if (response._id) {
                                // agregar sub al array

                                puesto._id = response._id;
                                $rootScope.puestos.unshift(puesto);

                            }

                            $state.go('home.puesto');

                            // Clear form fields
                            $scope.name = '';
                        }, function(errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                    } else {
                        $scope.errorArea = 'Indicar Area del puesto';
                    }
                    // }
                    // else{
                    // 	$scope.errorSub = 'Indicar UEN';
                    // }
                } else {
                    $scope.errorName = 'Indicar nombre para el puesto';
                }
            } else {
                //no hace nada
            }
        };

        $scope.borrarMensaje = function() {
            $scope.errorName = undefined;
            $scope.errorArea = undefined;
            $scope.errorSub = undefined;
        };

        $scope.agregarProceso = function(proceso) {
            var ok = false;
            if ((proceso !== undefined) && (proceso !== null)) {
                for (var i in $rootScope.procesosAgregados) {
                    if ($rootScope.procesosAgregados[i]._id === proceso._id) {
                        ok = true;
                    }
                }
                if (!ok) {
                    $rootScope.procesosAgregados.push(proceso);
                    this.proceso = undefined;
                }
            }
        };

        $scope.agregarProcesoEdit = function(proceso) {
            if (proceso !== undefined) {
                $rootScope.procesosEdit = this.puesto.procedimientos;
                $rootScope.procesosEdit.push(proceso);
                $scope.proceso = undefined;
            }
        };

        $scope.agregarInteractores = function(interactor) {
            var ok = false;
            if ((interactor !== undefined) && (interactor !== null)) {
                for (var i in $rootScope.interactoresAgregados) {
                    if ($rootScope.interactoresAgregados[i]._id === interactor._id) {
                        ok = true;
                    }
                }
                if (!ok) {
                    $rootScope.interactoresAgregados.push(interactor);
                    this.interaccion = undefined;
                }
            }
        };


        $scope.agregarInteractoresEdit = function(i) {
            if (i !== undefined) {
                $rootScope.interactoresEdit = this.puesto.interaccion;
                $rootScope.interactoresEdit.push(i);
                $scope.interaccion = undefined;
            }
        };

        $scope.borrarProceso = function(item) {
            for (var i in $rootScope.procesosAgregados) {
                if ($rootScope.procesosAgregados[i] === item) {
                    $rootScope.procesosAgregados.splice(i, 1);
                }
            }
        };

        $scope.borrarProcesoEdit = function(item) {
            $rootScope.procesosEdit = this.puesto.procedimientos;
            for (var i in $rootScope.procesosEdit) {
                if ($rootScope.procesosEdit[i] === item) {
                    $rootScope.procesosEdit.splice(i, 1);
                }
            }
        };

        $scope.borrarInteractor = function(item) {
            for (var i in $rootScope.interactoresAgregados) {
                if ($rootScope.interactoresAgregados[i] === item) {
                    $rootScope.interactoresAgregados.splice(i, 1);
                }
            }
        };

        $scope.borrarInteractorEdit = function(item) {
            $rootScope.interactoresEdit = this.puesto.interaccion;
            for (var i in $rootScope.interactoresEdit) {
                if ($rootScope.interactoresEdit[i] === item) {
                    $rootScope.interactoresEdit.splice(i, 1);
                }
            }
        };

        //abre modal para eliminar un puesto
        $scope.showConfirm = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Eliminar Puesto')
                .content('¿Está seguro que desea eliminar este puesto?')
                .ariaLabel('Lucky day')
                .ok('Eliminar')
                .cancel('Cancelar')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.remove(item);
            }, function() {
                console.log('cancelaste borrar');
            });
        };

        // Remove existing Puesto
        $scope.remove = function(puesto) {
            if (puesto) {
                puesto.$remove();

                for (var i in $scope.puestos) {
                    if ($scope.puestos[i] === puesto) {
                        $scope.puestos.splice(i, 1);
                    }
                }
            } else {
                $scope.puesto.$remove(function() {
                    $location.path('puestos');
                });
            }
        };

        // Update existing Puesto
        $scope.update = function() {
            if ($scope.clickedEdit == true) {

                var puesto = $scope.puesto;
                puesto.parent = $scope.parent;
                puesto.horarioE = $scope.horarioE;
                puesto.horarioS = $scope.horarioS;
                if ($scope.area !== undefined) {
                    puesto.area = $scope.area._id
                } else {
                    if (puesto.area !== undefined) {
                        puesto.area = puesto.area._id
                    }
                };
                if ($rootScope.interactoresEdit.length !== 0) {
                    for (var i in $rootScope.interactoresEdit) {
                        var id = $rootScope.interactoresEdit[i]._id;
                        $rootScope.interactoresAgregados.push(id);
                    }
                    puesto.interaccion = $rootScope.interactoresAgregados;
                }
                if ($rootScope.procesosEdit.length !== 0) {
                    for (var i in $rootScope.procesosEdit) {
                        var id = $rootScope.procesosEdit[i]._id;
                        $rootScope.procesosAgregados.push(id);
                    }
                    puesto.procesos = $rootScope.procesosAgregados;
                }

                /* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
                una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
                hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */
                if (this.enterprise !== undefined) { puesto.enterprise = this.enterprise._id } else if ((puesto.enterprise !== undefined) && (puesto.enterprise !== null)) { puesto.enterprise = puesto.enterprise._id };
                if (this.centroDeCosto !== undefined) { puesto.centroDeCosto = this.centroDeCosto.id } else if ((puesto.centroDeCosto !== undefined) && (puesto.centroDeCosto !== null)) { puesto.centroDeCosto = puesto.centroDeCosto };

                if (this.personal !== undefined) { puesto.personal = this.personal._id } else if ((puesto.personal !== undefined) && (puesto.personal !== null)) { puesto.personal = puesto.personal._id };
                // if (this.sub !== undefined) { puesto.sub = this.sub._id } else if ((puesto.sub !== undefined)&&(puesto.sub !== null)){ puesto.sub = puesto.sub._id };
                puesto.changeEstado = true;
                puesto.$update(function() {
                    if(puesto.personal) {
                        $location.path('puestos/view/' + puesto._id);
                    } else {
                        $state.go('home.puesto');
                    }
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        $scope.findAll = function() {
            $scope.find();
            $scope.findAreas();
        };

        // Find a list of Puestos
        $scope.find = function() {
            if ($scope.SEARCH !== undefined) {
                // $rootScope.puestos = Puestos.query({ e: $scope.SEARCH.enterprise });
                Puestos.query({ e: $scope.SEARCH.enterprise }, function(res) {
                    $rootScope.puestos = res;
                });
            }
        };

        // Find existing Puesto
        $scope.findOne = function() {
            Puestos.get({ puestoId: $stateParams.puestoId }, function(res) {
                $scope.puesto = res;
                Users.query({ e: $scope.SEARCH.enterprise }, function(res) {
                    $scope.users = res;
                    $scope.users.unshift({_id: '', displayName: '', status: 'active'});
                });

                Costcenters.query({e: $scope.SEARCH.enterprise}, function(data) {
                    $scope.relatedCostCenter = $filter('filter')(data, function(item) {
                        return item.id === $scope.puesto.centroDeCosto;
                    })[0];
                });
            });
        };

        $scope.findEnterprises = function() {
            $scope.enterprises = Enterprises.query();
        };
        $scope.findCentroDeCostos = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.centroDeCostos = Costcenters.query({e: $scope.SEARCH.enterprise});
            }
        };

        $scope.findAreas = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.areas = Areas.query({ e: $scope.SEARCH.enterprise });
            }
        };

        $scope.findProcesos = function() {
            if ($scope.SEARCH !== undefined) { $scope.procesos = Procesos.query({ e: $scope.SEARCH.enterprise }); }
        };

        $scope.findProcedimientos = function() {
            if ($scope.SEARCH !== undefined) { $scope.procedimientos = Procedimientos.query({ e: $scope.SEARCH.enterprise }); }
        };

        $scope.findInteractores = function() {
            if ($scope.SEARCH !== undefined) { $scope.interactores = Puestos.query({ e: $scope.SEARCH.enterprise }); }
        };

        $scope.findUsers = function() {
            if ($scope.SEARCH !== undefined) { $scope.usuarios = Users.query({ e: $scope.SEARCH.enterprise }); }
        };

        $scope.findSubs = function() {
            if ($scope.SEARCH !== undefined) { $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise }); }
        };

        $scope.showBottomSheet = function($event, item, model, param) {

            var template = '/modules/core/views/menu-opciones.client.view.html';
            $rootScope.currentItem = item;
            $rootScope.currentModel = model;
            $rootScope.currentParam = param;
            $mdBottomSheet.show({
                controller: DialogController,
                templateUrl: template,
                targetEvent: $event,
                resolve: {
                    item: function() {
                        return item;
                    }
                }

            }).then(function(clickedItem) {
                //$mdBottomSheet.hide();
                // console.log('por aqui ando');
            });

        };

        function DialogController($scope, $mdDialog, item, Areas) {

            $scope.item = item;

            $scope.goto = function(state, params) {
                if (state !== undefined) {
                    $state.go(state, params);
                    $mdBottomSheet.hide();
                }
            }

            //abre modal para eliminar un puesto
            $scope.showConfirm = function(ev, item) {
                var confirm = $mdDialog.confirm()
                    .title('Eliminar Puesto')
                    .content('¿Está seguro que desea eliminar este puesto?')
                    .ariaLabel('Lucky day')
                    .ok('Eliminar')
                    .cancel('Cancelar')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function() {
                    $scope.remove(item);
                }, function() {
                    console.log('cancelaste borrar');
                });
            };

            // Remove existing Puesto
            $scope.remove = function(puesto) {
                if (puesto) {
                    puesto.$remove();

                    for (var i in $scope.$parent.puestos) {
                        if ($scope.$parent.puestos[i] === puesto) {
                            $scope.$parent.puestos.splice(i, 1);
                        }
                    }
                } else {
                    $scope.puesto.$remove(function() {
                        $location.path('puestos');
                    });
                }
                $mdBottomSheet.hide();
            };

        };    
    }
]);