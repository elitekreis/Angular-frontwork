'use strict';

// Categories controller
angular.module('categories').controller('CategoriesController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Categories', 'Enterprises', '$mdBottomSheet', '$mdDialog', '$state', 'Subs',
    function($scope, $rootScope, $stateParams, $location, Authentication, Categories, Enterprises, $mdBottomSheet, $mdDialog, $state, Subs) {
        $scope.authentication = Authentication;

        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function() {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            $scope.find();
            $scope.findCategoryTypes();
            //console.log('search: ', $scope.SEARCH);
        });

        $scope.selectedMode = 'md-scale';
        $scope.selectedDirection = 'up';

        // Create new Category
        $scope.create = function() {
            // Create new Category object
            if (this.name !== undefined) {
                if (this.categoryType !== undefined) {
                    if (this.sub !== undefined) {
                        var category = new Categories({
                            name: this.name,
                            description: this.description ? this.description : undefined,
                            type1: this.categoryType,
                            sub: this.sub,
                            enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
                        });
                        // Redirect after save
                        category.$save(function(response) {
                            //$location.path('categories/' + response._id);

                            if (response._id) {
                                // agregar sub al array

                                category._id = response._id;
                                $rootScope.categories.unshift(category);

                            }
                            // Clear form fields
                            $scope.name = '';
                            $scope.description = '';

                            $state.go('home.categories');
                        }, function(errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                    } else {
                        $scope.errorName = 'Indicar UEN';
                    }
                } else {
                    $scope.errorName = 'Indicar el tipo de la categoria ';
                }
            } else {
                $scope.errorName = 'Indicar el nombre para la categoria ';
            }
        };

        // Update existing Category
        $scope.update = function() {
            var category = $scope.category;
            if (this.sub !== undefined) {
                category.sub = this.sub._id;
            } else if ((category.sub !== undefined) && (category.sub !== null)) {
                category.sub = category.sub._id;
            }

            if (this.enterprise !== undefined) {
                category.enterprise = this.enterprise._id;
            } else if ((category.enterprise !== undefined) && (category.enterprise !== null)) {
                category.enterprise = category.enterprise._id;
            }

            if (this.categoryType !== undefined) {
                category.type1 = this.categoryType;
            }

            if (category.mostrador == undefined) {
                category.mostrador = false;
            }


            category.$update(function() {
                $location.path('categorias');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Categories
        $scope.find = function() {
            if ($scope.SEARCH !== undefined) {
                $rootScope.categories = Categories.query({ e: $scope.SEARCH.enterprise });
            }

        };

        $scope.findEnterprises = function() {
            $scope.enterprises = Enterprises.query();
        };

        // Find a list of Enterprises
        $scope.findCategoryTypes = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.categoryTypes = ['Centro de Costo', 'Tipo de Venta','Tipo de Compra', 'Cliente', 'Contacto', 'Insumo', 'Materia Prima', 'Producto', 'Producto Interno', 'Proveedor', 'Proceso','Remuneracione'];
            }
        };

        $scope.findSubs = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise });
            }
        };

        // Find existing Category
        $scope.findOne = function() {
            $scope.category = Categories.get({
                categoryId: $stateParams.categoryId
            });
        };

        $scope.showBottomSheet = function($event, item, model, param) {
            var template = '/modules/core/views/menu-opciones.client.view.html';
            $rootScope.currentItem = item;
            $rootScope.currentModel = model;
            $rootScope.currentParam = param;
            //console.log('estadoactual: ', $rootScope.estadoActual);
            $mdBottomSheet.show({
                controller: DialogController,
                templateUrl: template,
                // controller: 'ListBottomSheetCtrl',
                targetEvent: $event,
                resolve: {
                    item: function() {
                        return item;
                    }
                }

            }).then(function(clickedItem) {
                //$mdBottomSheet.hide();
                console.log('por aqui ando');
            });
        };

        $scope.borrarError = function() {
            $scope.errorName = undefined;
        };

        function DialogController($scope, $mdDialog, item, Areas) {

            $scope.item = item;

            $scope.goto = function(state, params) {
                if (state !== undefined) {
                    $state.go(state, params);
                    $mdBottomSheet.hide();
                }
            };

            //abre modal para eliminar una categoria
            $scope.showConfirm = function(ev, item) {
                var confirm = $mdDialog.confirm()
                    .title('Eliminar Categoría')
                    .content('¿Está seguro que desea eliminar esta categoría?')
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

            // Remove existing Category
            $scope.remove = function(category) {
                if (category) {
                    category.$remove();

                    for (var i in $scope.categories) {
                        if ($scope.categories[i] === category) {
                            $scope.categories.splice(i, 1);
                        }
                    }
                } else {
                    $scope.category.$remove(function() {
                        $location.path('categories');
                    });
                }
            };
        }

    }
]);