'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Servicio = mongoose.model('Servicio'),
    Pago = mongoose.model('Pago'),
    Costcenter = mongoose.model('Costcenter'),
    Factura = mongoose.model('Facturado'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Servicio
 */
exports.create = function (req, res) {
    var servicio = new Servicio(req.body);
    servicio.user = req.user;

    servicio.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicio);
        }
    });
};

/**
 * Show the current Servicio
 */
exports.read = function (req, res) {
    // convert mongoose document to JSON
    var servicio = req.servicio ? req.servicio.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    servicio.isCurrentUserOwner = req.user && servicio.user && servicio.user._id.toString() === req.user._id.toString();

    res.jsonp(servicio);
};

/**
 * Update a Servicio
 */
exports.update = function (req, res) {
    var servicio = req.servicio;
    Servicio.findById(req.body._id)
    .exec(function(err,service){    
      if (err) {
          return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
          });
      } else {        
        // var detailList = service.operacion;       
        // if(detailList.length > 0) {         
        //   for(var i = detailList.length - 1; i >= 0; i--) {
        //     if(detailList[i].type === "factura") {             
        //       var id = detailList[i].facturaId.toString();            
        //       Factura.findById(id)
        //       .exec(function(err,factura){
        //         if(err) throw err;
        //         if(factura) {
        //           factura.total = 0;
        //           factura.save(function(err,info){
        //             if(err) throw err;
        //             console.log("factura updates after service was deleted!");
        //           })
        //         }
        //       });
        //       break;
        //     }
        //   }
        // }

        servicio = _.extend(servicio, req.body);
        before_servicio = servicio;
        
        servicio.save(function (err) {
          if (err) {
              return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
              });
          } else {
              res.jsonp(before_servicio);
          }

        });
      
      }

    });

   
};

/**
 * Delete an Servicio
 */
exports.delete = function (req, res) {
    var servicio = req.servicio;

    servicio.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(servicio);
        }
    });
};

/**
 * List of Servicios
 */
exports.list = function (req, res) {
    var year = req.query.year || null;
    var month = req.query.month || null;
    var enterprise = req.query.e || null;
    var filter = {};
    if (year !== null || month !== null) {
        filter.type = "costosIndirectos";
        if (year !== null)
            filter.year = year;
        if (month !== null)
            filter.month = month;

        filter.deleted = false;
        
        Pago.find(filter)
            .sort('-created')
            .exec(function (err, pagos) {
                
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    var serviciosAmount = [];
                    for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                        var serviciosID = pagos[i].servicios;
                        if (serviciosAmount[serviciosID])
                            serviciosAmount[serviciosID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        else
                            serviciosAmount[serviciosID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                    }

                    var serviciosID = pagos.map(function (doc) {
                        return doc.servicios;
                    });  // get valid servicios from pagos              

                    var services = [];
                    Servicio.find() /*find({_id: {$in: serviciosID}})*/
                        .sort('-created')
                        .populate('user', 'displayName')
                        .exec(function (err, servicios) {
                            var servicioLen = servicios.length - 1;
                            
                            // console.log(costos);
                            for (var i = 0; i < servicios.length; i++) {
                              var serviciosId = servicios[i]['_id'];
                              servicios[i]['pagoAcumulados'] = serviciosAmount[serviciosId] ? serviciosAmount[serviciosId]: 0;                               
                            }

                            getFactura(servicios,servicioLen) //              
                            //console.log(servicios)
                            //res.jsonp(servicios);
                        });

                        function getFactura(serviceInfo,serviceLen) {                            
                            
                          Factura.find({month: month,year: year},{total:1,servicios:1},function(err,factura){
                              var bill;
                              var elemPos;
                                                             
                              for(var j = 0; j < serviceInfo.length; j++) {

                                elemPos = factura.map(function(x){
                                    if(x.servicios)
                                      return x.servicios
                                }).indexOf(serviceInfo[j]._id.toString())
                               
                                
                                if(elemPos !== -1) {
                                  bill = factura[elemPos].total 
                                } else {
                                  bill = 0;
                                }

                                var resultObj = {
                                  _id: serviceInfo[j]._id,
                                  user: serviceInfo[j].user,
                                  costosindirectos: serviceInfo[j].costosindirectos,
                                  enterprise: serviceInfo[j].enterprise,                                
                                  created: serviceInfo[j].created,
                                  deleted: serviceInfo[j].deleted,
                                  costcenters: serviceInfo[j].costcenters,
                                  pagoAcumulados: serviceInfo[j].pagoAcumulados,
                                  descripcion: serviceInfo[j].descripcion,
                                  name: serviceInfo[j].name,
                                  facturado: bill
                                }

                                services.push(resultObj);

                              }                      
                        
                              sendResult(function(){                              
                                res.jsonp(services);                                
                              })                              
                              
                          })
                        }

                        function sendResult(cb) {
                          cb();
                        }
                  }
            });
    } else if (enterprise !== null) {        
        
        var services = [];
        Servicio.find({enterprise: enterprise}).sort('-created').populate('user', 'displayName').exec(function (err, servicios) {
            console.log(servicios)
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                //res.jsonp(servicios);
                getFactura(servicios); //
            }


            function getFactura(serviceInfo) {         //                   
                           
              Factura.find({},{total:1,serviceName:1},function(err,factura){
                var bill;
                var elemPos;
                                               
                for(var j = 0; j < serviceInfo.length; j++) {
                  
                  elemPos = factura.map(function(x){return x.serviceName}).indexOf(serviceInfo[j].name)

                  if(elemPos !== -1) {
                    bill = factura[elemPos].total 
                  } else {
                    bill = 0;
                  }

                  var resultObj = {
                    _id: serviceInfo[j]._id,
                    user: serviceInfo[j].user,
                    costosindirectos: serviceInfo[j].costosindirectos,
                    enterprise: serviceInfo[j].enterprise,                                
                    created: serviceInfo[j].created,
                    deleted: serviceInfo[j].deleted,
                    costcenters: serviceInfo[j].costcenters,
                    pagoAcumulados: serviceInfo[j].pagoAcumulados,
                    descripcion: serviceInfo[j].descripcion,
                    name: serviceInfo[j].name,
                    facturado: bill
                  }

                  services.push(resultObj);

                }                        
          
                sendResult(function(){                                
                  //console.log(services);
                  res.jsonp(services);                                
                });

              })
            } 

            function sendResult(cb) {
              cb();
            }                            
        });

    } else {
        Servicio.find().sort('-created').populate('user', 'displayName').exec(function (err, servicios) {
           
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(servicios);
            }
        });

    }
};

/**
 * Servicio middleware
 */
exports.servicioByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Servicio is invalid'
        });
    }

    Servicio.findById(id).populate('user', 'displayName').exec(function (err, servicio) {
        if (err) {
            return next(err);
        } else if (!servicio) {
            return res.status(404).send({
                message: 'No Servicio with that identifier has been found'
            });
        }
        req.servicio = servicio;
        next();
    });
};

exports.getCentroByServicios = function (req, res) {
   
    var enterprise = req.query.e || null;
    console.log("in centro function " + enterprise);
    if (enterprise !== null) {
        Servicio.find({enterprise: enterprise}).sort('-created')
            .exec(function (err, servicios) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var centroDeCostoTotal = [];
                    for (var i = 0; i < servicios.length; i++) {
                        var centroDeCostoId = servicios[i].costcenters[0];
                        if (centroDeCostoTotal[centroDeCostoId])
                            centroDeCostoTotal[centroDeCostoId] += servicios[i]['pagoAcumulados'];
                        else
                            centroDeCostoTotal[centroDeCostoId] = servicios[i]['pagoAcumulados'];
                    }
                    console.log(centroDeCostoTotal);
                    Costcenter.find({enterprise: enterprise, deleted: false})
                        .exec(function (err, centro) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                var centroResults = [];
                                for (var i = 0; i < centro.length; i++) {
                                    var total = 0
                                    var centroId = centro[i]['_id'];
                                    if (centroDeCostoTotal[centroId])
                                        total = centroDeCostoTotal[centroId];
                                    centroResults.push({
                                        id: centro[i].id,
                                        name: centro[i].name,
                                        total: total

                                    })
                                }

                                res.jsonp(centroResults);
                            }
                        });

                }
            });
    }
};