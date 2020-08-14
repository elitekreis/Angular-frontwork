'use strict';

// Comprobantes controller
angular.module('providers').controller('ProvidersViewController', ['user', 'provider', 'products', 'pedidos', 'compras', '$scope', '$rootScope', 'Comprobantes', '$location', 
	function(user, provider, products, pedidos, compras, $scope, $rootScope, Comprobantes, $location) {


		// asignacion de modelos
		this.user = user;
		this.provider = provider;
		this.products = products;
		this.pedidos = pedidos;
		this.compras = compras;

		// asignacion de funciones

		this.deudaProveedor = deudaProveedor;
		this.rutaProducto = rutaProducto;

		this.deudaProveedor(compras);

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';
		
		// // definicion de funciones

		function deudaProveedor (compras){
			compras.$promise.then(angular.bind(this, function(data) { 
				this.total = 0;
				for (var i in data){
					if ((data[i].proveedor !== undefined ) && (data[i].proveedor !== null)){
						if (data[i].proveedor._id === provider._id){
							if (data[i].estado === 'Pendiente de pago y recepcion' || data[i].estado === 'Pendiente de pago2'){
								this.total = this.total + data[i].total;
							}
						}
					}
				}
			}))
		}; //end deudaProveedor

		function rutaProducto (id){
			$location.path('productos/view/' + id);
		}

	}//end function
]);

// .config(function($mdThemingProvider) {
//   $mdThemingProvider.theme('default')
//     .primaryPalette('pink')
//     .accentPalette('pink')
//     .warnPalette('')
//     .backgroundPalette('');
// });