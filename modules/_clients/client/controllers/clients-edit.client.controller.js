'use strict';

// condicionventas controller
angular.module('clients').controller('ClientsEditController', ['$state', '$scope', 'user', 'clientes', 'client', 'enterprises', 'uens', 'condicionventas', 'categorias', 'contactos', 'condicionesdeiva', 'comprobantes',
	function($state, $scope, user, clientes, client, enterprises, uens, condicionventas, categorias, contactos, condicionesdeiva, comprobantes) {

		// asignacion de modelos
		this.user = user;
		this.client = client;
		this.enterprises = enterprises;
		this.turnos = ['Mañana', 'Tarde', 'Noche'];
		this.zones = ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5'];
		this.subs = uens;
		this.condicionPagos = condicionventas;
		this.categories = categorias;
		this.contacts = contactos;
		this.taxconditions = condicionesdeiva;
		this.comprobantes = comprobantes;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';

		// asignacion de funciones
		this.update = update;

		// definicion de funciones

		// Update existing Client
		function update(){
			var client = this.client
			if (this.enterprise !== undefined) { client.enterprise = this.enterprise } else if ((client.enterprise!==undefined)&&(client.enterprise!==null)){ client.enterprise = client.enterprise._id};
			// if (this.sub !== undefined) { client.sub = this.sub } else if((client.sub !== undefined)&&(client.sub !== null)){ client.sub = client.sub._id};
			if (this.contact !== undefined) { client.contacts = this.contact } else if((client.contacts !== undefined)&&(client.contacts !== null)){ client.contacts = client.contacts._id};
			if (this.taxcondition !== undefined) { client.taxCondition = this.taxcondition } else if((client.taxCondition !== undefined)&&(client.taxCondition !== null)){ client.taxCondition = client.taxCondition._id};
			if (this.comprobante !== undefined) { client.comprobante = this.comprobante } else if((client.comprobante !== undefined)&&(client.comprobante !== null)){ client.comprobante = client.comprobante._id};
			if (this.condicionPago !== undefined) { client.condicionPago = this.condicionPago } else if((client.condicionPago !== undefined)&&(client.condicionPago !== null)){ client.condicionPago = client.condicionPago._id};
			if (this.category !== undefined) { client.category1 = this.category } else if((client.category1 !== undefined)&&(client.category1 !== null)){ client.category1 = client.category1._id};
			if (this.region !== undefined) { client.region = this.region } else if((client.region !== undefined)&&(client.region !== null)){ client.region = client.region};
			if (this.turno !== undefined) { client.turno = this.turno } else if((client.turno !== undefined)&&(client.turno !== null)){ client.turno = client.turno};
			if ($scope.place !== undefined) { client.loc = [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]} else if((client.loc!==undefined)&&(client.loc!==null)) { client.loc = client.loc };
			client.$update(function() {
				$state.go('home.clients');
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};


		$scope.placeChanged = function() {
           $scope.place = this.getPlace();
           this.errorDir = undefined;
        };

	}
]);