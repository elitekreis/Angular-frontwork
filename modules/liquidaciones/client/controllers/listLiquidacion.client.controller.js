'use strict';

// Liquidaciones controller
angular.module('liquidaciones').controller('LiquidacionListController', ['$scope', '$http', '$stateParams', '$rootScope', '$mdDialog', '$state',
    function ($scope, $http, $stateParams, $rootScope, $mdDialog, $state) {

        $scope.centroDeCosto = $stateParams.centroDeCosto;
        $rootScope.empleadoId = $stateParams.empleadoId;

        $scope.findLiquidaciones = function() {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if (date && (date.month || date.year)) {
                $http.put('/api/liquidaciones', {
                    empleadoId: $stateParams.empleadoId,
                    month: date.month,
                    year: date.year
                }).success(function (response) {
                    $scope.liquidaciones = response;
                    $scope.name = $stateParams.displayName;
                });
            } else {
                $http.put('/api/liquidaciones', {
                    empleadoId: $stateParams.empleadoId
                }).success(function (response) {
                    $scope.liquidaciones = response;
                    $scope.name = $stateParams.displayName;
                });
            }
        };

        $scope.findLiquidaciones();

        $scope.showAlert = function(ev, obs) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title(obs)
                    .ariaLabel('Alert Dialog Demo')
                    .targetEvent(ev)
                    .ok('Cerrar')
            );
        };

        $scope.openMenu = function($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        $scope.removeLiquidacion = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la liquidacion?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function () {
                $http.delete('/api/liquidaciones/' + item._id)
                    .then(function(res) {
                        $state.go('home.liquidaciones', {
                            empleadoId: $stateParams.empleadoId,
                            displayName: $stateParams.displayName,
                            centroDeCosto: $stateParams.centroDeCosto
                        });
                    }).catch(function (err) {
                        console.log(err);
                    });
            }, function () {
                console.log("Error in the liquidacion deletion");
            });
        };
    }
]);