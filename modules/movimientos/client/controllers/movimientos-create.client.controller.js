'use strict';

// Finanzas controller
angular.module('movimientos').controller('MovimientosCreateController', ['user', 'movimiento', 'enterprises', 'modosFacturacion', '$state', 'movimientos',
	function(user, movimiento, enterprises, modosFacturacion, $state, movimientos) {

		// asignacion de modelos
		this.user = user;
		this.movimiento = movimiento;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new Comprobante
		function create () {
			// Create new Comprobante object
			var movimiento = new movimientos ({
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
			movimiento.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.movimientos');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}
]);
