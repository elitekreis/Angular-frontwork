'use strict';

// Comprobantes controller
angular.module('movimientos').controller('MovimientoEditController', ['user', 'movimiento', 'enterprises', 'modosFacturacion', '$location',
	function(user, movimiento, enterprises, modosFacturacion, $location) {

		// asignacion de modelos
		this.user = user;
		this.movimiento = movimiento;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var movimiento = this.movimiento ;

			if (this.enterprise !== undefined) { movimiento.enterprise = this.enterprise._id } else { movimiento.enterprise = movimiento.enterprise._id };
			if (this.modoFacturacion !== undefined) { movimiento.modoFacturacion = this.modoFacturacion } else { movimiento.modoFacturacion = movimiento.modoFacturacion };

			movimiento.$update(function() {
				$location.path('movimientos/view/' + movimiento._id);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};
	}
]);
