'use strict';

// Comprobantes controller
angular.module('arqueos').controller('ArqueosEditController', ['user', 'arqueo', 'enterprises', '$location',
	function(user, arqueo, enterprises, $location) {

		// asignacion de modelos
		this.user = user;
		this.arqueo = arqueo;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var arqueo = this.arqueo;

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
