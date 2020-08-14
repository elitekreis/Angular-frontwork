'use strict';

// puestosList controller
angular.module('impuestos').controller('ImpuestosViewController', ['$rootScope','$state', '$scope', '$http', '$stateParams', '$mdDialog', 'user', 'Impuestos',
    function($rootScope, $state, $scope, $http, $stateParams, $mdDialog, user, Impuestos) {
        var originatorEv;
        var year = (new Date()).getFullYear();
        var month = (new Date()).getMonth();
        if (localStorage.getItem("dateImpuestos")) {
            var date = JSON.parse(localStorage.getItem("dateImpuestos"));
            year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        }

        $scope.editing = false;
        $scope.coefficient = 0;
        $scope.ajustarPrice = 0;

        $scope.$watchCollection('authentication', function() {
            if (!sessionStorage.getItem('centroDeCosto')) {
                sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            } else if ($stateParams.centroDeCosto !== '' && $stateParams.centroDeCosto !== sessionStorage.getItem('centroDeCosto')) {
                sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            }

            $scope.findImpuestos();
        });

        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName; 

        
        var tax = {};
        tax.total = 0;
        $rootScope.ivaFilter = {};
        $scope.findImpuestos = function() {
          Impuestos.query({ centroDeCosto: sessionStorage.getItem('centroDeCosto'),month: month, year: year }, function(res) {
            console.log(res)
             //my edit Obinna
            var newArray = [];
            for(var i = 0; i < res.length; i++){
              if(res[i].name == 'IVA Ventas' || res[i].name == 'IVA Compras' && Object.keys($rootScope.ivaFilter).length <= 2) {
                if(res[i]) {
                  $rootScope.ivaFilter[res[i].name] = res[i]._id;
                  tax.total = (res[i].name == 'IVA Ventas') ? (tax.total + res[i].total) : (tax.total - res[i].total);                  

                  if(Object.keys($rootScope.ivaFilter).length == 2) {
                    var iva = {
                      _id: res[i]._id,
                      name: "IVA",
                      created: res[i].created,
                      type: res[i].type,
                      centroDeCosto: res[i].centroDeCosto,
                      total: tax.total,
                      month: res[i].month,
                      pagado: res[i].pagado || 0,
                      year: res[i].year,
                      //adjustars:  res[i].ajustars
                    }

                    localStorage.setItem("ivaType",JSON.stringify($rootScope.ivaFilter));
                    newArray.unshift(iva);
                  }
                }
              } else {
                newArray.push(res[i]);
              }
            }

            $scope.impuestos = newArray;
            //$rootScope.impuestos = res;
          });
        };

        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.deleteImpuesto = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar la impuesto?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function() {
                deleteImpuestoFromDB(item);
            }, function() {
                //cancelo
            });
        };

        function deleteImpuestoFromDB(item) {
            if (item) {
                item.$remove();
                $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
            }
        }

        $scope.editImpuesto = function(item) {
            $scope.coefficient = item.coefficient;
            $scope.editing = item;
        };

        $scope.updateImpuesto = function(item) {
            $scope.editing = false;
            item.total = (item.total / $scope.coefficient) * item.coefficient;

            item.$update(function() {
                console.log('todo ok');
            }, function(errorResponse) {
                console.log('error');
            });
        };

        $scope.createNewImpuesto = function() {
            $state.go("home.createImpuesto", { centroDeCosto: sessionStorage.getItem('centroDeCosto') });
        };

        $scope.showDialogAjustar = function($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/impuestos/views/ajustar-impuesto.client.view.html',
                locals: {
                    item: item
                },
                controller: DialogControllerAjustar
            })
        };


      

        $scope.showDialogPago = function($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-pago.client.view.html',
                locals: {
                    item: item,
                    user: user
                },
                controller: DialogController
            })
        }; //end showDialog

        function DialogControllerAjustar($scope, $mdDialog, $http, item) {
            $scope.item = item;
            $scope.apagarBoton = false;
            $scope.adjust = {}


            $scope.ivaType = function(iva,item) {
              if(iva == 'IVA Ventas') {
                $scope.iva = iva;
              } else if(iva == 'IVA Compras') {
                $scope.iva = iva
              }
            }



            $scope.closeDialog = function() {
                $mdDialog.hide();
            };

            $scope.addAjustar = function($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {

                    if (($scope.adjust.ajustarPrice !== undefined) && ($scope.adjust.ajustarPrice !== null)) {
                        
                        $http.put('/api/impuestos/ajustar', {
                                impuestoId: $rootScope.ivaFilter[$scope.iva],//item._id,
                                month: month,
                                year: year,
                                price: $scope.adjust.ajustarPrice,
                                observacion: $scope.adjust.observaciones
                            })
                            .success(function(response) {                                
                                $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
                            }).error(function(err) {
                                console.log("Error: " + err);
                            });

                        $scope.apagarBoton = true;
                    } else {
                      alert("Please complete the fields")
                    }

                    $mdDialog.hide();
                }
            }
        }

        function DialogController($scope, $mdDialog, item, user, PagosService, $filter, Socket, Cajas) {
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watchCollection('ServiciosService', function() {
                $scope.findPago();
            });
            $scope.$watchCollection('Cajas', function() {
                $scope.findCajas();
            });

            $scope.item = item;

            $scope.montoE = 0;
            $scope.montoC = 0;

            $scope.errorCaja = undefined;

            $scope.findCajas = function() {
                Cajas.query({ e: user.enterprise._id }, function(data) {
                    $scope.cajas = $filter('filter')(data, function(item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };

            $scope.closeDialog = function() {
                $mdDialog.hide();
            };

            $scope.findPago = function() {
                $scope.pagos = PagosService.query({ e: user.enterprise._id });
            };

            $scope.createPago = function($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var numero = $scope.pagos.length + 1;

                       // var year = (new Date()).getFullYear();
                        //var month = (new Date()).getMonth();
                        if($scope.pagoDate) {
                          year = (new Date($scope.pagoDate)).getFullYear()
                          month = (new Date($scope.pagoDate)).getMonth()
                        } else {
                          //$scope.pagoDate = new Date();
                          //year = (new Date($scope.pagoDate)).getFullYear()
                          //month = (new Date($scope.pagoDate)).getMonth()

                          var d = new Date();
                          
                          var period = d.setMonth(month);

                          $scope.pagoDate = new Date(period);
                          year = (new Date($scope.pagoDate)).getFullYear();
                          month = (new Date($scope.pagoDate)).getMonth();
                          
                        }

                        var pago = {
                            numero: numero,
                            impuestos: item._id,//compras id is used for IVA when pago is made on IVA
                            cajaD: $scope.caja._id,
                            montoE: $scope.montoE,
                            montoC: $scope.montoC,
                            pagoDate: $scope.pagoDate,
                            saldo: $scope.caja.total - ($scope.montoE + $scope.montoC),
                            observaciones: $scope.observaciones,
                            enterprise: user.enterprise._id,
                            year: year,
                            month: month,
                            type: 'impuesto'
                        };

                        Socket.emit('pago.create', pago);
                        var total = 0;
                        Impuestos.get({ impuestoId: item._id }, function(impuesto) {
                            if(impuesto.type !== 'Default' && impuesto.name !== "IVA Compras") {                              
                              total = impuesto.total + $scope.montoE + $scope.montoC;
                              Impuestos.update({
                                _id: item._id,
                                total: total
                              }, function() {
                                  $state.go('home.viewImpuesto', { centroDeCosto: item.centroDeCosto }, { reload: true });
                              }, function(errorResponse) {
                                  console.log('costo error');
                              });
                            } else {
                              //total = impuesto.total;
                              item.pagado += $scope.montoE;
                            }
                            
                        });

                        $mdDialog.hide();
                    } else {
                        $scope.errorCaja = 'Se debe seleccionar la caja origin'
                    }
                }
            }; //agrega puestos en el edit de caja

            $scope.addCheque = function(value) {
                $scope.errorCaja = false;
                if ($scope.caja) {
                    if ($scope.caja.cheques >= value) {
                        $scope.montoC = value;
                    } else {
                        $scope.errorCaja = 'amount is not available in selected caja';
                    }
                } else {
                    $scope.errorCaja = 'Se debe seleccionar la caja origin';
                }
            };
        }
    }
]);