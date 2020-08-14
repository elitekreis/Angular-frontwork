'use strict';

// Condicionventas controller
angular.module('condicionventas').controller('CondicionventasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Condicionventas', '$mdBottomSheet', 'Enterprises', '$mdDialog',
	function($scope, $rootScope, $stateParams, $location, Authentication, Condicionventas, $mdBottomSheet, Enterprises, $mdDialog) {
		$scope.authentication = Authentication;

		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.SEARCH);
		});

		// Create new Condicionventa
		$scope.create = function() {
			// Create new Condicionventa object
			var condicionventa = new Condicionventas ({
				name: this.name,
				description: this.description,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
			});

			console.log(condicionventa.enterprise, "empresa");

			// Redirect after save
			condicionventa.$save(function(response) {
				if(response._id) {
					// agregar sub al array

					condicionventa._id = response._id;
					$rootScope.condicionventas.unshift(condicionventa);

				}

				// Clear form fields
				$scope.name = '';
				$scope.description = '';

				$mdBottomSheet.hide();

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//abre modal para eliminar un puesto 
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Condicion de pago')
	          .content('¿Está seguro que desea eliminar esta condicion de pago?')
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

		// Remove existing Condicionventa
		$scope.remove = function( condicionventa ) {
			if ( condicionventa ) { condicionventa.$remove();

				for (var i in $scope.condicionventas ) {
					if ($scope.condicionventas [i] === condicionventa ) {
						$scope.condicionventas.splice(i, 1);
					}
					console.log($scope.condicionventas, 'array luego de delete');
				}
			} else {
				$scope.condicionventa.$remove(function() {
					$location.path('condicionventas');
				});
			}
		};

		// Update existing Condicionventa
		$scope.update = function() {
			var condicionventa = $scope.condicionventa ;

			/* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
			una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no 
			hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

			if (this.enterprise !== undefined) { condicionventa.enterprise = this.enterprise._id } else { condicionventa.enterprise = condicionventa.enterprise._id };

			condicionventa.$update(function() {
				$location.path('condiciones-pago/view/' + condicionventa._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Condicionventas
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.condicionventas = Condicionventas.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find existing Condicionventa
		$scope.findOne = function() {
			$scope.condicionventa = Condicionventas.get({ 
				condicionventaId: $stateParams.condicionventaId
			});
		};

		//find lista de empresas
		// $scope.findEnterprises = function() {
		// 	if ($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise }); }			
		// };

		$scope.findEnterprises = function() {
			$scope.enterprises = Enterprises.query();
		};
	}
]);