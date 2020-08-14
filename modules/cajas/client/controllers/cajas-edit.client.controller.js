'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasEditController', ['user', 'caja', 'enterprises', '$location',
	function(user, caja, enterprises, $location) {

		// asignacion de modelos
		this.user = user;
		this.caja = caja;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var caja = this.caja;

			if (this.enterprise !== undefined) { caja.enterprise = this.enterprise._id } else { caja.enterprise = caja.enterprise._id };
			if (this.modoFacturacion !== undefined) { caja.modoFacturacion = this.modoFacturacion } else { caja.modoFacturacion = sucursal.modoFacturacion };

			// comprobante.$update(function() {
			// 	$location.path('comprobantes/view/' + comprobante._id);
			// }, function(errorResponse) {
			// 	this.error = errorResponse.data.message;
			// });
		};
	}
]);
