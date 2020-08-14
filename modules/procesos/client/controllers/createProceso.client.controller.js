'use strict';

// Comprobantes controller
angular.module('procesos').controller('ProcesosCreateController', ['user', 'proceso', 'enterprises', '$state', 'procesos', 'procedimientos', 'Procedimientos', 'Categories', '$scope', 'categories',
	function(user, proceso, enterprises, $state, procesos, procedimientos, Procedimientos, Categories, $scope, categories) {

		// asignacion de modelos
		this.user = user;
		this.proceso = proceso;
		this.enterprises = enterprises;
		this.procedimientos = procedimientos;

		this.seleccionHabilitada = false;
		this.agregarHabilitada = false;

		$scope.procedimientosAgregados = [];
		$scope.procedimientosVista = [];
        $scope.categoryType = null;

		// asignacion de funciones
		this.create = create;
		this.habilitoSeleccion = habilitoSeleccion;
		this.habilitoAgregar = habilitoAgregar;
		this.deshabilitoSeleccion = deshabilitoSeleccion;
		this.exists = exists;
		this.toggle = toggle;
		this.createProcedimiento = createProcedimiento;


		// definicion de funciones

		function habilitoSeleccion(){
			this.seleccionHabilitada = true;			
		}//end habilitoSeleccion

		function habilitoAgregar (){
			this.agregarHabilitada = true;			
		} //end habilitoAgregar

		function deshabilitoSeleccion (){
			if (this.seleccionHabilitada === true){
				this.seleccionHabilitada = false;	
			}
			if (this.agregarHabilitada === true){
				this.agregarHabilitada = false;
			}					
		} //end deshabilitoSeleccion

		function exists (item, list) {
	        return list.indexOf(item._id) > -1;
	    } //end exists

        $scope.findCategoryTypes = function() {
        	$scope.categoryTypes = categories;
        };

	    function toggle(item, list) {
	    	var p = { procedimiento: {}, orden: undefined };
	        var idx = list.indexOf(item._id);
	        if (idx > -1) {
	        	list.splice(idx, 1);	
	        	for ( var i=0; i<$scope.procedimientosAgregados.length;i++ ){
		    		if ($scope.procedimientosAgregados[i].procedimiento === item){
		    			$scope.procedimientosAgregados.splice($scope.procedimientosAgregados[i].procedimiento, 1);	
		    		}
		    	}
	        }
	        else {
	        	list.push(item._id); 
	        	p.procedimiento = item;
	        	p.orden = $scope.procedimientosAgregados.length + 1; 
	        	$scope.procedimientosAgregados.push(p);
	        	$scope.errorProc = undefined;
	        }	
	    }; //end toggle

	    function createProcedimiento (){
			var procedimiento = new Procedimientos ({
				name: this.nameProcedimiento,
				description: this.descriptionProcedimiento,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id,
			});

			this.nameProcedimiento = '';
			this.nameProcedimiento = undefined;
			this.descriptionProcedimiento = '';
			this.descriptionProcedimiento = undefined;	

			var p = { procedimiento: {}, orden: undefined };
			p.procedimiento = procedimiento;
			p.orden = $scope.procedimientosAgregados.length + 1;


			procedimiento.$save(function(response) {
				//$location.path('procesos/' + response._id);

				if(response._id) {
					// agregar sub al array
					procedimiento._id = response._id;
					$scope.procedimientosAgregados.push(p);
					$scope.procedimientosVista.push(p);
					// console.log($rootScope.procedimientosAgregados);
					if ($scope.procedimientos !== undefined){
						$scope.procedimientos.unshift(procedimiento);
					}					
				}

			}, function(errorResponse) {
				this.error = errorResponse.data.message;
				// console.log($scope.error, 'error');
			});

			console.log($scope.procedimientosAgregados, 'procedimientosAgregados');
			
			this.agregarHabilitada = false
		} //end createProcedimiento

		function create () {
			if (this.name !== undefined){
				var proceso = new procesos ({
					name: this.name,
					procedimientos: $scope.procedimientosAgregados,
					category: $scope.categoryType,
					enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id
				});

				// Redirect after save
				proceso.$save(function(response) {
					//$location.path('procesos/' + response._id);

					if(response._id) {
						// agregar sub al array

						proceso._id = response._id;
						$scope.procedimientosAgregados = [];

					}

					$state.go('home.procesos');

					// Clear form fields
					$scope.name = '';

					
				}, function(errorResponse) {
					this.error = errorResponse.data.message;
				});
			}
			else{
				this.errorName = 'Debe indicar el nombre del proceso';
			}		
		}; //end create
	}
]);