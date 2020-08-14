'use strict';

// Comprobantes controller
angular.module('finanzas').controller('FinanzasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Comprobantes', '$mdBottomSheet', 'Enterprises', '$mdDialog',"getServiceDetials",
	function($scope, $rootScope, $stateParams, $location, Authentication, Comprobantes, $mdBottomSheet, Enterprises, $mdDialog, getServiceDetials) {
		$scope.authentication = Authentication;

		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.SEARCH);
		});

		var ctrl = this;
		$rootScope.tipoFinanza = $stateParams.tipo;

		// $scope.$watchCollection('tipoFinanza', function(){
		// 	console.log($rootScope.tipoFinanza, 'tipo');
		// 	if($rootScope.tipoFinanza == 'debe') {
		// 		$scope.daFilter = { tipoFinanza: 'debe' };
		// 	} else if ($rootScope.tipoFinanza === 'haber') {
		// 		console.log('entre');
		// 		$scope.daFilter = { tipoFinanza: 'haber' };
		// 	}
		// 	console.log($scope.daFilter, 'filter');
		// });	
		
		
		
		// Create new Comprobante
		$scope.create = function() {
			// Create new Comprobante object
			var comprobante = new Comprobantes ({
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
			comprobante.$save(function(response) {
				if(response._id) {
					// agregar sub al array

					comprobante._id = response._id;
					$rootScope.comprobantes.unshift(comprobante);

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
		$scope.remove = function( comprobante ) {
			if ( comprobante ) { comprobante.$remove();

				for (var i in $scope.comprobantes ) {
					if ($scope.comprobantes [i] === comprobante ) {
						$scope.comprobantes.splice(i, 1);
					}
				}
			} else {
				$scope.comprobante.$remove(function() {
					$location.path('comprobantes');
				});
			}
		};

		// Update existing Comprobante
		$scope.update = function() {
			var comprobante = $scope.comprobante ;

			if (this.enterprise !== undefined) { comprobante.enterprise = this.enterprise._id } else { comprobante.enterprise = comprobante.enterprise._id };

			comprobante.$update(function() {
				$location.path('comprobantes/view/' + comprobante._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Comprobantes
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.comprobantes = Comprobantes.query({ e: $scope.SEARCH.enterprise }); }
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
			Finanzas.get({finanzaId: $stateParams.finanzaId}, function(res){
				$scope.finanza = res;
				$rootScope.tipoFinanza = $scope.finanza.tipoFinanza;
			});
		};
	}
]);