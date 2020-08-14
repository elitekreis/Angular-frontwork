'use strict';

// Comprobantes controller
angular.module('comprobantes').controller('ComprobantesEditController', ['user', 'comprobante', 'enterprises', 'modosFacturacion', '$location',
	function(user, comprobante, enterprises, modosFacturacion, $location) {

		// asignacion de modelos
		this.user = user;
		this.comprobante = comprobante;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var comprobante = this.comprobante ;

			if (this.enterprise !== undefined) { comprobante.enterprise = this.enterprise._id } else { comprobante.enterprise = comprobante.enterprise._id };
			if (this.modoFacturacion !== undefined) { comprobante.modoFacturacion = this.modoFacturacion } else { comprobante.modoFacturacion = comprobante.modoFacturacion };

			// comprobante.$update(function() {
			// 	$location.path('comprobantes/view/' + comprobante._id);
			// }, function(errorResponse) {
			// 	this.error = errorResponse.data.message;
			// });
		};
	}
]);
