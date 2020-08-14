'use strict';

// Comprobantes controller
angular.module('transferencias').controller('CreateTransferenciasController', ['user', 'transferencia', 'enterprises', '$state', 'transferencias',
	function(user, transferencia, enterprises, $state, transferencias) {

		// asignacion de modelos
		this.user = user;
		this.transferencia = transferencia;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new Comprobante
		function create () {
			// Create new Comprobante object
			var transferencia = new transferencias ({
				name: this.name,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id
			});

			// Redirect after save
			transferencia.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.transferencias');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}
]);
