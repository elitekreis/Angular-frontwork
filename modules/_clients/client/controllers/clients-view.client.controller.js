'use strict';

// Comprobantes controller
angular.module('clients').controller('ClientsViewController', ['user', 'client', 'products', 'pedidos', 'ventas', '$scope',
	function(user, client, products, pedidos, ventas, $scope) {

		// $scope.$watch('deudaCliente', function (){
		// 	$scope.calcularDeuda();
		// });

		// asignacion de modelos
		this.user = user;
		this.client = client;
		this.products = products;
		this.pedidos = pedidos;
		this.ventas = ventas;
	    this.isOpen = false;
	    //variables para el menu
	    this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';
		// calcularDeuda();

		// asignacion de funciones

		this.calcularDeuda = calcularDeuda;

		this.calcularDeuda(ventas);

		// definicion de funciones
		function calcularDeuda (ventas){
			ventas.$promise.then(angular.bind(this, function(data) { 
				this.totalDeuda = 0;
				for (var i in data) {
					if ((data[i].cliente !== undefined ) && (data[i].cliente !== null)){
						if(data[i].cliente._id == client._id){
							if((data[i].estado == 'Pendiente de pago y entrega') || (data[i].estado=='Pendiente de pago2')){
								this.totalDeuda = this.totalDeuda + data[i].total; 
							}
						}
					}	
				};
			}));	
		}; //end calcularDeuda

	}//end function
]);