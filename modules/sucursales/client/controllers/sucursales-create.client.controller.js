'use strict';

// Comprobantes controller
angular.module('sucursales').controller('SucursalesCreateController', ['user', 'sucursal', 'enterprises', '$state', 'sucursales',
	function(user, sucursal, enterprises, $state, sucursales) {

		// asignacion de modelos
		this.user = user;
		this.sucursal = sucursal;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new sucursal
		function create () {
			// Create new sucursal object
			var sucursal = new sucursales ({
				name: this.name,
				descripcion: this.descripcion ? this.descripcion : undefined,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id
			});

			// Redirect after save
			sucursal.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.sucursales');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}
]);
