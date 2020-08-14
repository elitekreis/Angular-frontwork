'use strict';

// Comprobantes controller
angular.module('costosindirectos').controller('CostosIndirectosViewController', ['$rootScope','user', '$mdDialog', 'Socket', 'ServiciosService', 'PagosService', 'costosindirectos', 'serviciosService', 'cajas', 'serviciosLastMonthTotal', 'ServiceNavigation','$location',
    function ($rootScope, user, $mdDialog, Socket, ServiciosService, PagosService, costosindirectos, serviciosService, cajas, serviciosLastMonthTotal, ServiceNavigation,$location) {
        this.user = user;
        this.costo = true;
        this.showDialog = showDialog;
        this.costosindirectos = costosindirectos;
        this.serviciosService = serviciosService;
        this.serviciosLastMonthTotal = serviciosLastMonthTotal;
        this.openMenu = openMenu;
        this.showConfirm = showConfirm;
        this.serviciosIDArray = [];
        this.cajas = cajas;
        var originatorEv;
        this.editing = false;
        this.editingServicios = editingServicios;
        this.editServicios = editServicios;
        this.selectedMode = 'md-scale';
        this.selectedDirection = 'up';
        this.showDialog = showDialog;
        this.showDialogPago = showDialogPago;
        this.findCostosIndirectos = findCostosIndirectos;
        this.showDialogFactura = showDialogFactura;
        this.findFromArray = findFromArray;
        if (localStorage.getItem("centroId") !== undefined) {
            this.centroId = localStorage.getItem("centroId");
        }

        

        
        this.findCostosIndirectos(serviciosService);

        // definicion de funciones
         $rootScope.$broadcast("nav change",true);
       
        
        //removes the last nav from the list always.
        this.removeSubNav = function(){           
            ServiceNavigation.back();
            $rootScope.$broadcast("nav change",true);         
        }




        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName;      
        
        if(ServiceNavigation.getNav().length === 2) {
          localStorage.setItem("p2storage",ServiceNavigation.getNav())
        }

        function findFromArray(array, object) {

            if (!array) return false;
            if (!object) return false;

            var checker = false;

            array.forEach(function (entry) {
                if (entry._id === object._id) checker = true;
            });

            return checker;
        }

        function findCostosIndirectos(serviciosService) {
            
            if ((this.user.roles[0] !== 'admin') && (this.user.roles[0] !== 'groso')) {

                ServiciosService.$promise.then(angular.bind(this, function (data) {
                    for (var i in data) {
                        this.serviciosIDArray.push(data[i]);
                    }
                }));
            }
            else {
                console.log(serviciosService);
                this.serviciosIDArray = serviciosService;
                
            }
        }

        function openMenu($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        }

        function showConfirm(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('Â¿Eliminar la servicios?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Aceptar')
                .cancel('Cancelar');
            $mdDialog.show(confirm).then(function () {
                deleteServicios(item);
            }, function () {
                //cancelo
            });
        }

        //habilito edicion
        function editingServicios(item) {
            this.editing = item;
        }

        //edita nombre de la Servicios
        function editServicios(item) {
          this.editing = false;
          item.enterprise = item.enterprise._id;
          for (var i in item.puestos) {
              item.puestos[i] = item.puestos[i]._id;
          }
          
          console.log(item);
          item.$update(function () {
              
              console.log('todo ok');
          }, function (errorResponse) {
              console.log('error');
          });
        }

        function deleteServicios(item) {
            if (item) {
                //item.$remove();
                item.deleted = true;                    

                PagosService.query({
                    servicosId: item._id,
                    /*impuestosId: $stateParams.impuestosId,
                    empleadoId: $stateParams.empleadoId,
                    month: date.month || null,
                    year: date.year || null*/
                }, function(pagos) {                 
                    for (var i in pagos) {                                    
                      pagos[i].deleted = true;
                      pagos[i].$update();
                    }

                });

                item.$update(function () {
                  for (var i in serviciosService) {
                    if (serviciosService[i] === item) {
                      //serviciosService.splice(i, 1);
                      serviciosService[i].deleted = true;
                    }
                  }
                }, function (errorResponse) {
                  console.log('error');
                });

            } else {
              serviciosService.$remove(function () {

              });
            }
        }

        function showDialog($event, item) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'modules/servicios/views/create-servicio.client.view.html',
                locals: {
                    item: item,
                    user: this.user
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        } //end showDialog
        // actualizaciones en tiempo real.

        function showDialogPago($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-pago.client.view.html',
                locals: {
                    item: item,
                    user: this.user
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        } //end showDialog

        function showDialogFactura($event, item) {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/costosindirectos/views/create-factura.client.view.html',
                locals: {
                    item: item,
                    user: this.user
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    // $scope.find();
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        } //end showDialog



        Socket.on('costosindirecto.update', angular.bind(this, function (message) {
            if (message.enterprise === this.user.enterprise.enterprise) {
                this.serviciosService = ServiciosService.query({e: this.user.enterprise.enterprise})
                    .$promise.then(angular.bind(this, function (data) {                      
                                            
                        this.findCostosIndirectos(data);
                    }));
            }
        }));

        // fin actualizaciones en tiempo real.
        function DialogController($scope, $mdDialog, item, user, PagosService, Arqueos, $filter, $location, Socket, ServiciosService, Costcenters, Cajas, CostosindirectosService) {
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watchCollection('ServiciosService', function () {
                $scope.findServicios();
                $scope.findServiciosTotal();
                $scope.findPago();
            });
            $scope.$watchCollection('Cajas', function () {
                $scope.findCajas();
            });

            var subNav = ServiceNavigation.getNav();
            if(subNav)
             $scope.costosName = (subNav.length > 0) ? subNav[subNav.length - 1].name : "Factura";

            $scope.facturaDate = new Date();
            $scope.pagoDate = new Date();
            $scope.mostrar = true;

            var facturaDate; // = new Date($scope.facturaDate);
            var facturaMonth; //= facturaDate.getMonth(); // getMonth.monthId //facturaDate.getMonth();
            var facturaYear; //= facturaDate.getFullYear();// getYear.yearName  //facturaDate.getFullYear();
            var pagoDate;
            var pagoMonth;
            var pagoYear;      

            $scope.$watchCollection("facturaDate",function(newVal,oldVal){
              if(newVal) {
                facturaDate = new Date($scope.facturaDate);
                facturaMonth = facturaDate.getMonth(); 
                facturaYear = facturaDate.getFullYear();
              } else {
                facturaDate = new Date($scope.facturaDate);
                facturaMonth = getMonth.monthId
                facturaYear = getYear.yearName 
              }
            })

            $scope.$watchCollection("pagoDate",function(newVal,oldVal){
              if(newVal) {
                pagoDate = new Date($scope.pagoDate);
                pagoMonth = pagoDate.getMonth(); 
                pagoYear = pagoDate.getFullYear();
              } else {
                pagoDate = new Date($scope.pagoDate);
                pagoMonth = getMonth.monthId;
                pagoYear = getYear.yearName;
              }
            })

            $scope.item = item;
            $scope.costCenterAgregados = [];

            $scope.montoE = 0;
            $scope.montoC = 0;
            $scope.pagosAcumulados = item.pagosAcumulados;

            $scope.errorCaja = undefined;

            $scope.findCajas = function () {
                Cajas.query({e: user.enterprise._id}, function (data) {
                    $scope.cajas = $filter('filter')(data, function (item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };

            $scope.findCostCenter = function () {
               
                Costcenters.query({e: user.enterprise._id},function(data){
                     $scope.costcenters = data;

                    //get and auto select the cost center implementation part
                    if(JSON.parse(localStorage.getItem('centrodecosto'))) {
                        var costName = JSON.parse(localStorage.getItem('centrodecosto')).costoName;
                        var elemPos = $scope.costcenters.map(function(x){return x.name}).indexOf(costName);
                        if(elemPos !== -1)
                            $scope.agregarCostCenter($scope.costcenters[elemPos])
                    }
                })
            };

            $scope.findCostCenter();

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.findServicios = function () {
                ServiciosService.query({e: user.enterprise._id}, function (data) {
                    $scope.servicios = $filter('filter')(data, function (item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };
            $scope.serviciosIDArray = [];
            //devuelve todas la Servicios
            $scope.findServiciosTotal = function () {
              $scope.serviciosTotal = ServiciosService.query({e: user.enterprise._id});
            };

            $scope.findPago = function () {
              $scope.pagos = PagosService.query({e: user.enterprise._id});
            };


            $scope.createServicio = function ($event) {

                $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces
                var c = {Servicios: {}};
                //var name = 'Servicios '
                var num = $scope.serviciosTotal.length + 1;
                //var res = name.concat(num);

                var servicios = {
                    name: this.name,
                    descripcion: this.descripcion,
                    costcenters: $scope.costCenterAgregados,
                    costosindirectos: $scope.item._id,
                    enterprise: user.enterprise._id
                };

                var costosindirectosService = $scope.item;
                costosindirectosService.enterprise = costosindirectosService.enterprise._id;

                
               
                Socket.emit('servicios.create', servicios);
                $mdDialog.hide();
                ServiciosService.query({e: user.enterprise._id}, function (data) {
                    for (var i in data) {
                        if (data[i].costosindirectos == $scope.item._id && data[i].deleted == false) {
                            $scope.serviciosIDArray.push(data[i]._id);
                        }
                    }
                    costosindirectosService.servicio = $scope.serviciosIDArray;
                    costosindirectosService.$update(function () {
                        console.log('costos indirectos ok');
                    }, function (errorResponse) {
                        console.log('costos indirectos error');
                    });

                });
            };
            //agrega puestos en el create de caja
            $scope.agregarCostCenter = function (puesto) {
                var ok = false;
                if ((puesto !== undefined) && (puesto !== null)) {
                  for (var i in $scope.costCenterAgregados) {
                      if ($scope.costCenterAgregados[i]._id === puesto._id) {
                          var ok = true;
                      }
                  }
                  if (!ok) {
                      $scope.costCenterAgregados.push(puesto);
                  }
                }
            };
            
            $scope.createFactura = function($event,item) {

               if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                   
                    var navList = ServiceNavigation.getNav();//t o get sub nav which will be used to create titles for the factura navigation extend
                    var t1 = (navList[0]) ? navList[0].name : localStorage.getItem("p2storage")[0].name;
                    var t2 = (navList[1]) ? navList[1].name : localStorage.getItem("p2storage")[1].name;
                    var t2Id = (navList[1]) ? navList[1].id: localStorage.getItem("p2storage")[1].id; //sub centro id
                    var centro = JSON.parse(localStorage.getItem('centrodecosto'));
                    var centroId = centro.costosId;

                    if(!t1 || !t2) {
                       alert("Error! Cannot create factura");
                       return;
                    }

                    var factura = {
                      title1: t1,
                      title2: t2,
                      title2Id: t2Id, 
                      numero: $scope.numero,
                      centroId: centroId,
                      servicios: item._id,
                      serviceName: item.name,
                      montoE: $scope.montoE,
                      facturaDate: facturaDate,
                      month:facturaMonth,
                      year:facturaYear,
                      observaciones: $scope.observaciones,
                      enterprise: user.enterprise._id,
                      type: 'costosIndirectos'
                    };                   
                    
                    var actualBill;
                    CostosindirectosService.get({costosindirectoId: item.costosindirectos}, function (costo) {
                        
                        actualBill = $scope.montoE; 
                        
                        if(!item.facturado)
                          item.facturado = 0;
                        var yeartype = (typeof getYear.yearName  === 'number') ? facturaYear : facturaYear.toString();
                        if(getMonth.monthId === facturaMonth && getYear.yearName === yeartype ) {
                          item.facturado += actualBill; //update the view of the real bill
                        }
       
                        factura._id = item.costosindirectos;
                        factura.isFactura = true;        
                        factura.total = item.facturado;
                        //factura.saldo = item.facturado - item.pagoAcumulados;

                        CostosindirectosService.update(factura, function () {                                                      
                            console.log('costo ok');
                        }, function (errorResponse) {
                            console.log('costo error');
                        });

                    });

                    $mdDialog.hide();
               }
            };

            $scope.createPago = function ($event, item) {
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {
                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces                      
                                            
                        //var pagoDate = new Date($scope.pagoDate);
                        //var pagoMonth = pagoDate.getMonth();
                        //var pagoYear = pagoDate.getFullYear();
                        
                        var balance;
                        var newSaldo;

                        var yeartype = (typeof getYear.yearName  === 'number') ? pagoYear : pagoYear.toString();

                        if(getMonth.monthId === pagoMonth && getYear.yearName === yeartype ) {
                          balance = $scope.caja.total - ($scope.montoE + $scope.montoC);
                          newSaldo = item.facturado - $scope.montoE;
                          item.pagoAcumulados += $scope.montoE;
                        }
                        /*if(new Date().getMonth() === pagoMonth && new Date().getFullYear() === pagoYear) {
                          balance = $scope.caja.total - ($scope.montoE + $scope.montoC);
                          newSaldo = item.facturado - $scope.montoE;
                          item.pagoAcumulados += $scope.montoE;
                        }*/

                        var numero = $scope.pagos.length + 1;    
                        
                        var pago = {
                          numero: numero,
                          servicios: item._id,
                          cajaD: $scope.caja._id,
                          montoE: $scope.montoE,
                          montoC: $scope.montoC,
                          pagoDate: pagoDate,
                          month:pagoMonth,
                          year:pagoYear,
                          saldo: null,
                          observaciones: $scope.observaciones,
                          enterprise: user.enterprise._id,
                          facturado: item.facturado, //
                          type: 'costosIndirectos'
                        };

                        Socket.emit('pago.create', pago);
                        var total = 0;
                        CostosindirectosService.get({costosindirectoId: item.costosindirectos}, function (costo) {
                            total = costo.total + $scope.montoE + $scope.montoC;
                            CostosindirectosService.update({
                                _id: item.costosindirectos, total: total
                            }, function () {
                                console.log('costo ok');
                            }, function (errorResponse) {
                                console.log('costo error');
                            });

                        });


                        $mdDialog.hide();
                    }
                    else {
                        $scope.errorCaja = 'Se debe seleccionar la caja origin'
                    }
                }
            };          //agrega puestos en el edit de caja


            //funcion que rendondea a 2 decimales
            function roundToTwo(num) {
                return +(Math.round(num + "e+2") + "e-2");
            }
            $scope.pagosAcumulados = item.pagoAcumulados;
            $scope.addPagoAcumulados = function (value) {
                $scope.errorCaja = false;
                console.log($scope.caja);
                if ($scope.caja) {
                    if ($scope.caja.efectivo >= value) {
                        $scope.montoE = value;
                        $scope.pagosAcumulados = item.pagoAcumulados + $scope.montoC + $scope.montoE;
                    } else {
                        $scope.errorCaja = 'amount is not available in selected caja';
                    }
                } else {
                    $scope.errorCaja = 'Se debe seleccionar la caja origin';
                }
            }
            $scope.addCheque = function (value) {
                $scope.errorCaja = false;
                if ($scope.caja) {
                    if ($scope.caja.cheques >= value) {
                        $scope.montoC = value;
                        $scope.pagosAcumulados = item.pagoAcumulados + $scope.montoC + $scope.montoE;

                    } else {
                        $scope.errorCaja = 'amount is not available in selected caja';
                    }
                } else {
                    $scope.errorCaja = 'Se debe seleccionar la caja origin';
                }
            }

            function updateConstoIndirectos() {
                console.log(this.serviciosIDArray);
            }

        }

    }]);