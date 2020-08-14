'use strict';

// Comprobantes controller
angular.module('sucursales').controller('SucursalesController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Sucursales', '$mdBottomSheet', 'Enterprises', '$mdDialog',
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
			var sucursal = new Sucursales ({
				name: this.name,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
			});

			// Redirect after save
			sucursal.$save(function(response) {
				if(response._id) {
					// agregar sub al array

					sucursal._id = response._id;
					$rootScope.sucursales.unshift(sucursal);

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
		$scope.remove = function( sucursal ) {
			if ( sucursal ) { sucursal.$remove();

				for (var i in $scope.sucursales ) {
					if ($scope.sucursales [i] === sucursal ) {
						$scope.sucursales.splice(i, 1);
					}
				}
			} else {
				$scope.sucursal.$remove(function() {
					$location.path('sucursales');
				});
			}
		};

		// Update existing Comprobante
		$scope.update = function() {
			var sucursal = $scope.sucursal ;

			if (this.enterprise !== undefined) { sucursal.enterprise = this.enterprise._id } else { sucursal.enterprise = sucursal.enterprise._id };

			sucursal.$update(function() {
				$location.path('sucursales/view/' + sucursal._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Comprobantes
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.sucursales = Sucursales.query({ e: $scope.SEARCH.enterprise }); }
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
			$scope.sucursal = Sucursales.get({ 
				sucursalId: $stateParams.sucursalId
			});
		};
	}
]);