'use strict';

// costosindirectos controller
angular.module('costosindirectos')
.controller('CostocentersListController', ['$rootScope','$location', 'user', '$scope', 'centrodecosto', 'PagosService','ServiceNavigation','FacturaService',
	function($rootScope, $location, user, $scope, centrodecosto, PagosService, ServiceNavigation,FacturaService) {

		// asignacion de modelos
		this.user = user;	
		this.searchCostosIndirectos = searchCostosIndirectos;

		
		
		
		
		ServiceNavigation.navInit();

		
		$scope.getName = function(name,id) {
			ServiceNavigation.addNav({name:name,id:id});
			$rootScope.$broadcast("nav change",true);
			localStorage.setItem('centrodecosto',JSON.stringify({costoName:name,costosId: id}))
		}

		var pickedMonth;
		var pickedYear;

		$scope.$watchCollection("year",function(newVal,oldval){			
			localStorage.setItem("year",JSON.stringify({yearName : newVal}))
			//$rootScope.period.year = newVal;
		})

		$scope.$watchCollection("month",function(newVal,oldval){
			var elemPos = $scope.monthList.map(function(x){return x.id}).indexOf(newVal);
			localStorage.setItem("month",JSON.stringify({monthName : $scope.monthList[elemPos].name,monthId: $scope.monthList[elemPos].id}))
			//$rootScope.period.month = newVal;
		})

		// definicion de funciones

		$scope.monthList = 
		[		
			{id: 'all', name: 'Ninguno'},
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
		
		var currYear = new Date().getFullYear();

		
		//$scope.centrodecosto = centrodecosto.data;		
		this.searchCostosIndirectos();

	

 // {1:"enero",2:"febrero",3:"marzo",4:"abril",5:"mayo",6:"junio",7:"julio",8:"agosto",9:"septiembre",10:"octubre",11:"noviembre",12:"diciembre"};

		$scope.yearList = ["2016","2017",currYear];

		function searchCostosIndirectos(){
			var pos = (JSON.parse(localStorage.getItem('month'))) ? $scope.monthList.map(function(x){return x.name}).indexOf(JSON.parse(localStorage.getItem('month')).monthName) : null;
			pickedMonth = (pos !== -1 && pos !== null) ? $scope.monthList[pos].id : new Date().getMonth();
			pickedYear = (JSON.parse(localStorage.getItem('year'))) ? JSON.parse(localStorage.getItem('year')).yearName : new Date().getFullYear();
		
			
			$scope.year = pickedYear;
			$scope.month = pickedMonth;
			

			if($scope.year != "" ||  $scope.month != ""){
				var data = PagosService.query({year:$scope.year, month:$scope.month, e:user.enterprise._id});
				window.localStorage.setItem("search_postos", JSON.stringify({year:$scope.year, month:$scope.month.toString()}));
				$scope.centrodecosto = data;				
			}
		};
}]);



