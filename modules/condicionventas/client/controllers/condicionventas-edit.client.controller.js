'use strict';

// condicionventas controller
angular.module('condicionventas').controller('CondicionventasEditController', ['user', 'condicionventa', 'enterprises', '$state',
	function(user, condicionventa, enterprises, $state) {

		// asignacion de modelos
		this.user = user;
		this.condicionventa = condicionventa;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.update = update;

		// definicion de funciones
		// Update existing condicionventa
		function update () {
			var condicionventa = this.condicionventa ;

			if (this.enterprise !== undefined) { condicionventa.enterprise = this.enterprise._id } else { condicionventa.enterprise = condicionventa.enterprise._id };

			condicionventa.$update(function() {
				$state.go('home.condicionVentas');
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};
	}
]);
