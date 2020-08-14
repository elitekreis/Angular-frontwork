'use strict';

// Condicionventas controller
angular.module('condicionventas').controller('CondicionventasListController', ['$location', '$state', '$mdDialog', 'user', 'enterprises', 'condicionventas',
	function($location, $state, $mdDialog, user, enterprises, condicionventas) {

		// asignacion de modelos
		this.user = user;
		this.enterprises = enterprises;
		this.condicionventas = condicionventas;

		// asignacion de funciones
		this.showConfirm = showConfirm;
		this.remove = remove;

		// definicion de funciones
		function showConfirm (ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar condicion de venta')
	          .content('¿Está seguro que desea eliminar esta condicion de venta?')
	          .ariaLabel('Lucky day')
	          .ok('Eliminar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      remove(item);
		    }, function() {
		      console.log('cancelaste borrar');
		    });
		};

		// Remove existing Condicionventa
		function remove ( condicionventa ) {
			if ( condicionventa ) { condicionventa.$remove();
			} else {
				this.condicionventa.$remove(function() {
					// $location.path('condicionventas');
				});
			}
		};
	}
]);
