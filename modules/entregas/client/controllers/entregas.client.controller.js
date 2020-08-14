'use strict';

// Entregas controller
angular.module('entregas').controller('EntregasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Entregas', 'ClientsLocation',
	function($scope, $rootScope, $stateParams, $location, Authentication, Entregas, ClientsLocation ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			$scope.findClients()
		});

		  var marker, map;
		  $scope.$on('mapInitialized', function(evt, evtMap) {
		    map = evtMap;
		    marker = map.markers[0];
		  });

		  $scope.types = "['address']";
         $scope.placeChanged = function() {
           $scope.place = this.getPlace();
         }

		// Create new Entrega
		$scope.create = function() {
			// Create new Entrega object
			var entrega = new Entregas ({
				name: this.name
			});

			// Redirect after save
			entrega.$save(function(response) {
				$location.path('entregas/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Entrega
		$scope.remove = function( entrega ) {
			if ( entrega ) { entrega.$remove();

				for (var i in $scope.entregas ) {
					if ($scope.entregas [i] === entrega ) {
						$scope.entregas.splice(i, 1);
					}
				}
			} else {
				$scope.entrega.$remove(function() {
					$location.path('entregas');
				});
			}
		};

		// Update existing Entrega
		$scope.update = function() {
			var entrega = $scope.entrega ;

			entrega.$update(function() {
				$location.path('entregas/' + entrega._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Entregas
		$scope.find = function() {
			if($scope.SEARCH !== undefined) {
				$rootScope.entregas = Entregas.query({ e: $scope.SEARCH.enterprise });
			}
			
		};

		// $scope.findClients = function() {
		// 	if ($scope.SEARCH !== undefined) { 
		// 		$scope.clients = Clients.query({ e: $scope.SEARCH.enterprise });
				
		// 	};
			
		// };

		// Find existing Entrega
		$scope.findOne = function() {
			$scope.entrega = Entregas.get({ 
				entregaId: $stateParams.entregaId
			});
		};

		$scope.findClients = function(product) {
			if ($scope.SEARCH !== undefined) { 
				console.log('<<<<< ', $scope.authentication);
				ClientsLocation.getClientsByLocation($scope.authentication.user.enterprise.loc, $scope.SEARCH.enterprise)
				.success(function(data){
					// OK
					$scope.clients = data;
				})
				.error(function(error){
					// FUCK!
					console.error('Fuck!!! -> ', error);
				}); 
				console.log('clients: ', $scope.clients)
			};
			
		};
	}
]);