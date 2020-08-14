'use strict';

// Procesos controller
angular.module('procesos').controller('ProcesosController', ['$scope', '$rootScope','$stateParams', '$location', 'Authentication', 'Procesos', '$mdBottomSheet', 'Enterprises', 'Subs', '$mdDialog', 'Areas', 'Procedimientos', 'lodash', '$http', '$state',
	function($scope, $rootScope, $stateParams, $location, Authentication, Procesos, $mdBottomSheet, Enterprises, Subs, $mdDialog, Areas, Procedimientos, lodash, $http, $state ) {
		$scope.authentication = Authentication;

		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.findAll();
			$scope.findProcedimientos();
		});

		var _ = lodash;

		$scope.seleccionHabilitada = false;
		$scope.agregarHabilitada = false;

		$rootScope.procedimientosEdit = [];

		$scope.habilitoSeleccion = function(){
			$scope.seleccionHabilitada = true;			
		};

		$scope.habilitoAgregar = function(){
			$scope.agregarHabilitada = true;			
		};

		$scope.deshabilitoSeleccion = function(){
			if ($scope.seleccionHabilitada === true){
				$scope.seleccionHabilitada = false;	
			}
			if ($scope.agregarHabilitada === true){
				$scope.agregarHabilitada = false;
			}
		};

		// Create new Proceso
		$scope.create = function() {
			if (this.name !== undefined){
				// if ($scope.selected.length > 0 ){
					// Create new Proceso object
					var proceso = new Procesos ({
						name: this.name,
						procedimientos: $rootScope.procedimientosAgregados,
						// description: this.description,
						enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
						// sub: this.sub ? this.sub._id : undefined
					});

					// Redirect after save
					proceso.$save(function(response) {
						//$location.path('procesos/' + response._id);

						if(response._id) {
							// agregar sub al array

							proceso._id = response._id;
							$rootScope.procesos.unshift(proceso);
							$rootScope.procedimientosAgregados = [];

						}

						$state.go('home.procesos');

						// Clear form fields
						$scope.name = '';

						
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				// }
				// else{
				// 	$scope.errorProc = 'Debe seleccionar procedimientos para el proceso';
				// } 	
			}
			else{
				$scope.errorName = 'Debe indicar el nombre del proceso';
			}		
		};

		$scope.createProcedimiento = function(){
	
			var procedimiento = new Procedimientos ({
				name: this.nameProcedimiento,
				description: this.descriptionProcedimiento,
				enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise
			});

			procedimiento.$save(function(response) {
				//$location.path('procesos/' + response._id);

				if(response._id) {
					// agregar sub al array
					procedimiento._id = response._id;
					$rootScope.procedimientosAgregados.push(procedimiento._id);
					$scope.procedimientosVista.push(procedimiento);
					console.log($rootScope.procedimientosAgregados);
					if ($rootScope.procedimientos !== undefined){
						$rootScope.procedimientos.unshift(procedimiento);
					}					
				}

				$scope.nameProcedimiento = '';
				$scope.descriptionProcedimiento = '';

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				console.log($scope.error, 'error');
			});
			
			$scope.agregarHabilitada = false
		};

		$scope.borrarErrores = function(){
			$scope.errorProc = undefined;
			$scope.errorName = undefined;
		};

		//abre modal para eliminar un producto
		$scope.showConfirm = function(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title('Eliminar Proceso')
	          .content('¿Está seguro que desea eliminar este proceso?')
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

		// Remove existing Proceso
		$scope.remove = function( proceso ) {
			if ( proceso ) { proceso.$remove();

				for (var i in $scope.procesos ) {
					if ($scope.procesos [i] === proceso ) {
						$scope.procesos.splice(i, 1);
					}
				}
			} else {
				$scope.proceso.$remove(function() {
					$location.path('procesos');
				});
			}
		};

		// Update existing Proceso
		$scope.update = function() {
			// console.log($scope.procedimientosGuardar, 'guardar');
			var proceso = $scope.proceso;
			if( $rootScope.procedimientosEdit.length !== 0 ){
				for (var i in $rootScope.procedimientosEdit) {
					var id = $rootScope.procedimientosEdit[i]._id;
					$rootScope.procedimientosAgregados.push(id);
				}
				proceso.procedimientos = $rootScope.procedimientosAgregados;
			}	

			if (this.enterprise !== undefined) { proceso.enterprise = this.enterprise._id } else { proceso.enterprise = proceso.enterprise._id}; 
			// if (this.sub !== undefined) { proceso.sub = this.sub._id } else if ((proceso.sub!==undefined)&&(proceso.sub!==null)) { proceso.sub = proceso.sub._id};

			proceso.$update(function() {
				$location.path('procesos');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.procedimientosVista = [];
		$rootScope.procedimientosAgregados = [];
		$scope.selected = [];

	    $scope.toggle = function (item, list) {
	    	var idx2 = $rootScope.procedimientosAgregados.indexOf(item._id)
	        var idx = list.indexOf(item._id);
	        if (idx > -1) {
	        	list.splice(idx, 1);	
	        	$rootScope.procedimientosAgregados.splice(idx2, 1);
	        	$scope.procedimientosVista.splice(idx2, 1)
	        }
	        else {
	        	list.push(item._id); 
	        	$rootScope.procedimientosAgregados.push(item._id);
	        	$scope.procedimientosVista.push(item)
	        	$scope.errorProc = undefined;
	        }	
	    };

	    $scope.exists = function (item, list) {
	        return list.indexOf(item._id) > -1;
	    };

		$scope.findAll = function(){
			$scope.find();
		};

		$scope.addProcedimiento = function(item){
			console.log(item,'item');
			var ok = false;
			for (var i in $scope.proceso.procedimientos ){
				if ($scope.proceso.procedimientos[i]._id === item._id){
					ok = true;
				}
			}
			console.log(ok, 'ok');
			if (ok === false ){
				$rootScope.procedimientosEdit = this.proceso.procedimientos;
				$rootScope.procedimientosEdit.push(item);			
			}
		};

		$scope.removeProcedimiento = function(item){
			$rootScope.procedimientosEdit = this.proceso.procedimientos;
			for (var i in $rootScope.procedimientosEdit) {
				if ($rootScope.procedimientosEdit[i] === item ) {
					$rootScope.procedimientosEdit.splice(i, 1);
				}
			}
		};

		// Find a list of Procesos
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) { $rootScope.procesos = Procesos.query({ e: $scope.SEARCH.enterprise }); }
		};

		// Find a list of SBUs
		$scope.findEnterprises = function() {
			if($scope.SEARCH !== undefined) { $scope.enterprises = Enterprises.query({e: $scope.SEARCH.enterprise }); }
			
		};

		// Find a list of SBUs
		$scope.findSubs = function() {
			if($scope.SEARCH !== undefined) { $scope.subs = Subs.query({ e: $scope.SEARCH.enterprise }); }			
		};

		// Find a list of Areas
		$scope.findAreas = function() {
			if($scope.SEARCH !== undefined) { $scope.areas = Areas.query({ e: $scope.SEARCH.enterprise }); }			
		};

		$scope.findProcedimientos = function() {
			if($scope.SEARCH !== undefined) { $scope.procedimientos = Procedimientos.query({ e: $scope.SEARCH.enterprise }); }
		};
		// Find existing Proceso
		$scope.findOne = function() {
			$scope.proceso = Procesos.get({ 
				procesoId: $stateParams.procesoId
			});
		};
	}
]);