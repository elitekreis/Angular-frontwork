'use strict';

// Comprobantes controller
angular.module('remuneraciones').controller('RemuneracioneCreateController', ['user', '$state', 'categories', 'Remuneraciones',
	function(user, $state, categories, Remuneraciones) {

		// asignacion de modelos
		var that = this;
		this.user = user;
		this.categories = categories;
		this.units = ["U", "Hs"];
		
		//variables de finds
		this.errorRemuneracione = undefined;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'left';
		// asignacion de funciones
		this.create = create;
		this.rutaVolver = rutaVolver;

		function rutaVolver() {
        	history.back()
        }
		// definicion de funciones
		// Create new Remuneracione
		function create() {
			if(that.name !== undefined){
				if(that.category !== undefined) {
					var remuneracione = new Remuneraciones({
						name: that.name,
						description : that.description,
						category :that.category._id,
						enterprise: that.enterprise ? that.enterprise._id : user.enterprise._id,
						unit: that.unit
					});

					remuneracione.$save(function(response) {
						if(response._id) {
							// agregar sub al array
							$state.go('home.remuneraciones');
						}
					}, function(errorResponse) {
                        that.error = errorResponse.data.message;
					});
				} else {
                    that.errorRemuneracione = 'Se debe especificar una categoría para la remuneración';
				}
			}else{
                that.errorRemuneracione = 'Se debe especificar un nombre para la remuneración';
			}			
		}
	}
]);