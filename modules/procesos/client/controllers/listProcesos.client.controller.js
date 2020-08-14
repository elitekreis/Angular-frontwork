'use strict';

// Comprobantes controller
angular.module('procesos').controller('ProcesosListController', ['$location', 'user', 'procesos', 'enterprises', '$mdDialog', 'categories',
	function($location, user, procesos, enterprises, $mdDialog, categories) {

		// asignacion de modelos
		this.user = user;
		this.procesos = procesos;
		this.enterprises = enterprises;
		this.categories = categories;

		console.log(procesos);

		// asignacion de funciones
		this.showConfirm = showConfirm;
		this.remove = remove;

		/*function groupProcesos() {
			var proc = {};
            proc['tele'] = [];
			for(var i = 0; i < procesos.length; i++) {
				proc['tele'].push(procesos[i]);
			}

			console.log(proc);

			return proc;
		}*/

		// definicion de funciones
		function showConfirm(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Proceso')
	          .content('¿Está seguro que desea eliminar este proceso?')
	          .ariaLabel('Lucky day')
	          .ok('Eliminar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      remove(item);
		    }, function() {
		      console.log('cancelaste borrar');
		    });
		}	//end showConfirm

		// Remove existing Proceso
		function remove( proceso ) {
			if ( proceso ) { proceso.$remove();

				for (var i in procesos ) {
					if (procesos [i] === proceso ) {
						procesos.splice(i, 1);
					}
				}
			} else {
				proceso.$remove(function() {
					$location.path('procesos');
				});
			}
		} //end Remove

	}//end function
]);
