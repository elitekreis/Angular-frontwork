'use strict';

// finanzas controller
angular.module('finanzas').controller('ListFinanzasController', ['$location', 'user', 'enterprises', 'movimientos', 'tipoFinanza', '$rootScope', 'Finanzas', '$state',
	function($location, user, enterprises, movimientos, tipoFinanza, $rootScope, Finanzas, $state) {

		var self = this;

		// asignacion de modelos
		this.user = user;
		this.finanzas = [];
		this.costosIndirectos = [];
		this.enterprises = enterprises;
		this.movimientos = movimientos;
		this.tipoFinanza = tipoFinanza;
		this.daFilter = undefined;
		this.loading = false;
		this.finished = false;

		// finanzas: function(Authentication, Finanzas) {
		// 	//console.log('authentication: ', Authentication.user);
		// 	return Finanzas.query({e: Authentication.user.enterprise.enterprise});
		// }

		this.loadCompras = function() {

			if (user && user.enterprise && user.enterprise.enterprise) {
				self.loading = true;
				Finanzas.query({e: user.enterprise.enterprise, last: self.finanzas.length ? {created: self.finanzas[self.finanzas.length - 1].created, saldo: self.finanzas[self.finanzas.length - 1].saldo} : null, type: self.tipoFinanza === 'debe' ? 'debe' : 'haber'}, function (data) {
					self.loading = false;
					self.finanzas = self.finanzas.concat(data);

					if (data.length === 0) {
						self.finished = true;
					}
				})
			}

			this.loadmore = function () {
				
			}


			

			// this.getFinanzas = function () {
			// 	if (user && user.enterprise && user.enterprise.enterprise) {
			// 		Finanzas.query({e: user.enterprise.enterprise, last: null, limit: 10, type: self.tipoFinanza === 'debe' ? 'debe' : 'haber'}, function (data) {
			// 			self.finanzas = data;
			// 		})
			// 	}
			// }

			$rootScope.tipoFinanza = tipoFinanza;

			// asignacion de funciones
			// this.filtrar = filtrar;
			this.remove = remove;

			// this.filtrar();
			//
			//
			// function filtrar (){
			// 	if (this.tipoFinanza == 'debe'){
			// 		this.daFilter = { tipoFinanza : 'debe'};
			// 	}
			// 	else{
			// 		this.daFilter = { tipoFinanza : 'haber'};
			// 	}
			// }

			// Remove existing finanza
			function remove ( finanza ) {
				if ( finanza ) { finanza.$remove();
				} else {
					this.finanza.$remove(function() {
						$location.path('finanzas');
					});
				}
			};

			
			// into finanzas
			this.getIntoFinanzaDetail = function(item) {
			  	$state.go("home.viewFinanza", {finanzaId: item._id});
			};

			// into services
			this.getIntoServicioDetail = function(item) {
				$state.go("home.viewPago", {servicosId:(item._id + '/' + item.name + '/serviceDetails')});
			};
		}


		this.loadCostIndirecto = function() {
			if(self.costosIndirectos.length <= 0) {						
				self.loading = true;
				Finanzas.query({enterprise: user.enterprise._id,type: "facturas"}, function (data) {
					self.loading = false;
					self.costosIndirectos = self.costosIndirectos.concat(data);
					console.log(self.costosIndirectos);
					console.log(data);

					if (data.length === 0) {
						self.finished = true;
					}
				})
			}

			this.loadmoreFactura = function () {
				
			}

		}

		
	}

]);