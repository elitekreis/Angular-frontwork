'use strict';

// Comprobantes controller
angular.module('products').controller('ProductsListController', ['$location', '$rootScope', '$http', 'user', 'products', 'clienteCategories', 'enterprises', '$mdDialog', 'tipoProducto', '$mdBottomSheet',
	function($location, $rootScope, $http, user, products, clienteCategories, enterprises, $mdDialog, tipoProducto, $mdBottomSheet) {

		// asignacion de modelos
		this.user = user;
		this.products = products;
		this.enterprises = enterprises;
		// this.materias = materias;
		// this.insumos = insumos;
		this.tipoProducto = tipoProducto;
		this.daFilter = undefined;

		$rootScope.tipoProducto = tipoProducto;

		this.totalCosto = 0;

		// asignacion de funciones

		this.filtrar = filtrar;
		this.showBottomSheet = showBottomSheet;
		this.initTotalCostos = initTotalCostos;
		this.costoVariable = costoVariable;
		this.rutaProducto = rutaProducto;
		this.extraerListado = extraerListado;
		this.clienteCategories = clienteCategories;
		this.priceByCategory = priceByCategory;
		this.priceMixedByCategory = priceMixedByCategory;

		this.filtrar();
		this.costoVariable(products);

		// // definicion de funciones
		function rutaProducto(id){
			$location.path('productos/view/' + id);
		}

		function filtrar (){
			if (this.tipoProducto == 'm'){
				this.daFilter = { esMateriaPrima : true};
			}
			else{
				if (this.tipoProducto == 'p'){
					this.daFilter = { esProducto : true};
				}
				else{
					this.daFilter = { esInsumo : true};	
				}
			}
		}	

		function showBottomSheet ($event, item, model, param) {
			var template = '/modules/core/views/menu-opciones.client.view.html';
			$rootScope.currentItem = item;
			$rootScope.currentModel = model;
			$rootScope.currentParam = param;
	    	//console.log('estadoactual: ', $rootScope.estadoActual);
	    	$mdBottomSheet.show({
	    		// parent: angular.element(document.body),
		      	templateUrl: template,
		      	controller: DialogController,
		      	// controller: 'ListBottomSheetCtrl',
		      	targetEvent: $event,
		      	resolve: {
		         	item: function () {
		           	return item;
		         	}
		       	}

		    }).then(function(clickedItem) {
		    	//$mdBottomSheet.hide();
		    	// console.log('por aqui ando');
		    });
	  	}

		function initTotalCostos(){
			for(var i=0; i<clienteCategories.length; i++){
				clienteCategories[i].totalCosto = 0;
				clienteCategories[i].cant = 0;
			}
		}

	  	function costoVariable (products) {

			products.$promise.then(angular.bind(this, function(data) {
				this.totalCosto = 0;
				var cant = 0;
				var total = 0;
				if (tipoProducto == 'p'){
					this.initTotalCostos();
					for (var i in data) {
						if ((data[i].deleted == false) && (data[i].esProducto == true)){
							for(var j in data[i].catPrice){
								for(var k=0; k<clienteCategories.length; k++){
									if(data[i].catPrice[j].category == clienteCategories[k].category){
										if(data[i].catPrice[j].price > 0){
											clienteCategories[k].totalCosto += (data[i].costPerUnit / data[i].catPrice[j].price * 100);
											clienteCategories[k].cant = clienteCategories[k].cant + 1;
										}
									}
								}
							}
						}
					}
					
					for(var k=0; k<clienteCategories.length; k++){
						if(clienteCategories[k].cant > 0){
							clienteCategories[k].totalCosto = parseFloat(clienteCategories[k].totalCosto) / 5;
							clienteCategories[k].totalCosto = Math.round(clienteCategories[k].totalCosto * 100) / 100;
						}
					}
				}
				else{
					if (tipoProducto == 'm'){
						for (var i in data) {					
							if ((data[i].deleted == false) && (data[i].esMateriaPrima == true) && (data[i].unitPrice > 0)){
								cant = cant + 1;
								var unidad = data[i].costPerUnit/data[i].unitPrice*100;
								total = total + unidad;
							}
						}
					}
					else{
						if (tipoProducto == 'i'){
							for (var i in data) {					
								if ((data[i].deleted == false) && (data[i].esInsumo == true) && (data[i].unitPrice > 0)){
									cant = cant + 1;
									var unidad = data[i].costPerUnit/data[i].unitPrice*100;
									total = total + unidad;
								}
							}
						}
					}
				}
				if(cant == 0){
					total = 0;
				}else{
					total = total/cant;
				}
				this.totalCosto = Math.round(total * 100) / 100;
			}));
		}	

		function extraerListado (){
			var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
		   	var b = document.getElementById('printing-css-listado').value;
		   	var c = document.getElementById('printing-data-listado').innerHTML;
		   	window.frames["print_frame_listado"].document.title = 'IM - Productos';
		   	window.frames["print_frame_listado"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
		   	window.frames["print_frame_listado"].window.focus();
		   	window.frames["print_frame_listado"].window.print();
		}

		function httpGet(theUrl){
		    var xmlHttp = null;
		    xmlHttp = new XMLHttpRequest();
		    xmlHttp.open( "GET", theUrl, false );
		    xmlHttp.send( null );
		    return xmlHttp.responseText;
		} //end httpGet

	  	function DialogController($scope, $mdDialog, item, $state) {

			$scope.item = item;

			$scope.goto = function (state, params) {
				params.tipo = this.tipoProducto;
				if (state !== undefined) {
					$state.go(state, params);
					$mdBottomSheet.hide();
				}
			};

			//abre modal para eliminar un producto
			$scope.showConfirm = function(ev,item) {
				var confirm = $mdDialog.confirm()
					.title('Eliminar Producto')
					.content('¿Está seguro que desea eliminar este producto?')
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

			// Remove existing Product
			$scope.remove = function( product ) {
				if ( product ) { product.$remove();

					// for (var i in $parent.products ) {
					// 	if ($parent.products [i] === product ) {
					// 		$parent.products.splice(i, 1);
					// 	}
					// }
				} else {
					product.$remove(function() {
					});
				}

				$mdBottomSheet.hide();
			};
		}

		function priceMixedByCategory(item, categoryId){
			var price = this.priceByCategory(item, categoryId);
			var costPerUnit = 0;
			if(price != 0){
				costPerUnit = (item.costPerUnit / parseFloat(price) * 100);
			}
			return '$' + parseFloat(price).toFixed(2) + ' / ' +  costPerUnit.toFixed(2) + '%';
		}

		function priceByCategory(item, categoryId){
			for(var i=0; i<item.catPrice.length; i++){
				if(item.catPrice[i].category == categoryId){
					return item.catPrice[i].price;
				}
			}
			return 0;
		}

	}
]);