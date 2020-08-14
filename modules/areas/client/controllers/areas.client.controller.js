'use strict';

// Areas controller
angular.module('areas').controller('AreasController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Areas', '$mdBottomSheet', 'Enterprises', '$mdDialog', '$http', '$state', 'Procesos', 'Subs',
	function($scope, $rootScope, $stateParams, $location, Authentication, Areas, $mdBottomSheet, Enterprises, $mdDialog, $http, $state, Procesos, Subs) {
		$scope.authentication = Authentication;

		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
			$scope.findAll();
			if($stateParams.areaId !== undefined){
				$scope.findOne();
			}
			//console.log('search: ', $scope.SEARCH);
		});

		$rootScope.procesosEdit = [];

		$scope.submitEdit = function(){
			$scope.clickedEdit = true;
			$scope.update();
		};

		// Create new Area
		$scope.create = function() {
			// Create new Area object
			if (this.name !== undefined){
				if((this.parent !== undefined) || ($rootScope.areas.length == 0)){
					$scope.error = undefined;
					var area = new Areas ({
						name: this.name,
						nivel: this.nivel,
						parent: $scope.parent,
						objetivos: this.objetivos ? this.objetivos : undefined,
						politicas: this.politicas ? this.politicas : undefined,
						reglas: this.reglas ? this.reglas : undefined,
						sectores: this.sectores ? this.sectores : undefined,
						bienesUso :  this.bienesUso ? this.bienesUso : undefined,
						procesos: $rootScope.procesosAgregados,
						sub: this.sub ? this.sub._id : undefined,
						enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
					});

					// Redirect after save
					area.$save(function(response) {
						if(response._id) {
							// agregar sub al array
							area._id = response._id;
							$rootScope.areas.unshift(area);
							$rootScope.procesosAgregados = [];
							$location.path('/rrhh');
						}

						// Clear form fields
						$scope.name = '';
						$scope.nivel = '';
						$scope.parent = '';
						$scope.objetivos = '';
						$scope.politicas = '';
						$scope.reglas = '';
						$scope.sectores = '';
						$scope.bienesUso = '';

						$location.path('rrhh');
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				} else {
					$scope.error = 'Debes asignar un area superior';
				}
			}
			else{
				$scope.errorName = 'Indicar nombre para el area'
			}	
		};

		$scope.asignoAreaSuperior = function(){
			$scope.error = undefined;
			$scope.area.nivel = parseInt($scope.parent.nivel) + 1;
		};

		$scope.asignoAreaSuperiorCreate = function(){
			$scope.error = undefined;
			console.log($scope.parent.nivel);
			$scope.nivel = parseInt($scope.parent.nivel) + 1;
		};

		//abre modal para eliminar un area
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Area')
	          .content('¿Está seguro que desea eliminar este area?')
	          .ariaLabel('Lucky day')
	          .ok('Eliminar')
	          .cancel('Cancelar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		      $scope.remove(item);
		      // $scope.eliminarArea(item);
		    }, function() {
		      // console.log('cancelaste borrar');
		    });
		};	

		// Remove existing Area
		$scope.remove = function( area ) {
			if ( area ) { area.$remove();

				for (var i in $scope.areas ) {
					if ($scope.areas [i] === area ) {
						$scope.areas.splice(i, 1);
					}
				}
			} else {
				$scope.area.$remove(function() {				
				});
			}
			$mdBottomSheet.hide();
		};

		// Funciones para agregar/borrar procesos del area en el edit

		$scope.removeProceso= function(item){
			$rootScope.procesosEdit = this.area.procesos;
			for (var i in $rootScope.procesosEdit) {
				if ($rootScope.procesosEdit[i].proceso._id === item._id ) {
					$rootScope.procesosEdit.splice(i, 1);
				}
			}
		};

		$scope.addProceso = function(proceso){
			var p = {proceso: {}};
			p.proceso = proceso;
			$rootScope.procesosEdit = this.area.procesos;
			$rootScope.procesosEdit.push(p);		
		};

		// Remove existing Area
		$scope.eliminarArea = function( area ) {
			if ( area ) { 
				console.log(area._id);
				$http({ method: 'GET',
	                url: ('/api/borrarArea'),
	                params: { areaId: $stateParams.areaId }
	                })
				  	.then(function(response) {                         
	                    // console.log('borrado');
	                }, function(response) {
	                    // console.log('error');
	                });
				for (var i in $scope.areas ) {
					if ($scope.areas [i] === area ) {
						$scope.areas.splice(i, 1);
					}
				}
			} else {
				$scope.area.$remove(function() {
					$location.path('areas');
				});
			}
		};

		// Update existing Area
		$scope.update = function() {
			if ($scope.clickedEdit === true){
				console.log($scope.parent, 'parent');
				var area = $scope.area ;

				if( $rootScope.procesosEdit.length !== 0 ){
					area.procesos = $rootScope.procesosEdit;
				};	

				/* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
				una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no 
				hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

				if (this.enterprise !== undefined) { area.enterprise = this.enterprise._id } else if ((area.enterprise !== undefined)&&(area.enterprise !== null)) { area.enterprise = area.enterprise._id };
				if (this.sub !== undefined) { area.sub = this.sub} else if ((area.sub !== undefined)&&(area.sub !== null)) { area.sub = area.sub._id };
				if ($scope.parent !== undefined) { area.parent = $scope.parent._id} else if ((area.parent !== undefined)&&(area.parent !== null)) { area.parent = area.parent._id };
				console.log(area, 'area');
				area.$update(function() {
					$location.path('areas');
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}	
		};

		$scope.findAll = function(){
			$scope.find();
			$scope.findProcesos();
		};

		// Find a list of Areas
		$scope.find = function() {
			/*console.log('find areas');*/
			if ($scope.SEARCH !== undefined) { 
				Areas.query({ e: $scope.SEARCH.enterprise }, function(res){
					$rootScope.areas = res;
					if($rootScope.areas.length == 0){
						$scope.nivel = 0;
						$scope.name = 'Directorio';
					}; 
				});
			};
		};

		// Find existing Provider
		$scope.findOne = function() {
			$scope.area = Areas.get({
				areaId: $stateParams.areaId 
			});
			$scope.idProvider = $stateParams.providerId;
		};

		$rootScope.procesosAgregados = [];
		$scope.selected = [];

	    $scope.toggle = function (item, list) {
	        var idx = list.indexOf(item);
	        if (idx > -1) list.splice(idx, 1);
	        else {
	        	list.push(item); 
	        	// $scope.errorProc = undefined;
	        	$scope.agregarProceso(item);
	        }
	    };

	    $scope.exists = function (item, list) {
	        return list.indexOf(item) > -1;
	    };

	    $scope.agregarProceso = function(item){
	    	var p = {proceso: {}};
			p.proceso = item;
			$rootScope.procesosAgregados.push(p);
	    }

		//find lista de empresas
		$scope.findEnterprises = function() {
			if ($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({ e: $scope.SEARCH.enterprise }); }			
		};

		$scope.findProcesos = function() {
			if ($scope.SEARCH !== undefined) { $scope.procesos = Procesos.query({ e: $scope.SEARCH.enterprise }); }			
		};

		$scope.findSubs = function() {
			if($scope.SEARCH !== undefined) { $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise }); }			
		};

		$scope.showBottomSheet = function($event, item, model, param) {

			var template = '/modules/core/views/menu-opciones.client.view.html';
			$rootScope.currentItem = item;
			$rootScope.currentModel = model;
			$rootScope.currentParam = param;
	    	$mdBottomSheet.show({
	    		controller: DialogController,
		    	templateUrl: template,
		        targetEvent: $event,
		        resolve: {
		         item: function () {
		           return item;
		         }
		       }

		    }).then(function(clickedItem) {
		    	//$mdBottomSheet.hide();
		    	console.log('por aqui ando');
		    });

	  	};

	  	function DialogController($scope, $mdDialog, item, Areas) {
	  		$scope.item = item;

	  		$scope.goto = function (state, params) {
				if (state !== undefined) {
						$state.go(state, params);
						$mdBottomSheet.hide();
				}
			};

			$scope.showConfirm = function(ev,item) {
				//corroboro que no sea el directorio antes de borrar
				if(item.nivel!==0){
					var confirm = $mdDialog.confirm()
			          .title('Eliminar Area')
			          .content('¿Está seguro que desea eliminar este area?')
			          .ariaLabel('Lucky day')
			          .ok('Eliminar')
			          .cancel('Cancelar')
			          .targetEvent(ev);
				} else {
					var confirm = $mdDialog.confirm()
			          .title('Eliminar Area')
			          .content('No se puede eliminar el area de nivel 0')
			          .ariaLabel('Lucky day')
			          .ok('OK')
			          .targetEvent(ev);
				}
			    $mdDialog.show(confirm).then(function() {
			      $scope.remove(item);
			    }, function() {
			      // console.log('cancelaste borrar');
			    });
			};	

			// Remove existing Area
			$scope.remove = function( area ) {
				if(area.nivel!==0){
					/* recorro las areas para saber quien tiene como area superior
					al area que se va a a eliminar */
					
					var hijos = [];

					for (var i = $rootScope.areas.length - 1; i >= 0; i--) {
						if($rootScope.areas[i].deleted == false) {
							if($rootScope.areas[i].parent!==null){
								/*por cada area que tiene asignada como padre la candidata a eliminar
								le asigno como parent el padre de la misma, subiendo un nivel*/
								if($rootScope.areas[i].parent._id==area._id){
									$scope.updateParent($rootScope.areas[i], area.parent);
									var hijo = $rootScope.areas[i];
									hijos.push(hijo);
								}
							}
						}
					};

					/* recorro cada uno de los hijos que voy a modificar para actualizarlos
					recursivamente */

					recorroHijos(hijos);

					if ( area ) {
						area.$remove();
						for (var i in $scope.$parent.areas ) {
							if ($scope.$parent.areas [i] === area ) {
								$scope.$parent.areas.splice(i, 1);
							}
						}
					} else {
						$scope.area.$remove(function() {				
						});
					}
					$mdBottomSheet.hide();
				}
			};

			function recorroHijos(hijos) {
				console.log('recorro hijos');
				// console.log(hijos, hijos.length);
				var nietos = [];
				for (var m = hijos.length - 1; m >= 0; m--) {
					var area = hijos[m];
					// console.log('area', area);
					for (var i = $rootScope.areas.length - 1; i >= 0; i--) {
						if($rootScope.areas[i].deleted == false) {
							if($rootScope.areas[i].parent!==null){
								/*por cada area que tiene asignada como padre la candidata a eliminar
								le asigno como parent el padre de la misma, subiendo un nivel*/
								if($rootScope.areas[i].parent._id==area._id){
									// console.log('tiene hijo', $rootScope.areas[i]);
									$scope.updateParent($rootScope.areas[i], area);
									var nieto = $rootScope.areas[i];
									nietos.push(nieto);
								}
							}
						}
					};
				};
				if(nietos.length>0){
					recorroHijos(nietos);
				}
			};

			$scope.updateParent = function( area, parent ) {
				/* asigno el nuevo parent, por lo tanto actualizo el nivel */
				
				// console.log(parent);
				area.parent = parent;
				area.nivel = parseInt(parent.nivel) + 1;

				/* la siguiente validacion es para asegurarse que a la db llegue solo el id correspondiente en lugar del objeto completo de cada
				una de las propiedades evaluadas ya que al hacer el populate el id almacenado como string se convierte en un objeto completo y si no 
				hacemos esta validacion eso iria a la base cuando realmente solo tiene que ir un string indicando el id */

				if (this.enterprise !== undefined) { area.enterprise = this.enterprise._id } else if ((area.enterprise !== undefined)&&(area.enterprise !== null)) { area.enterprise = area.enterprise._id };

				area.$update(function() {
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});

			};

	  	};
	  	//end Dialog Controller

	}
]);
