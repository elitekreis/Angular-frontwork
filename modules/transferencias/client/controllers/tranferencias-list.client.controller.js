'use strict';

// Comprobantes controller
angular.module('transferencias').controller('ListTransferenciasController', ['$location', 'user', 'transferencias', 'enterprises', '$mdDialog',
	function($location, user, transferencias, enterprises, $mdDialog) {

		// asignacion de modelos
		this.user = user;
		this.transferencias = transferencias;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.remove = remove;

		// definicion de funciones

		// Remove existing Comprobante
		function remove ( transferencia ) {
			if ( transferencia ) { transferencia.$remove();
			} else {
				this.transferencia.$remove(function() {
					$location.path('transferencias');
				});
			}
		};
	}
]);
