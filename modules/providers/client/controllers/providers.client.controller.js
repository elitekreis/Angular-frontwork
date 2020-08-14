'use strict';

// Providers controller
angular.module('providers').controller('ProvidersController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Providers', 'Enterprises', 'Subs', '$mdBottomSheet', 'Contacts', 'Taxconditions', 'Categories', '$mdDialog', '$state', 'Comprobantes', 'Pedidos', 'Compras', 'Condicionventas', 'Products', '$timeout', '$filter',
	function($scope, $rootScope, $stateParams, $location, Authentication, Providers, Enterprises, Subs, $mdBottomSheet, Contacts, Taxconditions, Categories, $mdDialog, $state, Comprobantes, Pedidos, Compras, Condicionventas, Products, $timeout, $filter ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			$scope.findAll();
			//console.log('search: ', $scope.SEARCH);
		});

		$scope.banco = { cbu: '0' };
		$scope.creditLimit = 0;
		$scope.discountRate = 0;
		$scope.country = 'Argentina';
		$scope.city = 'La Plata';
		$scope.region = 'Buenos Aires';
		$scope.postalCode = '1900';

		var marker, map;
		  $scope.$on('mapInitialized', function(evt, evtMap) {
		    map = evtMap;
		    marker = map.markers[0];
		  });

		  $scope.types = "['address']";
         $scope.placeChanged = function() {
         	$scope.errorDir = undefined;
           $scope.place = this.getPlace();
         }


		// Create new Provider
		$scope.create = function() {
			// Create new Provider object
			if(this.name !== undefined){
				if (this.address !== undefined){
					if (this.category1 !== undefined){
						if (this.taxcondition !== undefined){	
							if (this.condicionPago !== undefined){	
								if (this.tipoComprobante !== undefined){	
										var latitud = $scope.place.geometry.location.lat();
										var longitud = $scope.place.geometry.location.lng();
										var provider = new Providers ({
										name: this.name,
										creditLimit: this.creditLimit ? this.creditLimit : 0,
										fiscalNumber: this.fiscalNumber ? this.fiscalNumber : undefined,
										condicionPago: this.condicionPago ? this.condicionPago._id : undefined,
										banco: this.banco ? this.banco : undefined,
										comprobante: this.tipoComprobante ? this.tipoComprobante._id : undefined,
										taxCondition: this.taxcondition ? this.taxcondition._id : undefined,
										discountRate: this.discountRate ? this.discountRate : 0,
										costCenter: this.costCenter ? this.costCenter : undefined,
										paymentMethod: this.paymentMethod ? this.paymentMethod : undefined,
										contacts: this.contact ? [ this.contact._id ] : [], // cambiar por contactos seleccionados
										country: this.country ? this.country : undefined,
										city: this.city ? this.city : undefined,
										region: this.region ? this.region : undefined,
										postalCode: this.postalCode,
										address: this.address ? this.address : undefined,
										phone: this.phone ? this.phone : 0,
										loc: [latitud, longitud],
										//fax: this.fax,
										web: this.web ? this.web : undefined,
										enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
										category1: this.category1 ? this.category1._id : undefined,
										observaciones: this.observaciones ? this.observaciones : undefined,
										//sub: this.sub._id || undefined
									});

									console.log(provider);

									// Redirect after save
									provider.$save(function(response) {
										//$location.path('providers/' + response._id);

										if(response._id) {
											// agregar sub al array

											provider._id = response._id;
											$rootScope.providers.unshift(provider);

										}

										$state.go('home.providers');

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

									}, function(errorResponse) {
										$scope.error = errorResponse.data.message;
									});
								}
								else{
									$scope.errorComprobante = 'Se debe ingresar un tipo de comprobante';
								}	
							}
							else{
								$scope.errorCondicion = 'Se debe ingresar la condicion de Pago';
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
					$scope.errorDir = 'Se debe ingresar la direccion';
				}			
			}
			else{
				$scope.errorName = 'Se debe ingresar la razon social';
			}				
		};

		$scope.borrarError = function(){
			$scope.errorName = undefined;
			$scope.errorDir = undefined;
			$scope.errorCategory = undefined;
			$scope.errorTax = undefined;
			$scope.errorCondicion = undefined;
			$scope.errorComprobante = undefined;
		}


		// Update existing Provider
		$scope.update = function() {
			var provider = $scope.provider;
			if (this.enterprise !== undefined) { provider.enterprise = this.enterprise._id } else { provider.enterprise = provider.enterprise._id };
			//if (this.sub !== undefined) { provider.sub = this.sub._id } else { provider.sub = provider.sub._id };
			if (this.contact !== undefined) { provider.contacts = [ this.contact._id ] } else if ((provider.contacts[0]!==undefined)&&(provider.contacts[0]!==null)) { provider.contacts = [ provider.contacts[0]._id ]};
			if (this.taxcondition !== undefined) { provider.taxCondition = this.taxcondition._id } else if ((provider.taxCondition!==undefined)&&(provider.taxCondition!==null)){ provider.taxCondition = provider.taxCondition._id};
			if (this.condicionPago !== undefined) { provider.condicionPago = this.condicionPago._id } else if ((provider.condicionPago!==undefined)&&(provider.condicionPago!==null)) { provider.condicionPago = provider.condicionPago};
			if (this.tipoComprobante !== undefined) { provider.comprobante = this.tipoComprobante; } else if ((provider.tipoComprobante!==undefined)&&(provider.tipoComprobante!==null)) { provider.tipoComprobante = provider.comprobante};
			if (this.category1 !== undefined) { provider.category1 = this.category1._id } else if ((provider.category1!==undefined)&&(provider.category1!==null)) { provider.category1 = provider.category1._id};
			if ($scope.place !== undefined) { provider.loc = [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]} else if((provider.loc!==undefined)&&(provider.loc!==null)){ provider.loc = provider.loc};
			if (this.city !== undefined) { provider.city = this.city } else if ((provider.city!==undefined)&&(provider.city!==null)){ provider.city = provider.city};
			provider.$update(function() {
				$location.path('proveedores');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Providers
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) {
				$rootScope.providers = Providers.query({ e: $scope.SEARCH.enterprise });
			}

		};

		// Find a list of SBUs
		$scope.findEnterprises = function() {
			if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({e: $scope.SEARCH.enterprise }); };

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

		// Find a list of condiciones de pago
		$scope.findCondicionPagos = function() {
			if($scope.SEARCH !== undefined) { $scope.condicionPagos = Condicionventas.query({ e: $scope.SEARCH.enterprise });}
			//$scope.condicionPagos = [ 'Efectivo', 'Cheque', 'Transferencia' ];
		};

		// Find a list of Enterprises
		$scope.findCategories = function() {
			if ($scope.SEARCH !== undefined) { $scope.categories = Categories.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of Enterprises
		$scope.findCitys = function() {
			if ($scope.SEARCH !== undefined) { $scope.citys = ['Berisso', 'Ensenala', 'La Plata']; } // ToDo:  migrate this to a factory

		};

		$scope.findProductos = function() {
			if($scope.SEARCH !== undefined) { 
				$scope.products = Products.query({ e: $scope.SEARCH.enterprise })
			;}
		};


		$scope.findAll = function(){
			//$scope.findOne();
			$scope.findComprobantes();
			$scope.findCompras();
			$scope.findPedidos();
			$scope.findProductos();
		};

		$scope.findAllView = function(){
			$scope.findOne();
			$scope.findComprobantes();
			$scope.findCompras();
			$scope.findPedidos();
			
		};

		// Find existing Provider
		$scope.findOne = function() {
			$scope.provider = Providers.get({
				providerId: $stateParams.providerId
			});
			$scope.idProvider = $stateParams.providerId;
		};

		$scope.findComprobantes = function(){
			if ($scope.SEARCH !== undefined) {
				$scope.comprobantes = Comprobantes.query({e: $scope.SEARCH.enterprise }, function(res){
					$rootScope.comprobantes = res;
					$rootScope.comprobantesFiltro = res;
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
					for (var i in $rootScope.comprobantesFiltro) {
						if ($rootScope.comprobantesFiltro[i].name === 'Pedido'){
							$rootScope.comprobantesFiltro.splice(i, 1);
						}
					}
				});
			}
		};


		$scope.comprasA = [];
		$scope.comprasB = [];
		$scope.comprasC = [];

		$scope.findCompras = function() {
			if($scope.SEARCH !== undefined) {
				$scope.compras = Compras.query({ e: $scope.SEARCH.enterprise });
			}
			$timeout(function(){
				$scope.filtro = $filter('filter')($scope.compras, function(item){
					return (item.estado === 'Pendiente de pago y recepcion' || item.estado === 'Pendiente de pago2');
				})
				$scope.deudaProveedor = 0;
				for (var i in $scope.filtro){
					if ($scope.filtro[i].proveedor._id === $scope.idProvider){
						$scope.deudaProveedor = $scope.deudaProveedor + $scope.filtro[i].total;
					}
				}
				return $scope.filtro;
			},1000)
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

			//abre modal para eliminar un proveedor
			$scope.showConfirm = function(ev,item) {
				var confirm = $mdDialog.confirm()
		          .title('Eliminar Proveedor')
		          .content('¿Está seguro que desea eliminar este proveedor?')
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

			// Remove existing Provider
			$scope.remove = function( provider ) {
				if ( provider ) { provider.$remove();

					for (var i in $scope.$parent.providers ) {
						if ($scope.$parent.providers[i] === provider ) {
							$scope.$parent.providers.splice(i, 1);
						}
					}
				} else {
					$scope.provider.$remove(function() {
					});
				}
				$mdBottomSheet.hide();
			};

		};
	}
]);
