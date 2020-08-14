'use strict';

// Comprobantes controller
angular.module('comprobantes').controller('ComprobantesCreateController', ['user', 'comprobante', 'enterprises', 'modosFacturacion', '$state', 'comprobantes',
	function(user, comprobante, enterprises, modosFacturacion, $state, comprobantes) {

		// asignacion de modelos
		this.user = user;
		this.comprobante = comprobante;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new Comprobante
		function create () {
			// Create new Comprobante object
			var comprobante = new comprobantes ({
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
			comprobante.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.comprobantes');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}
]);
