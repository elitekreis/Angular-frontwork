'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Sucursales', '$mdBottomSheet', 'Enterprises', '$mdDialog',
	function($scope, $rootScope, $stateParams, $location, Authentication, Sucursales, $mdBottomSheet, Enterprises, $mdDialog) {
		$scope.authentication = Authentication;

		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.SEARCH);
		});

		// Create new Comprobante
		$scope.create = function() {
			// Create new Comprobante object
			var caja = new Cajas ({
				name: this.name,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
			});

			// Redirect after save
			caja.$save(function(response) {
				if(response._id) {
					// agregar sub al array

					caja._id = response._id;
					$rootScope.cajas.unshift(caja);

				}

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//abre modal para eliminar un puesto 
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar tipo de Comprobante')
	          .content('¿Está seguro que desea eliminar este tipo de Comprobante?')
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

		// Remove existing Comprobante
		$scope.remove = function( caja ) {
			if ( caja ) { caja.$remove();

				for (var i in $scope.cajas ) {
					if ($scope.cajas [i] === caja ) {
						$scope.cajas.splice(i, 1);
					}
				}
			} else {
				$scope.caja.$remove(function() {
					$location.path('cajas');
				});
			}
		};

		// Update existing Comprobante
		$scope.update = function() {
			var caja = $scope.caja ;

			if (this.enterprise !== undefined) { caja.enterprise = this.enterprise._id } else { caja.enterprise = caja.enterprise._id };

			caja.$update(function() {
				$location.path('cajas/view/' + caja._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Comprobantes
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.cajas = Cajas.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of Enterprises
		// $scope.findEnterprises = function() {
		// 	if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise });}			
		// };

		$scope.findEnterprises = function() {
			$scope.enterprises = Enterprises.query();
		};

		// Find existing Comprobante
		$scope.findOne = function() {
			$scope.caja = Cajas.get({ 
				cajaId: $stateParams.cajaId
			});
		};
	}
]);