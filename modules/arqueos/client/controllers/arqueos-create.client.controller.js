'use strict';

// Comprobantes controller
angular.module('arqueos').controller('CreateArqueosController', ['user', 'arqueo', 'enterprises', '$state', 'arqueos',
	function(user, arqueo, enterprises, $state, arqueos) {

		// asignacion de modelos
		this.user = user;
		this.arqueo = arqueo;
		this.enterprises = enterprises;
		this.arqueos = arqueos;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new sucursal
		function create() {
			// Create new sucursal object
			var arqueo = new arqueos ({
				name: res,
				descripcion: this.descripcion,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id
			});

			arqueo.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.arqueos');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}
]);
