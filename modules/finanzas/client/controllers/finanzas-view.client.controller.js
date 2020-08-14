'use strict';

// Comprobantes controller
angular.module('finanzas').controller('FinanzasViewController', ['user', 'finanza', '$mdDialog', 'Movimientos', 'movimientos', 'tipoFinanza', '$rootScope', '$state',
	function(user, finanza, $mdDialog, Movimientos, movimientos, tipoFinanza, $rootScope, $state) {

		// asignacion de modelos
		this.user = user;
		this.finanza = finanza;
		this.tipoFinanza = tipoFinanza;
		// this.movimientos = movimientos;
		this.movimientos = Movimientos.query({ e: this.user.enterprise.enterprise});

		// asignacion de funciones

		this.showDialog = showDialog;
		this.rutaVolver = rutaVolver;

	    this.selectedMode = 'md-scale';
	    this.selectedDirection = 'up';

		// definicion de funciones
	
		function rutaVolver(){
			if (finanza.tipoFinanza == 'debe'){
				$rootScope.estadoActualParams.tipo = 'debe';
				$state.go('home.finanzas', $rootScope.estadoActualParams);
			}
			else{
				if (finanza.tipoFinanza == 'haber'){
					$rootScope.estadoActualParams.tipo = 'haber';
					$state.go('home.finanzas', $rootScope.estadoActualParams);
				}
			}
		}

		function showDialog($event,item,movimientos) {
	       $mdDialog.show({
	         targetEvent: $event,
	         templateUrl: 'modules/finanzas/views/add-asiento.client.view.html',
	         locals: {
	         	movimientosD: this.movimientosDebe,
	         	movimientosH: this.movimientosHaber,
	         	movimientos: this.movimientos,
	            item: item,
	            user : this.user
	         },
	         controller: DialogController
	      })
	       .then(function(answer) {
		      //$scope.alert = 'You said the information was "' + answer + '".';
		      // $scope.find();
		    }, function() {
		      //$scope.alert = 'You cancelled the dialog.';
		    });;
	  	}; //end showDialog

	   	function DialogController($scope, $mdDialog, item, user, Comprobantes, Movimientos, movimientos, Cajas, Condicionventas,$filter) {

	   		$scope.item = item;

	   		$scope.arrayMovs = movimientos;

	   		$scope.botonApagado = false;

	   		$scope.closeDialog = function() {
	         	$mdDialog.hide();
	        };

			$scope.findComprobantes = function(){
				$scope.comprobantes = Comprobantes.query({ e: $scope.item.enterprise._id });
			};

			$scope.findCajas = function(){
				$scope.cajas = Cajas.query({ e: $scope.item.enterprise._id });
			};

			$scope.findCondiciones = function(){
				$scope.condiciones = Condicionventas.query({ e: $scope.item.enterprise._id });
				$scope.filtrados = $filter('filter')($scope.condiciones, function(item){
					return (item.nombre !== 'Cuenta Corriente');
				})
			};

			$scope.add = function(saldo, monto){
				$scope.newSaldoDebe = saldo - monto;
				$scope.newSaldoHaber = saldo - monto;
			}

			$scope.createAsiento = function($event){
				if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)){
					if (($scope.monto !== undefined) && ($scope.monto !== null) && ($scope.monto !== 0)){
						if (($scope.caja !== undefined) && ($scope.caja !== null)){
							if (($scope.condicionVenta !== undefined) && ($scope.condicionVenta !== null)){
								if (($scope.comprobante !== undefined)&&($scope.comprobante !== null)){
									if (($scope.numComprobante == undefined) || ($scope.numComprobante == null)){
										$scope.numComprobante = 0;
									}
									$scope.botonApagado = true;

									var nuevoSaldo = $scope.item.saldo - $scope.monto; //saldo de la deuda de cliente/proveedor

									if ($scope.item.tipoFinanza == 'debe'){

										var nuevoSaldoCaja = $scope.caja.total - $scope.monto;

										var movimiento = new Movimientos({
											provider: $scope.item.provider._id,
											comprobante: $scope.comprobante,
											numero: $scope.numComprobante,
											estado: 'haber',
											finanza: $scope.item._id,
											monto: $scope.monto,
											saldo: nuevoSaldo,
											saldoCaja: nuevoSaldoCaja,
											caja: $scope.caja._id,
											condicion: $scope.condicionVenta._id,
											enterprise: user.enterprise._id,
										});

										$scope.item.saldo = nuevoSaldo;
										var finanza = $scope.item;
										finanza.enterprise = finanza.enterprise._id;
										finanza.provider = finanza.provider._id;

										movimiento.$save(function(response) {
											if(response._id) {
												movimientos.push(movimiento);
												$mdDialog.hide();
												finanza.$update(function() {
													console.log('saldo finanza ok');
												}, function(errorResponse) {
													console.log('saldo finanza error');
												});
											}
										}, function(errorResponse) {
											console.log(errorResponse);
										});
									}
									else{
										var nuevoSaldoCaja = $scope.caja.total + $scope.monto;

										var movimiento = new Movimientos({
											client: $scope.item.client._id,
											comprobante: $scope.comprobante,
											numero: $scope.numComprobante,
											estado: 'debe',
											finanza: $scope.item._id,
											monto: $scope.monto,
											saldo: nuevoSaldo,
											saldoCaja: nuevoSaldoCaja,
											caja: $scope.caja._id,
											condicion: $scope.condicionVenta._id,
											enterprise: user.enterprise._id,
										});

										$scope.item.saldo = nuevoSaldo;
										var finanza = $scope.item;
										finanza.enterprise = finanza.enterprise._id;
										finanza.client = finanza.client._id;

										movimiento.$save(function(response) {
											if(response._id) {
												movimientos.push(movimiento);
												$mdDialog.hide();
												finanza.$update(function() {
													console.log('saldo finanza ok');
												}, function(errorResponse) {
													console.log('saldo finanza error');
												});
											}
										}, function(errorResponse) {
											console.log(errorResponse);
										});

									}
								}
								else{
									$scope.errorPago = 'Debe indicar el tipo de comprobante';
								}
							}
							else{
								$scope.errorPago = 'Debe indicar la condicion de pago';
							}
						}
						else{
							$scope.errorPago = 'Debe indicar la caja a utilizar';
						}
					}
					else{
						$scope.errorPago = 'Debe indicar un monto valido';
					}
				}
			}
	    };
	    //end DialogController

	}
]);
