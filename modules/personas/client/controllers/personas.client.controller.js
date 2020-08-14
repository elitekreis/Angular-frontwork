'use strict';

// Personas controller
angular.module('personas').controller('PersonasController', ['$scope', '$timeout', '$window', '$stateParams', 'FileUploader', '$location', 'Authentication', 'Contacts', 'Remuneraciones', 'Costcenters', '$rootScope', 'Users', '$http', 'Enterprises', 'ChangeStatusUserById', '$filter', 'Puestos', '$mdDialog', '$q',
    function ($scope, $timeout, $window, $stateParams, FileUploader, $location, Authentication, Contacts, Remuneraciones, Costcenters, $rootScope, Users, $http, Enterprises, ChangeStatusUserById, $filter, Puestos, $mdDialog, $q) {
        $scope.authentication = Authentication;
        $scope.costcenterId = $stateParams.centroDeCosto;
        $scope.empresa = '';
        $scope.rolesUser = ['compras', 'ventas'];
        $scope.roles = ['user', 'admin', 'rrhh', 'compras', 'ventas', 'produccion'];
        $scope.rolesGroso = ['user', 'admin', 'rrhh', 'compras', 'ventas', 'produccion', 'groso'];
        $scope.sTrue = true;
        $scope.sFalse = false;
        $scope.switch = [];
        $scope.modoEditar = [];
        $scope.totalRemuneracion = 0;
        $scope.addedRemuneraciones = [];
        $scope.puesto = undefined;
        $scope.puestoPersona = undefined;
        $scope.puestoDisabled = true;
        $scope.fechaDeEntrada = new Date();
        $scope.showAddRemuneracion = false;
        $scope.user = Authentication.user;
        $scope.imageURL = "modules/users/img/profile/default.png";

        $scope.password = {
            currentPassword: '',
            newPassword: '',
            verifyPassword: ''
        }

        // watch for SEARCH to update value
        $scope.$watchCollection('authentication', function () {
            $scope.contactosDisponibles = [];
            $scope.contactosDisponiblesFilter = [];
            $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
            $scope.findUsers();
            $scope.findCentros();
            $scope.findPuestos();
            $scope.findRemuneraciones();
        });

        $scope.$watchCollection('enterpriseS', function () {
            $scope.findUsers();
        });

        $scope.$watchCollection('empresa', function () {
            $scope.findContacts($scope.empresa);
        });

        function arrContains(array, value) {
            for (var j = 0; j < array.length; j++) {
                if (array[j].email === value) {
                    return true;
                }
            }
            return false;
        }

        $scope.asignaPuesto = function (puesto) {
            $scope.puesto = puesto;
        };

        $scope.asignaRemuneracion = function (remuneracion) {
            $scope.showAddRemuneracion = remuneracion != null;
            $scope.remuneracion = remuneracion;
        };

        $scope.addRemuneracion = function (remuneracion) {
            remuneracion.total = $scope.totalRemuneracion;
            $scope.modoEditar.push(false);

            // If the remuneracion is not our list we add it
            if(!checkIfAlreadyIn(remuneracion)) {
                $scope.addedRemuneraciones.push(remuneracion);
            }

            $scope.totalRemuneracion = 0;
            $scope.showAddRemuneracion = false;
        };

        // Check if remuneracion is already in our list
        var checkIfAlreadyIn = function(remuneracion) {
            for(var i = 0; i < $scope.addedRemuneraciones.length; i++) {
                if($scope.addedRemuneraciones[i]._id == remuneracion._id) {
                    return true;
                }
            }

            return false;
        };

        $scope.editTrue = function(index) {
            $scope.modoEditar[index] = true;
        };

        $scope.updateP = function(index, p) {
            $scope.addedRemuneraciones[index].total = p.total;
            $scope.modoEditar[index] = false;
        };

        $scope.eliminarProducto = function(index) {
            $scope.addedRemuneraciones.splice(index, 1);
        };


        $scope.asignaCentro = function (centro) {
            $scope.centroDeCosto = centro;
            $scope.puestoDisabled = false;
        };

        // Create file uploader instance
        $scope.uploader = new FileUploader({
            url: 'api/users/picture'
        });

        // Set file uploader image filter
        $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function (item) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // Called after the user selected a new picture file
        $scope.uploadwait=false;// falso el boton funciona nada pasa
        $scope.uploader.onAfterAddingFile = function (fileItem) {
            $scope.uploadwait=true;//empieza la carga
            if ($window.FileReader) {
                var fileReader = new FileReader();
                fileReader.onload = function (fileReaderEvent) {
                    $timeout(function () {
                        var oldImageUrl = $scope.imageURL
                        $scope.imageURL = fileReaderEvent.target.result;
                        if($scope.imageURL != oldImageUrl){
                            $scope.uploadwait=false;
                        };
                    }, 0);
                };

                fileReader.readAsDataURL(fileItem._file);
            }
        };

        // Called after the user has successfully uploaded a new picture
        $scope.uploader.onSuccessItem = function () {
            // Show success message
            $scope.success = true;
            // Clear upload buttons
            $scope.cancelUpload();
        };

        // Called after the user has failed to uploaded a new picture
        $scope.uploader.onErrorItem = function (fileItem, response) {
            // Clear upload buttons
            $scope.cancelUpload();

            // Show error message
            $scope.error = response.message;
        };

        // Change user profile picture
        $scope.uploadProfilePicture = function () {
            // Clear messages
            console.log('image upload fired!');
            $scope.success = $scope.error = null;

            // Start upload
            $scope.uploader.uploadAll();
        };

        // Cancel the upload process
        $scope.cancelUpload = function () {
            $scope.uploader.clearQueue();
            $scope.imageURL = $scope.contacto.profileImageURL;
        };

        $scope.updatePassword = function () {
            if ((($scope.user.roles.indexOf('groso') !== -1) || $scope.password.currentPassword) && $scope.password.newPassword && $scope.password.newPassword === $scope.password.verifyPassword) {
                console.log('update password') ///api/users/password'
                $http.post('api/users/password', $scope.password).success(
                    function (response) {
                        $scope.passwordChangeError = '';
                        $scope.passwordChangeSuccess = response.message;
                        console.log('response', response)
                    }
                ).error(
                    function (error) {
                        $scope.passwordChangeError = error.message;
                        $scope.passwordChangeSuccess = '';
                        console.log('ee', error)
                    }
                )
            }
        }

        $scope.create = function () {

            if ($scope.contacto !== undefined) {
                if ($scope.contacto.firstName !== undefined) {
                    if ($scope.contacto.lastName !== undefined) {
                        if ($scope.contacto.username !== undefined) {
                            if($scope.puestoPersona && $scope.puestoPersona.estado !== "Ocupado") {
                                var persona = new Users({
                                    firstName: $scope.contacto.firstName,
                                    lastName: $scope.contacto.lastName,
                                    email: $scope.contacto.email ? $scope.contacto.email : undefined,
                                    username: $scope.contacto.username,
                                    enterprise: $scope.SEARCH.enterprise,
                                    sueldo: $scope.contacto.sueldo,
                                    puesto: $scope.puesto ? $scope.puesto._id : undefined,
                                    centroDeCosto: $scope.centroDeCosto ? $scope.centroDeCosto._id : undefined,
                                    remuneraciones: $scope.addedRemuneraciones,
                                    cuit: $scope.contacto.cuit || undefined,
                                    telefono: $scope.contacto.telefono || undefined,
                                    fechaDeEntrada: $scope.fechaDeEntrada || undefined,
                                    roles: [$scope.rolePersona],
                                    observaciones: undefined,
                                    password: angular.lowercase(removeAccents($scope.contacto.firstName + $scope.contacto.lastName + 'pass'))
                                });


                                $http.post('/api/auth/signup', persona).success(function (response) {
                                    //remuevo el asignado a personal de los contactos disponibles
                                    for (var i = 0; i < $scope.contactosDisponibles.length; i++) {
                                        if ($scope.contactosDisponibles[i].email === persona.email) {
                                            $scope.contactosDisponibles.splice(i, 1);
                                        }
                                    }

                                    $scope.uploader.onBeforeUploadItem = function (fileItem) {
                                        fileItem.formData = [response];
                                    };

                                    $scope.users.push(persona);
                                    $scope.puestoPersona = undefined;
                                    $scope.uploadProfilePicture();
                                    
                                    $location.path('/empleados');
                                }).error(function (err) {
                                    // $scope.error = response.message;
                                    console.log(err);
                                });
                            } else {
                                $scope.errorPuesto = 'Puesto ocupado';
                            }
                        }
                        else {
                            $scope.errorUser = 'Debe indicar un nombre de usuario para el nuevo personal';
                        }
                    }
                    else {
                        $scope.errorApellido = 'Debe indicar el apellido del nuevo personal';
                    }
                }
                else {
                    $scope.errorName = 'Debe indicar el nombre del nuevo personal';
                }
            }
            else {
                $scope.error = 'Ingrese los datos para el nuevo personal';
            }
        };

        $scope.update = function() {
            if ($scope.contacto !== undefined) {
                if ($scope.contacto.firstName !== undefined) {
                    if ($scope.contacto.lastName !== undefined) {
                        if ($scope.contacto.username !== undefined) {
                            if($scope.contacto.puesto && $scope.contacto.puesto._id === $scope.puestoPersona._id || $scope.puestoPersona && $scope.puestoPersona.estado !== "Ocupado") {
                                $scope.contacto.oldPuesto = $scope.contacto.puesto;
                                $scope.contacto.centroDeCosto = $scope.centroDeCostoPersona;
                                $scope.contacto.puesto = $scope.puestoPersona;
                                $scope.contacto.fechaDeEntrada = $scope.fechaDeEntrada;
                                $scope.contacto.roles = [$scope.rolePersona];
                                $scope.remuneraciones = $scope.addedRemuneraciones;
                                if($scope.contacto.profileImageURL) {
                                    $scope.uploadProfilePicture();
                                }

                                $http.put('/api/users', $scope.contacto).success(function () {
                                    $location.path('/empleados/' + $scope.contacto.centroDeCosto._id);
                                }).error(function (err) {
                                    // $scope.error = response.message;
                                    console.log(err);
                                });
                            } else {
                                $scope.errorPuesto = 'Puesto ocupado';
                            }
                        }
                        else {
                            $scope.errorUser = 'Debe indicar un nombre de usuario para el nuevo personal';
                        }
                    }
                    else {
                        $scope.errorApellido = 'Debe indicar el apellido del nuevo personal';
                    }
                }
                else {
                    $scope.errorName = 'Debe indicar el nombre del nuevo personal';
                }
            }
            else {
                $scope.error = 'Ingrese los datos para el nuevo personal';
            }
        };

        $scope.borrarError = function () {
            $scope.msjError = undefined;
            $scope.error = undefined;
            $scope.errorName = undefined;
            $scope.errorApellido = undefined;
            $scope.errorUser = undefined;
        };

        // Remove existing Persona
        $scope.remove = function (persona) {
            if (persona) {
                persona.$remove();

                for (var i in $scope.personas) {
                    if ($scope.personas[i] === persona) {
                        $scope.personas.splice(i, 1);
                    }
                }
            } else {
                $scope.persona.$remove(function () {
                    $location.path('personas');
                });
            }
        };



        // Find a list of Personas
        $scope.find = function () {
            $scope.personas = Personas.query();
        };
        $scope.findRemuneraciones = function(){
            $http.post('/api/remuneraciones/' + $scope.addedRemuneraciones[0]._id).then(function (res) {

                if(res.deleted){

                    return false;

                }
                return true;
                
            }).error(function (err) {
                // $scope.error = response.message;
                console.log(err);
            });
        }
        // Find existing Persona
        $scope.findOne = function () {
            $http({
                method: 'GET',
                url: ('/api/users/byId'),
                params: {userId: $stateParams.personaId}
            }).then(function successCallback(res) {
                $scope.puestoDisabled = false;
                $scope.contacto = res.data;

                $scope.contacto.cuit = Number($scope.contacto.cuit);
                $scope.rolePersona = $scope.contacto.roles[0];
                $scope.fechaDeEntrada = $scope.contacto.fechaDeEntrada ? new Date($scope.contacto.fechaDeEntrada) : new Date($scope.contacto.created);
                $scope.centroDeCostoPersona = $scope.contacto.centroDeCosto || $scope.contacto.puesto.centroDeCosto;
                $scope.puestoPersona =  $scope.contacto.puesto;
                $scope.addedRemuneraciones = $scope.contacto.remuneraciones;
                $scope.modoEditar = new Array($scope.addedRemuneraciones.length).fill(false);
                $scope.imageURL = $scope.contacto.profileImageURL;
                $scope.contacto.sueldo = Number($stateParams.sueldo);
                var deleted = $scope.findRemuneraciones();
                $scope.uploader.formData = [$scope.contacto];


                $scope.addedRemuneraciones.forEach(function(element) {
                   
                    $http.post('/api/remuneraciones/' + element._id).success(
                        function (res) {
                            if(res.deleted){
                                element.deleted = true;
                            }
                            else{
                                element.deleted = false;
                             }
                            if(res.deleted){
                                $scope.addedRemuneraciones.deleted = true;
                                return false;
                            }
                            return true;
                        }

                    ).error(function (err) {
                            // $scope.error = response.message;
                            console.log(err);
                        });


                  });

                }, function errorCallback(err) {
                    console.log('Error' + err);
                })
        };



        $scope.findCentros = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.centrosDeCosto = Costcenters.query({e: $scope.SEARCH.enterprise});
                //$scope.puestoDisabled = true;
            }
        };

        $scope.findRemuneraciones = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.remuneraciones = Remuneraciones.query({e: $scope.SEARCH.enterprise});
            }
        };

        // Find a list of
        $scope.findEnterprises = function () {
            $scope.enterprises = Enterprises.query();
        };

        // Find a list of
        $scope.findPuestos = function () {
            if ($scope.SEARCH !== undefined) {
                $rootScope.puestos = Puestos.query({e: $scope.SEARCH.enterprise});
            }
        };

        $scope.findContacts = function () {
            if ($scope.SEARCH !== undefined) {
                $rootScope.contactos = Contacts.query({e: $scope.SEARCH.enterprise});
            }
        };


        // Find a list of Users
        $scope.findUsers = function () {
            if ($scope.authentication.user.roles[0] !== 'groso') {
                if ($scope.SEARCH !== undefined) {
                    if ($scope.SEARCH.enterprise !== undefined && $scope.SEARCH.enterprise !== null) {
                        Users.query({e: $scope.SEARCH.enterprise}, function (res) {
                            $rootScope.users = res;
                            for (var j = 0; j < $rootScope.users.length; j++) {
                                if ($rootScope.users[j].status === 'active') {
                                    $scope.switch[$rootScope.users[j]._id] = true;
                                } else {
                                    $scope.switch[$rootScope.users[j]._id] = false;
                                }
                            }
                            ;
                            Contacts.query({e: $scope.SEARCH.enterprise}, function (res) {
                                $rootScope.contacts = res;
                                for (var j = 0; j < $rootScope.contacts.length; j++) {
                                    if (!arrContains($rootScope.users, $rootScope.contacts[j].email)) {
                                        $scope.contactosDisponibles.push($rootScope.contacts[j]);
                                    }
                                    ;
                                }
                                ;
                                $scope.contactosDisponiblesFilter = $scope.contactosDisponibles;
                            }, function (error) {
                                // Error handler code
                            });
                        }, function (error) {
                            // Error handler code
                        });
                    } else {
                        console.log('[+] el usuario no tiene empresa');
                        $rootScope.users = [];
                    }

                }
            } else {
                if ($scope.enterpriseS !== undefined && $scope.enterpriseS !== null) {
                    Users.query({e: $scope.enterpriseS._id}, function (res) {
                        $rootScope.users = res;
                        for (var j = 0; j < $rootScope.users.length; j++) {
                            if ($rootScope.users[j].status === 'active') {
                                $scope.switch[$rootScope.users[j]._id] = true;
                            } else {
                                $scope.switch[$rootScope.users[j]._id] = false;
                            }
                        }
                        ;
                        Contacts.query({e: $scope.enterpriseS._id}, function (res) {
                            $rootScope.contacts = res;
                            //me quedo con los contactos q aun no han sido asignados a personal
                            for (var j = 0; j < $rootScope.contacts.length; j++) {
                                if (!arrContains($rootScope.users, $rootScope.contacts[j].email)) {
                                    $scope.contactosDisponibles.push($rootScope.contacts[j]);
                                }
                                ;
                            }
                            ;
                            $scope.contactosDisponiblesFilter = $scope.contactosDisponibles;
                        }, function (error) {
                            // Error handler code
                        });
                    }, function (error) {
                        // Error handler code
                    });
                } else {
                    // console.log('[+] no seleccionó una empresa');
                    $rootScope.users = [];
                }

            }
        };

        $scope.findContacts = function (emp) {
            if (emp !== undefined) {
                Users.query({e: emp._id}, function (res) {
                    $rootScope.users = res;
                    for (var j = 0; j < $rootScope.users.length; j++) {
                        if ($rootScope.users[j].status === 'active') {
                            $scope.switch[$rootScope.users[j]._id] = true;
                        } else {
                            $scope.switch[$rootScope.users[j]._id] = false;
                        }
                    }
                    ;
                    Contacts.query({e: emp._id}, function (res) {
                        $rootScope.contacts = res;
                        //me quedo con los contactos q aun no han sido asignados a personal
                        for (var j = 0; j < $rootScope.contacts.length; j++) {
                            if (!arrContains($rootScope.users, $rootScope.contacts[j].email)) {
                                $scope.contactosDisponibles.push($rootScope.contacts[j]);
                            }
                            ;
                        }
                        ;
                        $scope.contactosDisponiblesFilter = $scope.contactosDisponibles;
                    }, function (error) {
                        // Error handler code
                    });
                }, function (error) {
                    // Error handler code
                });
            }
        };

        //autocomplete
        $scope.searchText = null;

        //borro el contacto seleccionado de la lista de contactos porque el mismo no puede ser su superior
        $scope.seleccionoContacto = function () {
            var index = $rootScope.contacts.indexOf($scope.contacto);
            $rootScope.contacts.splice(index, 1);
            Users.query({}, function (res) {
                var b = false;
                for (var j = 0; j < res.length; j++) {
                    if (res[j].username ===
                        angular.lowercase($scope.contacto.firstName +
                            '.' + $scope.contacto.lastName).split(' ').join('')) {
                        b = true;
                        console.log('existe uno igual');
                    }
                }
                if (b === false) {
                    $scope.contacto.username = angular.lowercase($scope.contacto.firstName +
                        '.' + $scope.contacto.lastName).split(' ').join('');
                } else {
                    $scope.contacto.username = angular.lowercase($scope.contacto.firstName +
                        '.' + $scope.contacto.lastName + Math.floor((Math.random() * 6) + 1)).split(' ').join('');
                }
            }, function (error) {

            });
        };

        $scope.assignSwitchValue = function (item) {
            if (item.status === 'active') {
                $scope.switch[item._id] = false;
                $scope.cambiarEstado(item, 'disabled');
            } else {
                $scope.switch[item._id] = true;
                $scope.cambiarEstado(item, 'active');
            }
        };


        //modal para confirmacion de activar/desactivar usuario
        $scope.showConfirm = function (ev, item, n) {
            var confirm = $mdDialog.confirm();
            switch (n) {
                case 1:
                    confirm
                        .title('Activar Usuario')
                        .content('¿Está seguro que desea activar este usuario?')
                        .ariaLabel('Lucky day')
                        .ok('Activar')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        $scope.cambiarEstado(item, 'active');
                    }, function () {
                        console.log('cancelaste activar');
                    });
                    break;
                case 2:
                    confirm
                        .title('Desactivar Usuario')
                        .content('¿Está seguro que desea desactivar este usuario?')
                        .ariaLabel('Lucky day')
                        .ok('Desactivar')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        $scope.cambiarEstado(item, 'disabled');
                    }, function () {
                        console.log('cancelaste desactivar');
                    });
                    break;
                case 3:
                    confirm
                        .title('Eliminar Usuario')
                        .content('¿Está seguro que desea eliminar este usuario?')
                        .ariaLabel('Lucky day')
                        .ok('Eliminar')
                        .cancel('Cancelar')
                        .targetEvent(ev);
                    $mdDialog.show(confirm).then(function () {
                        $scope.cambiarEstado(item, 'deleted');
                    }, function () {
                        console.log('cancelaste desactivar');
                    });
                    break;
            }
        };

        $scope.cambiarEstado = function (user, status) {
            var id = user._id;
            var username = user.username;
            ChangeStatusUserById.query({userId: id, estado: status}, function () {
            });
            user.status = status;
            if (user.status === 'active') {
                $scope.switch[user._id] = true;
            } else {
                $scope.switch[user._id] = false;
            }
        };

        //AUTOCOMPLETE

        //el texto ingresado
        $scope.searchText = null;

        /**
         * Create filter function for a query string
         */
        //filtro el arreglo de usuarios disponibles con los que coincidan con text
        $scope.searchTextChange = function (text) {
            var lowercaseQuery = angular.lowercase(text);
            $scope.contactosDisponiblesFilter = $filter('filter')($scope.contactosDisponibles, {displayName: text});
        };

        $scope.showAdvancedContact = function (ev) {
            $scope.searchText = undefined;
            $mdDialog.show({
                controller: FormContactCtr,
                //controllerAs: 'vm',
                templateUrl: '/modules/personas/views/create-contact-modal.client.view.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });

            function FormContactCtr($scope, $mdDialog, Contacts) {

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.create = function () {
                    var latitud = $scope.place.geometry.location.lat();
                    var longitud = $scope.place.geometry.location.lng();
                    // Create new Contact object
                    var contact = new Contacts({
                        firstName: $scope.firstName,
                        lastName: $scope.lastName,
                        email: $scope.email,
                        address: $scope.address,
                        city: $scope.city,
                        region: $scope.region ? $scope.region : undefined,
                        country: $scope.country,
                        phone: $scope.phone,
                        loc: [latitud, longitud],
                        //fax: this.fax,
                        web: $scope.web,
                        postalCode: $scope.postalCode,
                        status: 'active',
                        enterprise: $scope.enterprise ? $scope.enterprise._id : $parent.SEARCH.enterprise //,
                        //sub: this.sub._id

                    });

                    // Redirect after save
                    contact.$save(function (response) {
                        //$location.path('contacts/' + response._id);
                        if (response._id) {
                            // agregar sub al array

                            contact._id = response._id;
                            $rootScope.contacts.unshift(contact);

                        }

                        //$state.go('home.contacts');

                        // Clear form fields
                        $scope.firstName = '';
                        $scope.lastName = '';
                        $scope.email = '';
                        $scope.address = '';
                        $scope.city = '';
                        $scope.region = '';
                        $scope.country = '';
                        $scope.phone = '';
                        $scope.fax = '';
                        $scope.web = '';
                        $scope.postalCode = '';


                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                };
            }

            $scope.types = "['address']";

            $scope.placeChanged = function () {
                console.log('the place is now: ', this.getPlace());
                //$scope.place = this.getPlace();
            };
        };

        var characterMap = {
            "À": "A",
            "Á": "A",
            "Â": "A",
            "Ã": "A",
            "Ä": "A",
            "Å": "A",
            "Ấ": "A",
            "Ắ": "A",
            "Ẳ": "A",
            "Ẵ": "A",
            "Ặ": "A",
            "Æ": "AE",
            "Ầ": "A",
            "Ằ": "A",
            "Ȃ": "A",
            "Ç": "C",
            "Ḉ": "C",
            "È": "E",
            "É": "E",
            "Ê": "E",
            "Ë": "E",
            "Ế": "E",
            "Ḗ": "E",
            "Ề": "E",
            "Ḕ": "E",
            "Ḝ": "E",
            "Ȇ": "E",
            "Ì": "I",
            "Í": "I",
            "Î": "I",
            "Ï": "I",
            "Ḯ": "I",
            "Ȋ": "I",
            "Ð": "D",
            "Ñ": "N",
            "Ò": "O",
            "Ó": "O",
            "Ô": "O",
            "Õ": "O",
            "Ö": "O",
            "Ø": "O",
            "Ố": "O",
            "Ṍ": "O",
            "Ṓ": "O",
            "Ȏ": "O",
            "Ù": "U",
            "Ú": "U",
            "Û": "U",
            "Ü": "U",
            "Ý": "Y",
            "à": "a",
            "á": "a",
            "â": "a",
            "ã": "a",
            "ä": "a",
            "å": "a",
            "ấ": "a",
            "ắ": "a",
            "ẳ": "a",
            "ẵ": "a",
            "ặ": "a",
            "æ": "ae",
            "ầ": "a",
            "ằ": "a",
            "ȃ": "a",
            "ç": "c",
            "ḉ": "c",
            "è": "e",
            "é": "e",
            "ê": "e",
            "ë": "e",
            "ế": "e",
            "ḗ": "e",
            "ề": "e",
            "ḕ": "e",
            "ḝ": "e",
            "ȇ": "e",
            "ì": "i",
            "í": "i",
            "î": "i",
            "ï": "i",
            "ḯ": "i",
            "ȋ": "i",
            "ð": "d",
            "ñ": "n",
            "ò": "o",
            "ó": "o",
            "ô": "o",
            "õ": "o",
            "ö": "o",
            "ø": "o",
            "ố": "o",
            "ṍ": "o",
            "ṓ": "o",
            "ȏ": "o",
            "ù": "u",
            "ú": "u",
            "û": "u",
            "ü": "u",
            "ý": "y",
            "ÿ": "y",
            "Ā": "A",
            "ā": "a",
            "Ă": "A",
            "ă": "a",
            "Ą": "A",
            "ą": "a",
            "Ć": "C",
            "ć": "c",
            "Ĉ": "C",
            "ĉ": "c",
            "Ċ": "C",
            "ċ": "c",
            "Č": "C",
            "č": "c",
            "C̆": "C",
            "c̆": "c",
            "Ď": "D",
            "ď": "d",
            "Đ": "D",
            "đ": "d",
            "Ē": "E",
            "ē": "e",
            "Ĕ": "E",
            "ĕ": "e",
            "Ė": "E",
            "ė": "e",
            "Ę": "E",
            "ę": "e",
            "Ě": "E",
            "ě": "e",
            "Ĝ": "G",
            "Ǵ": "G",
            "ĝ": "g",
            "ǵ": "g",
            "Ğ": "G",
            "ğ": "g",
            "Ġ": "G",
            "ġ": "g",
            "Ģ": "G",
            "ģ": "g",
            "Ĥ": "H",
            "ĥ": "h",
            "Ħ": "H",
            "ħ": "h",
            "Ḫ": "H",
            "ḫ": "h",
            "Ĩ": "I",
            "ĩ": "i",
            "Ī": "I",
            "ī": "i",
            "Ĭ": "I",
            "ĭ": "i",
            "Į": "I",
            "į": "i",
            "İ": "I",
            "ı": "i",
            "Ĳ": "IJ",
            "ĳ": "ij",
            "Ĵ": "J",
            "ĵ": "j",
            "Ķ": "K",
            "ķ": "k",
            "Ḱ": "K",
            "ḱ": "k",
            "K̆": "K",
            "k̆": "k",
            "Ĺ": "L",
            "ĺ": "l",
            "Ļ": "L",
            "ļ": "l",
            "Ľ": "L",
            "ľ": "l",
            "Ŀ": "L",
            "ŀ": "l",
            "Ł": "l",
            "ł": "l",
            "Ḿ": "M",
            "ḿ": "m",
            "M̆": "M",
            "m̆": "m",
            "Ń": "N",
            "ń": "n",
            "Ņ": "N",
            "ņ": "n",
            "Ň": "N",
            "ň": "n",
            "ŉ": "n",
            "N̆": "N",
            "n̆": "n",
            "Ō": "O",
            "ō": "o",
            "Ŏ": "O",
            "ŏ": "o",
            "Ő": "O",
            "ő": "o",
            "Œ": "OE",
            "œ": "oe",
            "P̆": "P",
            "p̆": "p",
            "Ŕ": "R",
            "ŕ": "r",
            "Ŗ": "R",
            "ŗ": "r",
            "Ř": "R",
            "ř": "r",
            "R̆": "R",
            "r̆": "r",
            "Ȓ": "R",
            "ȓ": "r",
            "Ś": "S",
            "ś": "s",
            "Ŝ": "S",
            "ŝ": "s",
            "Ş": "S",
            "Ș": "S",
            "ș": "s",
            "ş": "s",
            "Š": "S",
            "š": "s",
            "Ţ": "T",
            "ţ": "t",
            "ț": "t",
            "Ț": "T",
            "Ť": "T",
            "ť": "t",
            "Ŧ": "T",
            "ŧ": "t",
            "T̆": "T",
            "t̆": "t",
            "Ũ": "U",
            "ũ": "u",
            "Ū": "U",
            "ū": "u",
            "Ŭ": "U",
            "ŭ": "u",
            "Ů": "U",
            "ů": "u",
            "Ű": "U",
            "ű": "u",
            "Ų": "U",
            "ų": "u",
            "Ȗ": "U",
            "ȗ": "u",
            "V̆": "V",
            "v̆": "v",
            "Ŵ": "W",
            "ŵ": "w",
            "Ẃ": "W",
            "ẃ": "w",
            "X̆": "X",
            "x̆": "x",
            "Ŷ": "Y",
            "ŷ": "y",
            "Ÿ": "Y",
            "Y̆": "Y",
            "y̆": "y",
            "Ź": "Z",
            "ź": "z",
            "Ż": "Z",
            "ż": "z",
            "Ž": "Z",
            "ž": "z",
            "ſ": "s",
            "ƒ": "f",
            "Ơ": "O",
            "ơ": "o",
            "Ư": "U",
            "ư": "u",
            "Ǎ": "A",
            "ǎ": "a",
            "Ǐ": "I",
            "ǐ": "i",
            "Ǒ": "O",
            "ǒ": "o",
            "Ǔ": "U",
            "ǔ": "u",
            "Ǖ": "U",
            "ǖ": "u",
            "Ǘ": "U",
            "ǘ": "u",
            "Ǚ": "U",
            "ǚ": "u",
            "Ǜ": "U",
            "ǜ": "u",
            "Ứ": "U",
            "ứ": "u",
            "Ṹ": "U",
            "ṹ": "u",
            "Ǻ": "A",
            "ǻ": "a",
            "Ǽ": "AE",
            "ǽ": "ae",
            "Ǿ": "O",
            "ǿ": "o",
            "Þ": "TH",
            "þ": "th",
            "Ṕ": "P",
            "ṕ": "p",
            "Ṥ": "S",
            "ṥ": "s",
            "X́": "X",
            "x́": "x",
            "Ѓ": "Г",
            "ѓ": "г",
            "Ќ": "К",
            "ќ": "к",
            "A̋": "A",
            "a̋": "a",
            "E̋": "E",
            "e̋": "e",
            "I̋": "I",
            "i̋": "i",
            "Ǹ": "N",
            "ǹ": "n",
            "Ồ": "O",
            "ồ": "o",
            "Ṑ": "O",
            "ṑ": "o",
            "Ừ": "U",
            "ừ": "u",
            "Ẁ": "W",
            "ẁ": "w",
            "Ỳ": "Y",
            "ỳ": "y",
            "Ȁ": "A",
            "ȁ": "a",
            "Ȅ": "E",
            "ȅ": "e",
            "Ȉ": "I",
            "ȉ": "i",
            "Ȍ": "O",
            "ȍ": "o",
            "Ȑ": "R",
            "ȑ": "r",
            "Ȕ": "U",
            "ȕ": "u",
            "B̌": "B",
            "b̌": "b",
            "Č̣": "C",
            "č̣": "c",
            "Ê̌": "E",
            "ê̌": "e",
            "F̌": "F",
            "f̌": "f",
            "Ǧ": "G",
            "ǧ": "g",
            "Ȟ": "H",
            "ȟ": "h",
            "J̌": "J",
            "ǰ": "j",
            "Ǩ": "K",
            "ǩ": "k",
            "M̌": "M",
            "m̌": "m",
            "P̌": "P",
            "p̌": "p",
            "Q̌": "Q",
            "q̌": "q",
            "Ř̩": "R",
            "ř̩": "r",
            "Ṧ": "S",
            "ṧ": "s",
            "V̌": "V",
            "v̌": "v",
            "W̌": "W",
            "w̌": "w",
            "X̌": "X",
            "x̌": "x",
            "Y̌": "Y",
            "y̌": "y",
            "A̧": "A",
            "a̧": "a",
            "B̧": "B",
            "b̧": "b",
            "Ḑ": "D",
            "ḑ": "d",
            "Ȩ": "E",
            "ȩ": "e",
            "Ɛ̧": "E",
            "ɛ̧": "e",
            "Ḩ": "H",
            "ḩ": "h",
            "I̧": "I",
            "i̧": "i",
            "Ɨ̧": "I",
            "ɨ̧": "i",
            "M̧": "M",
            "m̧": "m",
            "O̧": "O",
            "o̧": "o",
            "Q̧": "Q",
            "q̧": "q",
            "U̧": "U",
            "u̧": "u",
            "X̧": "X",
            "x̧": "x",
            "Z̧": "Z",
            "z̧": "z",
            " ": ""
        };

        var chars = Object.keys(characterMap).join('|');
        var allAccents = new RegExp(chars, 'g');
        var firstAccent = new RegExp(chars, '');

        var removeAccents = function (string) {
            return string.replace(allAccents, function (match) {
                return characterMap[match]
            })
        }

        //end controller
    }
])
// .service('dataService', function($http) {
//     this.helloWorld = function() {
//       console.log("This is a dataService method!");
//     };
  
//     this.getTodos = function(callbackArg){
//       $http.get('mock/todos.json').then(callbackArg);
//     };
//   });