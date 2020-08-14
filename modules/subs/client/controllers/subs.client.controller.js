'use strict';

// Subs controller
angular.module('subs').controller('SubsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Subs', 'Enterprises', '$mdBottomSheet', '$mdDialog', '$state',
	function($scope, $rootScope, $stateParams, $location, Authentication, Subs, Enterprises, $mdBottomSheet, $mdDialog, $state) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.SEARCH);
		});

		// Create new Sub
		$scope.create = function() {
			// Create new Sub object
			if (this.name !== undefined){
				var sub = new Subs ({
					name: this.name,
					description: this.description ? this.description : undefined,
					goals: this.goals ? this.goals : undefined,
					enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
				});
				// Redirect after save
				sub.$save(function(response) {
					// $location.path('subs/' + response._id);
					if(response._id) {
						// agregar sub al array

						sub._id = response._id;
						$rootScope.subs.unshift(sub);

					}			
					// Clear form fields
					$scope.name = '';
					$scope.description = '';

					$mdBottomSheet.hide();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
			else {
				$scope.errorName = 'Indique el nombre para la nueva UEN'
			}		
		};

		// Update existing Sub
		$scope.update = function() {
			var sub = $scope.sub ;
			if (this.enterprise !== undefined) { sub.enterprise = this.enterprise._id } else { sub.enterprise = sub.enterprise._id }; 

			sub.$update(function() {
				$location.path('UENs');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Subs
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.subs = Subs.query({ e: $scope.SEARCH.enterprise }); };
			
		};

		// Find a list of Enterprises
		$scope.findEnterprises = function() {
			if ($scope.SEARCH !== undefined) { 
				$scope.enterprises = Enterprises.query(); 
			}
		};

		// Find existing Sub
		$scope.findOne = function() {
			$scope.sub = Subs.get({ 
				subId: $stateParams.subId
			});
		};
		$scope.showBottomSheet = function($event, item, model, param) {
			var template = '/modules/core/views/menu-opciones.client.view.html';
			$rootScope.currentItem = item;
			$rootScope.currentModel = model;
			$rootScope.currentParam = param;
	    	//console.log('estadoactual: ', $rootScope.estadoActual);
	    	$mdBottomSheet.show({
	    	  controller: DialogController,
		      templateUrl: template,
		      // controller: 'ListBottomSheetCtrl',
		      targetEvent: $event,
		      resolve: {
		         item: function () {
		           return item;
		         }
		       }

		    }).then(function(clickedItem) {
		    	//$mdBottomSheet.hide();
		    });

	  	};

	  	function DialogController($scope, $mdDialog, item, Areas) {

	  		$scope.item = item;

	  		$scope.goto = function (state, params) {
				if (state !== undefined) {
						$state.go(state, params);
						$mdBottomSheet.hide();
				}
			}

			//abre modal para eliminar un proveedor
			$scope.showConfirm = function(ev,item) {
				var confirm = $mdDialog.confirm()
		          .title('Eliminar UEN')
		          .content('¿Está seguro que desea eliminar esta UEN?')
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
			// Remove existing Sub
			$scope.remove = function( sub ) {
				if ( sub ) { sub.$remove();

					for (var i in $scope.subs ) {
						if ($scope.subs [i] === sub ) {
							$scope.subs.splice(i, 1);
						}
					}
				} else {
					$scope.sub.$remove(function() {
						$location.path('subs');
					});
				}
				$mdBottomSheet.hide();
			};
		};
	}
]);