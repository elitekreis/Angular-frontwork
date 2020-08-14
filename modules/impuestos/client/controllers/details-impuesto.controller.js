'use strict';

// Create Impuesto controller
angular.module('impuestos').controller('ImpuestosDetailsController', ['$state', '$scope', '$rootScope', "$filter",'$http', '$mdDialog', '$stateParams', 'VentasExtra', 'ComprasExtra', 'ImpuestosTax',
    function($state, $scope, $rootScope, $filter, $http, $mdDialog, $stateParams, VentasExtra, ComprasExtra, ImpuestosTax) {
        var year = (new Date()).getFullYear();
        var month = (new Date()).getMonth();

        if (localStorage.getItem("dateImpuestos")) {
            var date = JSON.parse(localStorage.getItem("dateImpuestos"));
            year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        }

        $scope.impuestosName = $stateParams.impuestosName;
        $scope.impuestosType = $stateParams.impuestosType;
        console.log($stateParams, $scope.impuestosType);
        $scope.start = true;
        $scope.impuestos = [];
        $scope.ajustars = [];

        $scope.showAlert = function (ev, obs) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(obs)
                .ariaLabel('Alert Dialog Demo')
                .targetEvent(ev)
                .ok('Cerrar')
            );
        }



        function calcSaldo(arr) {
            console.log(arr)
            var newArr =  $filter('orderBy')(arr,'-created');
            //console.log(newArr)
            var nextItem;
            var amount;
            for(var i = newArr.length - 1; i >= 0; i--){
              nextItem = newArr[i + 1];
             
              //newArr[i].saldo = 0;
             
              /*if(nextItem){                
                amount = newArr[i].totalTax || newArr[i].montoE || newArr[i].price || 0;
                newArr[i].saldo = (nextItem.cliente) ? ( nextItem.saldo + newArr[i].totalTax ) : (nextItem.proveedor) ? ( nextItem.saldo - newArr[i].totalTax ) : (nextItem.montoE) ?
                (nextItem.saldo - newArr[i].montoE) : (newArr[i].adjType == 'IVA Ventas') ? (nextItem.saldo + newArr[i].price) : (newArr[i].adjType == 'IVA Compras') ? (nextItem.saldo - newArr[i].price) : 0;
              } else {
                newArr[i].saldo = (newArr[i].montoE) ? newArr[i].montoE : (newArr[i].adjType) ? (newArr[i].price) : newArr[i].totalTax;
              }*/
              if(!nextItem) {
                newArr[i].saldo = (newArr[i].montoE) ? newArr[i].montoE : (newArr[i].adjType) ? (newArr[i].price) : newArr[i].totalTax;
              } else {
                newArr[i].saldo = (newArr[i].cliente) ? ( nextItem.saldo + newArr[i].totalTax) :
                 (newArr[i].adjType === 'IVA Ventas') ? ( nextItem.saldo + newArr[i].price) :
                  (newArr[i].proveedor) ? ( nextItem.saldo - newArr[i].totalTax) :
                   (newArr[i].adjType === 'IVA Compras') ? ( nextItem.saldo - newArr[i].price) : ( nextItem.saldo - newArr[i].montoE);
              } 
            }
            
            $scope.impuestos = newArr;
        }

        $scope.loadmore = function() {            

            $scope.loading = true;
            $scope.start = false;
            var last = $scope.impuestos.length ? $scope.impuestos[$scope.impuestos.length - 1].created : null;
            var limit = $scope.impuestos.length < 40 ? 40 : 20;

          
            // if ($scope.impuestosName == 'IVA Ventas') {
            //     VentasExtra.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
            //         function(data) {

            //             $scope.impuestos = $scope.impuestos.concat(data.data);
            //             $scope.loading = false;
            //             $scope.start = false;
            //             if (data.data.length === 0)
            //                 $scope.done = true;
            //             else {
            //                 $http.get('/api/impuestos/ajustar', {
            //                     params: {
            //                         impuestoId: $stateParams.impuestosId,
            //                         year: year,
            //                         month: month,
            //                         last: data.data[data.data.length - 1].created
            //                     }
            //                 }).then(function(data) {
            //                     console.log("QQQQQ", data);

            //                     $scope.impuestos = $scope.impuestos.concat(data.data);
            //                 });
            //             }
            //         }
            //     )
            // } else if ($scope.impuestosName == 'IVA Compras') {
            //     ComprasExtra.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
            //         function(data) {
            //             console.log(data);
            //             $scope.impuestos = $scope.impuestos.concat(data.data);
            //             $scope.loading = false;
            //             $scope.start = false;
            //             if (data.data.length === 0)
            //                 $scope.done = true;
            //             else {
            //                 $http.get('/api/impuestos/ajustar', {
            //                     params: {
            //                         impuestoId: $stateParams.impuestosId,
            //                         year: year,
            //                         month: month,
            //                         last: data.data[data.data.length - 1].created
            //                     }
            //                 }).then(function(data) {
            //                     console.log(data.data)
            //                     $scope.impuestos = $scope.impuestos.concat(data.data);
            //                 });
            //             }
            //         }
            //     )
            // }
            if ($scope.impuestosName == 'IVA Ventas') {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function(data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                            });
                        }
                    }
                )
            } else if ($scope.impuestosName == 'IVA Compras') {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function(data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                            });
                        }
                    }
                )

             } else if ($scope.impuestosName == 'IVA') {                
                var iva = JSON.parse(localStorage.getItem('ivaType'));
                $scope.isIVA = true;  
                $http.get('/api/impuestos/ajustar', {
                    params: {
                        impuestoId: $stateParams.impuestosId,
                        year: year,
                        month: month,
                        //last: data.data[data.data.length - 1].created,
                        IVA: $scope.impuestosName,
                        ivaVentas: iva['IVA Ventas'],
                        ivaCompras: iva['IVA Compras']
                    }
                }).then(function(data) {                  
                    calcSaldo(data.data)
                });
                /*ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month, $scope.impuestosName,iva['IVA Ventas'],iva['IVA Compras']).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        //$scope.impuestos = $scope.impuestos.concat(data.data);
                       //calcSaldo(data.data)
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created,
                                    IVA: $scope.impuestosName,
                                    ivaVentas: iva['IVA Ventas'],
                                    ivaCompras: iva['IVA Compras']
                                }
                            }).then(function(data) {
                                calcSaldo(data.data)
                            });
                        }
                    }
                )*/
            } else {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created

                                }
                            }).then(function(data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                            });
                        }
                    }
                )
            }
        };

    }
]);