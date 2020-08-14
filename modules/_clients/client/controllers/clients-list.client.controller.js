'use strict';

// condicionventas controller
angular.module('clients').controller('ClientsListController', ['$rootScope', '$mdBottomSheet', '$mdDialog', '$state', 'user', 'clientes', 'enterprises',
	function($rootScope, $mdBottomSheet, $mdDialog, $state, user, clientes, enterprises) {

		// asignacion de modelos
		this.user = user;
		this.clients = clientes || [];
		this.enterprises = enterprises;

		// asignacion de funciones
		this.showBottomSheet = showBottomSheet;

		// definicion de funciones
		function showBottomSheet($event, item, model, param) {
			var template = '/modules/core/views/menu-opciones.client.view.html';
			$rootScope.currentItem = item;
			$rootScope.currentModel = model;
			$rootScope.currentParam = param;
	    	$mdBottomSheet.show({
	    	  controller: DialogController,
		      templateUrl: template,
		      // controller: 'ListBottomSheetCtrl',
		      targetEvent: $event,
		      resolve: {
		         item: function () {
		           return item;
		         }
		       }

		    }).then(function(clickedItem) {
		    	//$mdBottomSheet.hide();
		    	// console.log('por aqui ando');
		    });
	  	}; //end showBottomSheet

		function DialogController($scope, $mdDialog, item, Areas) {

	  		$scope.item = item;

	  		$scope.goto = function (state, params) {
				if (state !== undefined) {
					$state.go(state, params);
					$mdBottomSheet.hide();
				}
			} //end goTo

			//abre modal para eliminar una categoria
			$scope.showConfirm = function(ev,item) {
				var confirm = $mdDialog.confirm()
		          .title('Eliminar Cliente')
		          .content('¿Está seguro que desea eliminar este cliente?')
		          .ariaLabel('Lucky day')
		          .ok('Eliminar')
		          .cancel('Cancelar')
		          .targetEvent(ev);
			    $mdDialog.show(confirm).then(function() {
			      remove(item);
			    }, function() {
			      // console.log('cancelaste borrar');
			    });
			}; //end showConfirm


			function remove ( client ) {
				if ( client ) { client.$remove();
				} else {
					this.client.$remove(function() {
					});
				}
				$mdBottomSheet.hide();
			};//end remove

		}; //end DialogController

	}
]);
