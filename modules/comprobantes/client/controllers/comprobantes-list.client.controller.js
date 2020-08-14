'use strict';

// Comprobantes controller
angular.module('comprobantes').controller('ComprobantesListController', ['$location', 'user', 'comprobantes', 'enterprises', '$mdDialog', 'modosFacturacion',
	function($location, user, comprobantes, enterprises, $mdDialog, modosFacturacion) {

		// asignacion de modelos
		this.user = user;
		this.comprobantes = comprobantes;
		this.enterprises = enterprises;
		this.modosFacturacion = modosFacturacion;

		// asignacion de funciones
		this.showConfirm = showConfirm;
		this.remove = remove;

		// definicion de funciones
		function showConfirm (ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar tipo de Comprobante')
	          .content('¿Está seguro que desea eliminar este tipo de Comprobante?')
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

		// Remove existing Comprobante
		function remove ( comprobante ) {
			if ( comprobante ) { comprobante.$remove();
			} else {
				this.comprobante.$remove(function() {
					$location.path('comprobantes');
				});
			}
		};
	}
]);
