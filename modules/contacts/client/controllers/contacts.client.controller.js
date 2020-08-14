'use strict';

// Contacts controller
angular.module('contacts').controller('ContactsController', ['$scope', '$rootScope','$stateParams', '$location', 'Authentication', 'Contacts', 'Enterprises', 'Subs', '$mdBottomSheet', '$mdDialog', '$state',
	function($scope, $rootScope,$stateParams, $location, Authentication, Contacts, Enterprises, Subs, $mdBottomSheet, $mdDialog, $state ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.SEARCH);
		});

		$scope.selectedMode = 'md-scale';
	    $scope.selectedDirection = 'up';

		var marker, map;
		  $scope.$on('mapInitialized', function(evt, evtMap) {
		    map = evtMap;
		    marker = map.markers[0];
		  });

		  $scope.types = "['address']";
         $scope.placeChanged = function() {
           $scope.place = this.getPlace();
           $scope.error = undefined;
         }

		// Create new Contact
		$scope.create = function() {
			if($scope.place!==undefined){
				var latitud = $scope.place.geometry.location.lat();
				var longitud = $scope.place.geometry.location.lng();
				// Create new Contact object
				var contact = new Contacts ({
					firstName: this.firstName,
					lastName: this.lastName,
					email: this.email,
					observaciones: this.observaciones,
					address: this.address,
					city: this.city,
					region: this.region ? this.region : undefined,
					country: this.country,
					phone: this.phone,
					loc: [latitud, longitud],
					//fax: this.fax,
					web: this.web,
					// postalCode: this.postalCode,
					status: 'active',
					enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise //,
					//sub: this.sub._id

				});

				// Redirect after save
				contact.$save(function(response) {
					//$location.path('contacts/' + response._id);
					if(response._id) {
						// agregar sub al array

						contact._id = response._id;
						$rootScope.contacts.unshift(contact);

					}

					$state.go('home.contacts');

					// Clear form fields
					$scope.firstName = '';
					$scope.lastName = '';
					$scope.email = '';
					$scope.address = '';
					$scope.city = '';
					$scope.region = '';
					$scope.country = '';
					$scope.phone = '';
					$scope.fax = '';
					$scope.web = '';
					$scope.postalCode = '';
					$mdBottomSheet.hide();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.error = 'Tenes que igresar una ubicacion para el contacto.Ej:"La Plata" ';
			}
		};

		// Update existing Contact
		$scope.update = function() {
			var contact = $scope.contact ;

			if (this.enterprise !== undefined) { contact.enterprise = this.enterprise._id } else if((contact.enterprise!==undefined)&&(contact.enterprise!==null)){ contact.enterprise = contact.enterprise._id};
			if (this.sub !== undefined) { contact.sub = this.sub._id } else if((contact.sub!==undefined)&&(contact.sub!==null)){ contact.sub = contact.sub._id};
			if (this.city !== undefined) { contact.city = this.city } else if((contact.city!==undefined)&&(contact.city!==null)){ contact.city = contact.city};
			if ($scope.place !== undefined) { contact.loc = [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]} else if((contact.loc!==undefined)&&(contact.loc!==null)){ contact.loc = contact.loc };
			//if (this.sub !== undefined) { contact.sub = this.sub._id };

			contact.$update(function() {
				// console.log('actualice');
				$location.path('contactos');
			}, function(errorResponse) {
				// console.log(errorResponse);
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Contacts
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.contacts = Contacts.query({ e: $scope.SEARCH.enterprise }); }

		};

		// Find a list of SBUs
		$scope.findEnterprises = function() {
			$scope.enterprises = Enterprises.query();
		};

		// Find a list of SBUs
		$scope.findSubs = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.subs = Subs.query({ e: $scope.SEARCH.enterprise });
			}

		};

		// Find a list of Enterprises
		$scope.findCitys = function() {
			if ($scope.SEARCH !== undefined) { $scope.citys = ['Berisso', 'Ensenala', 'La Plata']; } // ToDo:  migrate this to a factory

		};

		// Find existing Contact
		$scope.findOne = function() {
			$scope.contact = Contacts.get({
				contactId: $stateParams.contactId
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
		    	console.log('por aqui ando');
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

			//abre modal para eliminar un contacto
			$scope.showConfirm = function(ev,item) {
				var confirm = $mdDialog.confirm()
		          .title('Eliminar Contacto')
		          .content('¿Está seguro que desea eliminar este contacto?')
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

			// Remove existing Contact
			$scope.remove = function( contact ) {
				if ( contact ) { contact.$remove();

					for (var i in $scope.contacts ) {
						if ($scope.contacts [i] === contact ) {
							$scope.contacts.splice(i, 1);
						}
					}
				} else {
					$scope.contact.$remove(function() {
						$location.path('contacts');
					});
				}
			};
		};		
	}
]);
