'use strict';

// Comprobantes controller
angular.module('remuneraciones').controller('RemuneracioneListController', ['$state', '$scope', '$rootScope', '$mdDialog', '$filter', 'Authentication', 'user', 'Remuneraciones', '$mdBottomSheet',
	function($state, $scope, $rootScope, $mdDialog, $filter, Authentication, user , Remuneraciones , $mdBottomSheet) {

		this.authentication = Authentication;
		this.user = user;		
		
		this.extraerListado = extraerListado;
		this.showBottomSheet = showBottomSheet;
		
		var enterprise = this.user.enterprise.enterprise;
		var global = this;

		$scope.$watchCollection('authentication', function () {
			Remuneraciones.query({e: enterprise}, function (data) {
				global.remuneraciones = data;
			});
		});		

		function showBottomSheet ($event, item, model, param) {
			var template = '/modules/core/views/menu-opciones.client.view.html';
			$rootScope.currentItem = item;
			$rootScope.currentModel = model;
			$rootScope.currentParam = param;
	    	//console.log('estadoactual: ', $rootScope.estadoActual);
	    	$mdBottomSheet.show({
	    		// parent: angular.element(document.body),
		      	templateUrl: template,
		      	controller: DialogController,
		      	// controller: 'ListBottomSheetCtrl',
		      	targetEvent: $event,
		      	resolve: {
		         	item: function () {
		           		return item;
		         	}
		       	}
		    });
		  }
		  
		  function extraerListado (){
			var a = httpGet("http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
		   	var b = document.getElementById('printing-css-listado').value;
		   	var c = document.getElementById('printing-data-listado').innerHTML;
		   	window.frames["print_frame_listado"].document.title = 'IM - Remuneraciones';
		   	window.frames["print_frame_listado"].document.body.innerHTML = '<style>' + a + b + '</style>' + c;
		   	window.frames["print_frame_listado"].window.focus();
		   	window.frames["print_frame_listado"].window.print();
		}

		function httpGet(theUrl){
		    var xmlHttp = null;
		    xmlHttp = new XMLHttpRequest();
		    xmlHttp.open( "GET", theUrl, false );
		    xmlHttp.send( null );
		    return xmlHttp.responseText;
		} //end httpGet

	  	function DialogController($scope, $mdDialog, item, $state) {

	  		$scope.item = item;

	  		$scope.goto = function (state, params) {
				if (state !== undefined) {
					$state.go(state, params);
					$mdBottomSheet.hide();
				}
			};

			//abre modal para eliminar un remuneraciones
			$scope.showConfirm = function(ev,item) {
				var confirm = $mdDialog.confirm()
		          .title('Eliminar remuneraciones')
		          .content('¿Está seguro que desea eliminar este remuneraciones?')
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

			// Remove existing remuneraciones
			$scope.remove = function(remuneracione) {
				remuneracione.$remove(function() {
				});
				$mdBottomSheet.hide();
			};
	  	}
	}
]);