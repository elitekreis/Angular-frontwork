'use strict';

// Comprobantes controller
angular.module('sucursales').controller('SucursalesEditController', ['user', 'sucursal', 'enterprises', '$location',
	function(user, sucursal, enterprises, $location) {

		// asignacion de modelos
		this.user = user;
		this.sucursal = sucursal;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing Comprobante
		function update () {
			// console.log(this.comprobante.enterprise, 'ent');
			// console.log(this.comprobante, 'comp');
			var sucursal = this.sucursal ;

			if (this.enterprise !== undefined) { sucursal.enterprise = this.enterprise._id } else { sucursal.enterprise = sucursal.enterprise._id };
			if (this.modoFacturacion !== undefined) { sucursal.modoFacturacion = this.modoFacturacion } else { sucursal.modoFacturacion = sucursal.modoFacturacion };

			// comprobante.$update(function() {
			// 	$location.path('comprobantes/view/' + comprobante._id);
			// }, function(errorResponse) {
			// 	this.error = errorResponse.data.message;
			// });
		};
	}
]);
