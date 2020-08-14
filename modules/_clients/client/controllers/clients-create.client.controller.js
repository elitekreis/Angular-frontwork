'use strict';

// condicionventas controller
angular.module('clients').controller('ClientsCreateController', ['$state', '$scope', 'user', 'clientes', 'client', 'enterprises', 'uens', 'condicionventas', 'categorias', 'contactos', 'condicionesdeiva', 'comprobantes', 'users', '$http',
	function($state, $scope, user, clientes, client, enterprises, uens, condicionventas, categorias, contactos, condicionesdeiva, comprobantes, users, $http) {

		// asignacion de modelos
		this.user = user;
		this.client = client;
		this.enterprises = enterprises;
		this.turnos = ['Mañana', 'Tarde', 'Noche'];
		this.zones = ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5'];
		this.subs = uens;
		this.condicionPagos = condicionventas;
		this.categories = categorias;
		this.contacts = contactos;
		this.taxconditions = condicionesdeiva;
		this.comprobantes = comprobantes;

		// asignacion de funciones
		this.create = create;
		this.borrarError = borrarError;

		// definicion de funciones

		// Create new Client
		function create () {
			var prod = [];
			if(this.name !== undefined){
				if(this.address !== undefined){
					if(this.taxcondition !== undefined){
						if(this.condicionPago !== undefined){
							if(this.tipoComprobante !== undefined){
								var client = new clientes ({
									name: this.name,
									creditLimit: this.creditLimit ? this.creditLimit : 0,
									fiscalNumber: this.fiscalNumber ? this.fiscalNumber : 0,
									taxCondition: this.taxcondition._id,
									condicionPago: this.condicionPago._id,
									comprobante: this.tipoComprobante._id,
									discountRate: this.discountRate ? this.discountRate : 0,
									loc: [$scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()],
									observaciones: this.observaciones ? this.observaciones : undefined,
									paymentMethod: this.paymentMethod,
									contacts: this.contact ? this.contact._id : undefined,
									country: this.country,
									city: this.city,
									region: this.region ? this.region : undefined,
									turno: this.turno ? this.turno : undefined,
									postalCode: this.postalCode ? this.postalCode : 1900,
									address: this.address,
									phone: this.phone ? this.phone : undefined,
									web: this.web ? this.web : undefined,
									mail: this.mail ? this.mail : undefined,
									isUser: this.isUser,
									category1: this.category1 ? this.category1._id : undefined,
									enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id,
									productosAsociados: prod
								});

								if (this.isUser){
									if (this.userName !== undefined){
										createUser(client,this.userName);
									}
									else{
										this.errorName = 'Se debe indicar el nombre de usuario para el nuevo usuario';
									}
								}else{
									client.$save(function(response) {
										$state.go('home.clients');
									}, function(errorResponse) {
										this.error = errorResponse.data.message;
									});
								}
							}
							else{
								this.errorComprobante = 'Se debe elegir un tipo de comprobante';
							}	
						}
						else{
							this.errorCondicion = 'Se debe elegir una condicion de pago';
						}	
					}
					else{
						this.errorTax = 'Se debe ingresar la condicion de IVA';
					}					
				}
				else{
					this.errorDir = 'Se debe ingresar la direccion';
				}	
			}
			else{
				this.errorName = 'Se debe ingresar la razon social del cliente';
			}			
		};

		function createUser (client,userName){
			var rol = [];
			rol.push('cliente');
			var persona = new users ({
				displayName: client.name,
				username: userName,
				email: client.mail,
				enterprise: client.enterprise,
				roles: rol,
				password: angular.lowercase(client.name + 'pass').split(' ').join('')
			});
			$http.post('/api/auth/signup', persona).success(function(response) {
				client.userLogin = response._id;
				client.$save(function(response) {
					$state.go('home.clients');
				}, function(errorResponse) {
					this.error = errorResponse.data.message;
				});
			});
		};

		function borrarError(){
			this.errorName = undefined;
			this.errorDir = undefined;
			this.errorSub = undefined;
			this.errorCategory = undefined;
			this.errorTax = undefined;
			this.errorCondicion = undefined;
			this.errorComprobante = undefined;
		}

		$scope.placeChanged = function() {
           $scope.place = this.getPlace();
           this.errorDir = undefined;
        }

	}
]);