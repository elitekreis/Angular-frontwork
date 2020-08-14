'use strict';

// Comprobantes controller
angular.module('products').controller('ProductsViewController', ['user', 'product', '$mdDialog', '$state', '$rootScope', '$http',
	function(user, product, $mdDialog, $state, $rootScope, $http) {

		// asignacion de modelos
		this.user = user;
		this.product = product;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';

	    this.rutaVolver = rutaVolver;

	    function rutaVolver (){
	  //   	if (product.esProducto){
	  //   		$rootScope.estadoActualParams.tipo = 'p';
	  //   	}
	  //   	else{
	  //   		if (product.esMateriaPrima){
	  //   			$rootScope.estadoActualParams.tipo = 'm';
	  //   		}
	  //   		else{
		 //    		if (product.esInsumo){
		 //    			$rootScope.estadoActualParams.tipo = 'i';
		 //    		}
		 //    	}
	  //   	}
			// $state.go('home.products', $rootScope.estadoActualParams);
			history.back()
		};

		// asignacion de funciones


		// definicion de funciones

	}
]);