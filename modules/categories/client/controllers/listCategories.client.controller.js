'use strict';

// Comprobantes controller
angular.module('categories').controller('CategoriesListController', ['$rootScope', 'user', 'categories', 'enterprises', '$mdBottomSheet', '$mdDialog', 'categoryTypes', '$state',
    function ($rootScope, user, categories, enterprises, $mdBottomSheet, $mdDialog, categoryTypes, $state) {

        // asignacion de modelos
        this.user = user;
        this.categories = categories;
        this.enterprises = enterprises;
        this.categoryTypes = categoryTypes;

        // asignacion de funciones
        this.showBottomSheet = showBottomSheet;
        // this.remove = remove;

        // definicion de funciones
        function showBottomSheet($event, item, model, param) {
            var template = '/modules/core/views/menu-opciones.client.view.html';
            $rootScope.currentItem = item;
            $rootScope.currentModel = model;
            $rootScope.currentParam = param;
            $mdBottomSheet.show({
                controller: DialogController,
                templateUrl: template,
                // controller: 'ListBottomSheetCtrl',
                targetEvent: $event,
                resolve: {
                    item: function () {
                        return item;
                    }
                }

            }).then(function (clickedItem) {
                //$mdBottomSheet.hide();
                // console.log('por aqui ando');
            });
        } //end showBottomSheet

        function DialogController($scope, $mdDialog, item, Areas) {

            $scope.item = item;

            $scope.goto = function (state, params) {
                if (state !== undefined) {
                    $state.go(state, params);
                    $mdBottomSheet.hide();
                }
            }; //end goTo

            //abre modal para eliminar una categoria
            $scope.showConfirm = function (ev, item) {
                var confirm = $mdDialog.confirm()
                    .title('Eliminar Categoría')
                    .content('¿Está seguro que desea eliminar esta categoría?')
                    .ariaLabel('Lucky day')
                    .ok('Eliminar')
                    .cancel('Cancelar')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {
                    remove(item);
                }, function () {
                    $mdBottomSheet.hide();
                });
            }; //end showConfirm

            // Remove existing Category
            function remove(category) {
                if (category) {
                    category.$remove();

                } else {
                    this.category.$remove(function () {
                    });
                }
                $mdBottomSheet.hide();
            } //end remove

        } //end DialogController

    } //end function
]);