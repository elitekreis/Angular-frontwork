'use strict';

// Comprobantes controller
angular.module('finanzas').controller('FinanzasEditController', ['user', 'finanza', 'enterprises', 'modosFacturacion', '$location',
	function(user, finanza, enterprises, modosFacturacion, $location) {

		// asignacion de modelos
		this.user = user;
		this.finanza = finanza;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var finanza = this.finanza ;

			if (this.enterprise !== undefined) { finanza.enterprise = this.enterprise._id } else { finanza.enterprise = finanza.enterprise._id };
			if (this.modoFacturacion !== undefined) { finanza.modoFacturacion = this.modoFacturacion } else { finanza.modoFacturacion = finanza.modoFacturacion };

			finanza.$update(function() {
				$location.path('finanzas/view/' + finanza._id);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};
	}
]);
