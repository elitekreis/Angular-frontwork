'use strict';

// Comprobantes controller
angular.module('transferencias').controller('TransferenciasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Comprobantes', '$mdBottomSheet', 'Enterprises', '$mdDialog',
	function($scope, $rootScope, $stateParams, $location, Authentication, Comprobantes, $mdBottomSheet, Enterprises, $mdDialog) {
		$scope.authentication = Authentication;

		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.SEARCH);
		});

		// Create new Comprobante
		$scope.create = function() {
			// Create new Comprobante object
			var transferencia = new Transferencias ({
				name: this.name,
				letra: this.letra,
				puntoDeVenta: this.puntoDeVenta,
				modoFacturacion: this.modo,
				movimientoStock: this.movimientoStock,
				movimientoCC: this.movimientoCC,
				movimientoOperacionInversa: this.movimientoOperacionInversa,
				funcionalidadSituacion: this.funcionalidadSituacion,
				autoAprobar: this.autoAprobar,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
			});

			// Redirect after save
			transferencia.$save(function(response) {
				if(response._id) {
					// agregar sub al array

					transferencias._id = response._id;
					$rootScope.transferencias.unshift(transferencias);

				}

				// Clear form fields
				$scope.name = '';
				$scope.letra = '';
				$scope.puntoDeVenta = '';
				$scope.modoFacturacion = '';

				$mdBottomSheet.hide();
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
		$scope.remove = function( transferencias ) {
			if ( transferencias ) { transferencias.$remove();

				for (var i in $scope.transferencias ) {
					if ($scope.transferencias[i] === transferencias ) {
						$scope.transferencias.splice(i, 1);
					}
				}
			} else {
				$scope.transferencias.$remove(function() {
					$location.path('transferencias');
				});
			}
		};

		// Update existing Comprobante
		$scope.update = function() {
			var transferencias = $scope.transferencias ;

			if (this.enterprise !== undefined) { transferencias.enterprise = this.enterprise._id } else { transferencias.enterprise = transferencias.enterprise._id };

			transferencias.$update(function() {
				$location.path('transferencias/view/' + transferencias._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Comprobantes
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.transferencias = Transferencias.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of Enterprises
		// $scope.findEnterprises = function() {
		// 	if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise });}			
		// };

		$scope.findEnterprises = function() {
			$scope.enterprises = Enterprises.query();
		};

		// Find a list of Modos de facturacion
		$scope.findModosF = function() {
			if ($scope.SEARCH !== undefined) { $scope.modosF = ['Comprobante interno', 'Talonario fiscal manual o pre-impreso', 'Factura electronica']; } 
		};

		// Find existing Comprobante
		$scope.findOne = function() {
			$scope.transferencia = Transferencias.get({ 
				transferenciaId: $stateParams.transferenciaId
			});
		};
	}
]);