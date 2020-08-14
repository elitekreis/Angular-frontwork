"use strict";

// Comprobantes controller
angular.module("pagos").controller("PagosViewController", [
  "$stateParams",
  "$state",
  "$http",
  "user",
  "Authentication",
  "$mdDialog",
  "$scope",
  "pago",
  "servicios",
  "Cajas",
  "CostosindirectosService",
  "Empleados",
  "Impuestos",
  "$rootScope",
  "ServiceNavigation",
  "PagosService",
  "Liquidaciones",
  function(
    $stateParams,
    $state,
    $http,
    user,
    authentication,
    $mdDialog,
    $scope,
    pago,
    servicios,
    Cajas,
    CostosindirectosService,
    Empleados,
    Impuestos,
    $rootScope,
    ServiceNavigation,
    PagosService,
    Liquidaciones
  ) {
    // asignacion de modelos
    var global = this;
    this.user = user;
    this.pago = pago;
    this.fromDate = "All";

    this.servicios = servicios;
    this.waiting = false;
    this.movimientos = [];
    this.movimientosList = [];
    this.pagoType = null;
    this.openMenu = openMenu;
    this.showConfirm = showConfirm;
    this.showAlertLiquidacion = showAlertLiquidacion;

    var originatorEv;

    // asignacion de funciones
    // ===============================
    this.findLiquidaciones = findLiquidaciones;
    this.findLiquidaciones();

    function findLiquidaciones() {
      var date = JSON.parse(localStorage.getItem("dateEmpleados"));
      if (date && (date.month || date.year)) {
        $http
          .put("/api/liquidaciones", {
            empleadoId: $stateParams.empleadoId,
            month: date.month,
            year: date.year
          })
          .success(function(response) {
            $scope.liquidaciones = response;
            $scope.name = $stateParams.displayName;
          });
      } else {
        $http
          .put("/api/liquidaciones", {
            empleadoId: $stateParams.empleadoId
          })
          .success(function(response) {
            $scope.liquidaciones = response;
            $scope.name = $stateParams.displayName;
          });
      }
    }

    // $scope.findLiquidaciones();

    // ===============================

    this.findMovimientos = findMovimientos;
    this.showAlert = showAlert;
    this.showDialogPago = showDialogPago;
    this.showDialogSaldo = showDialogSaldo;

    this.findMovimientos(pago);

    if ($stateParams.servicosId !== "") {
      this.pagoType = "costosIndirectos";
    } else if ($stateParams.impuestosId !== "") {
      this.pagoType = "impuestos";
    } else if ($stateParams.empleadoId !== "") {
      this.pagoType = "personal";
      this.displayName = $stateParams.displayName;
      this.centroDeCosto = $stateParams.centroDeCosto;
      Empleados.get({ empleadoId: $stateParams.empleadoId }, function(
        response
      ) {
        $scope.empleado = response;
      });
    }

    this.serviceDetailList = pago;
    this.saldos = pago;
    //alert(localStorage.getItem('serviceName'))
    this.serviceName = localStorage.getItem("serviceName");
    this.showComfirmServiceDetail = showComfirmServiceDetail;

    this.removeSaldo = removeSaldo;

    var getMonth = JSON.parse(localStorage.getItem("month"));
    var getYear = JSON.parse(localStorage.getItem("year"));

    var self = this;

    // $scope.centroDeCosto = $stateParams.centroDeCosto;
    // $rootScope.empleadoId = $stateParams.empleadoId;

    $rootScope.$broadcast("hide nav", true);

    $scope.rutaVolver = function() {
      history.back();
    };

    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    }

    // definicion de funciones

    function sort(pagos, liquidaciones) {
          
      var saldos = self.saldos.concat(liquidaciones);//pagos.concat(liquidaciones);
      if(liquidaciones.length > 0) {     
        saldos.sort(function(a, b) {
          var nameA = a.created.toUpperCase(); // ignore upper and lowercase
          var nameB = b.created.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          // names must be equal
          return 0;
        });

        // saldos.each(function(saldo,key) {
        //     console.log(saldo);
        // })
        var total_saldo = 0;
        for (var i in saldos) {
          if (saldos[i].remuneraciones) {
            saldos[i].type = "Liquidacion";
            total_saldo +=
              saldos[i].remuneraciones[0].total *
              saldos[i].remuneraciones[0].cantidad;
            saldos[i].saldo = total_saldo;
          } else {
            saldos[i].type = "pago";
            total_saldo -= saldos[i].montoE + saldos[i].montoC;
            saldos[i].saldo = total_saldo;
          }
        }      
      }
      return saldos;
    }

    function removeSaldo(ev, item) {
      var confirm = $mdDialog
        .confirm()
        .title("¿Eliminar la liquidacion?")
        .ariaLabel("Lucky day")
        .targetEvent(ev)
        .ok("Aceptar")
        .cancel("Cancelar");
      $mdDialog.show(confirm).then(
        function() {
          if (item.type == "pago") {
            console.log(self);
            item.deleted = true;
            item.$update(function() {
              var total_saldo = 0;
              for (var i in self.saldos) {
                if (self.saldos[i].deleted) {
                  continue;
                }
                if (self.saldos[i].remuneraciones) {
                  total_saldo +=
                    self.saldos[i].remuneraciones[0].total *
                    self.saldos[i].remuneraciones[0].cantidad;
                  self.saldos[i].saldo = total_saldo;
                } else {
                  total_saldo -= self.saldos[i].montoE + self.saldos[i].montoC;
                  self.saldos[i].saldo = total_saldo;
                }
              }
            });
          } else {
            $http
              .delete("/api/liquidaciones/" + item._id)
              .then(function(res) {
                item.deleted = true;
                console.log(self);

                var total_saldo = 0;
                for (var i in self.saldos) {
                  if (self.saldos[i].deleted) {
                    continue;
                  }
                  if (self.saldos[i].remuneraciones) {
                    total_saldo +=
                      self.saldos[i].remuneraciones[0].total *
                      self.saldos[i].remuneraciones[0].cantidad;
                    self.saldos[i].saldo = total_saldo;
                  } else {
                    total_saldo -=
                      self.saldos[i].montoE + self.saldos[i].montoC;
                    self.saldos[i].saldo = total_saldo;
                  }
                }
              })
              .catch(function(err) {
                console.log(err);
              });
          }
        },
        function() {
          console.log("Error in the liquidacion deletion");
        }
      );
    }

    function findMovimientos(pago) {
      this.waiting = true;
      this.movimientosList = pago;
      this.waiting = false;
      $scope.movimientosList = pago;
      var date = JSON.parse(localStorage.getItem("dateEmpleados"));
      if (date && (date.month || date.year)) {
        $http
          .put("/api/liquidaciones", {
            empleadoId: $stateParams.empleadoId,
            month: "",
            year: date.year
          })
          .success(function(response) {
            $scope.liquidaciones = response;
            $scope.name = $stateParams.displayName;
            global.saldos = sort($scope.movimientosList, $scope.liquidaciones);
          });
      } else {
        $http
          .put("/api/liquidaciones", {
            empleadoId: $stateParams.empleadoId
          })
          .success(function(response) {
            $scope.liquidaciones = response;
            $scope.name = $stateParams.displayName;
            global.saldos = sort($scope.movimientosList, $scope.liquidaciones);
          });
      }
    }

    $scope.callAddPago = function($event, item) {
      $rootScope.$emit("callAddPago", { event: $event, item: item });
    };
    $scope.callAddLiquidencion = function($event, item) {
      $rootScope.$emit("callAddLiquidencion", { event: $event, item: item });
    };

    function showAlertLiquidacion($event, item) {
      $mdDialog
        .show({
          targetEvent: $event,
          template:
            '<md-dialog aria-label="List dialog">' +
            "  <md-dialog-content>" +
            "    <md-list>" +
            '      <md-list-item >' +
            "         <h2>{{observaciones}}</h2>" +
            "      </md-list-item> " +
            "      <br>  "          +
            '      <md-list-item >' +
            "        <h2 style = 'font-weight:bold;'>{{concepto}}&nbsp&nbsp</h2>" +            
            "        <h2 style = 'font-style:italic;'>{{period}}</h2>" +
            "    </md-list-item></md-list>" +
            "  </md-dialog-content>" +
            "  <md-dialog-actions>" +
            '    <md-button ng-click="closeDialog()" class="md-primary">' +
            "      Cerrar" +
            "    </md-button>" +
            "  </md-dialog-actions>" +
            "</md-dialog>",

          locals: {
            item: item,
            user: global.user,
            global: global
          },
          controller: DialogController
        })
        .then(
          function(answer) {
            //$scope.alert = 'You said the information was "' + answer + '".';
            // $scope.find();
          },
          function() {
            //$scope.alert = 'You cancelled the dialog.';
          }
        );
    } //end showDialog

    function showAlert(ev, obs) {
      $mdDialog.show(
        $mdDialog
          .alert()
          .parent(angular.element(document.querySelector("#popupContainer")))
          .clickOutsideToClose(true)
          .title(obs)
          .ariaLabel("Alert Dialog Demo")
          .targetEvent(ev)
          .ok("Cerrar")
      );
    }

    function showComfirmServiceDetail(ev, item) {
      var confirm = $mdDialog
        .confirm()
        .title("¿Eliminar la factura?")
        .ariaLabel("Lucky day")
        .targetEvent(ev)
        .ok("Aceptar")
        .cancel("Cancelar");
      $mdDialog.show(confirm).then(
        function() {
          //deleteServiceDetail(item);
          deleteFactura(item);
        },
        function() {
          //cancelo
        }
      );
    }

    function deleteSaldo(item) {
      console.log(self);
      item.deleted = true;
      item.$update(function() {
        console.log("updated");
      });
    }

    function deleteFactura(item) {
      var strToArr = $stateParams.servicosId.split("/");
      var month = getMonth.monthId;
      var year = getYear.yearName;
      PagosService.query(
        {
          e: user.enterprise._id,
          type: "deleteService",
          id: item.id,
          serviceId: strToArr[0],
          month: month,
          year: year
        },
        function(data) {
          self.serviceDetailList = data;
        }
      );
    }

    function showConfirm(ev, item) {
      var confirm = $mdDialog
        .confirm()
        .title("¿Eliminar la pago?")
        .ariaLabel("Lucky day")
        .targetEvent(ev)
        .ok("Aceptar")
        .cancel("Cancelar");
      $mdDialog.show(confirm).then(
        function() {
          // deletePago(item);
          // deleteFactura(item);
          deleteSaldo(item);

          // this.findMovimientos();
        },
        function() {
          //cancelo
        }
      );
    }

    function deletePago(item) {
      if (item) {
        item.deleted = true;
        item.$update(
          function() {
            // code for update pago
            var total = 0;
            var cheques = 0;
            var efectivo = 0;
            Cajas.get({ cajaId: item.cajaD }, function(caja) {
              caja.total = caja.total + item.montoE + item.montoC;

              caja.cheques = caja.cheques + item.montoC;
              caja.efectivo = caja.efectivo + item.montoE;

              caja.enterprise = caja.enterprise._id;
              item.cajaD = caja;
              caja.$update(
                function() {
                  if ($stateParams.impuestosId !== "") {
                    Impuestos.get({ impuestoId: item.impuestos._id }, function(
                      impuesto
                    ) {
                      impuesto.total =
                        impuesto.total - (item.montoE + item.montoC);
                      impuesto.$update(
                        function() {
                          $state.go("home.viewImpuesto", {
                            centroDeCosto: item.impuestos.centroDeCosto
                          });
                        },
                        function(errorResponse) {
                          console.log("costo error");
                        }
                      );
                    });
                  } else if ($stateParams.empleadoId !== "") {
                    console.log("liquid");
                  } else {
                    servicios.pagoAcumulados =
                      servicios.pagoAcumulados - (item.montoC + item.montoE);
                    servicios.$update(
                      function() {
                        //  minus pago amount from servicios
                        CostosindirectosService.get(
                          { costosindirectoId: servicios.costosindirectos },
                          function(costo) {
                            total = costo.total - (item.montoC + item.montoE);
                            costo.total = total;
                            costo.enterprise = costo.enterprise.id;
                            costo.$update(
                              function() {
                                $state.go("home.viewPago", {
                                  servicosId: $stateParams.servicosId
                                });
                              },
                              function(errorResponse) {
                                console.log(errorResponse);
                              }
                            );
                          }
                        );
                      },
                      function(errorResponse) {
                        console.log("servicios error");
                      }
                    );
                  }
                },
                function(errorResponse) {
                  console.log("caja error");
                }
              );
            });
          },
          function(errorResponse) {
            console.log("pago error");
          }
        );
      }
    }
    // ===================================================

    function showDialogSaldo($event, item) {
      $mdDialog
        .show({
          targetEvent: $event,
          templateUrl: "modules/pagos/views/edit-saldo.client.view.html",
          locals: {
            item: item,
            user: global.user,
            global: global
          },
          controller: DialogController
        })
        .then(
          function(answer) {
            //$scope.alert = 'You said the information was "' + answer + '".';
            // $scope.find();
          },
          function() {
            //$scope.alert = 'You cancelled the dialog.';
          }
        );
    } //end showDialog

    // ===================================================
    function showDialogPago($event, item) {
      $mdDialog
        .show({
          targetEvent: $event,
          templateUrl: "modules/pagos/views/edit-pago.client.view.html",
          locals: {
            item: item,
            user: global.user,
            global: global
          },
          controller: DialogController
        })
        .then(
          function(answer) {
            //$scope.alert = 'You said the information was "' + answer + '".';
            // $scope.find();
          },
          function() {
            //$scope.alert = 'You cancelled the dialog.';
          }
        );
    } //end showDialog
    // fin actualizaciones en tiempo real.
    function DialogController(
      $scope,
      $mdDialog,
      item,
      user,
      global,
      PagosService,
      $filter,
      ServiciosService,
      Cajas,
      CostosindirectosService,
      Liquidaciones
    ) {
      $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
      $scope.obs = item.observaciones;

      if(item.type == "Liquidacion"){
        
        $scope.concepto = item.remuneraciones[0].name;
          
        $scope.period = item.fechaDeLiquidacion + " ~ " + item.fechaDeLiquidacion2;
        var month = new Array();
        month[0] = "Jan";
        month[1] = "Feb";
        month[2] = "Mar";
        month[3] = "Apr";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "Aug";
        month[8] = "Sep";
        month[9] = "Oct";
        month[10] = "Nov";
        month[11] = "Dec";
        var start_date = new Date(item.fechaDeLiquidacion);
        var end_date = new Date(item.fechaDeLiquidacion2);
        var dd1 = start_date.getDate();
        var mm1 = month[start_date.getMonth()];
        var yyyy1 = start_date.getFullYear();
        var dd2 = end_date.getDate();
        var mm2 =month[end_date.getMonth()]; 
        var yyyy2 = end_date.getFullYear();
        $scope.period = dd1 + " " + mm1 + " " + yyyy1 + "~" + dd2 + " " + mm2 + " " + yyyy2;
  

      }

      $scope.$watchCollection("ServiciosService", function() {
        $scope.findPago();
      });

      $scope.$watchCollection("Cajas", function() {
        $scope.findCajas();
      });

      $scope.mostrar = true;

      $scope.item = item;
      $scope.caja = item.cajaD;
      //$scope.
      $scope.costCenterAgregados = [];

      $scope.montoE = item.montoE;
      $scope.montoC = item.montoC;
      $scope.observaciones = item.observaciones;
      // $scope.saldos = saldos;
      $scope.pagoDate = new Date(item.pagoDate);

      $scope.errorCaja = undefined;

      $scope.findCajas = function() {
        Cajas.query({ e: user.enterprise._id }, function(data) {
          $scope.cajas = $filter("filter")(data, function(item) {
            return item._id !== $scope.item._id;
          });
        });
      };

      $scope.closeDialog = function() {
        $mdDialog.hide();
      };

      $scope.serviciosIDArray = [];
      //devuelve todas la Servicios

      $scope.findPago = function() {
        $scope.pagos = PagosService.query({ e: user.enterprise._id });
      };

      $scope.editLiquidacion = function($event, item) {
        if (
          $event.keyCode === 13 ||
          $event.keyCode === 0 ||
          $event.keyCode === undefined
        ) {
          Liquidaciones.get({ liquidacionId: item._id }, function(
            liquidacione
          ) {
            var newVal = item.newVal;
            item.remuneraciones[0].total = item.newVal;
            liquidacione.remuneraciones[0].total = item.newVal;
            liquidacione.observaciones = item.observaciones;

            console.log(liquidacione);
            liquidacione.$update(
              function() {
                // $state.go('home.viewSaldos', {centroDeCosto: item.impuestos.centroDeCosto});
              },
              function(errorResponse) {
                console.log("pago error");
              }
            );
          });

          $mdDialog.hide();
        }
      };

      $scope.editFactura = function($event, item) {
        if (
          $event.keyCode === 13 ||
          $event.keyCode === 0 ||
          $event.keyCode === undefined
        ) {
          CostosindirectosService.get(
            { costosindirectoId: servicios.costosindirectos },
            function(costo) {
              costo.facturaEdit = item;
              costo.$update(
                function(data) {
                
                  self.serviceDetailList = costo.operacion;
                  console.log("costo updated");
                  $mdDialog.hide();
                },
                function(errorResponse) {
                  console.log(errorResponse);
                }
              );
            }
          );
        }
      };

      $scope.editSaldo = function($event, item, global) {
        if (
          $event.keyCode === 13 ||
          $event.keyCode === 0 ||
          $event.keyCode === undefined
        ) {
          if (item.type == "pago") {
            var diffMontoE = item.newPago - item.montoE;
            var diffMontoC = $scope.montoC - item.montoC;
            var newPago = item.newPago;
            item.montoE = item.newPago;
            var cajaD =
              typeof item.cajaD === "string" ? item.cajaD : item.cajaD._id;

            PagosService.get({ pagoId: item._id }, function(pago) {
              pago.montoE = newPago;
              pago.observaciones = item.observaciones;

              pago.$update(
                function() {
                  console.log("pago updated");

                  var total_saldo = 0;
                  for (var i in self.saldos) {
                    if (self.saldos[i].remuneraciones) {
                      self.saldos[i].type = "Liquidacion";
                      total_saldo +=
                        self.saldos[i].remuneraciones[0].total *
                        self.saldos[i].remuneraciones[0].cantidad;
                      self.saldos[i].saldo = total_saldo;
                    } else {
                      self.saldos[i].type = "pago";
                      total_saldo -=
                        self.saldos[i].montoE + self.saldos[i].montoC;
                      self.saldos[i].saldo = total_saldo;
                    }
                  }
                },
                function(errorResponse) {
                  console.log("pago error");
                }
              );
            });
          } else {
            console.log("liquedence");

            // var diffMontoE = item.newVal - item.montoE;
            // var diffMontoC = $scope.montoC - item.montoC;
            // var newVal = item.newVal;
            // item.remuneraciones[0].total = item.newVal;
            item.remuneraciones[0].total = item.newVal / item.remuneraciones[0].cantidad;
            var liquidacion = item;

            var total_saldo = 0;

            $http
              .put("/api/liquidaciones/" + liquidacion._id, liquidacion)
              .then(function(response) {
                item.remuneraciones[0].total = item.newVal / item.remuneraciones[0].cantidad;
                for (var i in self.saldos) {
                  if (self.saldos[i].type == "Liquidacion") {
                    total_saldo +=
                      self.saldos[i].remuneraciones[0].total *
                      self.saldos[i].remuneraciones[0].cantidad;
                    self.saldos[i].saldo = total_saldo;
                  } else {
                    total_saldo -=
                      self.saldos[i].montoE + self.saldos[i].montoC;
                    self.saldos[i].saldo = total_saldo;
                  }
                }
              })

              .catch(function(errorResponse) {
                $scope.error = errorResponse.data.message;
              });
          }

          $mdDialog.hide();
        }
      };

      $scope.editPago = function($event, item) {
        if (
          $event.keyCode === 13 ||
          $event.keyCode === 0 ||
          $event.keyCode === undefined
        ) {
          if ($scope.caja !== undefined && $scope.caja !== null) {
            var diffMontoE = item.newPago - item.montoE;
            var diffMontoC = $scope.montoC - item.montoC;
            var cajaD =
              typeof item.cajaD === "string" ? item.cajaD : item.cajaD._id;
            Cajas.get({ cajaId: cajaD }, function(caja) {
              caja.total =
                diffMontoE != 0 ? caja.total - diffMontoE : caja.total;
              caja.total =
                diffMontoC != 0 ? caja.total - diffMontoC : caja.total;
              caja.cheques =
                diffMontoC != 0 ? caja.cheques - diffMontoC : caja.cheques;
              caja.efectivo =
                diffMontoE != 0 ? caja.efectivo - diffMontoE : caja.efectivo;
              caja.enterprise = caja.enterprise.id;
              item.cajaD = caja;
              console.log(caja);
              caja.$update(
                function() {
                  console.log("caja updated");
                  if ($stateParams.impuestosId !== "") {
                    Impuestos.get({ impuestoId: item.impuestos._id }, function(
                      impuesto
                    ) {
                      impuesto.total =
                        impuesto.total + (diffMontoE || 0) + (diffMontoC || 0);
                      impuesto.$update(
                        function() {
                          $state.go("home.viewImpuesto", {
                            centroDeCosto: item.impuestos.centroDeCosto
                          });
                        },
                        function(errorResponse) {
                          console.log("costo error");
                        }
                      );
                    });
                  } else {
                    CostosindirectosService.get(
                      { costosindirectoId: servicios.costosindirectos },
                      function(costo) {
                        costo.total =
                          diffMontoE != 0
                            ? costo.total + diffMontoE
                            : costo.total;
                        costo.total =
                          diffMontoC != 0
                            ? costo.total + diffMontoC
                            : costo.total;
                        costo.enterprise = costo.enterprise.id;
                        costo.pagoEdit = item;
                        costo.oldVal = $scope.oldVal;
                        costo.$update(
                          function() {
                            console.log("costo updated");
                            console.log(costo);
                            console.log(costo.operacion);
                            self.serviceDetailList = costo.operacion;

                            //$state.go('home.viewPago', {servicosId:(item.servicios._id + '/' + item.servicios.name + '/serviceDetails')});
                          },
                          function(errorResponse) {
                            console.log(errorResponse);
                          }
                        );
                      }
                    );
                  }
                },
                function(errorResponse) {
                  console.log(errorResponse);
                  console.log("caja error");
                }
              );
            });

            $mdDialog.hide();
          } else {
            $scope.errorCaja = "Se debe seleccionar la caja origin";
          }
        }
      }; //agrega puestos en el edit de caja

      $scope.editPago1 = function($event, values) {
        if (
          $event.keyCode === 13 ||
          $event.keyCode === 0 ||
          $event.keyCode === undefined
        ) {
          if ($scope.caja !== undefined && $scope.caja !== null) {
            $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces
            if (!item.type) {
              var diffMontoE = item.newVal - item.montoE;
              var diffMontoC = $scope.montoC - item.montoC;
              item.montoE =
                diffMontoE != 0 ? item.montoE + diffMontoE : item.montoE;
              item.montoC =
                diffMontoC != 0 ? item.montoC + diffMontoC : item.montoC;
              item.saldo =
                diffMontoE != 0 ? item.saldo - diffMontoE : item.saldo;
              item.saldo =
                diffMontoC != 0 ? item.saldo - diffMontoC : item.saldo;
              item.pagoDate = $scope.pagoDate;
              item.observaciones = $scope.observaciones;
            } else {
              var diffMontoE = values.newVal - item.montoE;
              var diffMontoC = values.newMontoC - item.montoC;
              $scope.oldVal = values.montoE;
              item.montoE = values.newVal;
              item.pagoDate = values.pagoDate;
              item.observaciones = values.newObservaciones;
              item.pagoDate = $scope.pagoDate;
            }

            item.$update(
              function() {
                Cajas.get({ cajaId: item.cajaD }, function(caja) {
                  caja.total =
                    diffMontoE != 0 ? caja.total - diffMontoE : caja.total;
                  caja.total =
                    diffMontoC != 0 ? caja.total - diffMontoC : caja.total;
                  caja.cheques =
                    diffMontoC != 0 ? caja.cheques - diffMontoC : caja.cheques;
                  caja.efectivo =
                    diffMontoE != 0
                      ? caja.efectivo - diffMontoE
                      : caja.efectivo;
                  caja.enterprise = caja.enterprise.id;
                  item.cajaD = caja;
                  caja.$update(
                    function() {
                      console.log("caja updated");
                      if ($stateParams.impuestosId !== "") {
                        Impuestos.get(
                          { impuestoId: item.impuestos._id },
                          function(impuesto) {
                            impuesto.total =
                              impuesto.total +
                              (diffMontoE || 0) +
                              (diffMontoC || 0);
                            impuesto.$update(
                              function() {
                                $state.go("home.viewImpuesto", {
                                  centroDeCosto: item.impuestos.centroDeCosto
                                });
                              },
                              function(errorResponse) {
                                console.log("costo error");
                              }
                            );
                          }
                        );
                      } else {
                        servicios.pagoAcumulados =
                          diffMontoE != 0
                            ? servicios.pagoAcumulados + diffMontoE
                            : servicios.pagoAcumulados;
                        servicios.pagoAcumulados =
                          diffMontoC != 0
                            ? servicios.pagoAcumulados + diffMontoC
                            : servicios.pagoAcumulados;
                        servicios.$update(
                          function() {
                            //  minus pago amount from servicios
                            CostosindirectosService.get(
                              { costosindirectoId: servicios.costosindirectos },
                              function(costo) {
                                costo.total =
                                  diffMontoE != 0
                                    ? costo.total + diffMontoE
                                    : costo.total;
                                costo.total =
                                  diffMontoC != 0
                                    ? costo.total + diffMontoC
                                    : costo.total;
                                costo.enterprise = costo.enterprise.id;
                                costo.pagoEdit = item;
                                costo.oldVal = $scope.oldVal;
                                costo.$update(
                                  function() {
                                    console.log("costo updated");
                                    console.log(costo);
                                    //self.serviceDetailList = costo.operacion;
                                    $state.go("home.viewPago", {
                                      servicosId: $stateParams.servicosId
                                    });
                                  },
                                  function(errorResponse) {
                                    console.log(errorResponse);
                                  }
                                );
                              }
                            );
                          },
                          function(errorResponse) {
                            console.log("servicios error");
                          }
                        );
                      }
                    },
                    function(errorResponse) {
                      console.log("caja error");
                    }
                  );
                });
              },
              function(error) {
                console.log(error);
              }
            );
            $mdDialog.hide();
          } else {
            $scope.errorCaja = "Se debe seleccionar la caja origin";
          }
        }
      }; //agrega puestos en el edit de caja

      //funcion que rendondea a 2 decimales
      function roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
      }

      $scope.pagosAcumulados = item.pagoAcumulados;
      $scope.addPagoAcumulados = function(value) {
        $scope.errorCaja = false;
        if ($scope.caja) {
          if ($scope.caja.efectivo + item.montoE >= value) {
            $scope.montoE = value;
            $scope.pagosAcumulados =
              item.pagoAcumulados + $scope.montoC + $scope.montoE;
          } else {
            $scope.errorCaja = "amount is not available in selected caja";
          }
        } else {
          $scope.errorCaja = "Se debe seleccionar la caja origin";
        }
      };

      $scope.addCheque = function(value) {
        $scope.errorCaja = false;
        if ($scope.caja) {
          if ($scope.caja.cheques >= value) {
            $scope.montoC = value;
            $scope.pagosAcumulados =
              item.pagoAcumulados + $scope.montoC + $scope.montoE;
          } else {
            $scope.errorCaja = "amount is not available in selected caja";
          }
        } else {
          $scope.errorCaja = "Se debe seleccionar la caja origin";
        }
      };
    }
  }
]);
