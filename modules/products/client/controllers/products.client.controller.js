'use strict';

// Products controller
angular.module('products').controller('ProductsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Products', 'Enterprises', 'Subs', 'Categories', 'Providers', '$mdBottomSheet', 'Metrics', '$state', '$mdDialog', '$filter', 'Contacts', 'Taxconditions', 'Modal', 'Comprobantes', '$timeout', '$interval',
	function($scope, $rootScope, $stateParams, $location, Authentication, Products, Enterprises, Subs, Categories, Providers, $mdBottomSheet, Metrics, $state, $mdDialog, $filter, Contacts, Taxconditions, Modal, Comprobantes,$timeout, $interval) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			$scope.findProveedores();
			$scope.findComprobantes();
			//console.log('search: ', $scope.SEARCH);
		});

		$scope.$watchCollection('product', function (){
			if($scope.product!==undefined){
				$rootScope.tipoCategoria = $scope.product.category1.name;
				// console.log($rootScope.tipoCategoria.name);
			}
		});

		$scope.seleccionHabilitada = false;

		$rootScope.tipoProducto = $stateParams.tipo;

		$scope.selected = [];

		$scope.productosAgregados = [];

		$scope.productosGuardar = [];

		$scope.habilitarCheck = [];

		$scope.hayCantidad = [];

		$scope.errorRepetido = [];

		$scope.valorMateriaPrima = [];

		$scope.costoTotal = 0;

		$scope.modificar = false;

		$scope.verListado = false;

		$scope.selectedMode = 'md-scale';
	    $scope.selectedDirection = 'up';

		$scope.$watchCollection('tipoProducto', function(){
			if($scope.tipoProducto === 'p') {
				$scope.daFilter = { esProducto: true };
				$scope.title = 'Nuevo Producto';
				$scope.esProducto = true;
				$scope.esMateriaPrima = false;
				$scope.esInsumo = false;
				Categories.query({ e: $scope.SEARCH.enterprise }, function(res){
					for(var i=0;i<res.length;i++){
						if(res[i].name=='Productos Terminados'){
							$scope.category=res[i];
						}
					};
				});
			} else if ($scope.tipoProducto === 'm') {
				$scope.daFilter = { esMateriaPrima: true };
				$scope.title = 'Nueva Materia Prima';
				$scope.esMateriaPrima = true;
				$scope.esProducto = false;
				$scope.esInsumo = false;
				Categories.query({ e: $scope.SEARCH.enterprise }, function(res){
					for(var i=0;i<res.length;i++){
						if(res[i].name=='Materia Prima'){
							$scope.category=res[i];
						}
					};
				});
			} else if ($scope.tipoProducto === 'i') {
				$scope.daFilter = { esInsumo: true };
				$scope.title = 'Nuevo Insumo';
				$scope.esMateriaPrima = false;
				$scope.esProducto = false;
				$scope.esInsumo = true;
				Categories.query({ e: $scope.SEARCH.enterprise }, function(res){
					for(var i=0;i<res.length;i++){
						if(res[i].name=='Insumo'){
							$scope.category=res[i];
						}
					};
				});
			}	else {
					// do nothing... bad request
			}
		});

		$rootScope.$watchCollection('nuevoProveedor', function(){
			if($rootScope.nuevoProveedor!==undefined){
				$scope.mostrar = true;
				$scope.proveedor = $rootScope.nuevoProveedor;
				$scope.selectedItemChange($scope.proveedor);
			} else {
				$scope.mostrar = false;
			}
		});

		$scope.filtros = null;
		$scope.tipoFiltro = null;
		$scope.loadOptions = function() {
		    // Use timeout to simulate a 650ms request.
		    $scope.filtros =  $scope.filtros  || [
		        { id: 1, name: 'Proveedor' },
		        { id: 2, name: 'Categoria' }
		    ];
		}; //end loadOptions

		$scope.filtrosProd = null;
		$scope.tipoFiltroProd = null;
		$scope.loadOptions2 = function() {
		    // Use timeout to simulate a 650ms request.
		    $scope.filtrosProd =  $scope.filtrosProd  || [
		        { id: 1, name: 'Productos Terminados' },
		        { id: 2, name: 'Materias Primas' },
		        { id: 3, name: 'Insumos' }
		        // { id: 4, name: 'Todos' }
		    ];
		}; //end loadOptions2

		$scope.errorPrecios = undefined;

		// $scope.desactivar = function(n){
		// 	if (n == 1){
		// 		$scope.aumento == true;
		// 	}
		// 	else{
		// 		$scope.decremento == true;
		// 	}
		// }; //end desactivar

		$scope.waiting = false;

		$scope.rutaVolver = function(){
			// $rootScope.estadoActualParams.tipo = 'p';
			// $state.go('home.products', $rootScope.estadoActualParams);
			history.back();
		}

		$scope.actualizarPrecios = function(){
			if (($scope.tipoFiltro !== undefined) && ($scope.tipoFiltro !== null)){
				if (($scope.tipoFiltroProd !== undefined) && ($scope.tipoFiltroProd !== null)){
					if (($scope.descuentoPorcentaje !== undefined) && ($scope.descuentoPorcentaje !== null)){
						if ($scope.tipoFiltro.name === 'Proveedor'){
							if (($scope.provider !== null) && ($scope.provider !== undefined)){
								$scope.productosProv = $filter('filter')($scope.filtrados, function(item){
									return (item.provider._id === $scope.provider._id); 
								})	
								for (var i in $scope.productosProv){
									var product = $scope.productosProv[i];
									if (($scope.productosTipo == 'Materias') || ($scope.productosTipo == 'Insumos')){
										var descuentoValor = $scope.descuentoPorcentaje*product.costPerUnit/100;
										if ($scope.eleccion == 'Decremento'){
											product.costPerUnit = product.costPerUnit - descuentoValor;
										}
										else{
											product.costPerUnit = product.costPerUnit + descuentoValor;		
										}
										calcularActualizacion(product);
									}	
									else {
										if ($scope.productosTipo == 'Productos'){
											var descuentoValor = $scope.descuentoPorcentaje*product.unitPrice/100;
											if ($scope.eleccion == 'Decremento'){
												product.unitPrice = product.unitPrice - descuentoValor;
											}
											else{
												product.unitPrice = product.unitPrice + descuentoValor;	
											}
											calcularActualizacion(product);
										}
										else{
											// cuando es todos
										}
									}
								}
								if ($scope.productosProv.length == 0){
									$scope.errorPrecios = 'No existen productos para las opciones indicadas';	
								}
							}
							else{
								$scope.errorPrecios = 'Se debe indicar el proveedor ';
							}
						}
						else{
							// selecciona categoria
							if (($scope.category !== null) && ($scope.category !== undefined)){
								$scope.productosCat = $filter('filter')($scope.filtrados, function(item){
									return (item.category2._id === $scope.category._id); 
								})	
								for (var i in $scope.productosCat){
									var product = $scope.productosCat[i];
									if (($scope.productosTipo == 'Materias') || ($scope.productosTipo == 'Insumos')){
										var descuentoValor = $scope.descuentoPorcentaje*product.costPerUnit/100;
										if ($scope.eleccion == 'Decremento'){
											product.costPerUnit = product.costPerUnit - descuentoValor;
										}
										else{
											product.costPerUnit = product.costPerUnit + descuentoValor;		
										}
										calcularActualizacion(product);
									}	
									else {
										if ($scope.productosTipo == 'Productos'){
											var descuentoValor = $scope.descuentoPorcentaje*product.unitPrice/100;
											if ($scope.eleccion == 'Decremento'){
												product.unitPrice = product.unitPrice - descuentoValor;
											}
											else{
												product.unitPrice = product.unitPrice + descuentoValor;	
											}
											calcularActualizacion(product);
										}
										else{
											// cuando es todos
										}
									}
								}	
							}
							else{
								$scope.errorPrecios = 'Se debe indicar la categoria';
							}
						}
					}
					else{
						$scope.errorPrecios = 'Se debe indicar el porcentaje a aumentar';
					}
				}
				else{
					$scope.errorPrecios = 'Se deben indicar los tipos de productos a modificar';
				}
			}
			else{
				$scope.errorPrecios = 'Se debe indicar el filtro';
			}	
		} //end actualizarPrecios

		function calcularActualizacion(product){
			product.enterprise = product.enterprise._id;
			product.category1 = product.category1._id;
			product.category2 = product.category2._id;
			product.provider = product.provider._id;
			product.$update(function() {
				if (product.esMateriaPrima){
					actualizarReferencias(product);
				}
				$scope.waiting = true;
				// console.log('actualice m/i/p OKKK');
				$state.go('home.products', $rootScope.estadoActualParams);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		}; //end calcularActualizacion

		$scope.seleccionProveedor = false;
		$scope.seleccionCategoria = false;

		$scope.seleccionarFiltro = function(){
			$scope.errorPrecios = undefined;
			if ($scope.tipoFiltro.name === 'Proveedor'){
				$scope.seleccionCategoria = false;
				$scope.seleccionProveedor = true;
			}
			else{
				$scope.seleccionProveedor = false;
				$scope.seleccionCategoria = true;
			}
		} //end seleccionarFiltro

		$scope.prodCat = undefined;

		$scope.filtrarProductos = function(){
			$scope.category = undefined;
			$scope.productosTipo = undefined;
			$scope.errorPrecios = undefined;
			if ($scope.tipoFiltroProd.name == 'Productos Terminados'){
				$scope.prodCat = 'producto';
				$rootScope.estadoActualParams = {tipo: "p"};
				$scope.productosTipo = 'Productos';
				$scope.filtrados = $filter('filter')($rootScope.products, function(item){
					return (item.esProducto === true); 
				})
			}
			else{
				if ($scope.tipoFiltroProd.name == 'Materias Primas'){
					$scope.prodCat = 'Materia Prima';
					$rootScope.estadoActualParams = {tipo: "m"};
					$scope.productosTipo = 'Materias';
					$scope.filtrados = $filter('filter')($rootScope.products, function(item){
						return (item.esMateriaPrima === true); 
					})
				}
				else{
					if ($scope.tipoFiltroProd.name == 'Insumos'){
						$scope.prodCat = 'Insumo';
						$rootScope.estadoActualParams = {tipo: "i"};
						$scope.productosTipo = 'Insumos';
						$scope.filtrados = $filter('filter')($rootScope.products, function(item){
							return (item.esInsumo === true); 
						})
					}
					else{
						$rootScope.estadoActualParams = {tipo: "p"};
						$scope.productosTipo = 'Todos';
						$scope.filtrados = $rootScope.products;
					}
				}
			}
		} //end filtrarProductos

		$scope.habilitoSeleccion = function(){
			$scope.seleccionHabilitada = true;
		}; //end habilitoSeleccion

		$scope.asignarPrecio = function(){
			$scope.unitPrice = this.costPerUnit;
			$scope.errorCost = undefined;
			$scope.errorPrice = undefined;
		}; //end asignarPrecio

		$scope.exists = function(item, list) {
	        return list.indexOf(item._id) > -1;
	    }; //end exists

	    $scope.toggle = function (item, list, cant,i,n) {
	    	var p = { producto: {}, name: undefined, cantidad: undefined, total:undefined };
	    	var p2 = { producto: {}, cantidad: undefined, total:undefined };
	        var idx = list.indexOf(item);
	        if (idx > -1){
	        	list.splice(idx, 1);
	        	// $scope.habilitarCheck[i] = false;
	        	// $scope.cantidad = undefined;	
	        	for ( var i=0; i<$scope.productosAgregados.length;i++ ){
		    		if ($scope.productosAgregados[i].producto._id === item._id){
		    			$scope.hayCantidad[i] = false;
		    			$scope.productosAgregados.splice(i, 1);	
		    			$scope.productosGuardar.splice(i,1)
		    		}
		    	}
	        } 
	        else{
	        	//uso p y p2, uno para mosrtaar en la vista y el otro para guardar en bbbdd
	        	list.push(item);	
	        	p.producto = item;
	        	p.name = item.name;
	        	p.cantidad = cant;
	        	p.total = $scope.valorMateriaPrima[i];
	        	p2.producto = item._id
	        	p2.name = item.name;
	        	p2.cantidad = cant;
	        	p2.total = $scope.valorMateriaPrima[i];
	        	$scope.productosAgregados.push(p);
	        	$scope.productosGuardar.push(p2)
	        	$scope.hayCantidad[i] = true;
	        	calculoTotal();
	        	if (n === 1 ){
	        		for (var i in $scope.productosAgregados){
	        			$scope.product.produccion.push($scope.productosAgregados[i]);
	        		}
	        	}
	        	// $scope.habilitarCheck[i] = false;
	        }
	    }; //end toggle

	    function calculoTotal (){
	    	$scope.costoTotal = 0;
	    	for (var i in $scope.productosAgregados){
	    		$scope.costoTotal = $scope.costoTotal + $scope.productosAgregados[i].total;
	    	}
	    }; //end calculoTotal

	    $scope.addCant = function(i,p,cant){
	    	var monto = p.costPerUnit * cant;
	    	$scope.valorMateriaPrima[i] = monto;
	    	$scope.habilitarCheck[i] = true;
	    	$scope.errorRepetido[i] = undefined;
	    }; //end addCant

	    $scope.addMateria = function(item,cant,$index){
			var materiasEdit = this.product.produccion;
			var p = { producto: {},name: undefined, cantidad: undefined, total:undefined };
			var ok = false;
			for (var i in this.product.produccion){
				if (this.product.produccion[i].producto !== undefined){
					if (this.product.produccion[i].producto._id === item._id){
						ok = true;
						$scope.errorRepetido[$index] = 'Materia Prima existente';
					}
				}
			}
			if (ok === false ){
				p.producto = item._id;
				p.name = item.name;
				p.cantidad = cant;
				p.total = cant * item.costPerUnit;
				$scope.product.produccion.push(p);
				updateMateria();	
			}
		} //end addMateria

		function updateMateria() {
			var product = $scope.product;
			product.enterprise = $scope.SEARCH.enterprise;
			product.costPerUnit = actualizarCosto();	
			// for (var i in product.produccion){
			// 	product.produccion[i].producto = product.produccion[i].producto._id;
			// };	
		}; //end update

		// Create new Product
		$scope.create = function() {
			var costo = 0;
			var precio = undefined;
			for (var i in $scope.taxes){
				if ($scope.taxes[i].name === this.tax){
					var valorTax = $scope.taxes[i].value
				}
			}
			if ($scope.esProducto == true){
				costo = $scope.costoTotal;
			}
			else{
				if (this.costPerUnit !== undefined){
					costo = this.costPerUnit;
				}
				else{
					costo = undefined;
				}
			}
			if (this.reseller == true){
				if (this.unitPrice2 !== undefined){
					precio = this.unitPrice2;
				}
				else{
					precio = undefined;
				}
			}
			else{
				if (this.unitPrice !== undefined){
					precio = this.unitPrice;
				}
				else{
					precio = undefined;
				}
			}
			// Create new Product object
			if(this.name !== undefined){
				if(costo !== undefined){
					if(precio !== undefined){
						if(this.tax !== undefined){
							// if(this.sub !== undefined){
								if(this.category2 !== undefined){
									if(this.provider !== undefined){
										var product = new Products ({
											name: this.name,
											description: this.description ? this.description : undefined,
											code: this.code ? this.code : 0,
											produccion: $scope.productosGuardar,
											//picture: this.picture || undefined,
											brandName: this.brandName ? this.brandName : undefined,
											unitPrice: precio,
											costPerUnit: costo,
											// sku: this.sku,
											discontinued: this.discontinued,
											provider: this.provider._id,
											quantityPerUnit: this.quantityPerUnit,
											unitsInStock: this.unitsInStock ? this.unitsInStock: 0,
											idealStock: this.idealStock ? this.idealStock: 0,
											criticalStock: this.criticalStock ? this.criticalStock : 0,
											unitsOnOrder: this.unitsOnOrder,
											storedIn: this.storedIn ? this.storedIn : undefined,
											metric: this.metric ? this.metric : 'u.',
											reseller: this.reseller,
											visible: this.visible,
											esProducto: $scope.esProducto,
											esMateriaPrima: $scope.esMateriaPrima,
											esInsumo: $scope.esInsumo,
											//rawMaterial: this.rawMaterial,
											tax: this.tax ? valorTax : undefined,
											enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
											// sub: this.sub._id,
											category1: $scope.category,
											category2: this.category2 ? this.category2._id : undefined,
											// categor3: this.categor3._id,
											// categor4: this.categor4._id,
											// categor5: this.categor5._id
										});

										if (this.reseller === true){
											// createProduct(product);
											product.esProducto = true;
										}

										product.$save(function(response) {
											//$location.path('products/' + response._id);

											if(response._id) {
												// agregar sub al array

												product._id = response._id;
												$rootScope.products.unshift(product);

											}
											$state.go('home.products', $rootScope.estadoActualParams);

											// Clear form fields
											$scope.name = '';
											$scope.description = '';
											$scope.brandName = '';
											$scope.unitPrice = 0;
											$scope.costPerUnit = 0;
											$scope.sku = '';
											$scope.discontinued = false;
											$scope.quantityPerUnit = 1;
											$scope.unitsInStock = 0;
											$scope.unitsOnOrder = 0;
											$scope.visible = true;
											$scope.storedIn = '';
											$scope.metric = '';
											$scope.reseller = false;
											$mdBottomSheet.hide();
										}, function(errorResponse) {
											$scope.error = errorResponse.data.message;
										});
									}
									else{
										$scope.errorProv = 'Se debe especificar el proveedor del producto';
									}
								}
								else{
									$scope.errorCategory = 'Se debe especificar la categoria para el producto';	
								}
							// }
							// else{
							// 	$scope.errorSub = 'Se debe especificar la UEN para el producto';		
							// }
						}
						else{
							$scope.errorTax = 'Se debe especificar el iva para el producto';		
						}
					}
					else{
						$scope.errorPrice = 'Se debe especificar un precio para el producto';	
					}	
				}
				else{
					$scope.errorCost = 'Se debe especificar un costo para el producto';
				}		
			}
			else{
				$scope.errorName = 'Se debe especificar un nombre para el producto';	
			}				
		}; //end Create

		$scope.borrarError = function(){
			$scope.errorName = undefined;
			$scope.errorCost = undefined;
			$scope.errorPrice = undefined;
			$scope.errorTax = undefined;
			$scope.errorSub = undefined;
			$scope.errorCategory = undefined;
			$scope.errorPrecio = undefined;
			$scope.errorPrecios = undefined;
		} //end borrarError

		$scope.habilitarEdicion = function(){
			$scope.modificar = true;
		};

		$scope.habilitoLista = function(){
			$scope.verListado = true;
		}

		$scope.eliminar = function(p,item){	
			for (var i in p.produccion){
				if (p.produccion[i].producto === item.producto){
					$scope.product.costPerUnit = $scope.product.costPerUnit - item.total
					p.produccion.splice(i, 1);
				}
				else{
					p.produccion[i].producto = p.produccion[i].producto._id;
				}
			}
			$scope.product.produccion = p.produccion;
		} //end eliminar


		$scope.modificoProducto = function(item){
			item.total = item.cantidad * item.producto.costPerUnit;
			for (var i in $scope.product.produccion){
				if ($scope.product.produccion[i] == item){
					$scope.product.produccion[i].cantidad = item.cantidad;
					$scope.product.produccion[i].total = item.total;
					actualizarCosto();
				};
			};
		}; //end modificoProducto

		function actualizarCosto (){
			var valor = 0;
			for (var i in $scope.product.produccion){
				valor = valor + $scope.product.produccion[i].total;
			}
			$scope.product.costPerUnit = valor;
			return valor;
		}; //end actualizarCosto

		
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
		}; //end showConfirm

		
		$scope.remove = function( product ) {
			if ( product ) { product.$remove();

				for (var i in $scope.products ) {
					if ($scope.products [i] === product ) {
						$scope.products.splice(i, 1);
					}
				}
			} else {
				$scope.product.$remove(function() {
					$location.path('products');
				});
			}
		}; //end remove

		
		$scope.update = function() {
			$scope.modificar = false;
			var product = $scope.product;
			if (this.reseller2 == true){
				if ((this.unitPrice2 !== undefined)&&(this.unitPrice2 !== null)){
					product.reseller = true;
					product.unitPrice = this.unitPrice2;
					product.esProducto = true;
				}
				else{
					$scope.errorPrecio = 'Se debe indicar el precio de reventa del producto'
					return 0;
				}
			}
			// if (product.produccion.length !== 0){
			// 	for (var i in product.produccion){
			// 		product.produccion[i].producto = product.produccion[i].producto._id;
			// 	}
			// }
			if (this.enterprise !== undefined) { product.enterprise = this.enterprise} else { product.enterprise = product.enterprise._id };
			if (this.sub !== undefined) { product.sub = this.sub } else if ((product.sub!==undefined)&&(product.sub!==null)){ product.sub = product.sub._id };
			if (this.category1 !== undefined) { product.category1 = this.category1 } else if ((product.category1!==undefined)&&(product.category1!==null)) { product.category1 = product.category1._id };
			if (this.category2 !== undefined) { product.category2 = this.category2 } else if ((product.category2!==undefined)&&(product.category2!==null)) { product.category2 = product.category2 ? product.category2._id : undefined };
			if (this.provider !== undefined) { product.provider = this.provider } else if ((product.provider!==undefined)&&(product.provider!==null)) { product.provider = product.provider._id };
			if (this.tax !== undefined) { product.tax = this.tax } else if ((product.tax!==undefined)&&(product.tax!==null)) { product.tax = product.tax };
			if (this.metric !== undefined) { product.metric = this.metric } else if ((product.metric!==undefined)&&(product.metric!==null)){ product.metric = product.metric };
			product.$update(function() {
				if(product.esInsumo){
					$rootScope.estadoActualParams = {tipo: "i"};
				}
				if(product.esProducto){
					$rootScope.estadoActualParams = {tipo: "p"};
				}	
				if(product.esMateriaPrima){
					actualizarReferencias(product);
					$rootScope.estadoActualParams = {tipo: "m"};
				}
				console.log($rootScope.estadoActualParams, 'esatdo actual');
				$state.go('home.products', $rootScope.estadoActualParams);
			}, function(errorResponse) {
				// console.log(errorResponse, 'errrroor');
			});
		}; //end update

		function actualizarReferencias(p){
			for (var i in $rootScope.products){
				if ($rootScope.products[i].produccion !== undefined){
					if ($rootScope.products[i].produccion.length > 0){
						for (var j in $rootScope.products[i].produccion){
							if ($rootScope.products[i].produccion[j].producto !== undefined){
								if ($rootScope.products[i].produccion[j].producto == p._id){
									$rootScope.products[i].produccion[j].producto = p._id;
									$rootScope.products[i].produccion[j].name = p.name;
									$rootScope.products[i].produccion[j].total = p.costPerUnit;
								}
							}	
						}
						var nuevoTotal = 0;
						for (var x in $rootScope.products[i].produccion){
							nuevoTotal = nuevoTotal + ($rootScope.products[i].produccion[x].total*$rootScope.products[i].produccion[x].cantidad);
						}
						$rootScope.products[i].costPerUnit = nuevoTotal;
						$scope.product = $rootScope.products[i];
						$scope.update();
					}
				}	
			}	
		}; //end actualizarReferencias
		
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) {
				$rootScope.products = Products.query({ e: $scope.SEARCH.enterprise });
			};
		}; //end find

		
		$scope.findEnterprises = function() {
			if ($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise }); }
		}; //end findEnterprises

		// Find a list of SBUs
		$scope.findSubs = function() {
			if ($scope.SEARCH !== undefined) { $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise }); }
		}; //end findSubs

		$scope.findComprobantes = function() {
			if($scope.SEARCH !== undefined) {
				Comprobantes.query({ e: $scope.SEARCH.enterprise }, function(res){
					$rootScope.comprobantesFiltro = res;
					for (var i in $rootScope.comprobantesFiltro) {
						if ($rootScope.comprobantesFiltro[i].name === 'Pedido'){
							$rootScope.comprobantesFiltro.splice(i, 1);
						}
					}
					Modal.setComprobantes($rootScope.comprobantesFiltro);
				});
			}
		}; //end findComrpoabntes


		$scope.findSubcategories = function() {
			if ($scope.SEARCH !== undefined) { $scope.subcategories = Categories.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of Enterprises
		$scope.findProviders = function() {
			if ($scope.SEARCH !== undefined) { 
				$scope.providers = Providers.query({ e: $scope.SEARCH.enterprise }); 
			}
		};

		// Find a list of Enterprises
		$scope.findTaxes = function() {
			if ($scope.SEARCH !== undefined) { $scope.taxes = [ {value:1, name: 'Iva incluido en el precio'}, {value:10.5, name: '10.50%'}, {value:21, name: '21.00%'}, {value:27, name: '27.00%'}];
			};
		};

		// Find a list of Enterprises
		$scope.findMetrics = function() {
			if ($scope.SEARCH !== undefined) { 
				$scope.metrics = Metrics.query();
			}
		};

		// Find existing Product
		$scope.findOne = function() {
			Products.get({productId: $stateParams.productId}, function(res){
				$scope.product = res;
				if ($scope.product.tax == 1){
					$scope.vistaTax = 'Iva Incluido';
				}
				else{
					$scope.vistaTax = $scope.product.tax;
				}
			});
		};

		$scope.findProveedores = function() {
			if($scope.SEARCH !== undefined) { 
				$scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
				Modal.setProveedores($scope.proveedores);
			}		
		};

		$scope.findContacts = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.contacts = Contacts.query({e: $scope.SEARCH.enterprise });
				Modal.setContactos($scope.contacts);
			};
		};

		$scope.findCategories = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.categories = Categories.query({ e: $scope.SEARCH.enterprise });
				Modal.setCategorias($scope.categories);
			}
		};
		// Find a list of Taxconditions
		$scope.findTaxConditions = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.taxconditions = Taxconditions.query({e: $scope.SEARCH.enterprise });
				Modal.setCondiciones($scope.taxconditions);
			};
		};

		//autocomplete para seleccionar proveedor
		$scope.searchTextChange = function(text){
			var lowercaseQuery = angular.lowercase(text);
			return $filter('filter')($scope.proveedores, {name: text});
		};

		$scope.selectedItemChange = function (item) {		
			$scope.proveedor = item;
			$rootScope.provider = item;
			$scope.descProveedor();
		};

		//Trae el % de descuento del proveedor seleccionado, y vuelve a calcular valores si el % cambio
		$scope.descProveedor = function(){
			if (($scope.proveedor !== null) && ($scope.proveedor !== undefined)){
				$scope.idProveedor = $scope.proveedor._id;
				$scope.errorProv = undefined;
			}	
			else{
				$scope.idProveedor = 0;
			}		
		};

		$scope.minLenghtProv = 0;

		$scope.showAdvancedProvider = function(ev) {
			$scope.minLenghtProv = 1;
			$scope.textToSearch = undefined;
				$scope.findContacts();
				$scope.findCategories();
				$scope.findTaxConditions();
				Modal.setEmpresa($scope.SEARCH.enterprise);
				$mdDialog.show({
			      controller: CrearController,
			      templateUrl: '/modules/products/views/create.provider.view.html',
			      parent: angular.element(document.body),
			      targetEvent: ev,
			      clickOutsideToClose: false
			    })
			    .then(function(answer) {
			    	$scope.minLenghtProv = 0;
			      $scope.status = 'You said the information was "' + answer + '".';
			    }, function() {
			      $scope.status = 'You cancelled the dialog.';
			    });
		};

		$scope.showBottomSheet = function($event, item, model, param) {
			var template = '/modules/core/views/menu-opciones.client.view.html';
			$rootScope.currentItem = item;
			$rootScope.currentModel = model;
			$rootScope.currentParam = param;
	    	//console.log('estadoactual: ', $rootScope.estadoActual);
	    	$mdBottomSheet.show({
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
	  	};

	  	function DialogController($scope, $mdDialog, item, Areas) {

	  		$scope.item = item;

	  		$scope.goto = function (state, params) {
				if (state !== undefined) {
						$state.go(state, params);
						$mdBottomSheet.hide();
				}
			}

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

						for (var i in $scope.$parent.products ) {
							if ($scope.$parent.products [i] === product ) {
								$scope.$parent.products.splice(i, 1);
							}
						}
					} else {
						$scope.product.$remove(function() {
						});
					}

					$mdBottomSheet.hide();
				};

	  	};

	  	function CrearController($scope, $mdDialog, Modal, Providers) {

	  		$scope.clicked = false;
	  		
			$scope.contacts = Modal.getContactos();
			$scope.categories = Modal.getCategorias();
			// $scope.categories2 = [ 'Materia Prima', 'Insumo'];
			$scope.comprobantes = Modal.getComprobantes();
			$scope.taxconditions = Modal.getCondiciones();
			$scope.proveedores = Modal.getProveedores();
			$scope.condicionPagos = [ 'Efectivo', 'Cheque', 'Transferencia' ];
			$scope.taxconditions2 = [ 'Consumidor Final', 'Responsable Inscripto'];
			$scope.banco = {name: undefined, account: undefined, cbu: undefined, identity: undefined};
			$scope.creditLimit = 0;
			$scope.discountRate = 0;
			$scope.country = 'Argentina';
			$scope.city = 'La Plata';
			$scope.region = 'Buenos Aires';
			$scope.postalCode = '1900';
			// $scope.condicionPago = 'Efectivo';

			var marker, map;
			  $scope.$on('mapInitialized', function(evt, evtMap) {
			    map = evtMap;
			    marker = map.markers[0];
			});

			$scope.types = "['address']";

	        $scope.placeChanged = function() {
	        	$scope.errorDir = undefined;
	           $scope.place = this.getPlace();
	        };

			$scope.hide = function() {
				$mdDialog.hide();
			};

			$scope.cancel = function($event) {
				if ($event !== undefined){
					if ($event.keyCode == 0) {
						$mdDialog.cancel();
					}	
				}
			};

			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};

			// Create new Provider
			$scope.crearProveedor = function($event) {
				if ($event.keyCode == 0){
					var empresa = Modal.getEmpresa();
					// Create new Provider object
					if (this.name !== undefined){
						if (this.address !== undefined){
							var latitud = $scope.place.geometry.location.lat();
							var longitud = $scope.place.geometry.location.lng();
							// if (this.category1 !== undefined){
								if (this.taxcondition !== undefined){
									if (this.condicionPago !== undefined){
										if (this.comprobante !== undefined){
											var provider = new Providers ({
												name: this.name,
												creditLimit: this.creditLimit ? this.creditLimit : 0,
							  					fiscalNumber: this.fiscalNumber ? this.fiscalNumber : 0,
												condicionPago: this.condicionPago ? this.condicionPago._id : undefined,
												comprobante: this.comprobante ? this.comprobante._id : undefined,
												banco: this.banco,
												taxCondition: this.taxcondition ? this.taxcondition._id : undefined,
												discountRate: this.discountRate ? this.discountRate : 0,
												costCenter: this.costCenter,
												paymentMethod: this.paymentMethod,
												contacts: this.contact ? this.contact._id : undefined,  // cambiar por contactos seleccionados
												country: this.country,
												city: this.city,
												region: this.region ? this.region : undefined,
												postalCode: this.postalCode,
												address: this.address,
												phone: this.phone ? this.phone : undefined,
												loc: [latitud, longitud],
												//fax: this.fax,
												web: this.web ? this.web : undefined,
												enterprise: empresa,
												category1: this.category1 ? this.category1._id : undefined,
												//sub: this.sub._id || undefined
											});
											// Redirect after save
											provider.$save(function(response) {
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
												$scope.hide();
												$rootScope.nuevoProveedor = provider;
											}, function(errorResponse) {
												$scope.error = errorResponse.data.message;
											});
										}
										else{
											$scope.errorComprobante = 'Indicar el tipo de comprobante'
										}	
									}
									else{
										$scope.errorCondicion = 'Indicar condicion de pago'
									}		
								}
								else{
									$scope.errorTax = 'Indicar la condicion de iva'
								}	
							// }
							// else{
							// 	$scope.errorCategory = 'Indicar la categoria';
							// }		
						}
						else{
							$scope.errorDir = 'Indicar la direccion';
						}	
					}
					else{
						$scope.errorNameProv = 'Indicar la razón social';
					}	
				}	
			};

			$scope.borrarError = function(){
				$scope.errorNameProv = undefined;
				$scope.errorDir = undefined;
				$scope.errorCategory = undefined;
				$scope.errorTax = undefined;
				$scope.errorCondicion = undefined;
				$scope.errorComprobante = undefined;
			}
		};	

	}
]);
