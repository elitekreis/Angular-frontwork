'use strict';

// Comprobantes controller
angular.module('transferencias').controller('EditTransferenciasController', ['user', 'transferencia', 'enterprises', 'modosFacturacion', '$location',
	function(user, transferencia, enterprises, modosFacturacion, $location) {

		// asignacion de modelos
		this.user = user;
		this.transferencia = transferencia;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var transferencia = this.transferencia;

			if (this.enterprise !== undefined) { transferencia.enterprise = this.enterprise._id } else { transferencia.enterprise = transferencia.enterprise._id };
			if (this.modoFacturacion !== undefined) { transferencia.modoFacturacion = this.modoFacturacion } else { transferencia.modoFacturacion = comprobante.modoFacturacion };

			// comprobante.$update(function() {
			// 	$location.path('comprobantes/view/' + comprobante._id);
			// }, function(errorResponse) {
			// 	this.error = errorResponse.data.message;
			// });
		};
	}
]);
