'use strict';

// Costcenters controller
angular.module('costcenters').controller('CostcentersController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Costcenters', 'Enterprises', '$mdBottomSheet', '$mdDialog', 'Categories', '$filter', 'Impuestos',
    function($scope, $rootScope, $stateParams, $location, Authentication, Costcenters, Enterprises, $mdBottomSheet, $mdDialog, Categories, $filter, Impuestos) {
        $scope.authentication = Authentication;

        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function() {
            $scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
            $scope.find();
            //console.log('search: ', $scope.SEARCH);
        });

        // Create new Costcenter
        $scope.create = function() {
            // Create new Costcenter object

            var costcenter = new Costcenters({
                name: this.name,
                description: this.description,
                category: this.category.value,
                category1: this.category1.id,
                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
            });

            // Redirect after save
            costcenter.$save(function(response) {
                //$location.path('costcenters/' + response._id);

                if (response._id) {
                    // agregar sub al array
                    var impuestoCompras = new Impuestos({
                        name: "IVA Compras",
                        type: "Default",
                        total: 0.0,
                        centroDeCosto: response._id,
                        month: (new Date()).getMonth(),
                        year: (new Date()).getFullYear()
                    });

                    var impuestoVentas = new Impuestos({
                        name: "IVA Ventas",
                        type: "Default",
                        total: 0.0,
                        centroDeCosto: response._id,
                        month: (new Date()).getMonth(),
                        year: (new Date()).getFullYear()
                    });

                    impuestoCompras.$save(function(response) {
                        console.log("Compras");
                        console.log(response);
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });

                    impuestoVentas.$save(function(response) {
                        console.log("Ventas");
                        console.log(response);
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });

                    costcenter._id = response._id;
                    $rootScope.costcenters.unshift(costcenter);

                }

                // Clear form fields
                $scope.name = '';
                $scope.description = '';


                $mdBottomSheet.hide();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        //abre modal para eliminar un centro de costo
        $scope.showConfirm = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Eliminar Centro de Costo')
                .content('¿Está seguro que desea eliminar este centro de costo?')
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

        // Remove existing Costcenter
        $scope.remove = function(costcenter) {
            if (costcenter) {
                costcenter.$remove();

                for (var i in $scope.costcenters) {
                    if ($scope.costcenters[i] === costcenter) {
                        $scope.costcenters.splice(i, 1);
                    }
                }
            } else {
                $scope.costcenter.$remove(function() {
                    $location.path('costcenters');
                });
            }
        };

        // Update existing Costcenter
        $scope.update = function() {
            var costcenter = $scope.costcenter;

            if (this.enterprise !== undefined) { costcenter.enterprise = this.enterprise._id } else { costcenter.enterprise = costcenter.enterprise._id }
            if (this.category !== undefined) { costcenter.category = this.category.value } else if ((costcenter.category !== undefined) && (costcenter.category !== null)) { costcenter.category = costcenter.category }
            if (this.category1 !== undefined) { costcenter.category1 = this.category1.id } else if ((costcenter.category1 !== undefined) && (costcenter.category1 !== null)) { costcenter.category1 = costcenter.category1 }
            costcenter.$update(function() {
                $location.path('centros-costo');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Costcenters
        $scope.find = function() {
            if ($scope.SEARCH !== undefined) { $rootScope.costcenters = Costcenters.query({ e: $scope.SEARCH.enterprise }); }
        };

        // Find a list of Enterprises
        $scope.findEnterprises = function() {
            if ($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise }); }

        };

        // Find a list of Enterprises
        $scope.findCategories = function() {
            if ($scope.SEARCH !== undefined) {
                $scope.categories = [
                    { name: 'Activo', value: 'activo' },
                    { name: 'Pasivo', value: 'pasivo' },
                    { name: 'Patrimonio Neto', value: 'patrimonio neto' },
                    { name: 'Negativo', value: 'negativo' },
                    { name: 'Ganancia', value: 'ganancia' }
                ];
            }

        };
        // Fills the select input list with categories
        $scope.findCategories2 = function() {
            Categories.query({ e: $scope.SEARCH.enterprise }, function(data) {
                $scope.categories2 = $filter('filter')(data, function(item) {
                    return item.type1 === 'Centro de Costo';
                });
                // Modal.setCategorias($scope.categories2);
            });
        };

        // Find existing Costcenter
        $scope.findOne = function() {
            $scope.costcenter = Costcenters.get({
                costcenterId: $stateParams.costcenterId
            });
            Categories.query({}, function(data) {
                $scope.relatedCategory = $filter('filter')(data, function(item) {
                    return item.id === $scope.costcenter.category1;
                })[0];
            });

        };
    }
]);