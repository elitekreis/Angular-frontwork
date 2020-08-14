'use strict';

// Comprobantes controller
angular.module('providers').controller('ProvidersEditController', ['user', 'provider', 'enterprises', 'categories', 'contacts', 'taxconditions', 'condicionPagos', 'comprobantes', '$scope', '$location', '$state',
	function(user, provider, enterprises, categories, contacts, taxconditions,condicionPagos, comprobantes, $scope,$location, $state) {

		// asignacion de modelos
		this.user = user;
		this.provider = provider;
		this.enterprises = enterprises;
		this.categories = categories;
		this.contacts = contacts;
		this.taxconditions = taxconditions;
		this.condicionPagos = condicionPagos;
		this.comprobantes = comprobantes;
		this.backButton = backButton;
		// asignacion de funciones

		this.update = update;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';

		// definicion de funciones
		var marker, map;
		$scope.$on('mapInitialized', function(evt, evtMap) {
		    map = evtMap;
		    marker = map.markers[0];
		}); //end mapInitialized

		  $scope.types = "['address']";

        $scope.placeChanged = function() {
           $scope.place = this.getPlace();
        }; //end placeChaged

        function backButton() {
        	history.back()
        }

		function update () {
			var provider = this.provider;
			if (this.enterprise !== undefined) { provider.enterprise = this.enterprise } else { provider.enterprise = provider.enterprise._id };
			//if (this.sub !== undefined) { provider.sub = this.sub._id } else { provider.sub = provider.sub._id };
			// if (this.contact !== undefined) { provider.contacts = [ this.contact ] } else if ((provider.contacts[0]!==undefined)&&(provider.contacts[0]!==null)) { provider.contacts = [ provider.contacts[0]._id ]};
			if (this.taxcondition !== undefined) { provider.taxCondition = this.taxcondition } else if ((provider.taxCondition!==undefined)&&(provider.taxCondition!==null)){ provider.taxCondition = provider.taxCondition._id};
			if (this.condicionPago !== undefined) { provider.condicionPago = this.condicionPago } else if ((provider.condicionPago!==undefined)&&(provider.condicionPago!==null)) { provider.condicionPago = provider.condicionPago._id};
			if (this.tipoComprobante !== undefined) { provider.comprobante = this.tipoComprobante; } else if ((provider.comprobante!==undefined)&&(provider.comprobante!==null)) { provider.comprobante = provider.comprobante._id};
			if (this.category1 !== undefined) { provider.category1 = this.category1 } else if ((provider.category1!==undefined)&&(provider.category1!==null)) { provider.category1 = provider.category1._id};
			if ($scope.place !== undefined) { provider.loc = [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]} else if((provider.loc!==undefined)&&(provider.loc!==null)){ provider.loc = provider.loc};
			// if (this.city !== undefined) { provider.city = this.city } else if ((provider.city!==undefined)&&(provider.city!==null)){ provider.city = provider.city};
			// console.log(provider, 'provider');
			provider.$update(function() {
				// $location.path('proveedores/view/' + provider._id);
				$state.go('home.providers');
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		}; //end Update

	} //end function
]);