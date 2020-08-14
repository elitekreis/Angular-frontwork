'use strict';

// Taxconditions controller
angular.module('taxconditions').controller('TaxconditionsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Taxconditions', 'Enterprises', '$mdBottomSheet', '$mdDialog',
	function($scope, $rootScope, $stateParams, $location, Authentication, Taxconditions, Enterprises, $mdBottomSheet, $mdDialog) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
		});

		// Create new Taxcondition
		$scope.create = function() {
			// Create new Taxcondition object
			var taxcondition = new Taxconditions ({
				name: this.name,
				taxPercentage: this.taxPercentage,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
			});

			// Redirect after save
			taxcondition.$save(function(response) {
				//$location.path('condiciones-impuesto/view/' + response._id);

				if(response._id) {
					// agregar sub al array

					taxcondition._id = response._id;
					$rootScope.taxconditions.unshift(taxcondition);

				}


				// Clear form fields
				$scope.name = '';
				$scope.taxPercentage = '';

				$mdBottomSheet.hide();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//abre modal para eliminar una condicion de iva 
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Condicion de IVA')
	          .content('¿Está seguro que desea eliminar esta condicion de IVA?')
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

		// Remove existing Taxcondition
		$scope.remove = function( taxcondition ) {
			if ( taxcondition ) { taxcondition.$remove();

				for (var i in $scope.taxconditions ) {
					if ($scope.taxconditions [i] === taxcondition ) {
						$scope.taxconditions.splice(i, 1);
					}
				}
			} else {
				$scope.taxcondition.$remove(function() {
					$location.path('taxconditions');
				});
			}
		};

		// Update existing Taxcondition
		$scope.update = function() {
			var taxcondition = $scope.taxcondition ;

			if (this.enterprise !== undefined) { taxcondition.enterprise = this.enterprise._id } else { taxcondition.enterprise = taxcondition.enterprise._id }; 

			taxcondition.$update(function() {
				$location.path('condiciones-impuesto');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Taxconditions
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.taxconditions = Taxconditions.query({ e: $scope.SEARCH.enterprise }); }
			
		};

		// Find a list of Enterprises
		$scope.findEnterprises = function() {
			$scope.enterprises = Enterprises.query();
		};

		// Find existing Taxcondition
		$scope.findOne = function() {
			$scope.taxcondition = Taxconditions.get({ 
				taxconditionId: $stateParams.taxconditionId
			});
		};
	}
]);