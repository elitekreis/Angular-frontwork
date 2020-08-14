'use strict';

// Comprobantes controller
angular.module('providers').controller('ProvidersCreateController', ['user', 'provider', 'providers', 'enterprises', 'categories', 'contacts', 'taxconditions', 'condicionPagos', 'comprobantes', '$scope', '$state',
	function(user, provider, providers, enterprises, categories, contacts, taxconditions,condicionPagos, comprobantes, $scope,$state) {

		// asignacion de modelos
		this.user = user;
		this.provider = provider;
		this.enterprises = enterprises;
		this.categories = categories;
		this.contacts = contacts;
		this.taxconditions = taxconditions;
		this.condicionPagos = condicionPagos;
		this.comprobantes = comprobantes;		
		

		// asignacion de funciones
		this.create = create;
		this.borrarError = borrarError;
		
		// definicion de funciones

		var marker, map;

		$scope.$on('mapInitialized', function(evt, evtMap) {
		    map = evtMap;
		    marker = map.markers[0];
		}); //end mapInitialized

		$scope.types = "['address']";

        $scope.placeChanged = function() {
        	borrarError();
        	$scope.place = this.getPlace();
        }; //end placeChanged


		// Create new Provider
		function create () {
			if(this.name !== undefined){
				if (this.address !== undefined){
					if (this.category1 !== undefined){
						if (this.taxcondition !== undefined){	
							if (this.condicionPago !== undefined){	
								if (this.tipoComprobante !== undefined){	
										var latitud = $scope.place.geometry.location.lat();
										var longitud = $scope.place.geometry.location.lng();
										var provider = new providers ({
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
										contact: this.contact ? this.contact : undefined, 
										address: this.address ? this.address : undefined,
										phone1: this.phone1 ? this.phone1 : 0,
										phone2: this.phone2 ? this.phone2 : 0,
										mail1: this.mail1 ? this.mail1 : 0,
										mail2: this.mail2 ? this.mail2 : 0,
										loc: [latitud, longitud],
										impuesto1: this.imp1 ? this.imp1 : 0,
										impuesto2: this.imp2 ? this.imp2 : 0,
										impuesto3: this.imp3 ? this.imp3 : 0,
										impuesto4: this.imp4 ? this.imp4 : 0,
										web: this.web ? this.web : undefined,
										enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
										category1: this.category1 ? this.category1._id : undefined,
										observaciones: this.observaciones ? this.observaciones : undefined
									});

									// Redirect after save
									provider.$save(function(response) {
										if(response._id) {
											// agregar sub al array
											provider._id = response._id;
										}
										$state.go('home.providers');

									}, function(errorResponse) {
										console.log(errorResponse, 'error');
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
		}; //end create

		function borrarError (){
			$scope.errorName = undefined;
			$scope.errorDir = undefined;
			$scope.errorCategory = undefined;
			$scope.errorTax = undefined;
			$scope.errorCondicion = undefined;
			$scope.errorComprobante = undefined;
		} //end borrarError


	} //end function
]);