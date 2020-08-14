'use strict';

// Comprobantes controller
angular.module('procesos').controller('ProcesosEditController', ['user', 'proceso', 'enterprises', '$location', 'procedimientos', 'procesos', '$mdDialog', '$scope', 'Procedimientos', 'categories',
	function(user, proceso, enterprises, $location, procedimientos, procesos,  $mdDialog, $scope, Procedimientos, categories) {

		// asignacion de modelos
		this.user = user;
		this.proceso = proceso;
		this.enterprises = enterprises;
		this.procedimientos = procedimientos;
		this.procesos = procesos;

		// this.reorden = reorden;

		var procedimientosEdit = [];
		var procedimientosAgregados = [];
		var errorDuplicado = undefined;
		var duplicado = false;

		// asignacion de funciones
		this.removeProcedimiento = removeProcedimiento;
		this.addProcedimiento = addProcedimiento;
		this.showConfirm = showConfirm;
		this.habilitaReorden = habilitaReorden;
		this.guardaReorden = guardaReorden;
		this.controlarDuplicado = controlarDuplicado;
		this.habilitoSeleccion = habilitoSeleccion;
		this.habilitoAgregar = habilitoAgregar;
		this.deshabilitoSeleccion = deshabilitoSeleccion;
		this.createProcedimiento = createProcedimiento;
		this.habilitarActualizar = habilitarActualizar;
        this.habilitarActualizarCategoria = habilitarActualizarCategoria;
		this.updateName = updateName;
        this.updateCategory = updateCategory;

        this.backButton = backButton;

		this.reorden = false;
		this.duplicado = duplicado;
		this.actualizo = false;
        this.actualizoCategoria = false;
		this.errorDuplicado = errorDuplicado;

		this.seleccionHabilitada = false;
		this.agregarHabilitada = false;
        $scope.categoryTypes = [];

        findCategoryTypes();

        function backButton() {
        	history.back()
        }

        function findCategoryTypes() {
            $scope.categoryTypes = categories;
        }

		function habilitarActualizar(){
			this.actualizo = true;
		}

        function habilitarActualizarCategoria(category){
            this.actualizoCategoria = !(proceso.category && category.id === proceso.category.id);
        }

		function updateName(nombre){
			if (nombre !== undefined){
				var proceso2 = proceso;
				proceso2.name = nombre;
				proceso2.enterprise = proceso2.enterprise._id;
				this.actualizo = false;
				proceso2.$update(function() {
				}, function(errorResponse) {
					this.error = errorResponse.data.message;
				});
			}
		}

        function updateCategory(category){
            if (category !== undefined){
                var proceso2 = proceso;
                proceso2.category = category._id;
                proceso2.enterprise = proceso2.enterprise._id;
                this.actualizoCategoria = false;
                proceso2.$update(function() {
                }, function(errorResponse) {
                    this.error = errorResponse.data.message;
                });
            }
        }

		// definicion de funciones

		function removeProcedimiento(item){
			procedimientosEdit = this.proceso.procedimientos;
			for (var i in procedimientosEdit) {
				if (procedimientosEdit[i] === item ) {
					procedimientosEdit.splice(i, 1);
				}
			}
			update(procedimientosEdit);
		}; //end removeProcedimientos

		function addProcedimiento(item){
			procedimientosEdit = this.proceso.procedimientos;
			var max = 1;
			for (var i in procedimientosEdit){
				console.log(procedimientosEdit[i].orden);
				if (procedimientosEdit[i].orden >= max){
					max = procedimientosEdit[i].orden;
				}
			}
			var p = { procedimiento: {}, orden: undefined };
			var ok = false;
			for (var i in this.proceso.procedimientos ){
				if (this.proceso.procedimientos[i].procedimiento._id === item._id){
					ok = true;
				}
			}
			if (ok === false ){
				p.procedimiento = item;
				if (max >= procedimientosEdit.length){
					p.orden = max + 1;
				}
				else{
					p.orden = procedimientosEdit.length + 1;
				}
				procedimientosEdit.push(p);		
				update(procedimientosEdit);	
			}
		} //end addProcedimiento

		function update(procedimientos) {
			var proceso2 = proceso;
			proceso2.procedimientos = procedimientos;
			proceso2.enterprise = proceso2.enterprise._id
			// if (this.sub !== undefined) { proceso.sub = this.sub._id } else if ((proceso.sub!==undefined)&&(proceso.sub!==null)) { proceso.sub = proceso.sub._id};

			proceso2.$update(function() {
				// $location.path('procesos/view/' + proceso._id);
			}, function(errorResponse) {
				this.error = errorResponse.data.message;
			});
		}; //end update

		function habilitaReorden (){			
			this.reorden = true;
		}; //end habilitaReorden

		function controlarDuplicado (orden,item){	
			this.numeroError = undefined;
			duplicado = false;	
			for ( var i=0; i<this.proceso.procedimientos.length;i++ ){
				if (this.proceso.procedimientos[i].orden === orden){
					if (this.proceso.procedimientos[i] !== item ){
						duplicado = true;
						this.numeroError = orden;
						return 0
					}
					else {
						errorDuplicado = undefined;
						this.numeroError = undefined;
						duplicado = false;
					}
				}
			}
		}; //end controlarDuplicado

		function guardaReorden (proceso){
			if (duplicado === false){
				this.reorden = false;
				if (this.enterprise !== undefined) { proceso.enterprise = this.enterprise._id } else { proceso.enterprise = proceso.enterprise._id}; 
				// if (this.sub !== undefined) { proceso.sub = this.sub._id } else if ((proceso.sub!==undefined)&&(proceso.sub!==null)) { proceso.sub = proceso.sub._id};
				errorDuplicado = undefined;
				proceso.$update(function() {
					console.log('bien hecho');
					// $location.path('procesos/view/' + proceso._id);
				}, function(errorResponse) {
					this.error = errorResponse.data.message;
				});
			}
			else {
				errorDuplicado = 'No se pueden asignar dos numeros de orden iguales';
			}

		}; //end guardaReorden

		// definicion de funciones
		function showConfirm(ev,item) {
			var confirm = $mdDialog.confirm()
	          .title(item.procedimiento.name)
	          .content(item.procedimiento.description)
	          .ariaLabel('Lucky day')
	          .ok('Editar')
	          .cancel('Cerrar')
	          .targetEvent(ev);
		    $mdDialog.show(confirm).then(function() {
		       $location.path('procedimientos/' + item.procedimiento._id + '/edit' );
		    }, function() {
		      // console.log('cerraste');
		    });
		};	//end showConfirm

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

		function createProcedimiento (){
			procedimientosEdit = this.proceso.procedimientos;
			//control para ponerle el ultimo numero que hay
			var max = 1;
			for (var i in procedimientosEdit){
				console.log(procedimientosEdit[i].orden);
				if (procedimientosEdit[i].orden >= max){
					max = procedimientosEdit[i].orden;
				}
			}

			var procedimiento = new Procedimientos ({
				name: this.nameProcedimiento,
				description: this.descriptionProcedimiento,
				enterprise: this.enterprise ? this.enterprise._id : this.user.enterprise._id,
			});

			this.nameProcedimiento = '';
			this.nameProcedimiento = undefined;
			this.descriptionProcedimiento = '';
			this.descriptionProcedimiento = undefined;	
			

			if (this.enterprise !== undefined) { proceso.enterprise = this.enterprise._id } else { proceso.enterprise = proceso.enterprise._id}; 
			// if (this.sub !== undefined) { proceso.sub = this.sub._id } else if ((proceso.sub!==undefined)&&(proceso.sub!==null)) { proceso.sub = proceso.sub._id};

			procedimiento.$save(function(response) {
				//$location.path('procesos/' + response._id);

				if(response._id) {
					// agregar sub al array
					procedimiento._id = response._id;
					var p = { procedimiento: {}, orden: undefined };
					p.procedimiento = procedimiento;
					if (max >= procedimientosEdit.length){
						p.orden = max + 1;
					}
					else{
						p.orden = procedimientosEdit.length + 1;
					}
					procedimientosEdit.push(p);	
					var proceso2 = proceso;
					proceso2.procedimientos = procedimientosEdit;
					proceso2.$update(function() {
						// $location.path('procesos/view/' + proceso._id);
					}, function(errorResponse) {
						this.error = errorResponse.data.message;
					});

					if (procedimientos !== undefined){
						procedimientos.unshift(procedimiento);
					}					
				}

			}, function(errorResponse) {
				this.error = errorResponse.data.message;
				// console.log($scope.error, 'error');
			});
			
			this.agregarHabilitada = false
		} //end createProcedimiento

	} //end function
]);