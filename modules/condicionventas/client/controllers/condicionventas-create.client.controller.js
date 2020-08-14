'use strict';

// condicionventas controller
angular.module('condicionventas').controller('CondicionventasCreateController', ['user', 'condicionventa', 'enterprises', '$state', 'condicionventas',
	function(user, condicionventa, enterprises, $state, condicionventas) {

		// asignacion de modelos
		this.user = user;
		this.condicionventa = condicionventa;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		
		// Create new condicionventa
		function create () {
			// Create new condicionventa object
			var condicionventa = new condicionventas ({
				name: this.name,
				description: this.description,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id,
			});

			// Redirect after save
			condicionventa.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.condicionVentas');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};
	}
]);