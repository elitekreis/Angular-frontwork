'use strict';

// Actividad controller
angular.module('actividades').controller('ActividadListController', ['$scope', '$http', '$stateParams', '$mdDialog', 'Empleados', 'Actividades',
    function ($scope, $http, $stateParams, $mdDialog, Empleados, Actividades) {
        $scope.centroDeCosto = $stateParams.centroDeCosto;

        $scope.findActividad = function () {
            $http.put('/api/actividades', {
                empleadoId: $stateParams.empleadoId
            }).success(function (response) {
                $scope.actividades = response;
                $scope.name = $stateParams.displayName;
            });
        };

        $scope.showObservacion = function(ev, obs) {
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

        $scope.showDialogActividad = function ($event) {
            Empleados.get({empleadoId: $stateParams.empleadoId}, function (response) {
                $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'modules/actividades/views/create-actividad.client.view.html',
                    locals: {
                        item: response
                    },
                    controller: DialogController
                })
            });
        };

        function DialogController($scope, $mdDialog, $state, item) {
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
                    $state.go('home.actividades', {empleadoId: item._id, displayName: item.userLogin.displayName}, {reload: true})
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };
        }
    }
]);