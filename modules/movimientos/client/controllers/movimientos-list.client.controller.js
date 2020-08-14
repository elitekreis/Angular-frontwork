'use strict';

// Comprobantes controller
angular.module('movimientos').controller('ListMovimientosController', ['$location', 'user', 'movimientos', 'enterprises',
	function($location, user, movimientos, enterprises) {

		// asignacion de modelos
		this.user = user;
		this.movimientos = movimientos;
		this.enterprises = enterprises;
		// asignacion de funciones
		this.remove = remove;

		// definicion de funciones

		// Remove existing Comprobante
		function remove ( movimiento ) {
			if ( movimiento ) { movimiento.$remove();
			} else {
				this.movimiento.$remove(function() {
					$location.path('movimientos');
				});
			}
		};
	}
]);
