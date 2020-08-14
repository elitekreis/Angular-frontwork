'use strict';

// costosindirectos controller
angular.module('costosindirectos').controller('CostosIndirectosCreateController', ['$location', 'user',  '$mdDialog','CostosindirectosService',	'$state',
	function($location, user, $mdDialog, costosindirectosService, $state) {
		
		var centroId = localStorage.getItem("centroId");
		console.log(centroId);
		// asignacion de modelos
		this.user = user;
		// asignacion de funciones
		this.create = create;

		// definicion de funciones
		// Create new costosindirectos
		function create () {
			// Create new costosindirectos object
			var costosindirectos = new costosindirectosService ({
				name: this.name,
				descripcion: this.descripcion ? this.descripcion : undefined,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id,
				costcenters:centroId
			});

			// Redirect after save
			costosindirectos.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.costosIndirectos',{centroId:centroId});

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

	}]);

