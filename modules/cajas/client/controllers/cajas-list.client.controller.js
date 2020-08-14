'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasListController', ['$location', 'user', 'cajas', 'enterprises', '$mdDialog',
	function($location, user, cajas, enterprises, $mdDialog) {

		// asignacion de modelos
		this.user = user;
		this.cajas = cajas;
		this.enterprises = enterprises;

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
		function remove ( caja ) {
			if ( caja ) { caja.$remove();
			} else {
				this.caja.$remove(function() {
					$location.path('cajas');
				});
			}
		};
	}
]);
