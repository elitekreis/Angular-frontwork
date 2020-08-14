'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Pago = mongoose.model('Pago'),
    Costosindirecto = mongoose.model('Costosindirecto'),
    Servicio = mongoose.model('Servicio'),
    Factura = mongoose.model('Facturado'),
    Costcenter = mongoose.model('Costcenter'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Pago
 */
exports.create = function (req, res) {
    var pago = new Pago(req.body);
    pago.user = req.user;

    console.log(req.user);
    pago.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(pago);
        }
    });
};

/**
 * Show the current Pago
 */
exports.read = function (req, res) {
   
    // convert mongoose document to JSON
    var pago = req.pago ? req.pago.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    pago.isCurrentUserOwner = req.user && pago.user && pago.user._id.toString() === req.user._id.toString();

    console.log(pago);

    res.jsonp(pago);
};

/**
 * Update a Pago
 */
exports.update = function (req, res) {
    var pago = req.pago;
   

    pago = _.extend(pago, req.body);

    pago.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(pago);
        }
    });

   
};

/**
 * Delete an Pago
 */
exports.delete = function (req, res) {


  var pago = req.pago;

  pago.remove(function (err) {
      if (err) {
          return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
          });
      } else {
          res.jsonp(pago);
      }
  });
};

/**
 * List of Pagos
 */
exports.list = function (req, res) {

    
    
    if(req.query.type === "serviceDetails"){
        Servicio.findById(req.query.servicosId)      
        .exec(function(err,service){
            
            if(err) throw err;
            if(service) {
               res.json(service.operacion);
             } else {
              res.end("not found")
             }
           
        });
        return;
    }

    /*** 
      for standard this below show be on a delete route for the concept of restful apis be achieve. 
      takes care of delete pago or factura on service datails list.
    ***/
    if(req.query.type === "deleteService") {
      //console.log(req.query)
       Servicio.findById(req.query.serviceId)     
        .exec(function(err,service){
          if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });

          } else {            
            var serviceDetails = service.operacion;
            var elemPos = serviceDetails.map(function(x){return x.id}).indexOf(req.query.id);
            var elemMonto = serviceDetails[elemPos].montoE;

            if(service.operacion[elemPos].type === 'factura') {
              var actionMonth = elemMonto.month || req.query.month;
              var actionYear = elemMonto.year || req.query.year;
              Factura.findOne({servicios: req.query.serviceId,month: actionMonth,year: actionYear}).exec(function(err,factura){
                if(err) throw err; 
                if(factura){           
                  factura.total -= elemMonto;
                }                
                factura.save(function(){});
              })
              //update service details list
              var nextPos = elemPos + 1;              
              for(var i = nextPos; i < serviceDetails.length; i++) {
                serviceDetails[i].saldo -= elemMonto;
              }


            } else if(serviceDetails[elemPos].type === 'pago') {           
               
              Pago.findById(serviceDetails[elemPos]._id).exec(function(err,pago){                  
                if(pago) {
                  pago.montoE = 0;
                  pago.deleted = true;
                  pago.save(function(){});                  
                }
              })
             
              //update service details list
              var nextPos = elemPos + 1;              
              for(var i = nextPos; i < serviceDetails.length; i++) {
                serviceDetails[i].saldo += elemMonto;
              }
            }

            serviceDetails.splice(elemPos,1);

            service.save(function(err,info){
              console.log(err)
            });
            res.json(serviceDetails);
          }

            
        });
      return;
    }



    var year = req.query.year || null;
    var month = req.query.month || null;
    var servicosId = req.query.servicosId || null;
    var impuestosId = req.query.impuestosId || null;
    var empleadoId = req.query.empleadoId || null;
    var enterprise = req.query.e || null;
    var facturaList = [];
    var filter = {};
    var data = [];
    if ((year !== null || month !== null) && servicosId == null && impuestosId == null && empleadoId == null) {
        filter.type = "costosIndirectos";
        if (year !== null)
            filter.year = year;
        if (month !== null)
            filter.month = month;
        if(req.query.month === "all")
            delete filter.month;
        
        filter.deleted = false;

       console.log(filter);
        
        Pago.find(filter)
            .populate('servicios', "costcenters")
            .select({"servicios": 1, "montoE": 2, "montoC": 3,})
            .sort('-created')
            .exec(function (err, pagos) {
              console.log(pagos);
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });

                } else if(req.query.isResumen) {
                   var controAmount = [];
                   var costo = [];
                   var elemPos;
                   var controIDs;

                   var resultObj = {}
                   resultObj.total = 0;
                 

                   filter.centroId = req.query.centroId;
                  
                   console.log(filter);
                  /*for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                    controIDs = pagos[i].servicios.costcenters;
                    elemPos = controIDs.map(function(x){return x}).indexOf(req.query.centroId);
                    if(elemPos !== -1) {
                      resultObj.id = req.query.centroId;
                      resultObj.total += pagos[i]['montoE'] + pagos[i]['montoC'];

                     
                    }
                    
                  }*/
                  Factura.find(filter,function(err,facturas){
                    if(err) throw err;
                    for(var i = 0; i < facturas.length; i++){
                      if(facturas[i])
                        resultObj.total +=  facturas[i].total;
                    }

                    console.log(resultObj);                   
                      
                  
                    costo.push(resultObj);
                    res.json(costo);
                  });

                 

                  /*console.log(month + " / " + year)
                  Factura.find({enterprise:enterprise,month: month,year: year,title1: centro.name},
                    function(err,facturas){
                    if(err) throw err;
                    for(var i = 0; i < facturas.length; i++) {
                      resultObj.facturado += facturas[i].total;
                    }
                    costo.push(resultObj);
                    res.json(costo);
                  });*/                          
              

                } else {
                    var controAmount = [];
                    var costo = [];
                    for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                        var controID = pagos[i].servicios.costcenters[0];
                        if (controAmount[controID])
                            controAmount[controID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        else
                            controAmount[controID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                    }

                    console.log(controAmount);
                    var controlids = Object.keys(controAmount);
                    console.log(controlids);
                     // get valid servicios from pagos
                    // code for get valid costos by servicios
                    Costcenter.find({enterprise: enterprise, deleted: false})
                    .sort('-created')
                    .exec(function (err, centro) {
                       var resultObj = [];                           
                       var centroLen = centro.length;
                        for (var i = 0; i < centro.length; i++) {
                            var total = 0;
                            if(controlids.indexOf(''+centro[i]._id) == -1)
                            {
                              continue;
                            }
                            
                            
                            //get facturado for service
                             resultObj.push({
                                id: centro[i]._id,
                                name: centro[i].name,
                                total: controAmount[centro[i]._id]
                              })                            
                        }

                        console.log(resultObj);
                        for(var index = 0;index<resultObj.length;index++)
                        {
                            getFactura(resultObj[index],index,resultObj.length);    
                        }
                          
                    });
                }

                function getFactura(resultObj,index,centroLen) {
                
                  var facturaTotal = 0;                 

                  if  (facturaList.length > 0) {
                                                   
                    for(var j = 0; j < facturaList.length; j++) {
                      if(facturaList[j].title1 === resultObj.name)
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
                    //Todo add centro de costo id to factura wehen created.This can be used to search better by Id in create factura controller 
                    if(req.query.centroName) {
                      var criteria = {enterprise:enterprise,month: month,year: year,title1: req.query.centroName}
                    } else {
                      var criteria = (filter.month) ? {enterprise:enterprise,month: month,year: year} : {enterprise:enterprise,year: year};
                    }

                    Factura.find(criteria,{total:1,title1:1},function(err,factura){
                      if(err){
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        })
                      }                 
                      if(factura.length > 0) {  
                        facturaList = factura;                              
                        for(var j = 0; j < factura.length; j++) {
                          if(factura[j].title1 === resultObj.name)
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

    } else if (servicosId !== null) {

       
        
        Pago.find({servicios: servicosId, deleted: false}).sort('-created')
            .populate('user', 'displayName')
            .populate('cajaD')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pagos);
                }
            });

    } else if (impuestosId !== null) {
        if ((year !== null || month !== null)) {
            var startDate = moment().startOf('month');
            var endDate = startDate.clone().endOf('month');

            if (month && year) {
                startDate = moment().year(year).month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (month) {
                startDate = moment().month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (year) {
                startDate = moment().year(year).startOf("year");
                endDate = startDate.clone().endOf('year');
            }

            Pago.find({
                impuestos: impuestosId,
                deleted: false,
                pagoDate: {
                    $gt: startDate,
                    $lt: endDate
                }
            }).sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('impuestos')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pagos);
                    }
                });
        } else {
            Pago.find({
                impuestos: impuestosId,
                deleted: false
                }).sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('impuestos')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(pagos);
                    }
                });
        }
    }  else if (empleadoId !== null) {
        if ((year !== null || month !== null)) {
            var startDate = moment().startOf('month');
            var endDate = startDate.clone().endOf('month');

            if (month && year) {
                startDate = moment().year(year).month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (month) {
                startDate = moment().month(month).startOf("month");
                endDate = startDate.clone().endOf('month');
            } else if (year) {
                startDate = moment().year(year).startOf("year");
                endDate = startDate.clone().endOf('year');
            }

            Pago.find({
                personal: empleadoId,
                deleted: false,
                pagoDate: {
                    $gt: startDate,
                    $lt: endDate
                }})
                .sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('personal')
                .populate('personal.userLogin')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log("this is");
                        console.log(pagos);
                        res.jsonp(pagos);
                    }
                });
        } else {
            Pago.find({personal: empleadoId, deleted: false})
                .sort('-created')
                .populate('user', 'displayName')
                .populate('cajaD')
                .populate('personal')
                .populate('personal.userLogin','displayName')
                .exec(function (err, pagos) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log("this is");
                        console.log(pagos);
                        res.jsonp(pagos);
                    }
                });
        }

    } else if (enterprise !== null) {
       
        Pago.find({enterprise: enterprise, deleted: false}).sort('-created')
            .populate('user', 'displayName')
            .populate('cajaD')
            .populate('servicios')
            .populate('impuestos')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pagos);
                }
            });

    } else {
        filter.type = "costosIndirectos";
        Pago.find(filter)
            .populate('servicios', "costcenters")
            .select({"servicios": 1, "montoE": 2, "montoC": 3})
            .sort('-created')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)

                    });
                } else {
                    var controAmount = [];
                    for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                        var controID = pagos[i].servicios.costcenters[0];
                        if (controAmount[controID])
                            controAmount[controID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        else
                            controAmount[controID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                    }
                    var controIDs = pagos.map(function (doc) {
                        return doc.servicios.costcenters[0];
                    });  // get valid servicios from pagos

                    // code for get valid costos by servicios
                    Costcenter.find({_id: {$in: controIDs}})
                        .sort('-created')
                        .exec(function (err, centro) {
                            for (var i = 0; i < centro.length; i++) {
                                var total = controAmount[centro[i]._id];

                                data.push({
                                    id: centro[i]._id,
                                    name: centro[i].name,
                                    total: total

                                });
                            }
                            res.jsonp(data);
                        });
                }
            });
    }

};

exports.loadMoreByCaja = function (req, res) {
    var enterprise = req.query.e || null;    
    var caja = req.query.caja || null;
    var last = req.query.p || null;
    var limit = parseInt(req.query.limit) || 0;
    var pagina = parseInt(req.query.pagina) || 0;
   
    if (last) {        
        Pago.find({enterprise: enterprise, deleted: false, created: {$lt: last}, cajaD: caja })
            .skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('cajaD')
            .populate('servicios')
            .populate('impuestos')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pagos);
                }
            });    
    } else {       
        console.log('pagos cajad : ' + caja);
        
        Pago.find({enterprise: enterprise, deleted: false, cajaD: caja })
            .skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('cajaD')
            .populate('servicios')
            .populate('impuestos')
            .exec(function (err, pagos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pagos);
                }
            });    
    }

};

exports.loadMoreByCajaDate = function (req, res) {
  var enterprise  = req.query.e || null;    
  var caja        = req.query.caja || null;
  var startdate	= req.query.start || null;
  var enddate 	= req.query.end || null;   
  console.log("eeeeeeeeeeeeeeeee");
  console.log(req.query);
  Pago.find({enterprise: enterprise, deleted: false, cajaD: caja, created: { $gte: new Date(startdate), $lte: new Date(enddate) } })    
  .sort('-created')
  .populate('user', 'displayName')
  .populate('cajaD')
  .populate('servicios')
  .populate('impuestos')
  .exec(function (err, pagos) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(pagos);
    }
  });        
};

/**
 * Pago middleware
 */
exports.pagoByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Pago is invalid'
        });
    }

    Pago.findById(id)
        .populate('user', 'displayName')
        .populate('servicios')
        .populate('impuestos')
        .exec(function (err, pago) {
            if (err) {
                return next(err);
            } else if (!pago) {
                return res.status(404).send({
                    message: 'No Pago with that identifier has been found'
                });
            }
            req.pago = pago;
            next();
        });
};
exports.getCostoLastMonthTotal = function (req, res) {
    var filter = {};
    var data = {};
    var serviciosAmount = [];
    filter.year = new Date().getFullYear();
    filter.month = new Date().getMonth() - 1;
    filter.type = "costosIndirectos";
    var controId = req.query.controId || null;
    Pago.find(filter)
        .populate('servicios')
        .sort('-created')
        .exec(function (err, pagos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                    if (pagos[i].servicios && pagos[i].servicios.costcenters[0] == controId) {
                        var serviciosID = pagos[i].servicios._id;
                        if (serviciosAmount[serviciosID]) {
                            serviciosAmount[serviciosID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                        }
                        else {
                            serviciosAmount[serviciosID] = pagos[i]['montoE'] + pagos[i]['montoC'];

                        }
                    }
                }
                // code for get valid costos by servicios
                Costosindirecto.find()
                    .sort('-created')
                    .populate('user', 'displayName')
                    .exec(function (err, costos) {

                        for (var i = 0; i < costos.length; i++) {
                            var serviciosArray = costos[i]['servicio'];
                            var total = 0;
                            for (var servicioID in serviciosAmount) {
                                if (serviciosArray.indexOf(servicioID) !== -1) { // if servicos id exists in costos
                                    total += serviciosAmount[servicioID];
                                }

                            }
                            var id = costos[i]['_id'];
                            data[id] = total;

                        }
                        res.jsonp(data);
                    });
            }

        });
};
exports.getServiciosLastMonthTotal = function (req, res) {
    var filter = {};
    var data = {};
    var serviciosAmount = [];
    filter.year = new Date().getFullYear();
    filter.month = new Date().getMonth() - 1;
    filter.type = "costosIndirectos";
    Pago.find(filter)
        .sort('-created')
        .exec(function (err, pagos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                for (var i = 0; i < pagos.length; i++) { // code for get servicios total amount
                    var serviciosID = pagos[i].servicios;
                    if (serviciosAmount[serviciosID])
                        serviciosAmount[serviciosID] += pagos[i]['montoE'] + pagos[i]['montoC'];
                    else
                        serviciosAmount[serviciosID] = pagos[i]['montoE'] + pagos[i]['montoC'];
                }
                // code for get valid costos by servicios
                Servicio.find()
                    .exec(function (err, servicios) {
                        for (var i = 0; i < servicios.length; i++) {
                            var total = 0;

                            var serviciosID = servicios[i]['_id'];
                            if (serviciosAmount[serviciosID]) { // if servicos id exists in costos
                                total = serviciosAmount[serviciosID];
                            }
                            data[serviciosID] = total;

                        }
                        res.jsonp(data);
                    });
            }

        });
};