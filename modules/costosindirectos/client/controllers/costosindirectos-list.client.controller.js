'use strict';

// costosindirectos controller
angular.module('costosindirectos').controller('CostosindirectosListController', ['$location', 'user', '$mdDialog','costosindirectosService', '$state', 'enterprises', '$scope', 'PagosService', 'CostosindirectosService', 'costosLastMonthTotal',
 'ServiciosService','ServiceNavigation','$rootScope',
	function($location, user, $mdDialog, costosindirectosService, $state, enterprises, $scope, PagosService, CostosindirectosService, costosLastMonthTotal, ServiciosService,ServiceNavigation, $rootScope) {
		// asignacion de modelos
		this.user = user;
		
		$scope.costosindirectosService = costosindirectosService;
		this.enterprises = enterprises;

		// asignacion de funciones
		this.showConfirm = showConfirm;
		this.editingCaja = editingCaja;
		this.lastMonthTotal = costosLastMonthTotal;
		this.editCostosindirectos = editCostosindirectos;
		//this.searchCostosIndirectos = searchCostosIndirectos;
/*		$scope.year = new Date().getFullYear();
		$scope.month = new Date().getMonth();
*/

		//gets subnav name for page
		this.getName = function(name,id) { 
			//alert(name + "/ " + id)           
            ServiceNavigation.addNav({name:name,id:id});
            $rootScope.$broadcast("nav change",true);
        }
        
        
        this.removeSubNav = function(){           
            ServiceNavigation.back();
            $rootScope.$broadcast("nav change",true);         
        }

        this.getServiceId = function(id,name) {
        	$rootScope.serviceInfo = {
        		id: id,
        		name: name
        	}
        }

        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName;
        
      

/*		// definicion de funciones
		$scope.monthList = 
[
    { id: 0, name: 'enero' },
    { id: 1, name: 'febrero' },
    { id: 2, name: 'marzo' },
    {id:  3, name: 'abril'},
    {id:  4, name:  'mayo'},
    {id: 5, name:   'junio'},
    {id: 6, name: 'julio'},
    {id:7, name:'agosto'},
    {id:8, name:'septiembre'},
    {id:9, name: 'octubre'},
    {id:10, name:'noviembre'},
    {id:11, name:'diciembre'}
  ];
*/
 // {1:"enero",2:"febrero",3:"marzo",4:"abril",5:"mayo",6:"junio",7:"julio",8:"agosto",9:"septiembre",10:"octubre",11:"noviembre",12:"diciembre"};
//		$scope.yearList = ["2016","2017"];
//		localStorage.removeItem('search_postos');
		// Remove existing Comprobante
		function showConfirm (ev,item) {
		    var confirm = $mdDialog.confirm()
		        .title('¿Eliminar la Costos Indirectos?')
		        .ariaLabel('Lucky day')
		        .targetEvent(ev)
		        .ok('Aceptar')
		        .cancel('Cancelar');
		    $mdDialog.show(confirm).then(function() {
		      deleteCostosIndirectos(item);
		    }, function() {
		      //cancelo
		    });
		};

		function deleteCostosIndirectos(item) {
			if (item) {
				item.deleted = true;
				item = new CostosindirectosService(item);				
				//item.$remove();
				item.isCostosUpdate = true;
				item.$update();

				for (var i in $scope.costosindirectosService) {
					if ($scope.costosindirectosService[i]._id === item._id) {
						$scope.costosindirectosService[i].deleted = true;
						//$scope.costosindirectosService.splice(i, 1);
					}
				}

				ServiciosService.query({}, function(servicios) {
					for (var i in servicios) {    
						if (servicios[i].costosindirectos == item._id){
	                        servicios[i].deleted = true;
	                        servicios[i].$update();

	                        PagosService.query({servicosId: servicios[i]._id}, function(pagos) {                     
                                for (var j in pagos) {                                    
                                    pagos[j].deleted = true;
                                    pagos[j].$update();
                                }
                            });
                    	}
                    }					
				});
			} else {
				$scope.costosindirectosService.$remove(function() {
				});
			}
		};

		//habilito edicion
		function editingCaja(item){
			this.editing = item;
		};

		//edita nombre de la caja
		function editCostosindirectos (item){
			this.editing = false;
			item = new CostosindirectosService(item);
			item.enterprise = item.enterprise._id;
			item.$update(function() {
				console.log('todo ok');
			}, function(errorResponse) {
				console.log('error');
			});
		};
/*		function searchCostosIndirectos(){
			if($scope.year != "" ||  $scope.month != ""){
				var data = PagosService.query({year:$scope.year, month:$scope.month});
				localStorage.setItem("search_postos", JSON.stringify({year:$scope.year, month:$scope.month}));
				$scope.costosindirectosService = data;
			}
		};
*/	}]);
