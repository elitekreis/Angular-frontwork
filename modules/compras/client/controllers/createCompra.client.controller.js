angular.module('compras').controller('CreateCompraController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Compras', 'Enterprises','$mdBottomSheet', '$state', '$mdDialog', '$filter', 'compras', 'Products', 'Modal', 'Contacts', 'Taxconditions', 'Categories', 'Subs', 'Metrics', 'Providers', '$http', 'Cajas', 'Impuestos', 'tipoCompra',
	function($scope, $rootScope, $stateParams, $location, Authentication, Compras, Enterprises, $mdBottomSheet, $state, $mdDialog, $filter, compras, Products, Modal, Contacts, Taxconditions, Categories, Subs, Metrics, Providers, $http, Cajas, Impuestos, tipoCompra) {
		$scope.authentication = Authentication;

		$scope.$watchCollection('authentication', function (){
			$scope.tipoCompra = tipoCompra;
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.findProductos();
			$scope.findCajas();
			$scope.findProveedores();
			$scope.findComprobantes();
			$scope.findCondicionesventas();
		});


		$scope.$watchCollection('condicionV', function(){
			if($scope.condicionV !== undefined){
				$scope.verCondicionVenta($scope.condicionV);
			}
		});

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
			if(($rootScope.nuevaMateriaPrima !==undefined)&&($rootScope.nuevaMateriaPrima !==null)&&($rootScope.nuevaMateriaPrima !== '')){
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
			}
		});

		$scope.selectedMode = 'md-scale';
	    $scope.selectedDirection = 'up';

	    $scope.mostrarCaja = true;  //controla si muestra o no caja dependiendo de la condicion de venta

		$scope.compras = compras; // asigno las compras que ya busque en el resolve de las rutas
		// $scope.tipoCompra = tipoCompra;
		// $scope.tipoCompra2 = $stateParams.tipo;
		$scope.idProveedor = 0;
		//controla si el producto esta siendo ingresado para ver si lo borra o no al cambiar el proveedor
		$scope.tipeando = false;
		//vuelve el cursor al primer campo
		$scope.isFocus = false;

		$scope.productoEditado = [];

		//deshabolita el select del proveedor cuando hay productos agregados a la compra
		$scope.deshabilitarProveedor = false;

		$scope.productoCompra = { cantidad: undefined, descuento: undefined, observaciones: ''};

		$rootScope.productosAgregados = [];

		$scope.selectedProduct = [];
		$scope.selectedItem = null;
		$scope.searchText = null;

		//variables para el control de la ventana del autocomplete
		$scope.minLenghtProd = 0;
		$scope.minLenghtProv = 0;

		//Pongo a 0 valores de la vista
		$scope.subtotal = 0;
		$scope.descuentoPorcentaje = 0;
		$scope.descuentoValor = 0;
		$scope.neto = 0;
		$scope.tax1 = 0;
		$scope.tax2 = 0;
		$scope.tax3 = 0;
		$scope.imp1 = 0;
		$scope.imp2 = 0;
		$scope.imp3 = 0;
		$scope.imp4 = 0;
		$scope.total = parseFloat(0);
		$scope.totalTax = 0;
		$scope.totalImp = 0;

		//si la condicion de venta es CC no debe elegir caja
		$scope.verCondicionVenta = function(c){
			$scope.errorCondicion = undefined;
			if (c.name == 'Cuenta Corriente'){
				$scope.mostrarCaja = false;
				$scope.caja = undefined;
			}
			else{
				$scope.mostrarCaja = true;
			}
		};

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
		}; //end descProveedor

		$scope.initAutocomplete = function(){
			$scope.findProductos();
			$scope.searchTextChangeProduct('');
		}; //end initAutocomplete

		$scope.searchTextChangeProduct = function(text){
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
		}; //end searchTextChangeProduct

		$scope.searchTextChange = function(text){
			var lowercaseQuery = angular.lowercase(text);
			return $filter('filter')($scope.proveedores, {name: text});
		}; //end searchText

		$scope.selectedItemChangeProduct = function (item){
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
		}; //end selectedItemChangeProduct

		$scope.selectedItemChange = function (item) {
			if ((item !== null) && (item !== undefined)){
				$scope.idProveedor = item._id;
			}
			$scope.proveedor = item;
			$rootScope.provider = item;
			$scope.descProveedor();
			$scope.tipeando = false;
			// asigno por defecto los campos asociados al proveedor en los select
			if(item!==null){
				for(var i=0; i<$scope.condicionVentas.length;i++){
					if (item.condicionPago !== undefined) {
						if($scope.condicionVentas[i]._id == item.condicionPago){
							$scope.condicionV = $scope.condicionVentas[i];
						}
					}	
				}
				if ((item.comprobante !== null)&&(item.comprobante !== undefined)){
					for(var i=0; i<$scope.comprobantesFiltro.length;i++){
						if($scope.comprobantesFiltro[i]._id == item.comprobante){
							$scope.tipoComprobante = $scope.comprobantesFiltro[i];
						}
					}
				}
			}
		}; //end selectedItemChange

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

              	}
            }
        }; //end sendProduct

        $scope.sendProvider = function($event, provider) {
            if ($event.keyCode === 13) {
            	$event.preventDefault();
              	if((provider === null) || (provider === undefined)){
              		$scope.mensajeP = 'No seleccionaste un proveedor valido';
              	}else {
					$scope.proveedor = provider;
              	}
            }
        }; //end sendProvider

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
				$scope.productosAgregados.splice(0,0,p);
				// $rootScope.productosAgregados.push(p);
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
		}; //end agregarProducto

		$scope.reverse = function(array) {
            var copy = [].concat(array);
            return copy.reverse();
        }; //end reverse

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
			if ($scope.provider.impuesto1 !== 0){
				$scope.imp1 = $scope.imp1 + total*$scope.provider.impuesto1/100;
			}
			if ($scope.provider.impuesto2 !== 0){
				$scope.imp2 = $scope.imp2 + total*$scope.provider.impuesto2/100;
			}
			if ($scope.provider.impuesto3 !== 0){
				$scope.imp3 = $scope.imp3 + total*$scope.provider.impuesto3/100;
			}
			if ($scope.provider.impuesto4 !== 0){
				$scope.imp4 = $scope.imp4 + total*$scope.provider.impuesto4/100;
			}
			if (p.product.tax == 10.5){
				$scope.tax1 = $scope.tax1 + (total*10.5/100);
			}
			if (p.product.tax == 21){
				$scope.tax2 = $scope.tax2 + (total*21/100);
			}
			if (p.product.tax == 27){
				$scope.tax3 = $scope.tax3 + total*27/100;
			}
			$scope.total = Math.round(($scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3 + $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4) * 100)/100;
			$scope.totalTax = $scope.tax1 + $scope.tax2 + $scope.tax3;
			var totalI = $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
			$scope.totalImp = Math.round(totalI * 100) / 100;
			return total;
		}; //end calcularSubtotal

		$scope.cantProductos = function(){
			if ($rootScope.productosAgregados.length > 0) {return true;}
		}; //end cantProductos

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
		}; //end showAdvancedProduct

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
		}; //end showAdvancedProvider

		//Habilita form para editar producto
		$scope.editar = function(index){
			$scope.productoEditado[index] = true;
		};//end editar

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
			if ($scope.provider.impuesto1 !== 0){
				$scope.imp1 = $scope.neto*$scope.provider.impuesto1/100;
			}
			if ($scope.provider.impuesto2 !== 0){
				$scope.imp2 = $scope.neto*$scope.provider.impuesto2/100;
			}
			if ($scope.provider.impuesto3 !== 0){
				$scope.imp3 = $scope.neto*$scope.provider.impuesto3/100;
			}
			if ($scope.provider.impuesto4 !== 0){
				$scope.imp4 = $scope.neto*$scope.provider.impuesto4/100;
			}
			$scope.tax1 = tax1;
			$scope.tax2 = tax2;
			$scope.tax3 = tax3;
			var totalI = $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
			$scope.totalImp = Math.round(totalI * 100) / 100;
			$scope.total = $scope.neto + $scope.tax1 + $scope.tax2 + $scope.tax3 + $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
			this.p = undefined;
			$scope.productoEditado[index] = false;
		}; //end editarProducto

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
			var totalImpuesto = $scope.provider.impuesto1 + $scope.provider.impuesto2 + $scope.provider.impuesto3 + $scope.provider.impuesto4;
			var restoImpuesto = producto.total*totalImpuesto/100;
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
			if ($scope.provider.impuesto1 !== 0){
				$scope.imp1 = $scope.neto*$scope.provider.impuesto1/100;
			}
			if ($scope.provider.impuesto2 !== 0){
				$scope.imp2 = $scope.neto*$scope.provider.impuesto2/100;
			}
			if ($scope.provider.impuesto3 !== 0){
				$scope.imp3 = $scope.neto*$scope.provider.impuesto3/100;
			}
			if ($scope.provider.impuesto4 !== 0){
				$scope.imp4 = $scope.neto*$scope.provider.impuesto4/100;
			}
			var totalI = $scope.imp1 + $scope.imp2 + $scope.imp3 + $scope.imp4;
			$scope.totalImp = Math.round(totalI * 100) / 100;
			$scope.subtotal = parseFloat($scope.subtotal - subt);
			totalIva = (subt - descGen + tax1 + tax2 + tax3);
			$scope.descuentoValor = parseFloat($scope.descuentoValor - descGen);
			var restar = totalIva + restoImpuesto;
			$scope.total = $scope.total - restar;
			$scope.totalTax = $scope.totalTax - tax1 - tax2 - tax3;
			$scope.totalImp = totalI;
			$scope.remove(producto);
			// $rootScope.productosAgregados.splice(producto, 1);
			if($rootScope.productosAgregados.length == 0){
				$scope.deshabilitarProveedor = false;
			}
		};//borrarProducto

		$scope.remove = function( producto ) {
			for (var i in $rootScope.productosAgregados) {
				if ($rootScope.productosAgregados [i] === producto) {
					$rootScope.productosAgregados.splice(i,1);
				}
			}	
		}; //end remove

		$scope.clickSubmit = function(){
			if ($scope.tipoCompra == 'compra'){
				var estado = 'Finalizada';
			}
			else{
				if ($scope.tipoCompra == 'pedido'){
					var estado = 'Pendiente de pago y recepcion';
				}
			}
			$scope.clicked = true;
			$scope.create(estado);
		}; //end clickSubmit

		// Create new Compra
		$scope.create = function(e) {
			if($scope.puesto != undefined){
				if ($scope.tipoCompra == 'compra'){
					var caja = $scope.caja;
					var alta = this.created;
					var recepcion = this.fechaRecepcion; 
					var pago = this.fechaPago;
					var puesto = $scope.puesto._id;
				}
				else{
					if ($scope.tipoCompra == 'pedido'){
						var caja = 0;
						var alta = undefined;
						var recepcion = undefined; 
						var pago = undefined;
						var puesto = $scope.puesto._id;
					}
				}
				if (this.condicionV.name == 'Cuenta Corriente'){
					caja = 0;
				}
				if ($scope.clicked === true){
					if (caja !== undefined){ 
						if ($scope.productosAgregados.length !== 0){
							if ($scope.proveedor !== undefined){
								if($scope.comprobante !== undefined){
									if ($scope.tipoComprobante !== undefined){								
										// if (($scope.caja.name !== undefined || $scope.caja.name !== '') && $scope.caja.name !== 'Lucas Delivery'  ){								
										if ($scope.caja !== undefined || $scope.caja !== ''){
											if(this.condicionV !== undefined){
												
												if (caja == 0){
													caja = undefined;
												}
												// Create new Compra object
												var compra = new Compras ({
													estado: e,
													fechaAlta: alta,
													fechaPago: pago,
													fechaRecepcion: recepcion,
													caja: caja,
													comprobante: this.comprobante,
													tipoComprobante: this.tipoComprobante,
													products: $rootScope.productosAgregados,
													proveedor: $scope.proveedor,
													observaciones: this.observaciones,
													subtotal: $scope.subtotal,
													descuentoPorcentaje: this.descuentoPorcentaje,
													descuentoValor: this.descuentoValor,
													neto: $scope.neto,
													tax1: this.tax1,
													tax2: this.tax2,
													tax3: this.tax3,
													totalTax: this.totalTax,
													totalImp: $scope.totalImp,
													total: $scope.total,
													condicionVenta: this.condicionV._id,
													category: this.category ? this.category._id : undefined,
													enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
													puesto: puesto
												});

												// Redirect after save
												compra.$save(function(response) {
													if(response._id) {
														$http.post('/api/impuestos/updateTotal',
															{
																month: (new Date()).getMonth(),
																year: (new Date()).getFullYear()
															}
														);

														$state.go('home.compras');
														// agregar sub al array
														compra._id = response._id;
														$scope.compras.unshift(compra);
													}

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
													console.log(errorResponse, 'erropr');
												});

											}
											else{
												$scope.errorCondicion = 'No elegiste una condicion de compra';
											}
										}
										else{
											$scope.errorCondicion = 'No seleccionaste Caja para la venta';
											
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
					else{
						$scope.mensajeCaja = 'Seleccionar la caja';
					}	
				}
				else {
					//prevent defaults
					//prevengo que se haga un submit cuando presiona enter
				}	
			}else{
				$scope.errorCondicion = 'Please assign puesto to user.';
			}
			
		}; //end create

		$scope.findProductos = function() {
			if($scope.SEARCH !== undefined) { $scope.products = Products.query({ e: $scope.SEARCH.enterprise });}
		}; //end findProductos

		$scope.findEnterprises = function() {
			if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise });}
		}; //end findEnterprises

		$scope.findProveedores = function() {
			if($scope.SEARCH !== undefined) {
				$scope.proveedores = Providers.query({ e: $scope.SEARCH.enterprise });
				Modal.setProveedores($scope.proveedores);
			}
		}; //end findProveedores

		$scope.findContacts = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.contacts = Contacts.query({e: $scope.SEARCH.enterprise });
				Modal.setContactos($scope.contacts);
			}
		}; //end findContacts

		$scope.findTaxConditions = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.taxconditions = Taxconditions.query({e: $scope.SEARCH.enterprise });
				Modal.setCondiciones($scope.taxconditions);
			}
		}; //end findTaxConditions

		$scope.findCategories = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.categories = Categories.query({ e: $scope.SEARCH.enterprise });
				Modal.setCategorias($scope.categories);
			}
		}; //end findCategories

		$scope.findSubs = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.subs = Subs.query({ e: $scope.SEARCH.enterprise });
				Modal.setSubs($scope.subs);
			}
		}; //end findSubs

		$scope.findCajas = function(){
            if ($scope.SEARCH !== undefined) {
                $scope.cajas = [];
                Cajas.query({e: $scope.SEARCH.enterprise}, function (foundCaja) {
                    foundCaja.forEach(function (entry) {
                        if (entry.deleted === false) {
                            $scope.cajas.push(entry);
                        }

                        if(entry.user._id.toString() == user._id.toString()) {
                            $scope.caja = entry;
                        }
                    });

                    if ($scope.cajas.length === 1) {
                        $scope.caja = $scope.cajas[0]
                    }
                })
            }
		};

		$scope.findSubcategories = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.subcategorias = Categories.query({ e: $scope.SEARCH.enterprise });
				Modal.setSubcategorias($scope.subcategorias);
			}
		}; //end findSubcategories

		$scope.findTaxes = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.taxes = [ {value:1, name: 'Iva incluido en el costo'}, {value:10.5, name: '10.50%'}, {value:21, name: '21.00%'}, {value:27, name: '27.00%'}];
				Modal.setTaxes($scope.taxes);
			}
		}; //end findTaxes

		$scope.findMetrics = function() {
			if ($scope.SEARCH !== undefined) {
				$scope.metrics = Metrics.query();
				Modal.setMetrics($scope.metrics);
			}
		}; //end findMetrics

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
		};//end findComprobantes

		$scope.findCondicionesventas = function() {
			if ($scope.SEARCH !== undefined) { 
				var promise = $http({ method: 'GET', url: ('/api/condicionventas/'), params: { e: $scope.SEARCH.enterprise }});
				promise.then(function(response) {
    				$scope.condicionVentas = response.data;
    				Modal.setCondicionesVentas($scope.condicionVentas);
  				});
			}
		};//end findCondicionesVentas

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

			$scope.crearMateriaPrima = function($event){
				if ($event.keyCode == 0){
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
				}							
			}; //end crearMateriaPrima

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
			}; //end borrarError

			// Create new Provider
			$scope.crearProveedor = function($event) {
				if ($event.keyCode == 0){
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
				}		
			}; //end crearProveedor
		} //end crearController


	} //end function		
]);