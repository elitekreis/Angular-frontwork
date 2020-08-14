'use strict';

// Comprobantes controller
angular.module('sucursales').controller('SucursalesListController', ['$location', 'user', 'sucursales', 'enterprises', '$mdDialog', 'cajas', 'ServiceNavigation',
    function($location, user, sucursales, enterprises, $mdDialog, cajas, ServiceNavigation) {

        // asignacion de modelos
        this.user = user;
        this.sucursales = sucursales;
        this.enterprises = enterprises;
        this.sucuraleId = undefined;

        // asignacion de funciones
        this.showConfirm = showConfirm;
        this.editingCaja = editingCaja;
        this.editSucursal = editSucursal;
        this.findUsuarios = findUsuarios;

        this.findUsuarios(cajas);

        // definicion de funciones
        function findUsuarios(cajas) {
            if ((this.user.roles[0] !== 'admin') && (this.user.roles[0] !== 'groso')) {
                this.sucuraleId = "";
                cajas.$promise.then(angular.bind(this, function(data) {
                    for (var i in data) {
                        if (!data[i].deleted && data[i].puestos !== undefined) {
                            if (data[i].puestos.length !== 0) {
                                console.log(data[i].puestos);
                                for (var j in data[i].puestos) {
                                    if (data[i].puestos[j]._id === user.puesto) {
                                        this.sucuraleId = data[i].sucursal;
                                    }
                                }
                            }
                        }
                    }
                }));
            } else {
                this.arrayCajas = cajas;
            }
        };

         //it initializes and gets the current name of inner page in view.
        ServiceNavigation.navInit();
        this.getName = function(name) {           
            ServiceNavigation.addNav({name:name});
        }

        // Remove existing Comprobante
        function showConfirm(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la sucursal?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                deleteSucursal(item);
            }, function() {
                //cancelo
            });
        };

        function deleteSucursal(item) {
            if (item) {
                item.$remove();

                for (var i in sucursales) {
                    if (sucursales[i] === item) {
                        deleteCajas(sucursales[i].cajas);
                        sucursales.splice(i, 1);
                    }
                }
            } else {
                sucursales.$remove(function() {});
            }
        };

        function deleteCajas(item) {
            for (var i in item) {
                if (item[i]) {

                    for (var i in cajas) {
                        if (cajas[i]._id === item[i]) {
                            cajas.splice(i, 1);
                        }
                    }
                } else {
                    cajas.$remove(function() {

                    });
                }
            }

        };
        //habilito edicion
        function editingCaja(item) {
            this.editing = item;
        };

        //edita nombre de la caja
        function editSucursal(item) {
            this.editing = false;
            item.enterprise = item.enterprise._id;
            for (var i in item.cajas) {
                item.cajas[i] = item.cajas[i]._id;
            };
            item.$update(function() {
                console.log('todo ok');
            }, function(errorResponse) {
                console.log('error');
            });
        };
    }
]);