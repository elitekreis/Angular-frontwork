'use strict';

// Clients controller
angular.module('clients').controller('ClientsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Clients', 'Enterprises', 'Subs', '$mdBottomSheet', 'Contacts', 'Taxconditions', 'Categories', 'Ventas', 'Comprobantes', 'Pedidos', '$filter', '$timeout', '$mdDialog', '$state', 'Condicionventas', '$q',
	function($scope, $rootScope, $stateParams, $location, Authentication, Clients, Enterprises, Subs, $mdBottomSheet, Contacts, Taxconditions, Categories, Ventas, Comprobantes, Pedidos, $filter, $timeout, $mdDialog, $state, Condicionventas, $q ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			$scope.findAll();
			$scope.findZones();
			$scope.findCondicionPagos();
		});

		var marker, map;
		$scope.$on('mapInitialized', function(evt, evtMap) {
		    map = evtMap;
			marker = map.markers[0];
		});

		$scope.types = "['address']";
       
        $scope.placeChanged = function() {
           $scope.place = this.getPlace();
           $scope.errorDir = undefined;
        }

		//console.log('user: ', $scope.SEARCH);

		// Create new Client
		$scope.create = function() {
			// Create new Client object
			var tempContact = [];
			var prod = [];
				if(this.name !== undefined){
					if(this.address !== undefined){
						if(this.sub !== undefined){
							if(this.category1 !== undefined){
								if(this.taxcondition !== undefined){
									if(this.condicionPago !== undefined){
										if(this.tipoComprobante !== undefined){
											var client = new Clients ({
												name: this.name,
												creditLimit: this.creditLimit ? this.creditLimit : 0,
												fiscalNumber: this.fiscalNumber ? this.fiscalNumber : 0,
												taxCondition: this.taxcondition._id,
												condicionPago: this.condicionPago._id,
												comprobante: this.tipoComprobante._id,
												discountRate: this.discountRate ? this.discountRate : 0,
												loc: [$scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()],
												//costCenter: this.costCenter,
												observaciones: this.observaciones ? this.observaciones : undefined,
												paymentMethod: this.paymentMethod,
												contacts: this.contact ? [ this.contact._id ] : [],
												country: this.country,
												city: this.city,
												region: this.region ? this.region : undefined,
												turno: this.turno ? this.turno : undefined,
												postalCode: this.postalCode ? this.postalCode : 1900,
												address: this.address,
												phone: this.phone ? this.phone : undefined,
												// fax: this.fax,
												web: this.web ? this.web : undefined,
												category1: this.category ? this.category._id : undefined,
												enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
												sub: this.sub ? this.sub._id : undefined,
												productosAsociados: prod
											});

											// Redirect after save
											client.$save(function(response) {
												//$location.path('clients/' + response._id);

												if(response._id) {
													// agregar sub al array

													client._id = response._id;
													$rootScope.clients.unshift(client);

												}

												$state.go('home.clients');

												// Clear form fields
												$scope.name = '';
												$scope.creditLimit = 0;
												$scope.fiscalNumber = '';
												$scope.discountRate = 0;
												$scope.contacts = [];
												$scope.country = '';
												$scope.city = '';
												$scope.region = '';
												$scope.postalCode = '';
												$scope.address = '';
												$scope.phone = '';
												$scope.fax = '';
												$scope.web = '';

												// $mdBottomSheet.hide();
											}, function(errorResponse) {
												$scope.error = errorResponse.data.message;
											});
										}
										else{
											$scope.errorComprobante = 'Se debe elegir un tipo de comprobante';
										}	
									}
									else{
										$scope.errorCondicion = 'Se debe elegir una condicion de pago';
									}	
								}
								else{
									$scope.errorTax = 'Se debe ingresar la condicion de IVA';
								}		
							}
							else{
								$scope.errorCategory = 'Se debe ingresar la categoria';
							}			
						}
						else{
							$scope.errorSub = 'Se debe ingresar la UEN';
						}				
					}
					else{
						$scope.errorDir = 'Se debe ingresar la direccion';
					}	
				}
				else{
					$scope.errorName = 'Se debe ingresar la razon social del cliente';
				}			
		};

		$scope.borrarError = function(){
			$scope.errorName = undefined;
			$scope.errorDir = undefined;
			$scope.errorSub = undefined;
			$scope.errorCategory = undefined;
			$scope.errorTax = undefined;
			$scope.errorCondicion = undefined;
			$scope.errorComprobante = undefined;
		}

		//abre modal para eliminar un cliente
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Cliente')
	          .content('¿Está seguro que desea eliminar este cliente?')
	          .ariaLabel('Lucky day')
	          .ok('Eliminar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      $scope.remove(item);
					$mdBottomSheet.hide();
		    }, function() {
					$mdBottomSheet.hide();
		      console.log('cancelaste borrar');
		    });
		};

		// Remove existing Client
		$scope.remove = function( client ) {
			console.log('---> remover item disparado');
			if ( client ) {
				//client.$remove();
				console.log('client es: ', client);
				for (var i in $rootScope.clients ) {
					if ($rootScope.clients[i]._id === client._id ) {
						console.log('---> se encuentra en el array en la posicion ', i);
						$rootScope.clients.splice(i, 1);
						client.$remove();
					} else { console.log('La concha de la lora');}
				}
			} else {
				console.log('--> No se encuentra en el array');
				$scope.client.$remove(function() {
					$location.path('clients');
				});
			}
		};

		// Update existing Client
		$scope.update = function() {
			var client = $scope.client
			if (this.enterprise !== undefined) { client.enterprise = this.enterprise._id } else if ((client.enterprise!==undefined)&&(client.enterprise!==null)){ client.enterprise = client.enterprise._id};
			if (this.sub !== undefined) { client.sub = this.sub._id } else if((client.sub !== undefined)&&(client.sub !== null)){ client.sub = client.sub._id};
			if (this.contact !== undefined) { client.contacts = [ this.contact._id ] } else if((client.contacts[0] !== undefined)&&(client.contacts[0] !== null)){ client.contacts = [ client.contacts[0]._id]};
			if (this.taxcondition !== undefined) { client.taxCondition = this.taxcondition._id } else if((client.taxCondition !== undefined)&&(client.taxCondition !== null)){ client.taxCondition = client.taxCondition._id};
			if (this.comprobante !== undefined) { client.comprobante = this.comprobante._id } else if((client.comprobante !== undefined)&&(client.comprobante !== null)){ client.comprobante = client.comprobante._id};
			if (this.condicionPago !== undefined) { client.condicionPago = this.condicionPago._id } else if((client.condicionPago !== undefined)&&(client.condicionPago !== null)){ client.condicionPago = client.condicionPago._id};
			if (this.category !== undefined) { client.category1 = this.category._id } else if((client.category1 !== undefined)&&(client.category1 !== null)){ client.category1 = client.category1._id};
			if (this.region !== undefined) { client.region = this.region } else if((client.region !== undefined)&&(client.region !== null)){ client.region = client.region};
			if (this.turno !== undefined) { client.turno = this.turno } else if((client.turno !== undefined)&&(client.turno !== null)){ client.turno = client.turno};
			if ($scope.place !== undefined) { client.loc = [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]} else if((client.loc!==undefined)&&(client.loc!==null)) { client.loc = client.loc};
			//if (this.city !== undefined) { client.city = this.city } else { client.city = client.city};

			client.$update(function() {
				$location.path('clientes');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Clients
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) {
				$rootScope.clients = Clients.query({ e: $scope.SEARCH.enterprise });

			};

		};

		$scope.setZone = function(s) {
			if (s !== '') {
				//console.log('cambio a ', s);
				$scope.fzone = { region: s };
			} else {
				//console.log('filtro eliminado ');
				$scope.fzone = undefined;
			}

		};

		// Find a list of SBUs
		$scope.findEnterprises = function() {
			$scope.enterprises = Enterprises.query();
		};

		// Find a list of SBUs
		$scope.findSubs = function() {
			if($scope.SEARCH !== undefined) { $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise }); }

		};

		// Find a list of SBUs
		$scope.findContacts = function() {
			if ($scope.SEARCH !== undefined) { $scope.contacts = Contacts.query({e: $scope.SEARCH.enterprise }); };
		};

		// Find a list of Taxconditions
		$scope.findTaxConditions = function() {
			if ($scope.SEARCH !== undefined) { $scope.taxconditions = Taxconditions.query({e: $scope.SEARCH.enterprise }); };

		};

		// Find a list of Enterprises
		$scope.findCategories = function() {
			if ($scope.SEARCH !== undefined) { $scope.categories = Categories.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of Enterprises
		$scope.findZones = function() {
			if ($scope.SEARCH !== undefined) { $scope.zones = ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5'];
				$scope.clientsInZone = [];
				$timeout(function(){
					$scope.zones.forEach(function(zone){
						$scope.clientsInZone[zone] = $filter('filter')($rootScope.clients, { region: zone });
					});
				}, 500)

			} // ToDo:  migrate this to a factory
		};

		// Find a list of Enterprises
		$scope.findTurnos = function() {
			if ($scope.SEARCH !== undefined) { $scope.turnos = ['Mañana', 'Tarde', 'Noche']; } // ToDo:  migrate this to a factory

		};

		// Find a list of Enterprises
		$scope.findCitys = function() {
			if ($scope.SEARCH !== undefined) { $scope.citys = ['Berisso', 'Ensenala', 'La Plata']; } // ToDo:  migrate this to a factory

		};


		// Find existing Client
		$scope.findOne = function() {
			$scope.client = Clients.get({
				clientId: $stateParams.clientId
			});
			$scope.idClient = $stateParams.clientId;
		};

		$scope.findAll = function(){
			//$scope.findOne();
			$scope.findComprobantes();
			$scope.findVentas();
			$scope.findPedidos();
		};

		$scope.findAllView = function(){
			$scope.findOne();
			$scope.findComprobantes();
			$scope.findPedidos();
			$scope.findVentas();
			var promise = asyncVentas();
			promise.then(function(response) {
				calcularDeuda();
  			});
		};

		function calcularDeuda(){
			$scope.totalDeuda = 0;
			for (var i = $scope.ventas.length - 1; i >= 0; i--) {
				if($scope.ventas[i].cliente._id==$scope.client._id){
					if(($scope.ventas[i].estado=='Pendiente de pago y entrega')||($scope.ventas[i].estado=='Pendiente de pago2')){
						$scope.totalDeuda = $scope.totalDeuda + $scope.ventas[i].total; 
					}
				}
			};
		};

		function asyncVentas(item) {
		    var deferred = $q.defer();
			setTimeout(function() {
			    if ($scope.ventas!==undefined) {
			      deferred.resolve('Hello');
			    } else {
			      deferred.reject('Greeting');
			    }
			}, 1000);
			return deferred.promise;
		};

		$scope.findComprobantes = function(){
			if ($scope.SEARCH !== undefined) {
				$scope.comprobantes = Comprobantes.query({e: $scope.SEARCH.enterprise }, function(res){
					$rootScope.comprobantes = res;
					for (var i in $rootScope.comprobantes) {
						if ($rootScope.comprobantes[i].name === 'Presupuesto'){
							$scope.idPresupuesto = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Factura A'){
							$rootScope.idFacturaA = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Factura B'){
							$rootScope.idFacturaB = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Factura C'){
							$rootScope.idFacturaC = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Remito'){
							$rootScope.idRemito = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Remito de Devolucion'){
							$rootScope.idRemitoDev = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Nota de Credito'){
							$rootScope.idNotaC = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Nota de Debito'){
							$rootScope.idNotaD = $rootScope.comprobantes[i]._id;
						}
						if ($rootScope.comprobantes[i].name === 'Orden de Pago'){
							$rootScope.idOrden = $rootScope.comprobantes[i]._id;
						}
					}
				});
			}
		};

		// Find a list of condiciones de pago
		$scope.findCondicionPagos = function() {
			if($scope.SEARCH !== undefined) { $scope.condicionPagos = Condicionventas.query({ e: $scope.SEARCH.enterprise });}
		};

		$scope.findVentas = function() {
			if($scope.SEARCH !== undefined) {
				$scope.ventas = Ventas.query({ e: $scope.SEARCH.enterprise });
			}
		};


		$scope.findPedidos = function(){
			if ($scope.SEARCH !== undefined) {
				$scope.pedidos = Pedidos.query({ e: $scope.SEARCH.enterprise });
			}
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

			//abre modal para eliminar un cliente
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Cliente')
	          .content('¿Está seguro que desea eliminar este cliente?')
	          .ariaLabel('Lucky day')
	          .ok('Eliminar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      $scope.remove(item);
					$mdBottomSheet.hide();
		    }, function() {
					$mdBottomSheet.hide();
		      console.log('cancelaste borrar');
		    });
		};

		// Remove existing Client
		$scope.remove = function( client ) {
			if ( client ) {
				for (var i in $rootScope.clients ) {
					if ($rootScope.clients[i]._id === client._id ) {
						$rootScope.clients.splice(i, 1);
						client.$remove();
					} else { console.log('hubo un error al eliminar');}
				}
			} else {
				$scope.client.$remove(function() {
				});
			}
			$mdBottomSheet.hide();
		};

	  	};


	}
]);
