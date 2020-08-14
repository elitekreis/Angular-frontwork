'use strict';

angular.module('personas').controller('PersonasListController', ['$scope', 'Enterprises', 'Authentication', 'Users', '$timeout', 'ChangeStatusUserById', '$mdDialog', '$http', '$state',
    function ($scope, Enterprises, Authentication, Users, $timeout, ChangeStatusUserById, $mdDialog, $http, $state) {

        function init() {
            $scope.users = [];
            $scope.enterprises = [];
        }

        $scope.authentication = Authentication;

        $scope.$watchCollection('authentication', function () {
            if (Authentication.user) {
                $timeout(function () { //making sure service set the value
                    $scope.findUsers(null);
                }, 0)
            }
        });

        $scope.findEnterprises = function () {
            Enterprises.query({}, function (res) {
                $scope.enterprises = res || [];
            });
        };

        $scope.findUsers = function (enterprise) {
            if (Authentication.user.roles[0] === 'groso') {
                Users.query({e: enterprise}, function (res) {
                    $scope.users = res;
                })
            } else {
                if (Authentication.user.enterprise.enterprise) {
                    Users.query({e: Authentication.user.enterprise.enterprise}, function (res) {
                        $scope.users = res;
                    })
                } else {
                    $scope.users = [];
                }
            }
        }

        $scope.assignSwitchValue = function (item) {

            if (item.status === 'active') {
                $scope.cambiarEstado(item, 'active');
            } else {
                $scope.cambiarEstado(item, 'disabled');
            }
        };

        $scope.cambiarEstado = function (user, status, callback) {
            var id = user._id;
            var username = user.username;
            ChangeStatusUserById.query({userId: user._id, estado: status}, function () {
                if (callback) callback(); //if loader needed
            });
        };

        $scope.remove = function (event, item) {

            console.log(item);

            var confirm = $mdDialog.confirm();
            confirm
                .title('Eliminar Usuario')
                .content('¿Está seguro que desea eliminar este usuario?')
                .ariaLabel('Lucky day')
                .ok('Eliminar')
                .cancel('Cancelar')
                .targetEvent(event);

            $mdDialog.show(confirm).then(
                function () {
                    $scope.cambiarEstado(item, 'deleted', function () {
                        // loader might be needed
                        if(item.puesto) {
                            item.oldPuesto = item.puesto;
                        }
                        item.puesto = undefined;
                        item.deleted = true;

                        $http.put('/api/users', item).success(function () {
                            $state.reload();
                        }).error(function (err) {
                            // $scope.error = response.message;
                            console.log(err);
                        });

                        $scope.findUsers($scope.selectedEnterprice || null)
                    });
                }
            )
        };

        $scope.selectedNewEnterprice = function () {
            if ($scope.selectedEnterprice && $scope.selectedEnterprice._id) {
                $scope.findUsers($scope.selectedEnterprice._id)
            }
        };

        init();
    }
]);
