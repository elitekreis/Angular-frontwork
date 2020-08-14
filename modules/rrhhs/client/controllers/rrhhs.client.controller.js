'use strict';

// Rrhhs controller
angular.module('rrhhs').controller('RrhhsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Rrhhs', 'Areas', 'Puestos', '$rootScope', '$http', '$compile', '$mdBottomSheet', 'ShowAreaInfo', 'Modal', '$mdDialog',
	function($scope, $stateParams, $location, Authentication, Rrhhs, Areas, Puestos, $rootScope, $http, $compile, $mdBottomSheet, ShowAreaInfo, Modal, $mdDialog) {
		$scope.authentication = Authentication;


		// watch for SEARCH to update value
		$scope.$watchCollection('authentication', function (){
			$scope.SEARCH = { enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null };
			$scope.find();
		});

		// Create new Rrhh
		$scope.create = function() {
			// Create new Rrhh object
			var rrhh = new Rrhhs ({
				name: this.name
			});

			// Redirect after save
			rrhh.$save(function(response) {
				$location.path('rrhhs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Rrhh
		$scope.remove = function( rrhh ) {
			if ( rrhh ) { rrhh.$remove();

				for (var i in $scope.rrhhs ) {
					if ($scope.rrhhs [i] === rrhh ) {
						$scope.rrhhs.splice(i, 1);
					}
				}
			} else {
				$scope.rrhh.$remove(function() {
					$location.path('rrhhs');
				});
			}
		};

		// Update existing Rrhh
		$scope.update = function() {
			var rrhh = $scope.rrhh ;

			rrhh.$update(function() {
				$location.path('rrhhs/' + rrhh._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.bindOrganigrama = function(id, elemento){
			// console.log(id, 'id');
			// console.log(elemento, 'elemento');
			var el = angular.element(document.getElementById(id));
			var newElem = angular.element(elemento);
  			el.append(newElem);
  			$compile(newElem)($scope);
		};
		// Find a list of Areas
		$scope.find = function() {
			if ($scope.SEARCH !== undefined) {
				Areas.query({ e: $scope.SEARCH.enterprise }, function(res1) {
						var nivelMax = 0;
						var nivel = 0;
						$scope.organigrama = [];
						$rootScope.areas = res1;
						for(var i=0; i < $rootScope.areas.length; i++){
							if($rootScope.areas[i].nivel===0){
								$scope.organigrama[0] = $rootScope.areas[i];
							}
							if(parseInt($rootScope.areas[i].nivel)>nivelMax){
								nivelMax = $rootScope.areas[i].nivel;
							}
						}
						//armo la matriz de las areas segun niveles
						for(i=1; i<=nivelMax; i++){
							$scope.organigrama[i] = [];
							for(var j=0; j < $rootScope.areas.length; j++){
								if($rootScope.areas[j].nivel===i){
						            $scope.organigrama[i].push($rootScope.areas[j]);
								}
							}
						};
						// recorro estructura de niveles
						for(i=1; i<=nivelMax; i++){
							//recorro items del nivel i
							// console.log(i, 'nivel');
							for(var element in $scope.organigrama[i]){
								//si el area no fue eliminada
								if($scope.organigrama[i][element].deleted==false){
								//por cada item me fijo donde esta su padre
									if(i==1){
										var id = 'organigrama';
										if(document.getElementById(id).children.length==1){
											var elemento = '<ul id="nivel0"><li id="nivel'+ i + element +'" ><a ng-click="showAdvancedArea($event)" id="' + $scope.organigrama[i][element]._id + '">' + $scope.organigrama[i][element].name + '</a></li></ul>';
											$scope.bindOrganigrama(id, elemento);
										} else {
											var elemento = '<li id="nivel'+ i + element +'" ><a ng-click="showAdvancedArea($event)" id="' + $scope.organigrama[i][element]._id + '">' + $scope.organigrama[i][element].name + '</a></li>';
											$scope.bindOrganigrama('nivel0', elemento);
										}
									}
									else{
										for(var value in $scope.organigrama[i-1]){
											if($scope.organigrama[i][element].parent._id == $scope.organigrama[i-1][value]._id){
												// console.log('soy tu padre', $scope.organigrama[i][element].name);
												// console.log('soy tu padre', $scope.organigrama[i][element].deleted);
												var str1 = 'nivel';
												var str2 = i-1;
												var str3 =	value;
												var res = str1.concat(str2,str3);
												// console.log(document.getElementById(res).children.length, 'length');
												// console.log(res, 'id');
												if(document.getElementById(res).children.length==1){
													var elemento = '<ul id="itemsNivel'+res+'"><li id="nivel'+ i + element +'" ><a href="#" ng-click="showAdvancedArea($event)" id="' + $scope.organigrama[i][element]._id + '">' + $scope.organigrama[i][element].name + '</a></li></ul>';
													$scope.bindOrganigrama(res, elemento);
												} else {
													console.log('!!!!!', $scope.organigrama[i][element]);
													var elemento = '<li id="nivel'+ i + element +'" ><a href="#" ng-click="showAdvancedArea($event)" id="' + $scope.organigrama[i][element]._id + '">' + $scope.organigrama[i][element].name + '</a></li>';
													var id = 'itemsNivel' + res;
													$scope.bindOrganigrama(id, elemento);
												}
											}
										}
									}
								} //end if si el area no fue eliminada
							};
						};
				});
			}
		};

		// $scope.clickArea = function($event, value) {
		// 	var areaActive = $event.toElement.id;
		// 	console.log('value:', areaActive);
		// 	ShowAreaInfo.setArea(areaActive);
		// 	var template = 'modules/rrhhs/views/show-info.client.view.html';
		//     if (template === '') {
		//     	console.log('No existe un estado configurado para esta acción!');
		//     	// console.log($rootScope.estadoActual);
		//     } else {
		//     	//console.log('estadoactual: ', $rootScope.estadoActual);
		//     	$mdBottomSheet.show({
		// 	      templateUrl: template,
		// 	      controller: 'AreaInfoCtrl',
		// 	      targetEvent: $event
		// 	    }).then(function(clickedItem) {
		// 	    	//$mdBottomSheet.hide();
		// 	    	console.log('por aqui ando');
		// 	    });
		//     };
	 //  	};


		// Find existing Rrhh
		$scope.findOne = function() {
			$scope.rrhh = Rrhhs.get({
				rrhhId: $stateParams.rrhhId
			});
		};

		$scope.showAdvancedArea = function(ev) {
			var areaActive = ev.toElement.id;
			// console.log('value:', areaActive);
			ShowAreaInfo.setArea(areaActive);
			$mdDialog.show({
		      controller: AreaModalController,
		      templateUrl: '/modules/rrhhs/views/view-area.client.view.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose: false
		    })
		    .then(function(answer) {
		      $scope.status = 'You said the information was "' + answer + '".';
		    }, function() {
		      $scope.status = 'You cancelled the dialog.';
		    });
		};

		function AreaModalController($scope, $mdDialog, ShowAreaInfo) {
			// console.log('area modal');
			var areaActive = ShowAreaInfo.getArea();
			// console.log(areaActive);
			$http({ method: 'GET',
	            url: ('/api/findAreaById'),
	            params: { areaId: areaActive }
	        })
			.then(function(response) {
	            $scope.areaActive = response.data;
	            // console.log($scope.areaActive);
	            $scope.parent = $scope.areaActive.parent;
	            $http({ method: 'GET',
			        url: ('/api/puestoByAreaId'),
			        params: { areaId: $scope.areaActive._id }
			    })
				.then(function(res) {
					if(res.data[0] == null){
						$scope.puestosActive = null;
					} else {
						$scope.puestosActive = res.data;
						console.log($scope.puestosActive);
					}
					// console.log('puestos', $scope.puestosActive);
			    }, function(response) {
			        console.log('error');
			    });
	        }, function(response) {
	            console.log('error');
	        });
			$scope.hide = function() {
			    $mdDialog.hide();
			  };
			$scope.cancel = function() {
			    $mdDialog.cancel();
			  };
			$scope.answer = function(answer) {
			    $mdDialog.hide(answer);
			  };
		};
	}
]);
// .controller('AreaInfoCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Rrhhs', 'Areas', 'Puestos', 'ShowAreaInfo', '$http',
// 	function($scope, $stateParams, $location, Authentication, Rrhhs, Areas, Puestos, ShowAreaInfo, $http) {
// 		var areaActive = ShowAreaInfo.getArea();
// 		$http({ method: 'GET',
// 	            url: ('/api/findAreaById'),
// 	            params: { areaId: areaActive }
// 	        })
// 			.then(function(response) {
// 	            $scope.areaActive = response.data;
// 	            console.log($scope.areaActive);
// 	            $scope.parent = $scope.areaActive.parent;
// 	            $http({ method: 'GET',
// 			        url: ('/api/puestoByAreaId'),
// 			        params: { areaId: $scope.areaActive._id }
// 			    })
// 				.then(function(res) {
// 					if(res.data[0] == null){
// 						$scope.puestosActive = null;
// 					} else {
// 						$scope.puestosActive = res.data;
// 					}
// 					console.log('puestos', $scope.puestosActive);
// 			    }, function(response) {
// 			        console.log('error');
// 			    });
// 	        }, function(response) {
// 	            console.log('error');
// 	        });
// 	}
// ]);
