'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication', '$q',
	function($scope, $http, $location, Users, Authentication, $q) {
		$scope.user = Authentication.user;

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.findOne = function(){
			console.log($stateParams);
			// Users.query({}, function(res){
			// $scope.users = res;
			// for(var i=0; i<$scope.users.length; i++){
			// 	if($scope.users[i]._id === $stateParams.personaId){
			// 		$scope.user = $scope.users[i];
			// 	}
			// };
			// });
		}
	}
])

.controller('EditUserController', ['$scope', '$http', '$location', 'Users', 'Authentication', '$stateParams', 'Puestos', '$rootScope', '$timeout', '$q',
	function($scope, $http, $location, Users, Authentication, $stateParams, Puestos, $rootScope, $timeout, $q) {

		$scope.roles = ['user', 'admin', 'rrhh', 'compras', 'ventas', 'produccion', 'cliente'];

		$scope.editadoOk = false;

		$scope.selectedMode = 'md-scale';
	    $scope.selectedDirection = 'up';
		// Update a user profile
		$scope.updateUserProfile = function() {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
				if (this.puesto !== undefined) { user.puesto = this.puesto._id; } else if ((user.puesto!==undefined)&&(user.puesto!==null)) { user.puesto = user.puesto._id};
				if (this.rol !== undefined) { user.roles[0] = this.rol; } else if ((user.roles[0]!==undefined)&&(user.roles[0]!==null)) { user.roles[0] = user.roles[0]};
				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
		};

		$scope.asignarUsuario = function(){
			Users.query({}, function(res){
				$scope.users = res;
				for(var i=0; i<$scope.users.length; i++){
					if($scope.users[i]._id === $stateParams.personaId){
						$scope.user = $scope.users[i];
					}
				};
			});
		};


		$scope.editarPuesto = function(){
			if (($scope.puesto !== undefined)&&($scope.puesto !== null)){
				var nuevoPuesto = $scope.puesto._id
			}
			else{
				if (($scope.user.puesto !== null)&&($scope.user.puesto !== undefined)){
					var nuevoPuesto = $scope.user.puesto._id;
				}
				else{
					var nuevoPuesto = undefined;
				}
			}
			if($scope.rol === undefined){
				var nuevoRol = $scope.user.roles[0];
			}
			else{
				var nuevoRol = $scope.rol;
			}
				if (($scope.user.observaciones !== null)&&($scope.user.observaciones !== undefined)){
					var nuevaObservacion = $scope.user.observaciones
				}
				else{
					var nuevaObservacion = undefined;
				}
			
			$http({ method: 'POST',
                url: ('/api/users/changePuesto'),
                params: { userId: $stateParams.personaId, puestoId: nuevoPuesto, rol: nuevoRol, obs: nuevaObservacion }
                })
			  	.then(function(response) {
                    $scope.user.observaciones = nuevaObservacion;
                    $scope.user.puesto = nuevoPuesto;
                    $scope.user.roles[0] = nuevoRol;
                    $scope.modoEdicion = false;
                    $scope.editadoOk = true;
                    $timeout(function(){$scope.editadoOk = false;}, 4000);
                }, function(response) {
                    console.log('error');
                });
		};

		// Find a list of Puestos
		$scope.findPuestos = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.puestos = Puestos.query({ e: $scope.SEARCH.enterprise }); }
		};

	}
]);
