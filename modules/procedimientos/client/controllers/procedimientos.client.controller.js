'use strict';

// Procedimientos controller
angular.module('procedimientos').controller('ProcedimientosController', ['$scope', '$rootScope','$stateParams', '$location', 'Authentication', 'Procedimientos', 'Procesos', '$mdBottomSheet', 'Enterprises', 'Subs', '$mdDialog', 'Puestos',
	function($scope, $rootScope, $stateParams, $location, Authentication, Procedimientos, Procesos, $mdBottomSheet, Enterprises, Subs, $mdDialog, Puestos ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.findAll();
			//console.log('search: ', $scope.SEARCH);
		});

		$scope.nombreProcesoFiltro = undefined;

		$scope.backButton = function () {
        	history.back()
        }

		// Create new Proceso
		$scope.create = function() {
			// Create new Proceso object
			var procedimiento = new Procedimientos ({
				name: this.name,
				description: this.description,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
				// puesto: this.puesto ? this.puesto._id : undefined
			});

			// Redirect after save
			procedimiento.$save(function(response) {
				//$location.path('procesos/' + response._id);

				if(response._id) {
					// agregar sub al array

					procedimiento._id = response._id;
					$rootScope.procedimientos.unshift(procedimiento);

				}

				// Clear form fields
				$scope.name = '';

				$mdBottomSheet.hide();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//abre modal para eliminar un producto
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Procedimiento')
	          .content('¿Está seguro que desea eliminar este procedimiento?')
	          .ariaLabel('Lucky day')
	          .ok('Eliminar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      $scope.remove(item);
		    }, function() {
		      console.log('cancelaste borrar');
		    });
		};	

		// Remove existing Proceso
		$scope.remove = function( procedimiento ) {
			console.log(procedimiento, 'procedimiento');
			if ( procedimiento ) { procedimiento.$remove();

				for (var i in $scope.procedimientos ) {
					if ($scope.procedimientos [i] === procedimiento ) {
						$scope.procedimientos.splice(i, 1);
					}
				}
			} else {
				$scope.procedimientos.$remove(function() {
					$location.path('procedimientos');
				});
			}
		};

		$scope.eliminar = function(procedimiento, proceso){
			for ( var i in $scope.procesos){
				if ($scope.procesos[i].name === proceso){
					for (var j in $scope.procesos[i].procedimientos){
						if ($scope.procesos[i].procedimientos[j].procedimiento.name === procedimiento.name){
							var proceso = $scope.procesos[i];
							$scope.procesos[i].procedimientos.splice(j, 1);
						}
					}
				}
			}
			console.log(proceso, 'proceso');
			if (this.enterprise !== undefined) { proceso.enterprise = this.enterprise._id } else { proceso.enterprise = proceso.enterprise._id}; 
			if (this.sub !== undefined) { proceso.sub = this.sub._id } else if ((proceso.sub!==undefined)&&(proceso.sub!==null)) { proceso.sub = proceso.sub._id};

			proceso.$update(function() {
				$location.path('procedimientos');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		}

		// Update existing Proceso
		$scope.update = function() {
			var procedimiento = $scope.procedimiento ;

			if (this.enterprise !== undefined) { procedimiento.enterprise = this.enterprise._id } else { procedimiento.enterprise = procedimiento.enterprise._id}; 
			if (this.puesto !== undefined) { procedimiento.puesto = this.puesto._id } else if ((procedimiento.puesto!==undefined)&&(procedimiento.puesto!==null)) { procedimiento.puesto = procedimiento.puesto._id};

			procedimiento.$update(function() {
				history.back()
				// $location.path('procesos'); 
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//filtro para listar los procedimientos de un proceso
		$scope.filtrarProcesos = function(proceso){
	    	$scope.nombreProcesoFiltro = proceso.name;
	    	$scope.procedimientosFiltro = proceso.procedimientos;
	    }

	    $scope.eliminarFiltro = function(){
	    	$scope.nombreProcesoFiltro = undefined;
	    }

	    $scope.findAll = function(){
			$scope.find();
			$scope.findProcesos();
		}

		// Find a list of Procesos
		$scope.find = function() {
			$scope.nombreProcesoFiltro = undefined;
			if ($scope.SEARCH !== undefined) { $rootScope.procedimientos = Procedimientos.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of SBUs
		$scope.findEnterprises = function() {
			if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({e: $scope.SEARCH.enterprise }); };
			
		};

		// Find a list of SBUs
		$scope.findPuestos = function() {
			if($scope.SEARCH !== undefined) { $scope.puestos = Puestos.query({ e: $scope.SEARCH.enterprise }); }			
		};

		$scope.findProcesos = function() {
			if($scope.SEARCH !== undefined) { $scope.procesos = Procesos.query({ e: $scope.SEARCH.enterprise }); }			
		};

		// Find existing Proceso
		$scope.findOne = function() {
			$scope.procedimiento = Procedimientos.get({ 
				procedimientoId: $stateParams.procedimientoId
			});
		};
	}
]);