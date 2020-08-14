'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Costosindirecto = mongoose.model('Costosindirecto'),
    Servicio = mongoose.model('Servicio'),
    Pago = mongoose.model('Pago'),
    Factura = mongoose.model('Facturado'),
    Servicio = mongoose.model('Servicio'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Costosindirecto
 */
exports.create = function (req, res) {
    var costosindirecto = new Costosindirecto(req.body);
    costosindirecto.user = req.user;

    costosindirecto.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(costosindirecto);
        }
    });
};

/**
 * Show the current Costosindirecto
 */
exports.read = function (req, res) {
    // convert mongoose document to JSON
    var costosindirecto = req.costosindirecto ? req.costosindirecto.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    costosindirecto.isCurrentUserOwner = req.user && costosindirecto.user && costosindirecto.user._id.toString() === req.user._id.toString();

    res.jsonp(costosindirecto);
};



/**
 * Update a Costosindirecto
 */
exports.update = function (req, res) {   


     if(req.body.isCostosUpdate) {

       Factura.update({title2Id:req.body._id},{$set:{total:0}},function(err,info){
        if(err) throw err;
        console.log(info)
       }) 


     }


    if(req.body['facturaEdit']) {
     
      Factura.findOne({servicios: req.body.facturaEdit.serviceId,month:req.body.facturaEdit.month,year:req.body.facturaEdit.year}).exec(function(err,factura){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
          if(factura) {
            var oldDiff = factura.total - req.body.facturaEdit.montoE;
            var newDiff = oldDiff + req.body.facturaEdit.newVal;         
            factura.total = newDiff;
            factura.save(function(err,info){});
            findService();
          } else {
            res.json([{}])
          }
        }
      });

      function findService() {
        Servicio.findById(req.body.facturaEdit.serviceId).exec(function(err,service){
          if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
          } else {
           
            var dataStamp = + new Date(req.body.facturaEdit.facturaDate);
            var elemPos = service.operacion.map(function(x){return x.id}).indexOf(req.body.facturaEdit.id);
           
            if(elemPos !== -1) {
              service.operacion[elemPos].saldo -= req.body.facturaEdit.montoE;
              service.operacion[elemPos].saldo += req.body.facturaEdit.newVal;
              service.operacion[elemPos].montoE = req.body.facturaEdit.newVal;
              service.operacion[elemPos].facturaDate = req.body.facturaEdit.facturaDate;
              service.operacion[elemPos].observaciones = req.body.facturaEdit.observaciones;
              var newSaldo = {};
              newSaldo.val = service.operacion[elemPos].saldo; //holds reference to the modified saldo;
              var nextPos = elemPos + 1;
              var deductSaldo = newSaldo;
              var deductPago = 0;
              for(var i = nextPos; i < service.operacion.length; i++) {
                if(service.operacion[i].type === 'factura'){               
                  service.operacion[i].saldo = newSaldo.val + service.operacion[i].montoE;
                  newSaldo.val += service.operacion[i].montoE;            
                } else if(service.operacion[i].type === 'pago') {                 
                  service.operacion[i].saldo = newSaldo.val - service.operacion[i].montoE;
                  newSaldo.val -= service.operacion[i].montoE;
                } else {

                }
              }
              service.operacion.push({});
              service.operacion.pop();// just to be able to save
              service.save(function(err,info){
                if(err) throw err;                
                res.json(service);
                console.log("service edit saved");
                  
              })

             
            }
                
          }
        })
       
      }
       return;  
    }

    if(req.body['pagoEdit']){
        

      updateService();

      function updateService() {
        
        Servicio.findById(req.body.pagoEdit.serviceId).exec(function(err,service){
          if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
          } else {
            if(service) {             
                         
              Costosindirecto.findById(service.costosindirectos).exec(function(err,costo){
                if(err) throw err;

                if(costo) {
                  costo.total = (costo.total - req.body.pagoEdit.montoE) + req.body.pagoEdit.newPago;                  
                  costo.save(function(err,info){})
                }

              });              
              var pagoDiff = req.body.pagoEdit.newPago - req.body.pagoEdit.montoE;
              service.pagoAcumulados = (pagoDiff > 0) ? (service.pagoAcumulados + pagoDiff) : service.pagoAcumulados - (req.body.pagoEdit.montoE - req.body.pagoEdit.newPago);
              var dataStamp = + new Date(req.body.pagoEdit.pagoDate);
              var elemPos = service.operacion.map(function(x){return x.id}).indexOf(req.body.pagoEdit.id);
              if(elemPos !== -1) {
                Pago.findById(service.operacion[elemPos]._id).exec(function(err,pago){                  
                  if(pago) {
                     pago.montoE = req.body.pagoEdit.newPago;
                     pago.save(function(){});                  
                  }

                })
                var diff = req.body.pagoEdit.newPago - req.body.pagoEdit.montoE;
                service.operacion[elemPos].saldo = (diff > 0) ? service.operacion[elemPos].saldo - diff : service.operacion[elemPos].saldo + (req.body.pagoEdit.montoE - req.body.pagoEdit.newPago) ;
                //service.operacion[elemPos].saldo -= req.body.pagoEdit.newPago;
                service.operacion[elemPos].montoE = req.body.pagoEdit.newPago;
                service.operacion[elemPos].pagoDate = req.body.pagoEdit.pagoDate;
                service.operacion[elemPos].observaciones = req.body.pagoEdit.observaciones;
                var newSaldo = {};
                newSaldo.val = service.operacion[elemPos].saldo; //holds reference to the modified saldo;
                var nextPos = elemPos + 1;
                var deductSaldo = newSaldo;
                var deductPago = 0;
                for(var i = nextPos; i < service.operacion.length; i++) {
                  if(service.operacion[i].type === 'factura'){               
                    service.operacion[i].saldo = newSaldo.val + service.operacion[i].montoE;
                    newSaldo.val += service.operacion[i].montoE;            
                  } else if(service.operacion[i].type === 'pago') {

                    service.operacion[i].saldo = newSaldo.val - service.operacion[i].montoE;
                    newSaldo.val -= service.operacion[i].montoE;
                  } else {

                  }
                }
                service.operacion.push({});
                service.operacion.pop();// just to be able to save
                service.save(function(err,info){
                  if(err) throw err;                
                  res.json(service);
                  console.log("service edit saved");
                    
                })
               
              }
                
            }
          }
        })
      }
      return;
    }



    var costosindirecto = req.costosindirecto;
   
    var reqData = { 
      title1: req.body.title1,
      title2: req.body.title2,
      title2Id: req.body.title2Id,
      numero: req.body.numero,
      servicios: req.body.servicios,
      serviceName: req.body.serviceName,
      centroId: req.body.centroId,
      montoE: req.body.montoE,
      facturaDate: req.body.facturaDate,
      month: req.body.month,
      year: req.body.year,
      observaciones: req.body.observaciones,
      enterprise: req.body.enterprise,
      type: req.body.type,
      isFactura: req.body.isFactura,
      total: req.body.montoE,
      saldo: req.body.montoE
    }


    if(req.body.isFactura ) {
        if(Factura) {         
            Factura.findOne({
                month: req.body.month.toString(),
                year: req.body.year.toString(),
                serviceName:req.body.serviceName,
                enterprise: req.body.enterprise,
                servicios: req.body.servicios
            },{total:1,facturaDate:1,saldo:1})
            .exec(function(err,data){         
                if(err) throw err;
                if(data) { 
                    data.total += req.body.montoE; // piece of factura totals individual sevice total; which sums up to be fcturado.
                    data.facturaDate = req.body.facturaDate;
                    data.saldo += req.body.montoE;
                    req.body.saldo = data.saldo;
                    req.body.facturaId = data._id;
                    updateServicio(req.body);
                    data.save(function(err,info){
                       saveCostIndirecto()
                    })
                } else {
                  
                  req.body.saldo = reqData.saldo;
                  createFactura(function(id){
                    req.body.facturaId = id;
                    updateServicio(req.body);
                  });
                }               
            })  
        } else {
          req.body.saldo = reqData.saldo;          
          createFactura(function(id){
            req.body.facturaId = id;
            updateServicio(req.body);
          });
        }
        
        

        function createFactura(cb) {
          var factura = new Factura(reqData);
          factura.save(function(err,info){ 
            console.log(err)            
            saveCostIndirecto();                          
          }) 
          cb(factura._id);
        } 


        function updateServicio(t) {
            Servicio.findById(t.servicios)
            .populate('user',"displayName")
            .exec(function(err,service){
                if(err) throw err;             
                var facturaOperacion = {
                  id: genId(),
                  type: "factura",
                  facturaId: req.body.facturaId,
                  saldo: t.saldo,
                  facturaDate: req.body.facturaDate,
                  montoE: req.body.montoE,
                  numero: req.body.numero,
                  facturado: req.body.total,
                  pagado: null,
                  month: req.body.month.toString(),
                  year: req.body.year.toString(),
                  created_by: service.user.displayName,
                  observaciones: t.observaciones,
                  serviceId: t.servicios,
                  date: + new Date()
                }
                if(!service.operacion) {
                  service.operacion = [];
                  service.operacion.push(facturaOperacion);                  
                } else if(service.operacion.length > 0) {
                  var lastOperacion = service.operacion[service.operacion.length - 1];
                  facturaOperacion.saldo = lastOperacion.saldo + t.montoE;                
                  service.operacion.push(facturaOperacion);
                }  else {
                  facturaOperacion.saldo = t.montoE; 
                  service.operacion.push(facturaOperacion);
                }
                service.save(function(err,info){
                  console.log("operations factura saved!");                
                });
            })
            

             function genId() {
              var text = "";
              var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567899966600555777222";

                for( var i=0; i < 25; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
             }
        }       
       
    } else {
      saveCostIndirecto();
    }


    function saveCostIndirecto() {
      

      costosindirecto = _.extend(costosindirecto, req.body);
     
      costosindirecto.save(function (err) {
          if (err) {
              return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
              });
          } else {
              res.jsonp(costosindirecto);
          }
      });
   }
};

/**
 * Delete an Costosindirecto
 */
exports.delete = function (req, res) {
    var costosindirecto = req.costosindirecto;

    costosindirecto.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(costosindirecto);
        }
    });
};

/**
 * List of Costosindirectos
 */

exports.list = function (req, res) {
    var enterprise = req.query.e || null;
    var centroId = req.query.centroId || null;
    var year = req.query.year || null;
    var month = req.query.month || null;
    var filter = {};
    var facturaList = [];
    if (enterprise !== null) {
      
        Costosindirecto.find({enterprise: enterprise})
            .sort('-created')
            .populate('user', 'displayName')
            .exec(function (err, costosindirecto) {
               
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(costosindirecto);
                }
            });
    } else if (year !== null || month !== null) {
        filter.type = "costosIndirectos";

        if (year !== null)
            filter.year = year;
        if (month !== null)
            filter.month = month;

        filter.deleted = false;
        
        var costroByDate = [];
        Pago.find(filter)
            .populate('servicios')
            .select({"servicios": 1, "montoE": 2, "montoC": 3})
            .sort('-created')
            .exec(function (err, pagos) {
                
                var costo = [];
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {                    
                    for (var i = pagos.length - 1; i >= 0; i--) {
                        var costroId = pagos[i].servicios.costosindirectos;
                        if (pagos[i].servicios.costcenters[0] == centroId) {                                                                

                            if (costroByDate[costroId])
                                costroByDate[costroId] += pagos[i]['montoE'] + pagos[i]['montoC'];
                            else
                                costroByDate[costroId] = pagos[i]['montoE'] + pagos[i]['montoC'];
                        }
                    }
                   
                    Costosindirecto.find({costcenters: centroId})
                        .sort('-created')
                        .exec(function (err, costoindirecto) {
                            console.log(costoindirecto)
                            var len = costoindirecto.length;
                            for (var i = 0; i < costoindirecto.length; i++) {
                                if (costroByDate[costoindirecto[i]._id]) {
                                    costoindirecto[i]['total'] = costroByDate[costoindirecto[i]._id];
                                }else{
                                    costoindirecto[i]['total'] = 0;
                                }

                                getFactura(costoindirecto[i],i,len)
                            }
                            //res.jsonp(costoindirecto);                            
                        });
                }


                function getFactura(centroInfo,centroIndex,centroLen) {
                  var facturaTotal = 0;
                  var resultObj = {
                    _id: centroInfo._id,
                    user: centroInfo.user,
                    enterprise: centroInfo.enterprise,
                    costcenters: centroInfo.costcenters,                        
                    created: centroInfo.created,
                    deleted: centroInfo.deleted,
                    cheques: centroInfo.cheques,
                    efectivo: centroInfo.efectivo,
                    total: centroInfo.total,
                    servicio: centroInfo.servicio,                         
                    name: centroInfo.name,
                    //facturado: facturaTotal
                  }

                   if(facturaList.length > 0){

                                                   
                    for(var j = 0; j < facturaList.length; j++) {
                      if(facturaList[j].title2 === centroInfo.name)
                        facturaTotal += facturaList[j].total;
                    }
                    

                    resultObj.facturado = facturaTotal;

                    costo.push(resultObj);
                    if(costo.length === centroLen) {
                      sendResult(function(){                  
                        res.jsonp(costo);                                
                      })
                    }                    

                  } else {             
                    
                    Factura.find({enterprise:centroInfo.enterprise,month: month, year: year},{total:1,title2:1},function(err,factura){
                      if(err){
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                      }                 
                      if(factura.length > 0) { 
                        facturaList = factura;                              
                        for(var j = 0; j < factura.length; j++) {
                          if(factura[j].title2 === centroInfo.name)
                            facturaTotal += factura[j].total;
                        }
                      }

                      resultObj.facturado = facturaTotal;

                      costo.push(resultObj);
                      if(costo.length === centroLen) {
                        sendResult(function(){   
                          res.jsonp(costo);                                
                        })
                      } 
                       
                    })
                  }

                 
                }

                function sendResult(cb) {
                  cb();
                }

            });
    }
    else if (centroId !== null) {

      Costosindirecto.find({costcenters: centroId})
          .sort('-created')
          .exec(function (err, costoindirecto) {
              
              if (err) {
                  return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                  });
              } else {
                  res.jsonp(costoindirecto);
              }
          });
    }
    else {
        Costosindirecto.find()
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('servicio', 'name descripcion')
            .exec(function (err, costosindirecto) {
                
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(costosindirecto);
                }
            });
    }

};

/**
 * Costosindirecto middleware
 */

exports.costosindirectoByID = function (req, res, next, id) {
    Costosindirecto.findById(id)
        .populate('user', 'displayName')
        .populate('enterprise', 'name')
        // .populate('servicio', 'name descripcion total efectivo cheques credito debito dolares')
        .exec(function (err, costosindirecto) {
           console.log(id);
            if (err) return next(err);
            if (!costosindirecto) return next(new Error('Failed to load sucursal ' + id));
            req.costosindirecto = costosindirecto;
            next();
        });
};
exports.getCostroByDate