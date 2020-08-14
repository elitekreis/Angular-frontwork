'use strict';

// Comprobantes controller
angular.module('finanzas').controller('FinanzasCreateController', ['user', 'finanza', 'enterprises', '$state', 'finanzas',
	function(user, finanza, enterprises, $state, finanzas) {

		// asignacion de modelos
		this.user = user;
		this.finanza = finanza;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new finanza
		function create () {
			// Create new finanza object
			var finanza = new finanzas ({
				name: this.name,
				letra: this.letra,
				puntoDeVenta: this.puntoDeVenta,
				modoFacturacion: this.modo,
				movimientoStock: this.movimientoStock,
				movimientoCC: this.movimientoCC,
				movimientoOperacionInversa: this.movimientoOperacionInversa,
				funcionalidadSituacion: this.funcionalidadSituacion,
				autoAprobar: this.autoAprobar,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id,
			});

			// Redirect after save
			finanza.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.finanzas');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}
]);
