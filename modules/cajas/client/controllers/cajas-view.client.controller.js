'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasViewController', ['$stateParams', 'user', 'Authentication', 'caja', 'TransferenciasExtra', /*'transferencias', 'arqueos'*/'ArqueosExtra', '$mdDialog',/* 'ventasPendientes', 'Compras',*/'ComprasExtra', 'MovimientosExtra',
/* 'comprasFinalizadas', 'movimientos', 'ventasPendientesEntrega',  'ventasFinalizadas',*/ 'CondicionventasExtra', 'CajasExtra', '$scope', 'PagosExtra', /* 'pagosService','ventasAnuladas', */
function ($stateParams, user, authentication, caja, TransferenciasExtra, /*transferencias, arqueos*/ ArqueosExtra, $mdDialog, /*ventasPendientes, Compras,*/ ComprasExtra, MovimientosExtra, /*comprasFinalizadas, movimientos, ventasPendientesEntrega, ventasFinalizadas,*/ condicionventasExtra, CajasExtra, $scope, PagosExtra /*pagosService, ventasAnuladas*/) {

    // asignacion de modelos
    var global = this;
    this.user = user;
    this.caja = caja;
    this.cajaId = $stateParams.cajaId;

    //this.transferencias = transferencias;
    this.ventasFinalizada = [];
    this.movimientos = [];
    this.waiting = false;
    this.idCuenta;

    // loadmore
    this.startdate = new Date();
    this.startdate.setDate(this.startdate.getDate() - 5);    
    this.startdate.setHours(0,0,0);
    this.enddate = new Date();
    this.enddate.setHours(23,59,0);

    // asignacion de funciones

    this.findMovimientos = findMovimientos;
    this.commonService = commonService;
    this.showAlert = showAlert;
    
    var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;

    this.findMovimientos();
   
    //global.loadmoreCondi = 0;
    
    /*
    function loadmoreCaja () {
        global.loadingCaja = true;        

        console.log('loadmoreCaja : ' );
              
        
        setTimeout(function () {
            CajasExtra.loadMore(enterprise, 'Finalizada',global.ventasFinalizadaLength, 40).then(
                angular.bind(this, function (data) {
                    
                    data = data.data;                       
                    global.ventasFinalizadaLength += data.length;

                    if (data.length == 0) {
                        global.doneCaja = true;
                        return;
                    }
                    global.ventasFinalizada = global.ventasFinalizada.concat(data);
                    for (var i = 0; i < data.length; i++) {
                        if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                            console.log("data pushed");
                            global.movimientos.push(data[i]);
                        }
                    }
                    global.loadingCaja = false; 
                    
                    loadmoreCaja();               
                })
            ).catch(
                function(err) { 
                    if (err.status == 400) {
                        global.doneCaja = true;                
                    }
                }
            );
        }, 1000);
    }
    loadmoreCaja();*/

    this.loadmore = function() {

        if (global.loadingCaja || global.doneCaja) return;        

        global.enddate = new Date(global.startdate);
        global.startdate.setDate(global.startdate.getDate() - 10);
        global.enddate.setDate(global.enddate.getDate() - 1);

        global.loadingCaja = true;  
        global.commonService();
    }


    global.ventasFinalizada = [];
    this.loadmoreCaja1 = function () {
        global.loadingCaja = true;
        global.movimientosList = global.movimientos;
        setTimeout(function () {

            // ventasFinalizadas.$promise.then(angular.bind(this, function(data) {
            //   console.log("data");
            //     for (var i = 0; i < data.length; i++) {
            //         if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
            //           console.log("data pushed");
            //             global.movimientos.push(data[i]);
            //         }
            //     }
            // }));
            console.log(authentication)
            console.log("áuth");
            var p = global.ventasFinalizada.length ? global.ventasFinalizada.length : 0;
            var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;
            CajasExtra.loadMore(enterprise, 'Finalizada', p, 30).then(
                angular.bind(this, function (data) {
                    data = data.data;
                    global.ventasFinalizada = global.ventasFinalizada.concat(data);
                    console.log(data.length);
                    for (var i = 0; i < data.length; i++) {
                        if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                            console.log("data pushed1");
                            global.movimientos.push(data[i]);
                        }

                    }
                    global.loadingCaja = false;
                    global.movimientosList = global.movimientos;
                })
            )

            // if(global.movimientosList.length === 0) {
            //     global.count = 40;
            //     global.movimientosList = global.movimientos.slice(0, 40);
            //     // global.doneCaja = true;
            // }
            //
            // if(global.movimientos.slice(global.count, global.count + 20).length >= 20) {
            //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count, global.count + 20));
            //     global.loadingCaja = false;
            //     global.count += 20;
            // } else {
            //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count));
            //     global.loadingCaja = false;
            //     global.count += 20;
            // }
        }, 1000);
    };

    // definicion de funciones

    function commonService () {
        ArqueosExtra.loadMoreByDate(enterprise, global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {                                
                    global.movimientos.push(data[i]);                   
                }

                 console.log( global.movimientos);
                 console.log(global.cajaId);
            })
        );

        TransferenciasExtra.loadMoreByDate(enterprise, global.startdate, global.enddate, global.cajaId).then(
            angular.bind(this, function (res) {
                var data = res.data;                
                for (var i = 0; i < data.length; i++) {                   
                    global.movimientos.push(data[i]);                   
                }

                console.log( global.movimientos);
                 console.log(global.cajaId);
            })
        )

        MovimientosExtra.loadMoreByDate(enterprise, 'haber', global.cajaId, global.startdate, global.enddate ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                for (var i = 0; i < data.length; i++) {            
                    if (data[i].provider != undefined) {
                        global.movimientos.push(data[i]);             
                    }
                }
                console.log(global.movimientos);
                console.log(global.cajaId);
            })
        );

        MovimientosExtra.loadMoreByDate(enterprise, 'debe', global.cajaId, global.startdate, global.enddate ).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {            
                    if (data[i].client != undefined) {
                        global.movimientos.push(data[i]);             
                    }
                }

                console.log( global.movimientos);
                console.log(global.cajaId)
            })
        );  
    
        CajasExtra.loadMoreByDate(enterprise, 'Pendiente de pago y entrega', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                
                for (var i = 0; i < data.length; i++) {     
                    if (data[i].condicionVenta !== global.idCuenta && data[i].caja === global.cajaId) {
                        global.movimientos.push(data[i]);               
                    }      
                }

            })
        );

        CajasExtra.loadMoreByDate(enterprise, 'Pendiente de entrega', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;

                for (var i = 0; i < data.length; i++) {             
                    if (data[i].condicionVenta != global.idCuenta && data[i].caja === global.cajaId) {
                        global.movimientos.push(data[i]);               
                    }      
                }

            })
        );

        CajasExtra.loadMoreByDate(enterprise, 'Anulada', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {
                var data = res.data;
                for (var i = 0; i < data.length; i++) {                                       
                    if (data[i].condicionVenta !== global.idCuenta && data[i].caja === global.cajaId) {
                      global.movimientos.push(data[i]);    
                    }
                    console.log( global.movimientos); 
                }
            })
        );  

        ComprasExtra.loadMoreByCajaDate(enterprise, 'Finalizada', global.startdate, global.enddate, global.cajaId).then(
            angular.bind(this, function (res) {
                var data = res.data;
                
                for (var i = 0; i < data.length; i++) {                   
                  global.movimientos.push(data[i]);                   
                }
               

            })
        );

        PagosExtra.loadMoreByCajaDate(enterprise, global.startdate, global.enddate, global.cajaId).then(
            angular.bind(this, function (res) {
                var data = res.data;
               
                for (var i = 0; i < data.length; i++) {                   
                  global.movimientos.push(data[i]);                   
                }

            })
        );

        CajasExtra.loadMoreByDate(enterprise, 'Finalizada', global.startdate, global.enddate, global.cajaId ).then(
            angular.bind(this, function (res) {               
                var data = res.data;          
                for (var i = 0; i < data.length; i++) {                  
                  if (data[i].condicionVenta !== global.idCuenta && data[i].caja === global.cajaId) {
                    global.movimientos.push(data[i]);
                  }  
                }                       
                global.loadingCaja = false;
            })            
        );
    }

    function findMovimientos() {
        console.log("Movimientos: ");        
        console.log("Pagos Service: ");
        this.waiting = true;
       
        /*condicionventas.$promise.then(angular.bind(this, function (res) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].name == 'Cuenta Corriente') {
                    global.idCuenta = res[i]._id;
                }
            }
        }));*/

        condicionventasExtra.loadMore(enterprise, 'Cuenta Corriente').then(
            angular.bind(this, function (res) {
                if (res.data.length > 0) {
                    global.idCuenta = res.data[0]._id;
                }                          
            })
        );

        global.commonService();

        this.waiting = false;        
    }

    function showAlert(ev, obs) {
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

}
]);
