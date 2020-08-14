'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasCreateController', ['user', 'caja', 'enterprises', '$state', 'cajas', 'puestos', 'totalCajas',
	function(user, caja, enterprises, $state, cajas, puestos, totalCajas) {

		// asignacion de modelos
		this.user = user;
		this.caja = caja;
		this.enterprises = enterprises;
		this.puestos = puestos;
		this.cajas = cajas;

		this.puestosAgregados = [];

		// asignacion de funciones
		this.create = create;
		this.agregarPuesto = agregarPuesto;

		// definicion de funciones
		// Create new sucursal
		function create() {
			var name = 'Caja '
			var num = totalCajas.length + 1;
			var res = name.concat(num);
			// Create new sucursal object
			var caja = new cajas ({
				name: res,
				descripcion: this.descripcion,
				puestos: this.puestosAgregados,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id
			});

			caja.$save(function(response) {
				if(response._id) {
					// agregar sub al array
					$state.go('home.sucursales');

				}
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		};

		function agregarPuesto (puesto){
			var ok = false;
			if ((puesto !== undefined) && (puesto !== null)){
				for (var i in this.puestosAgregados){
					if (this.puestosAgregados[i]._id === puesto._id){
						var ok = true;
					}
				}
				if (!ok){
					this.puestosAgregados.push(puesto);
				}
			}
			console.log(this.puestosAgregados, 'puestos agregados');
		};

	}
]);
