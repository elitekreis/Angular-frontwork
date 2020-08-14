'use strict';

// Comprobantes controller
angular.module('arqueos').controller('ListArqueosController', ['$location', 'user', 'arqueos', 'enterprises', '$mdDialog',
	function($location, user, arqueos, enterprises, $mdDialog) {

		// asignacion de modelos
		this.user = user;
		this.arqueos = arqueos;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.remove = remove;

		// definicion de funciones

		// Remove existing Comprobante
		function remove ( arqueo ) {
			if ( arqueo ) { arqueo.$remove();
			} else {
				this.arqueo.$remove(function() {
					$location.path('arqueos');
				});
			}
		};
	}
]);
