'use strict';

// Enterprises controller
angular.module('enterprises').controller('EnterprisesController', ['$scope', '$rootScope','$stateParams', '$location', 'Authentication', 'Enterprises', '$mdBottomSheet', '$mdDialog', 'Comprobantes', 'Categories', 'Condicionventas', 'Taxconditions', 'Clients', '$q', 'Areas',
	function($scope, $rootScope, $stateParams, $location, Authentication, Enterprises, $mdBottomSheet, $mdDialog, Comprobantes, Categories, Condicionventas, Taxconditions, Clients, $q, Areas ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			//console.log('search: ', $scope.authentication.user.roles[0]);
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

		// Create new Enterprise
		$scope.create = function() {
			// Create new Enterprise object
			var enterprise = new Enterprises ({
				name: this.name,
				description: this.description,
				email: this.email,
				fiscalNumber: this.fiscalNumber,
				taxCondition: this.taxCondition,
				// country: this.country,
				// city: this.city,
				region: this.region,
				postalCode: this.postalCode,
				address: this.address,
				loc: [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()],
				phone: this.phone,
				fax: this.fax,
				web: this.web
			});

			// Redirect after save
			enterprise.$save(function(response) {
				// $location.path('enterprises/' + response._id);
				if(response._id) {
					enterprise._id = response._id;
					$rootScope.enterprises.unshift(enterprise);
				}

				//*** Crea toda la configuracion necesaria para la nueva empresa
				
				//*** CREA DIRECTORIO

				var area = new Areas ({
					name: 'Directorio',
					nivel: 0,
					enterprise: enterprise._id,
				});
				// Redirect after save
				area.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				//*** FIN CREA DIRECTORIO

				//*** CREA COMPROBANTES

				var facturaA = new Comprobantes ({
					name: 'Factura A',
					letra: 'A',
					puntoDeVenta: '1',
					modoFacturacion: 'Talonario fiscal manual o pre-impreso',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				facturaA.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var facturaB = new Comprobantes ({
					name: 'Factura B',
					letra: 'B',
					puntoDeVenta: '1',
					modoFacturacion: 'Talonario fiscal manual o pre-impreso',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});


				function asyncGuardarFacturaB() {
				    var deferred = $q.defer();
				    facturaB.$save(function(response) {
						if(response._id) {
							facturaB._id = response._id;
						}
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
					setTimeout(function() {
					    if (facturaB!==undefined) {
					      deferred.resolve('Hello');
					    } else {
					      deferred.reject('Greeting');
					    }
					  }, 1000);
					  return deferred.promise;
				}


				var facturaC = new Comprobantes ({
					name: 'Factura C',
					letra: 'C',
					puntoDeVenta: '1',
					modoFacturacion: 'Talonario fiscal manual o pre-impreso',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				facturaC.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var ordenDePago = new Comprobantes ({
					name: 'Orden De Pago',
					letra: 'O',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				ordenDePago.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var notaDeCredito = new Comprobantes ({
					name: 'Nota De Credito',
					letra: 'NC',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				notaDeCredito.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var notaDeDebito = new Comprobantes ({
					name: 'Nota De Debito',
					letra: 'ND',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				notaDeDebito.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var remitoDevolucion = new Comprobantes ({
					name: 'Remito De Devolucion',
					letra: 'RD',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				remitoDevolucion.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var pedido = new Comprobantes ({
					name: 'Pedido',
					letra: 'P',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				pedido.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var presupuesto = new Comprobantes ({
					name: 'Presupuesto',
					letra: 'X1',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				presupuesto.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var reciboPago = new Comprobantes ({
					name: 'Recibo De Pago',
					letra: 'X2',
					puntoDeVenta: '',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				reciboPago.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var remito = new Comprobantes ({
					name: 'Remito',
					letra: 'R',
					puntoDeVenta: '1',
					modoFacturacion: 'Comprobante interno',
					movimientoStock: false,
					movimientoCC: false,
					movimientoOperacionInversa: false,
					funcionalidadSituacion: false,
					autoAprobar: false,
					enterprise: enterprise._id,
				});

				remito.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				//*** FIN CREA COMPROBANTES

				//*** CREA CATEGORIAS

				var materiaPrima = new Categories ({
					name: 'Materia Prima',
					description: 'MP para lavar y cortar',
					type1: 'Materia Prima',
					enterprise: enterprise._id
				});
				// Redirect after save
				materiaPrima.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var insumo = new Categories ({
					name: 'Insumo',
					description: 'Insumo para desarrollo de actividades',
					type1: 'Insumo',
					enterprise: enterprise._id
				});
				// Redirect after save
				insumo.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var productosTerminados = new Categories ({
					name: 'Productos Terminados',
					description: 'Productos Elaborados',
					type1: 'Producto',
					enterprise: enterprise._id
				});
				// Redirect after save
				productosTerminados.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				//*** FIN CREA CATEGORIAS

				//*** CREA CONDICIONES DE PAGO

				var cuentaCorriente = new Condicionventas ({
					name: 'Cuenta Corriente',
					description: '',
					enterprise: enterprise._id
				});

				// Redirect after save
				cuentaCorriente.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var cheque = new Condicionventas ({
					name: 'Cheque',
					description: '',
					enterprise: enterprise._id
				});

				// Redirect after save
				cheque.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var efectivo = new Condicionventas ({
					name: 'Efectivo',
					description: '',
					enterprise: enterprise._id
				});

				// Redirect after save
				// efectivo.$save(function(response) {
				// 	if(response._id) {
				// 		efectivo._id = response._id;
				// 	}
				// }, function(errorResponse) {
				// 	$scope.error = errorResponse.data.message;
				// });

				function asyncGuardarEfectivo() {
				    var deferred = $q.defer();
				    efectivo.$save(function(response) {
						if(response._id) {
							efectivo._id = response._id;
						}
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
					setTimeout(function() {
					    if (efectivo!==undefined) {
					      deferred.resolve('Hello');
					    } else {
					      deferred.reject('Greeting');
					    }
					  }, 1000);
					  return deferred.promise;
				}

				var transferencia = new Condicionventas ({
					name: 'Transferencia',
					description: '',
					enterprise: enterprise._id
				});

				// Redirect after save
				transferencia.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var tarjetaDeCredito = new Condicionventas ({
					name: 'Tarjeta De Credito',
					description: '',
					enterprise: enterprise._id
				});

				// Redirect after save
				tarjetaDeCredito.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var tarjetaDeDebito = new Condicionventas ({
					name: 'Tarjeta De Debito',
					description: '',
					enterprise: enterprise._id
				});

				// Redirect after save
				tarjetaDeDebito.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				//*** FIN CREA CONDICIONES DE PAGO

				//*** CREA CONDICIONES DE IVA

				var responsableInscripto = new Taxconditions ({
					name: 'Responsable Inscripto',
					enterprise: enterprise._id
				});

				// Redirect after save
				responsableInscripto.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var monotributo = new Taxconditions ({
					name: 'Monotributo',
					enterprise: enterprise._id
				});

				// Redirect after save
				monotributo.$save(function(response) {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

				var consumidorFinal = new Taxconditions ({
					name: 'Consumidor Final',
					enterprise: enterprise._id
				});

				// Redirect after save
				// consumidorFinal.$save(function(response) {
				// 	if(response._id) {
				// 		consumidorFinal._id = response._id;
				// 	}
				// }, function(errorResponse) {
				// 	$scope.error = errorResponse.data.message;
				// });
				function asyncGuardarConsumidorFinal() {
				    var deferred = $q.defer();
				    consumidorFinal.$save(function(response) {
						if(response._id) {
							consumidorFinal._id = response._id;
						}
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
					setTimeout(function() {
					    if (consumidorFinal!==undefined) {
					      deferred.resolve('Hello');
					    } else {
					      deferred.reject('Greeting');
					    }
					  }, 1000);
					  return deferred.promise;
				}

				//*** FIN CREA CONDICIONES DE IVA

				//*** CREA CLIENTES
				var promiseFacturaB = asyncGuardarFacturaB();
				var promiseEfectivo = asyncGuardarEfectivo();
				var promiseConsumidorFinal = asyncGuardarConsumidorFinal();
				promiseFacturaB.then(function(response) {
					promiseEfectivo.then(function(response) {
						promiseConsumidorFinal.then(function(response) {
							// console.log(consumidorFinal._id, "id consumidor final");
							// console.log(efectivo._id, "id efectivo");
							// console.log(facturaB._id, "id facturaB");
							var cliente = new Clients ({
								name: 'Consumidor Final',
								taxCondition: consumidorFinal._id,
								condicionPago: efectivo._id,
								comprobante: facturaB._id,
								loc: [ -34.9204948000000002, -57.9535657000000128 ],
								enterprise: enterprise._id
							});
							// Redirect after save
							cliente.$save(function(response) {
							}, function(errorResponse) {
								$scope.error = errorResponse.data.message;
							});
  						});
  					});
  				});

				//*** FIN CREA CLIENTES

				// Clear form fields
				$scope.name = '';
				$scope.description = '';

				$mdBottomSheet.hide();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//abre modal para eliminar un puesto
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Empresa')
	          .content('¿Está seguro que desea eliminar esta empresa?')
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

		// Remove existing Enterprise
		$scope.remove = function( enterprise ) {
			if ( enterprise ) { enterprise.$remove();

				for (var i in $scope.enterprises ) {
					if ($scope.enterprises [i] === enterprise ) {
						$scope.enterprises.splice(i, 1);
					}
				}
			} else {
				$scope.enterprise.$remove(function() {
					$location.path('enterprises');
				});
			}
		};

		// Update existing Enterprise
		$scope.update = function() {
			var enterprise = $scope.enterprise ;

			if($scope.place !== undefined) { enterprise.loc = [ $scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]} else { enterprise.loc = enterprise.loc};

			enterprise.$update(function() {
				$location.path('empresas');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Enterprises
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.enterprises = Enterprises.query(); };

		};

		// Find existing Enterprise
		$scope.findOne = function() {
			$scope.enterprise = Enterprises.get({
				enterpriseId: $stateParams.enterpriseId
			});
		};
	}


]);
