
'use strict';

// Compras controller
angular.module('compras')
.controller('ComprasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Compras', 'Enterprises', 'Comprobantes', 'Condicionventas', 'Products', 'Providers', '$mdBottomSheet', '$state', 'lodash', '$mdDialog', '$timeout', '$filter', 'Modal', 'Categories', 'Subs', 'Metrics', '$http', 'Contacts', 'Taxconditions', 'HistorialCompras', '$q',
	function($scope, $rootScope, $stateParams, $location, Authentication, Compras, Enterprises, Comprobantes, Condicionventas, Products, Providers, $mdBottomSheet, $state, lodash, $mdDialog, $timeout, $filter, Modal, Categories, Subs, Metrics, $http, Contacts, Taxconditions, HistorialCompras, $q) {
		$scope.authentication = Authentication;
		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			$scope.findProveedores();
			$scope.findProductos();
			//condiciones para el select
			$scope.findComprobantes();
			$scope.findCondicionesventas();
            $scope.findOne();
		});

		var created = new Date();
		$scope.created = new Date(created.setTime(created.getTime() + (3*60*60*1000)));
		
		$scope.$watchCollection('compraVerificada', function (){
		});

		$rootScope.$watchCollection('nuevoProveedor', function(){
			if($rootScope.nuevoProveedor!==undefined){
				$scope.mostrar = true;
				$scope.proveedor = $rootScope.nuevoProveedor;
				$scope.selectedItemChange($scope.proveedor);
				$rootScope.nuevoProveedor = undefined;
			} else {
				$scope.mostrar = false;
			}
		});
		$rootScope.$watchCollection('nuevaMateriaPrima', function(){
			if($rootScope.nuevaMateriaPrima !==undefined){
				$scope.mostrarMateria = true;
				$http({ method: 'GET',
		            url: ('/api/products/' + $rootScope.nuevaMateriaPrima._id),
		            params: {  }
		        })
				.then(function(response) {
		            $scope.producto = response.data;
		        }, function(response) {
		            console.log('error');
		        });
				// $scope.producto = $rootScope.nuevaMateriaPrima ;
				$scope.selectedItemChangeProduct($scope.producto);
			} else {
				$scope.mostrarMateria = false;
			};
		});
		$scope.modoEdicion = false;
		$scope.isFocus = false;
		
		$scope.initAutocomplete = function(){
			$scope.findProductos();
			$scope.searchTextChangeProduct('');
		};
		$scope.activarEdicion = function(compra){
			$scope.modoEdicion = true;
			$scope.compraVerificada = angular.copy(compra);
			$location.hash('verificacion');
			// console.log($scope.compraVerificada);
		};

		$scope.cerrarEdicion = function(compra){
			$scope.modoEdicion = false;
			$scope.compraVerificada = undefined;
		};

		$scope.modificoProducto = function(p){
			actualizarValoresProducto(p);
			calcularTotalesVerificacion();
			$scope.modificarPrecioProducto(p.product);
		};

		function actualizarValoresProducto(p){
			for(var i = 0; i<$scope.compraVerificada.products.length; i++){
				if($scope.compraVerificada.products[i]._id==p._id){
					var total = 0;
					var desc = $scope.compraVerificada.products[i].descuento * $scope.compraVerificada.products[i].product.costPerUnit / 100;
					var descTotal = desc * $scope.compraVerificada.products[i].cantidad;
					// console.log(desc, 'desc');
					// console.log(descTotal, 'descTotal');
					total = $scope.compraVerificada.products[i].product.costPerUnit * $scope.compraVerificada.products[i].cantidad;
					// console.log(total, 'total');
					$scope.compraVerificada.products[i].total = total - descTotal;
					$scope.compraVerificada.products[i].subtotal = total;
					// console.log($scope.compraVerificada.products[i]);
				}
			}
		}

		function calcularTotalesVerificacion(){
			// console.log($scope.compraVerificada);
			var sub = 0;
			var totTax1 = 0;
			var totTax2 = 0;
			var totTax3 = 0;
			var descP = 0;
			var i;
			var tax1 = [];
			var tax2 = [];
			var tax3 = [];
			if ($scope.compraVerificada.descuentoPorcentaje !== undefined){
				descP = parseFloat($scope.compraVerificada.descuentoPorcentaje);
			}
			for (i = 0; i < $scope.compraVerificada.products.length; i++) {
				//descuentos
				if ($scope.compraVerificada.products[i].descuento === undefined){
					$scope.compraVerificada.products[i].descuento = 0;
				}
				if (($scope.compraVerificada.products[i].cantidad === undefined) || ($scope.compraVerificada.products[i].cantidad === null)){
					$scope.compraVerificada.products[i].cantidad = 0;
				}
				if ($scope.compraVerificada.products[i].product.costPerUnit === undefined){
					$scope.compraVerificada.products[i].product.costPerUnit = 0;
				}
   				var desc = parseFloat($scope.compraVerificada.products[i].descuento) * $scope.compraVerificada.products[i].product.costPerUnit / 100;
   				var finalPrice = parseFloat($scope.compraVerificada.products[i].product.costPerUnit) - desc;
   				var additionalIva = parseFloat($scope.compraVerificada.products[i].product.tax) * parseFloat(finalPrice) / 100;
				if(parseFloat($scope.compraVerificada.products[i].product.tax) === 10.5){
					tax1.push(additionalIva*parseFloat($scope.compraVerificada.products[i].cantidad));
				}
				if(parseFloat($scope.compraVerificada.products[i].product.tax) === 21){
					tax2.push(additionalIva*parseFloat($scope.compraVerificada.products[i].cantidad));
				}
				if(parseFloat($scope.compraVerificada.products[i].product.tax) === 27){
					tax3.push(additionalIva*parseFloat($scope.compraVerificada.products[i].cantidad));
				}
				// console.log('cantidad', $scope.compraVerificada.products[i].cantidad);
				// console.log('final price', finalPrice);
   				sub = sub + parseFloat($scope.compraVerificada.products[i].cantidad)*finalPrice;
			}
			if(tax1.length > 0){
				for (i = 0; i < tax1.length; i++) {
	   				totTax1 = totTax1 + parseFloat(tax1[i]);
   				}
			}
			if(tax2.length > 0){
				for (i = 0; i < tax2.length; i++) {
	   				totTax2 = totTax2 + parseFloat(tax2[i]);
   				}
			}
			if(tax3.length > 0){
				for (i = 0; i < tax3.length; i++) {
	   				totTax3 = totTax3 + parseFloat(tax3[i]);
   				}
			}
			// console.log(sub);
			$scope.compraVerificada.subtotal = sub;
			var descV = sub * descP / 100;
			var d = $scope.compraVerificada.descuentoPorcentaje * $scope.compraVerificada.subtotal / 100;
			$scope.compraVerificada.descuentoValor = d;

			$scope.compraVerificada.neto = $scope.compraVerificada.subtotal - d;
			$scope.compraVerificada.tax1 = totTax1;
			$scope.compraVerificada.tax2 = totTax2;
			$scope.compraVerificada.tax3 = totTax3;
			$scope.compraVerificada.totalTax = totTax1 + totTax2 + totTax3;;
			$scope.compraVerificada.total = $scope.compraVerificada.neto + totTax1 + totTax2 + totTax3;
		};

		$scope.modificarPrecioProducto = function(p){
			$rootScope.products = $scope.products;
			for (var i in $rootScope.products){
				if ($rootScope.products[i]._id === p._id){
					var cost = p.costPerUnit;
					p = $rootScope.products[i];
					var product = new Products ({
						_id : p._id,
						name : p.name,
						description: p.description,
						code: p.code,
						//picture: this.picture || undefined,
						brandName: p.brandName,
						unitPrice: cost,
						costPerUnit: cost,
						// sku: p.sku,
						discontinued: p.discontinued,
						provider: p.provider,
						quantityPerUnit: p.quantityPerUnit,
						unitsInStock: p.unitsInStock,
						idealStock: p.idealStock,
						criticalStock: p.criticalStock,
						unitsOnOrder: p.unitsOnOrder,
						storedIn: p.storedIn,
						metric: p.metric,
						reseller: p.reseller,
						visible: p.visible,
						esProducto: p.esProducto,
						esMateriaPrima: p.esMateriaPrima,
						esInsumo: p.esInsumo,
						//rawMaterial: p.rawMaterial,
						tax: p.tax,
						enterprise: p.enterprise ,
						sub: p.sub._id,
						category1: p.category1,
						category2: p.category2
					});
					
					product.enterprise = product.enterprise._id;
					if ((product.sub!==undefined)&&(product.sub!==null)){ product.sub = product.sub._id };
					if ((product.category1!==undefined)&&(product.category1!==null)) { product.category1 = product.category1._id };
					if ((product.category2!==undefined)&&(product.category2!==null)) { product.category2 = product.category2 ? product.category2._id : undefined };
					if ((product.provider!==undefined)&&(product.provider!==null)) { product.provider = product.provider._id };
					// if ((product.tax!==undefined)&&(product.tax!==null)) { product.tax = product.tax };
					// if ((product.metric!==undefined)&&(product.metric!==null)){ product.metric = product.metric };
					// console.log(product, 'product');

					product.$update(function(response) {
						// console.log('actualice bien');
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				}
			}
		};

		$scope.historialDeCompra = function(compraO){
			//creo un historial de compra y lo guardo en la bbdd
			var historialCompra = new HistorialCompras ({
				compra: $scope.historialCompra
			});
			console.log("ISTORIJAA");
			// Redirect after save
			historialCompra.$save(function(response) {
				// console.log('se creo el historial con id:', response._id);

				// actualizo la modificacion de la compra despues de guardar el historial
				$scope.modoEdicion = false;
				var compra = $scope.compraVerificada;
				compra.historial = response;
				compra.estado = 'Finalizada';

				/* 
				español
				la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
				una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
				hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id
				
				ingles
				the following validation is for making sure that only the proper id of each item read is reaching the db, and not the complete object 
				because when you populate the id stored as string it turns into a complete object and if we do not make this validation 
				that would go to the db when it really should be a string pointing the id */

				if (compra.enterprise !== undefined) { compra.enterprise = compra.enterprise._id };
				if (compra.tipoComprobante !== undefined) { compra.tipoComprobante = compra.tipoComprobante._id };
				if (compra.proveedor !== undefined) { compra.proveedor = compra.proveedor._id };
				if (compra.condicionVenta !== undefined) { compra.condicionVenta = compra.condicionVenta._id };
				if (compra.caja !== undefined) { compra.caja = compra.caja._id };

				compra.$update(function() {
					//actualiza la compra
					$scope.findOne();
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
				$scope.compraVerificada = null;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.productoCompra = { cantidad: undefined, descuento: undefined, observaciones: ''};

		//para mostrar formulario de crear contacto en modal de crear proveedor
		$scope.mostrarFormulario = true;

		//no muestra el form para elegir productos hasta que no se elija un proveedor
		$scope.mostrarForm = false;

		//deshabolita el select del proveedor cuando hay productos agregados a la compra
		$scope.deshabilitarProveedor = false;

		//variable para filtrar productos por proveedor
		$scope.idProveedor = 0;

		$rootScope.productosAgregados = [];
		$scope.productoEditado = [];
		$scope.comprobanteEditado = false;
		//se pone en true cuando se elige un proveedor para mostrar sus productos asociados
		$scope.mostrarProductos = false;

		//cambia segun se quieran ver las compras anuladas/cerradas
		$scope.verAnuladas = 0;
		$scope.verCerradas = 0;

		//controla si el producto esta siendo ingresado para ver si lo borra o no al cambiar el proveedor
		$scope.tipeando = false;

		//Pongo a 0 valores de la vista
		$scope.subtotal = 0;
		$scope.descuentoPorcentaje = 0;
		$scope.descuentoValor = 0;
		$scope.neto = 0;
		$scope.tax1 = 0;
		$scope.tax2 = 0;
		$scope.tax3 = 0;
		$scope.total = parseFloat(0);
		$scope.totalTax = 0;

		$scope.showConfirmRecepcion = function(ev, item) {
			var confirm = $mdDialog.confirm()
	          .title('Recibir compra')
	          .content('¿Confirmar recibo de la compra?')
	          .ariaLabel('Lucky day')
	          .ok('Confirmar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		    	item.estado = 'Finalizada';
		      	$scope.update(item);
		    }, function() {
		      console.log('cancelaste cerrar');
		    });
		};

		$scope.showConfirmPago = function(ev, item) {
			var confirm = $mdDialog.confirm()
	          .title('Pagar compra')
	          .content('¿Confirmar pago de la compra?')
	          .ariaLabel('Lucky day')
	          .ok('Confirmar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      	item.estado = 'Finalizada';
		      	$scope.update(item);
		    }, function() {
		      console.log('cancelaste cerrar');
		    });
		};

		//abre modal para anular y pagar compras
		$scope.showConfirm = function(ev,item,n) {
			console.log(n);
			switch(n){
				case 1:
					var confirm = $mdDialog.confirm()
			          .title('Anular Compra')
			          .content('¿Está seguro que desea anular esta compra?')
			          .ariaLabel('Lucky day')
			          .ok('Anular')
			          .cancel('Cancelar')
			          .targetEvent(ev);
				    $mdDialog.show(confirm).then(function() {
				    	item.estado = 'Anulada';
				    	$scope.update(item);
				    	$scope.montoTotal();
				    }, function() {
				      console.log('cancelaste anular');
				    });
				break;
				// case 2:
				// 	var confirm = $mdDialog.confirm()
			 //          .title('Pagar Compra')
			 //          .content('¿Está seguro que desea pagar esta compra?')
			 //          .ariaLabel('Lucky day')
			 //          .ok('Pagar')
			 //          .cancel('Cancelar')
			 //          .targetEvent(ev);
				//     $mdDialog.show(confirm).then(function() {
				//       $scope.comprobarComprobante(item);
				//     }, function() {
				//       console.log('cancelaste pagar');
				//     });
				// break;
				case 3:
					var confirm = $mdDialog.confirm()
			          .title('Verificar Compra')
			          .content('¿Está seguro que verificar esta compra?')
			          .ariaLabel('Lucky day')
			          .ok('Verificar')
			          .cancel('Cancelar')
			          .targetEvent(ev);
				    $mdDialog.show(confirm).then(function() {
				      $scope.historialDeCompra(item);
				    }, function() {
				      console.log('cancelaste verificar');
				    });
				break;
			}
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
			if ((this.producto !== undefined) && (this.producto !== null) && ($scope.tipeando === false)){
				this.producto = undefined;
				$scope.searchText = undefined;
			}
		};

		//agrega producto seleccionado de la lista de productos frecuentes
		$scope.agregar = function(item){
			$scope.producto = item;
			item = undefined;
		};

		$scope.sendProduct = function($event,productoCompra,producto) {
			$scope.mensajeP = undefined;
            if ($event.keyCode === 13) {
            	$event.preventDefault();
              	if((producto === null) || (producto === undefined)){
              		$scope.mensajeP = 'No seleccionaste un producto';
              	}
              	else {
              		$scope.mensajeP = undefined;
              		if(productoCompra === undefined){
              			productoCompra = {cantidad: 0}
              		}
              		if((productoCompra.cantidad === null) || (productoCompra.cantidad === undefined) || (productoCompra.cantidad === 0)){
              			$scope.mensajeP = 'No seleccionaste una cantidad para el producto';
              		}
              		else {
              				$scope.mensajeP = undefined;
              				$scope.producto = producto;
              				$scope.agregarProducto(producto,productoCompra);
              			}

              	};
            }
        };

		//Agrega a un arreglo los productos que va seleccionando
		$scope.agregarProducto = function(producto,productoCompra) {
			$scope.clicked = false;
			$scope.errorProd = undefined;
			$scope.mensajeP = undefined;
			var p = {product: {}, cantidad: undefined, descuento: undefined, total: undefined, subtotal: undefined, observaciones: undefined};
			if (producto != undefined){
				if(producto.total == undefined){
					producto.total = 0;
				}
				p.product = producto;
				p.cantidad = productoCompra.cantidad;
				if (productoCompra.descuento == undefined){
					p.descuento = 0;
				}
				else{
					p.descuento = productoCompra.descuento;
				}
				if (productoCompra.observaciones == undefined){
					p.observaciones = '';
				}
				else{
					p.observaciones = productoCompra.observaciones;
				}
				p.total = 0;
				p.subtotal = 0;
				var subtotal = calcularSubtotal(p);
				p.total = p.total + subtotal;
				$rootScope.productosAgregados.push(p);
				// $scope.producto = undefined;
				productoCompra = undefined;
				p = undefined;
				$scope.productoCompra = { cantidad: undefined, descuento: undefined, observaciones: ''};
				$scope.selectedProduct = [];
				$scope.selectedItem = null;
				$scope.searchText = '';
				$scope.deshabilitarProveedor = true;
				document.getElementById("buscaP").focus();
			}
			else{
				return 0;
			}
		};

		$scope.reverse = function(array) {
            var copy = [].concat(array);
            return copy.reverse();
        }

		//autocomplete
		$scope.selectedProduct = [];
		$scope.selectedItem = null;
		$scope.searchText = null;

		//Calcula el subtotal del producto que agrega, y actualiza los valores del total de la compra a medida que agrega productos
		var calcularSubtotal = function(p){
			var total = 0;
			var descuentoPorcentaje = p.descuento;
			var precio = parseFloat(p.product.costPerUnit);
			var cant = parseFloat(p.cantidad);
			var subtotal = parseFloat(precio*cant);
			var descuentoValor = subtotal*descuentoPorcentaje/100;
			p.subtotal = subtotal;
			total = subtotal - descuentoValor;
			$scope.subtotal = $scope.subtotal + total;
			$scope.descuentoValor = $scope.subtotal*$scope.descuentoPorcentaje/100;
			$scope.neto = $scope.subtotal - $scope.descuentoValor;
			if (p.product.tax == 10.5){
				$scope.tax1 = $scope.tax1 + (total*10.5/100);
			}
			if (p.product.tax == 21){
				$scope.tax2 = $scope.tax2 + (total*21/100);
			}
			if (p.product.tax == 27){
				$scope.tax3 = $scope.tax3 + total*27/100;
			}
			$scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
			$scope.totalTax = $scope.tax1 + $scope.tax2 + $scope.tax3;
			return total;
		};


		//Elimina un producto del arreglo de productos
		$scope.borrarProducto = function(producto) {
			var subt = 0;
			var iva = 0;
			var descProd = 0; //descuento del producto
			var descGen = 0; //descuento del proveedor
			var tax1 = 0;
			var tax2 = 0;
			var tax3 = 0;
			var totalIva = 0;
			descProd = parseFloat((producto.product.costPerUnit * producto.cantidad)*producto.descuento/100);
			subt = parseFloat((producto.product.costPerUnit * producto.cantidad) - descProd); //subtotal de solo ese prod
			descGen = parseFloat((subt*$scope.descuentoPorcentaje)/100);
			iva = producto.product.tax;
			if (iva == 10.5){
				tax1 = parseFloat(subt*10.5/100);
				$scope.tax1 = parseFloat($scope.tax1 - tax1);
			}
			if (iva == 21){
				tax2 = parseFloat(subt*21/100);
				$scope.tax2 = parseFloat($scope.tax2 - tax2);
			}
			if (iva == 27){
				tax3 = parseFloat(subt*27/100);
				$scope.tax3 = parseFloat($scope.tax3 - tax3);
			}
			$scope.neto = parseFloat($scope.neto - (subt - descGen));
			$scope.subtotal = parseFloat($scope.subtotal - subt);
			totalIva = (subt - descGen + tax1 + tax2 + tax3);
			$scope.descuentoValor = parseFloat($scope.descuentoValor - descGen);
			$scope.total = $scope.total - totalIva;
			$scope.totalTax = $scope.totalTax - tax1 - tax2 - tax3;
			$rootScope.productosAgregados.splice(producto, 1);
			if($rootScope.productosAgregados.length == 0){
				$scope.deshabilitarProveedor = false;
			}
		};

		$scope.cantProductos = function(){
			if ($rootScope.productosAgregados.length > 0) {return true;}
		};

		$scope.clickSubmit = function(){
			$scope.clicked = true;
			$scope.create();
		};

		// Create new Compra
		$scope.create = function() {
			if ($scope.clicked === true){
				if ($scope.productosAgregados.length !== 0){
					if ($scope.proveedor !== undefined){
						if($scope.comprobante !== undefined){
							if ($scope.tipoComprobante !== undefined){								
								if(this.condicionV !== undefined){
									// Create new Compra object
									var compra = new Compras ({
										created: $scope.created,
										comprobante: this.comprobante,
										tipoComprobante: this.tipoComprobante,
										products: $rootScope.productosAgregados,
										proveedor: $scope.proveedor,
										observaciones: this.observaciones,
										subtotal: this.subtotal,
										descuentoPorcentaje: this.descuentoPorcentaje,
										descuentoValor: this.descuentoValor,
										neto: this.neto,
										tax1: this.tax1,
										tax2: this.tax2,
										tax3: this.tax3,
										totalTax: this.totalTax,
										total: this.total,
										condicionVenta: this.condicionV._id,
										enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
									});

									// Redirect after save
									compra.$save(function(response) {
										/*$location.path('compras/' + response._id);*/

										if(response._id) {
											// agregar sub al array

											compra._id = response._id;
											$rootScope.compras.unshift(compra);

										}

										$state.go('home.compras');

										// Clear form fields
										$scope.comprobante = '';
										$scope.tipoComprobante = '';
										$scope.observaciones = '';
										$scope.subtotal = 0;
										$scope.descuentoPorcentaje = 0;
										$scope.descuentoValor = 0;
										$scope.neto = 0;
										$scope.tax1 = 0;
										$scope.tax2 = 0;
										$scope.tax3 = 0;
										$scope.total = 0;
										$scope.condicionVenta = '';
										$scope.clicked = false;
										$rootScope.nuevoProveedor = '';
										$rootScope.nuevaMateriaPrima = '';
										$scope.proveedor = '';
										$scope.producto = '';


									}, function(errorResponse) {
										$scope.error = errorResponse.data.message;
									});

								}
								else{
									$scope.errorCondicion = 'No elegiste una condicion de compra';
								}
							}
							else{
								$scope.errorTipoC = 'No elegiste un tipo de comprobante';
							}
						}
						else{
							$scope.errorComprobante = 'Se debe especificar un numero de comprobante';
						}
					}
					else{
						$scope.errorProv = 'No elegiste un proveedor';
					}
				}
				else{
					$scope.errorProd = 'Tenes que elegir productos para la compra';
				}
			}
			else {
				//prevent defaults
				//prevengo que se haga un submit cuando presiona enter
			}
		};

		//Habilita form para editar producto
		$scope.editar = function(index){
			$scope.productoEditado[index] = true;
		};

		//edita un producto
		$scope.editarProducto = function(index,p){
			var subt = 0;
			var tax1 = 0;
			var tax2 = 0;
			var tax3 = 0;
			var descuento = p.product.costPerUnit*p.descuento/100;
			p.subtotal = p.cantidad * p.product.costPerUnit;
			p.total = p.cantidad * (p.product.costPerUnit - descuento);
			/*var subtotal = calcularSubtotal(p);*/
			$rootScope.productosAgregados[index] = p;
			for (var i = 0; i < $rootScope.productosAgregados.length; i++) {
				subt = subt + $rootScope.productosAgregados[i].total;
				var iva = $rootScope.productosAgregados[i].product.tax;
				if (iva == 10.5){
					tax1 = tax1 + $rootScope.productosAgregados[i].total*10.5/100;
				}
				if (iva == 21){
					/*console.log(tax2);*/
					tax2 = tax2 + $rootScope.productosAgregados[i].total*21/100;
				}
				if (iva == 27){
					tax3 = tax3 + $rootScope.productosAgregados[i].total*27/100;
				}
			}
			$scope.descuentoValor = subt * $scope.descuentoPorcentaje/100;
			$scope.subtotal = subt;
			$scope.neto = subt - $scope.descuentoValor;
			$scope.tax1 = tax1;
			$scope.tax2 = tax2;
			$scope.tax3 = tax3;
			$scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3;
			this.p = undefined;
			$scope.productoEditado[index] = false;
		};

		// Remove existing Compra
		$scope.remove = function( compra ) {
			if ( compra ) { compra.$remove();

				for (var i in $scope.compras ) {
					if ($scope.compras [i] === compra ) {
						$scope.compras.splice(i, 1);
					}
				}
			} else {
				$scope.compra.$remove(function() {
					$location.path('compras');
				});
			}
		};

		// Update estado a Anulado
		$scope.update = function(item) {
			var compra = item;

			/* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
			una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
			hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

			if (this.enterprise !== undefined) { compra.enterprise = this.enterprise._id } else if ((compra.enterprise !== undefined)&&(compra.enterprise !== null)) { compra.enterprise = compra.enterprise._id };
			if (this.tipoComprobante !== undefined) { compra.tipoComprobante = this.tipoComprobante._id } else if((compra.tipoComprobante !== undefined)&&(compra.tipoComprobante!==null)) { compra.tipoComprobante = compra.tipoComprobante._id };
			if ($scope.proveedor !== undefined) { compra.proveedor = $scope.proveedor._id } else if((compra.proveedor !== undefined)&&(compra.proveedor!==null)){ compra.proveedor = compra.proveedor._id };
			if (this.condicionVenta !== undefined) { compra.condicionVenta = this.condicionVenta._id } else if((compra.condicionVenta !== undefined)&&(compra.condicionVenta !==null)){ compra.condicionVenta = compra.condicionVenta._id };
			if (this.caja !== undefined) { compra.caja = this.caja._id } else if ((compra.caja !== undefined)&&(compra.caja !== null)) { compra.caja = compra.caja._id };


			compra.$update(function() {
				// $location.path('compras');
				/*$location.path('compras/' + compra._id);*/
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//comprueba si el numero de comprobante es 0 para que lo cambie
		$scope.comprobarComprobante = function(compra){
			if (compra.comprobante == 0){
				$scope.comprobanteEditado = true;
			}
			else{
				compra.estado = 'cerrado';
				$scope.update(compra);
				$scope.montoTotal();
			}
		};

		$scope.find = function() {
			var promise = asyncCompras();
			promise.then(function(response) {
				$scope.montoTotal();
  			});

		};

		function asyncCompras(item) {
			if ($scope.SEARCH !== undefined) {
				 $rootScope.compras = Compras.query({ e: $scope.SEARCH.enterprise });
			}
		    var deferred = $q.defer();
			setTimeout(function() {
			    if ($rootScope.compras!==undefined) {
			      deferred.resolve('Hello');
			    } else {
			      deferred.reject('Greeting');
			    }
			}, 1000);
			return deferred.promise;
		}

		$scope.comprasFinalizadas = [];

		$scope.montoTotal = function(){
			$scope.totalPendientesPR = 0;
			$scope.totalPendientesPago = 0;
			$scope.totalPendientesRecepcion = 0;
			$scope.totalFinalizadas = 0;
			$scope.totalAnuladas = 0;
			for (var i = 0; i < $scope.compras.length; i++) {
				if (($scope.compras[i].estado === 'Pendiente de pago y recepcion') && ($scope.compras[i].deleted === false)){
					$scope.totalPendientesPR  = $scope.totalPendientesPR  + $scope.compras[i].total;
				}
				if (($scope.compras[i].estado === 'Pendiente de pago2') && ($scope.compras[i].deleted === false)){
					$scope.totalPendientesPago = $scope.totalPendientesPago + $scope.compras[i].total;
				}
				if (($scope.compras[i].estado === 'Pendiente de recepcion') && ($scope.compras[i].deleted === false)){
					$scope.totalPendientesRecepcion = $scope.totalPendientesRecepcion + $scope.compras[i].total;
				}
				if (($scope.compras[i].estado === 'Finalizada') && ($scope.compras[i].deleted === false)){
					$scope.totalFinalizadas = $scope.totalFinalizadas + $scope.compras[i].total;
				}
				if (($scope.compras[i].estado === 'Anulada') && ($scope.compras[i].deleted === false)){
					$scope.totalAnuladas = $scope.totalAnuladas + $scope.compras[i].total;
				}
			}
		};

		// Find existing Compra
		$scope.findOne = function() {
			Compras.get({ compraId: $stateParams.compraId }, function(res){
				$scope.compra = res;
				if($scope.compra.historial!==undefined){
					$http({
					  method: 'GET',
					  url: '/api/users/byId',
					  params: { userId: $scope.compra.historial.modificadoPor }
					}).then(function successCallback(response) {
					    // this callback will be called asynchronously
					    // when the response is available
					    $scope.usuarioDeHistorial = response.data;
					  }, function errorCallback(err) {
					  	console.log('Error' + err);
					    // called asynchronously if an error occurs
					    // or server returns response with an error status.
					  });
				}
			});
			$scope.historialCompra = Compras.get({
				compraId: $stateParams.compraId
			});
		};

		$scope.findTipoComprobante = function() {
			if($scope.SEARCH !== undefined) { $scope.tipoComprobante = Comprobantes.query({ e: $scope.SEARCH.enterprise });}
		};

		// Find a list of Comprobantes
		$scope.findComprobantes = function() {
			// $scope.comprobantes = Comprobantes.query();
			if ($scope.SEARCH !== undefined) {
				var promise = $http({ method: 'GET', url: ('/api/comprobantes/'), params: { e: $scope.SEARCH.enterprise }});
				promise.then(function(response) {
    				$scope.comprobantesFiltro = response.data;
    				for (var i in $scope.comprobantes){
	                   	if ($scope.comprobantesFiltro[i].name === 'Pedido'){
	                   		$scope.comprobantesFiltro.splice(i, 1);
	                   	}
	                }
	                Modal.setComprobantes($scope.comprobantesFiltro);
  				});
			}
		};

		// Find a list of CondicionVentas
		$scope.findCondicionesventas = function() {
			if ($scope.SEARCH !== undefined) { 
				// $scope.condicionesVentas = Condicionventas.query();
				var promise = $http({ method: 'GET', url: ('/api/condicionventas/'), params: { e: $scope.SEARCH.enterprise }});
				promise.then(function(response) {
    				$scope.condicionVentas = response.data;
    				Modal.setCondicionesVentas($scope.condicionVentas);
  				});
			}
		};

		// Find a list of Enterprises
		$scope.findEnterprises = function() {
			if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise });}
		};

		$scope.findProductos = function() {
			if($scope.SEARCH !== undefined) { $scope.products = Products.query({ e: $scope.SEARCH.enterprise });}
		};

		$scope.findProveedores = function() {
			if($scope.SEARCH !== undefined) {
				$scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
				Modal.setProveedores($scope.proveedores);
			}
		};

		//autocomplete para seleccionar proveedor
		$scope.searchTextChange = function(text){
			var lowercaseQuery = angular.lowercase(text);
			return $filter('filter')($scope.proveedores, {name: text});
		};

		$scope.sendProvider = function($event, provider) {
            if ($event.keyCode === 13) {
            	$event.preventDefault();
              	if((provider === null) || (provider === undefined)){
              		$scope.mensajeP = 'No seleccionaste un proveedor valido';
              	}else {
					$scope.proveedor = provider;
              	}
            }
        };

		$scope.selectedItemChange = function (item) {
			console.log('entre selected item change');
			if ((item !== null) && (item !== undefined)){
				$scope.idProveedor = item._id;
			}
			$scope.proveedor = item;
			$rootScope.provider = item;
			$scope.descProveedor();
			$scope.tipeando = false;
			//asigno por defecto los campos asociados al proveedor en los select
			if(item!==null){
				Providers.get({ providerId: item._id }, function(prov){
					for(var i=0; i<$scope.condicionVentas.length;i++){
						if($scope.condicionVentas[i]._id == prov.condicionPago._id){
							$scope.condicionV = $scope.condicionVentas[i];
						}
					}
					for(var i=0; i<$scope.comprobantesFiltro.length;i++){
						if($scope.comprobantesFiltro[i]._id == prov.comprobante._id){
							$scope.tipoComprobante = $scope.comprobantesFiltro[i];
						}
					}
				});
			}
		};

		// $scope.searchTextChangeProduct = function(text){
		// 	console.log($scope.idProveedor , 'id prov compras');
		// 	$scope.tipeando = true;
		// 	var lowercaseQuery = angular.lowercase(text);
		// 	if ($scope.SEARCH !== undefined) {
		// 		var promise = $http({ method: 'GET', url: ('/api/products/'), params: { e: $scope.SEARCH.enterprise }});
		// 			promise.then(function(response) {
		// 				$scope.productos = response.data;
		// 				if ($scope.idProveedor === 0){
		// 					$scope.filtrados = $filter('filter')($scope.productos, function(item){
		// 						return (item.esMateriaPrima === true || item.esInsumo === true);
		// 					})
		// 				}
		// 				else{
		// 					$scope.filtrados = $filter('filter')($scope.productos, function(item){
		// 						return (item.esMateriaPrima === true || item.esInsumo === true) && (item.provider._id === $scope.idProveedor); 
		// 					})
		// 				}
		// 			});
		// 		return $scope.filtrados = $filter('filter')($scope.filtrados, {name: text});	
		// 	}	
		// };

		
		$scope.searchTextChangeProduct = function(text){
			console.log($scope.idProveedor , 'id prov compras');
			$scope.tipeando = true;
			var lowercaseQuery = angular.lowercase(text);
			if ($scope.idProveedor === 0){
				$scope.filtrados = $filter('filter')($scope.products, function(item){
					return (item.esMateriaPrima === true || item.esInsumo === true);
				})
			}
			else{
				$scope.filtrados = $filter('filter')($scope.products, function(item){
					return (item.esMateriaPrima === true || item.esInsumo === true) && (item.provider._id === $scope.idProveedor); 
				})
			}
			return $scope.filtrados = $filter('filter')($scope.filtrados, {name: text});
		};


		$scope.selectedItemChangeProduct = function (item) {
			// console.log('cambio prod');
			$scope.errorProd = undefined;
			$scope.producto = item;
			if($scope.producto!==null){
				document.getElementById('inputCantidad').focus();
			}
			if((this.proveedor === null) || (this.proveedor === undefined)){
				if (($scope.producto !== null) && ($scope.producto !== undefined)){
					this.proveedor = $scope.producto.provider;
				}
			}
		};

		//autocomplete para seleccionar producto por codigo
		$scope.searchTextChangeCode = function(text){
			var lowercaseQuery = angular.lowercase(text);
			return $filter('filter')($scope.products, {code: text});
		};

		$scope.selectedItemChangeCode = function (item) {
			$scope.producto = item;
			console.log($scope.producto, 'producto elegido');
		};

		$scope.showAdvanced = function(ev,item) {
		    $mdDialog.show({
		      controller: DialogController,
		      templateUrl: '/modules/compras/views/modal.client.view.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true,
		       resolve: {
		         item: function () {
		           return item;
		         }
		       }
		    })
		    .then(function(answer) {
		      $scope.status = 'You said the information was "' + answer + '".';
		    }, function() {
		      $scope.status = 'You cancelled the dialog.';
		    });
		  };

		$scope.showAdvancedProvider = function(ev) {
			$scope.minLenghtProv = 1;
			$scope.textToSearch = undefined;
				$scope.findContacts();
				$scope.findCategories();
				$scope.findTaxConditions();
				Modal.setEmpresa($scope.SEARCH.enterprise);
				$mdDialog.show({
			      controller: CrearController,
			      templateUrl: '/modules/compras/views/create.provider.view.html',
			      parent: angular.element(document.body),
			      targetEvent: ev,
			      clickOutsideToClose: false
			    })
			    .then(function(answer) {
			      $scope.minLenghtProv = 0;
			      $scope.status = 'You said the information was "' + answer + '".';
			    }, function() {
			      $scope.minLenghtProv = 0;	
			      $scope.status = 'You cancelled the dialog.';
			    });
		};

		$scope.findContacts = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.contacts = Contacts.query({e: $scope.SEARCH.enterprise });
				Modal.setContactos($scope.contacts);
			};
		};

		// Find a list of Taxconditions
		$scope.findTaxConditions = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.taxconditions = Taxconditions.query({e: $scope.SEARCH.enterprise });
				Modal.setCondiciones($scope.taxconditions);
			};
		};

		//variables para el control de la ventana del autocomplete
		$scope.minLenghtProd = 0;
		$scope.minLenghtProv = 0;

		$scope.showAdvancedProduct = function(ev) {
			$scope.minLenghtProd = 1;
			$scope.searchText = undefined;
				$scope.findProveedores();
				$scope.findSubs();
				$scope.findMetrics();
				$scope.findSubcategories();
				$scope.findCategories();
				$scope.findTaxes();
				Modal.setEmpresa($scope.SEARCH.enterprise);
				$mdDialog.show({
			      controller: CrearController,
			      templateUrl: '/modules/compras/views/create.product.view.html',
			      parent: angular.element(document.body),
			      targetEvent: ev,
			      clickOutsideToClose: false
			    })
			    .then(function(answer) {
			      $scope.minLenght = 0;
			      $scope.status = 'You said the information was "' + answer + '".';
			    }, function() {
			      $scope.minLenght = 0;	
			      $scope.status = 'You cancelled the dialog.';
			    });
		};

		$scope.findCategories = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.categories = Categories.query({ e: $scope.SEARCH.enterprise });
				Modal.setCategorias($scope.categories);
			}
		};


		// Find a list of SBUs
		$scope.findSubs = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.subs = Subs.query({ e: $scope.SEARCH.enterprise });
				Modal.setSubs($scope.subs);
			}
		};

		$scope.findSubcategories = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.subcategorias = Categories.query({ e: $scope.SEARCH.enterprise });
				Modal.setSubcategorias($scope.subcategorias);
			}
		};

		$scope.findTaxes = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.taxes = [ {value:1, name: 'Iva incluido en el costo'}, {value:10.5, name: '10.50%'}, {value:21, name: '21.00%'}, {value:27, name: '27.00%'}];
				Modal.setTaxes($scope.taxes);
			};
		};

		$scope.findMetrics = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.metrics = Metrics.query();
				Modal.setMetrics($scope.metrics);
			}
		};

		//****PARA LA EXTRACCION DEL PDF

		$scope.extraerCompra = function(item){
			var promise = asyncAsignarCompra(item);
			promise.then(function(response) {
				// console.log(response);
				$scope.printIt();
  			});
		};

		function asyncAsignarCompra(item) {
		    var deferred = $q.defer();
		    $scope.compra = item;
			setTimeout(function() {
			    if ($scope.compra!==undefined) {
			      deferred.resolve('Hello');
			    } else {
			      deferred.reject('Greeting');
			    }
			  }, 1000);
			  return deferred.promise;
		}

		$scope.printIt = function(){
		   var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
		   var b = document.getElementById('printing-css-compra').value;
		   var c = document.getElementById('printing-data-compra').innerHTML;
		   window.frames["print_frame_compra"].document.title = 'IM - Compra';
		   window.frames["print_frame_compra"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
		   window.frames["print_frame_compra"].window.focus();
		   window.frames["print_frame_compra"].window.print();
		};

		function httpGet(theUrl){
		    var xmlHttp = null;
		    xmlHttp = new XMLHttpRequest();
		    xmlHttp.open( "GET", theUrl, false );
		    xmlHttp.send( null );
		    return xmlHttp.responseText;
		}

		//****FIN EXTRACCION DEL PDF

		function DialogController($scope, $mdDialog, item, Ventas) {

			$scope.item = item; //es la venta que tengo que actualizar

			$scope.hide = function() {
			    $mdDialog.hide();
			  };
			$scope.cancel = function() {
			    $mdDialog.cancel();
			  };
			$scope.answer = function(answer) {
			    $mdDialog.hide(answer);
			  };

			$scope.actualizarCompra = function(data){

					var compra = $scope.item;

					if (data === 'pagado'){
						var estado = 'Pendiente de recepcion';
					}
					if (data === 'recibido'){
						var estado = 'Pendiente de pago2';
					}
					if (data === 'pYr'){
						var estado = 'Finalizada';
					}

					compra.estado = estado;

					/* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
					una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no
					hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */
					compra.enterprise = compra.enterprise._id;
					compra.tipoComprobante = compra.tipoComprobante._id;
					compra.proveedor = compra.proveedor._id;
					compra.condicionVenta = compra.condicionVenta._id;

					compra.$update(function() {
						$mdDialog.hide();
						// if (data !== undefined){
						// 	location.reload(true);
						// }
						$location.path('compras');
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});

			};

		};

		function CrearController($scope, $mdDialog, Modal, Products, Contacts){
			if(($rootScope.provider !== undefined) && ($rootScope.provider !== null) ) {
				$scope.provider = $rootScope.provider.name;
			}
			else{
				$scope.provider = undefined;
			}
			$scope.contacts = Modal.getContactos();
			$scope.taxconditions = Modal.getCondiciones();
			$scope.comprobantes = Modal.getComprobantes();
			$scope.categories2 = [ 'Materia Prima', 'Insumo'];
			$scope.categories = Modal.getCategorias();
			$scope.subcategorias= Modal.getSubcategorias();
			$scope.subs = Modal.getSubs();
			$scope.proveedores = Modal.getProveedores();
			$scope.taxes = Modal.getTaxes();
			$scope.metrics = Modal.getMetrics();
			$scope.quantityPerUnit = 0;
			$scope.unitsInStock = 0;
			$scope.idealStock = 0;
			$scope.criticalStock = 0;
			$scope.unitPrice = 0;
			$scope.costPerUnit = 0;
			$scope.condicionPagos = Modal.getCondicionesVentas();
			$scope.banco = {name: undefined, account: undefined, cbu: undefined, identity: undefined};
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
	        };

	        $scope.placeChangedContact = function() {
	           $scope.placeContact = this.getPlace();
	        };

			$scope.hide = function() {
				$mdDialog.hide();
			};
			$scope.cancel = function() {
				$mdDialog.cancel();
			};
			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};

			$scope.crearMateriaPrima = function(){
				var esMp = false;
				var esI = false;
				for (var i in $scope.categories) {
					if ($scope.categories[i].name === this.category1 ){
						var categoria = $scope.categories[i];
					}
				}
				if (categoria.name === 'Insumo'){
					esI = true;
				}
				else{
					esMp = true;
				}
				for (var i in $scope.taxes){
					if ($scope.taxes[i].name === this.tax){
						var valorTax = $scope.taxes[i].value
					}
				}
				if ($rootScope.provider === undefined){
					for (var i in $scope.proveedores){
						if ($scope.proveedores[i].name === this.provider){
							var idProveedorModal = $scope.proveedores[i]._id
						}
					}
				}
				else{
					var idProveedorModal = $rootScope.provider._id
				}
				var empresa = Modal.getEmpresa();
				if (this.code !== undefined){
						if (this.name !== undefined){
							if (this.tax !== undefined){
								if (categoria.name !== undefined){
									if (this.category2 !== undefined){
										if (this.sub !== undefined){
											if (this.provider !== undefined){
												var product = new Products ({
													name: this.name,
													description: this.description ? this.description : undefined,
													code: this.code,
													//picture: this.picture || undefined,
													brandName: this.brandName ? this.brandName : undefined,
													unitPrice: this.unitPrice,
													costPerUnit: this.costPerUnit,
													// sku: this.sku,
													discontinued: this.discontinued,
													provider: idProveedorModal,
													quantityPerUnit: this.quantityPerUnit,
													unitsInStock: this.unitsInStock,
													idealStock: this.idealStock,
													criticalStock: this.criticalStock,
													unitsOnOrder: this.unitsOnOrder,
													storedIn: this.storedIn ? this.storedIn : undefined,
													metric: this.metric ? this.metric : 'u.',
													reseller: this.reseller,
													visible: this.visible,
													esInsumo: esI,
													esMateriaPrima: esMp,
													tax: this.tax ? valorTax : undefined,
													enterprise: empresa,
													sub: this.sub._id,
													category1: categoria._id,
													category2: this.category2 ? this.category2._id : undefined,
												});

												// Redirect after save
												product.$save(function(response) {

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
													$scope.hide();
													$rootScope.nuevaMateriaPrima = product;
													// console.log($rootScope.nuevaMateriaPrima);

													}, function(errorResponse) {
														$scope.error = errorResponse.data.message;
													});
												}
											else{
												$scope.errorProv = 'Se debe elegir un proveedor';												
											}	
										}
										else{
											$scope.errorSub = 'Se debe especificar la UEN para el producto';
										}
									}
									else{
										$scope.errorCategory = 'Se debe especificar la subcategoria para el producto';	
									}	
								}
								else{
									$scope.errorCategory2 = 'Indicar la categoria del producto';
								}	
							}
							else{
								$scope.errorTax = 'Se debe especificar el iva para el producto';
							}	
						}
						else{
							$scope.errorName = 'Se debe indicar el nombre del producto';
						}		
					}
					else{
						$scope.errorCode = 'Se debe indicar el codigo del producto';
					}							
			};

			$scope.borrarError = function(){
				$scope.errorCode = undefined;
				$scope.errorProv = undefined;
				$scope.errorName = undefined;
				$scope.errorNameProv = undefined;
				$scope.errorTax = undefined;
				$scope.errorSub = undefined;
				$scope.errorCategory = undefined;
				$scope.errorCategory2 = undefined;
				$scope.errorCondicion = undefined;
				$scope.errorComprobante = undefined;
			}

			// Create new Provider
			$scope.crearProveedor = function() {
				var empresa = Modal.getEmpresa();
				// Create new Provider object
				if (this.name !== undefined){
					if (this.address !== undefined){
						var latitud = $scope.place.geometry.location.lat();
						var longitud = $scope.place.geometry.location.lng();
						if (this.category1 !== undefined){
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
						}
						else{
							$scope.errorCategory = 'Indicar la categoria';
						}		
					}
					else{
						$scope.errorDir = 'Indicar la direccion';
					}	
				}
				else{
					$scope.errorNameProv = 'Indicar la razón social';
				}		
			};
		}
	}
]);