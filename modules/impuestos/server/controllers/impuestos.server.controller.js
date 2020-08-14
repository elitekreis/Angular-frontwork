'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Impuesto = mongoose.model('Impuesto'),
    Ventas = mongoose.model('Venta'),
    Pagos = mongoose.model('Pago'),
    Compras = mongoose.model('Compra'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var Venta = mongoose.model('Venta');
var Compra = mongoose.model('Compra');


/**
 * Create a impuesto
 */
exports.create = function(req, res) {
    var startDate = moment().startOf('month');
    var endDate = startDate.clone().endOf('month');
    var impuesto = new Impuesto(req.body);
    impuesto.user = req.user;

    if (req.body.type) {
        // Automatico Impuesto

        Ventas.find({
            created: {
                $gt: startDate,
                $lt: endDate
            },
            estado: 'Finalizada',
            deleted: false
        }).exec(function(err, ventas) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var total = 0;
                for (var i = 0; i < ventas.length; i++) {
                    if (req.body.automaticoType == 'brutas' && ventas[i].impuesto) {
                        total += ventas[i].total;
                    } else if (req.body.automaticoType == 'netas') {
                        total += ventas[i].neto;
                    }
                }

                impuesto.total = req.body.coefficient * total;
                impuesto.type = 'Automatico';

                impuesto.save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(impuesto);
                    }
                });
            }
        });
    } else {
        // Manual Impuesto
        impuesto.type = 'Manual';

        impuesto.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(impuesto);
            }
        });
    }
};

/**
 * Show the current impuesto
 */
exports.read = function(req, res) {
    res.jsonp(req.impuesto);
};

/**
 * Update a impuesto
 */
exports.update = function(req, res) {
    var impuesto = req.impuesto;
    impuesto = _.extend(impuesto, req.body);

    impuesto.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(impuesto);
        }
    });
};

/**
 * Update the total value in an impuesto
 */
exports.updateTotal = function(req, res) {
    console.log("+++++++++++++++++ impuestos")
    var impuesto = req.body;
    Impuesto.findOneAndUpdate({ centroDeCosto: impuesto.centroDeCosto, name: impuesto.name }, { $inc: { total: impuesto.total } })
        .exec(function(err, impuestos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(impuestos);
            }
        });
};

/**
 * Update all automatico impuestos on load of the impuestos list
 */
exports.updateAutomaticoImpuestos = function(req, res) {
    var month = req.body.month;
    var year = req.body.year;
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

    Ventas.find({
            myDate: {
                $gt: startDate,
                $lt: endDate
            },
            estado: 'Finalizada',
            deleted: false
        })
        .populate('puesto', 'centroDeCosto')
        .exec(function(err, ventas) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Compras.find({
                        created: {
                            $gt: startDate,
                            $lt: endDate
                        },
                        estado: 'Finalizada',
                        deleted: false
                    })
                    .populate('puesto', 'centroDeCosto')
                    .exec(function(err, compras) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            Impuesto.find().exec(function(err, impuestos) {
                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    var total;
                                    impuestos.forEach(function(impuesto) {
                                        total = 0;
                                        if (impuesto.type == 'Manual') {
                                            Pagos
                                                .find({
                                                    pagoDate: {
                                                        $gt: startDate,
                                                        $lt: endDate
                                                    },
                                                    deleted: false,
                                                    impuestos: impuesto._id
                                                })
                                                .exec(function(err, pagos) {
                                                    total = 0;
                                                    if (err) {
                                                        return res.status(400).send({
                                                            message: errorHandler.getErrorMessage(err)
                                                        });
                                                    } else {
                                                        pagos.forEach(function(pago) {
                                                            total += (pago.montoE + pago.montoC);
                                                        });

                                                        impuesto.total = total;
                                                        impuesto.month = month;
                                                        impuesto.year = year;
                                                        impuesto.save(function(err) {
                                                            if (err) {
                                                                return res.status(400).send({
                                                                    message: errorHandler.getErrorMessage(err)
                                                                });
                                                            }
                                                        });
                                                    }
                                                })
                                        } else {
                                            if (impuesto.name === 'IVA Compras') {
                                                for (var i = 0; i < compras.length; i++) {
                                                    if (compras[i].puesto && impuesto.centroDeCosto == compras[i].puesto.centroDeCosto) {
                                                        compras[i].impuestoId = impuesto._id;
                                                        compras[i].save(function(err) {
                                                            if (err) {
                                                                return res.status(400).send({
                                                                    message: errorHandler.getErrorMessage(err)
                                                                });
                                                            }
                                                        });

                                                        total += compras[i].totalTax;
                                                    }
                                                }
                                            } else {
                                                for (var i = 0; i < ventas.length; i++) {
                                                    if (ventas[i].puesto && impuesto.centroDeCosto == ventas[i].puesto.centroDeCosto) {
                                                        if (impuesto.type === 'Automatico') {
                                                            if (impuesto.automaticoType == 'netas') {
                                                                total += ventas[i].neto;
                                                            } else if (impuesto.automaticoType == 'brutas' && ventas[i].impuesto) {
                                                                total += (ventas[i].total + ventas[i].totalTax);
                                                            }
                                                        } else if (impuesto.name === 'IVA Ventas' && ventas[i].impuesto) {
                                                            ventas[i].impuestoId = impuesto._id;
                                                            ventas[i].save(function(err) {
                                                                if (err) {
                                                                    return res.status(400).send({
                                                                        message: errorHandler.getErrorMessage(err)
                                                                    });
                                                                }
                                                            });
                                                            total += ventas[i].totalTax;
                                                        }
                                                    }
                                                }
                                            }

                                            if (impuesto.type === 'Automatico')
                                                impuesto.total = impuesto.coefficient * total;
                                            else
                                                impuesto.total = total;

                                            impuesto.month = month;
                                            impuesto.year = year;

                                            if (impuesto.type == "Default") {
                                                var ajustes = ajustarsArray(impuesto, year, month);
                                                for (var i = 0; i < ajustes.length; i++) {
                                                    impuesto.total += ajustes[i].price;
                                                }
                                            }

                                            impuesto.save(function(err) {
                                                if (err) {
                                                    return res.status(400).send({
                                                        message: errorHandler.getErrorMessage(err)
                                                    });
                                                }
                                            });
                                        }
                                    });
                                    console.log("impu = ", impuestos);
                                    res.jsonp(impuestos);
                                }
                            });
                        }
                    })
            }
        });
};

/**
 * Adds an ajustar in the ajustars array
 */
exports.addAjustar = function(req, res) {
    var impuestoId = req.body.impuestoId;
    var month = req.body.month.toString();
    var year = req.body.year.toString();
    var price = req.body.price;
    var observacion = req.body.observacion;

    if (year == "") {
        if (month == "") {
            month = (new Date()).getMonth();
        }

        year = (new Date()).getFullYear();
    }

    Impuesto
        .findById(impuestoId)
        .exec(function(err, impuesto) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                })
            } else {
                var newImpuesto;

                if (month == "") {
                    var endMonth = year == (new Date()).getFullYear() ? (new Date()).getMonth() + 1 : 12;
                    for (var monthCt = 0; monthCt < endMonth; monthCt++) {
                        newImpuesto = addAjustes(impuesto, year, monthCt.toString(), observacion, price);
                        newImpuesto.save(function(result, err) {

                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            res.jsonp({
                                price: price,
                                month: month,
                                year: year,
                                observacion: observacion
                            });
                        });
                    }


                } else {
                    newImpuesto = addAjustes(impuesto, year, month, observacion, price);
                    newImpuesto.save(function(err) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        }

                        res.jsonp(newImpuesto);
                    });
                }
            }
        });
};

function addAjustes(impuesto, year, month, observacion, price) {
    // Checks if we have the chosen year in the object if not we create and entry with the year
    if (impuesto.ajustars !== undefined && impuesto.ajustars.hasOwnProperty(year)) {
        // Checks if we have the chosen month in the object if not we create and entry with the month
        if (impuesto.ajustars[year].hasOwnProperty(month)) {
            impuesto.ajustars[year][month].push({
                created: new Date(),
                price: price,
                observacion: observacion
            });
        } else {
            impuesto.ajustars[year][month] = [{
                created: new Date(),
                price: price,
                observacion: observacion
            }];
        }
    } else {
        if (impuesto.ajustars == undefined)
            impuesto.ajustars = {};

        impuesto.ajustars[year] = {};
        impuesto.ajustars[year][month] = [{
            created: new Date(),
            price: price,
            observacion: observacion
        }];
    }
    impuesto.total = impuesto.total + price;

    impuesto.markModified('ajustars');
    return impuesto;
}

/**
 * It lists all ajustars for given date
 */
exports.listAjustar = function(req, res) {
    console.log("^^^^^^^^", req.query);
    var impuesto = req.query.impuestoId || null;
    var last = req.query.last || null;
    var limit = req.query.limit || null;
    var year = req.query.year;
    var month = req.query.month;

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

    if (moment(last) > endDate) {
        last = endDate.clone();
    }


    if(req.query.IVA) {
      
       if (last) {
          Impuesto.find({$or: [{ _id: req.query.ivaVentas, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } },
          { _id: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } }]})
              .limit(limit)
              .sort('-created')
              .populate('proveedor', 'name')
              .exec(function(imperr, impuestos) {
                  if (imperr) return res.status(400).send({ message: errorHandler.getErrorMessage(imperr) });
                  Venta.find({$or: [{impuestoId: req.query.ivaVentas, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } },
                   {impuestoId: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } }]})
                      .limit(limit)
                      .sort('-created')
                      .populate('cliente', 'name')
                      .exec(function(err, ventas) {
                          Compra.find({$or: [{impuestoId: req.query.ivaVentas, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } },
                          {impuestoId: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } }]})
                              .limit(limit)
                              .sort('-created')
                              .populate('proveedor', 'name')
                              .exec(function(err, compras) {
                                  if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                  res.jsonp(compras.concat(ventas.concat(impuestos)));
                              })
                          if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                      })

                  // res.jsonp(impuestos);
              })
      
      } else {
        Impuesto.find({month:month,year: year,type: "Default"},function(err,impuestos){
          if(err) throw err;

          var taxes = [req.query.ivaCompras,req.query.ivaVentas];
          //console.log(impuestos);
          Venta.find({impuestoId: req.query.ivaVentas, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } })
            .limit(limit)
            .sort('-created')
            .populate('cliente', 'name')
            .exec(function(err, ventas) {
                Compra.find({impuestoId: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } })
                  .limit(limit)
                  .sort('-created')
                  .populate('proveedor', 'name')
                  .exec(function(err, compras) {
                      if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                      
                      Pagos.find({type: 'impuesto',month: month,year: year,deleted: false})
                      .populate('cajaD','name')
                      .exec(function(err,pago){
                        if(err) throw err;
                        var addAjustarArr = [];
                        
                        var elemPos;                       
                        var ajList = [];
                        var count;
                        var toObj;
                        
                        
                        for(var k = 0; k < taxes.length; k++){
                          elemPos = impuestos.map(function(x){return x._id.toString()}).indexOf(taxes[k]);
                          if(impuestos[elemPos]){
                            if(impuestos[elemPos].ajustars) {                               
                              if(impuestos[elemPos].ajustars[year]) {                        
                                ajList = impuestos[elemPos].ajustars[year][month] || [];
                              }

                              if(ajList.length > 0){
                                  for(var j = 0; j < ajList.length; j++){
                                    toObj = ajList[j];
                                    toObj.adjType = impuestos[elemPos].name;
                                    addAjustarArr.push(toObj);
                                  }
                              }
                              
                            }
                          }
                        } 
                       
                        res.jsonp(pago.concat(compras.concat(ventas.concat(addAjustarArr))));
                      })                   
                      
                     //res.jsonp(newArr);
                  })

                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            })
        })

        /*Impuesto.find({$or: [{ _id: req.query.ivaVentas},{_id: req.query.ivaCompras}]})
          .limit(limit)
          .sort('-created')
          .populate('proveedor', 'name')
          .exec(function(err, impuestos) {

             if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
             Venta.find({$or: [{impuestoId: req.query.ivaVentas, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } },
                   {impuestoId: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } }]})
                  .limit(limit)
                  .sort('-created')
                  .populate('cliente', 'name')
                  .exec(function(err, ventas) {
                      Compra.find({$or: [{impuestoId: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } },
                          {impuestoId: req.query.ivaCompras, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } }]})
                          .limit(limit)
                          .sort('-created')
                          .populate('proveedor', 'name')
                          .exec(function(err, compras) {
                              if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                              res.jsonp(compras.concat(ajustarsArray(impuestos[0], year, month).concat(ventas)));
                          })

                      if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                  })
          })*/
      }

    } else {

      if (last) {
          Impuesto.find({ _id: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } })
              .limit(limit)
              .sort('-created')
              .populate('proveedor', 'name')
              .exec(function(imperr, impuestos) {
                  if (imperr) return res.status(400).send({ message: errorHandler.getErrorMessage(imperr) });
                  Venta.find({ impuestoId: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } })
                      .limit(limit)
                      .sort('-created')
                      .populate('cliente', 'name')
                      .exec(function(err, ventas) {
                          Compra.find({ impuestoId: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: moment(last).format() }, totalTax: { $gt: 0 } })
                              .limit(limit)
                              .sort('-created')
                              .populate('proveedor', 'name')
                              .exec(function(err, compras) {
                                  if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                  res.jsonp(compras.concat(ventas.concat(impuestos)));
                              })
                          if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                      })

                  // res.jsonp(impuestos);
              })
      
      } else {

          Impuesto.find({ _id: impuesto })
              .limit(limit)
              .sort('-created')
              .populate('proveedor', 'name')
              .exec(function(err, impuestos) {

                  if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                  Venta.find({ impuestoId: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } })
                      .limit(limit)
                      .sort('-created')
                      .populate('cliente', 'name')
                      .exec(function(err, ventas) {
                          Compra.find({ impuestoId: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } })
                              .limit(limit)
                              .sort('-created')
                              .populate('proveedor', 'name')
                              .exec(function(err, compras) {
                                  if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                  res.jsonp(compras.concat(ajustarsArray(impuestos[0], year, month).concat(ventas)));
                              })

                          if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                      })
              })
      }
    }
};


function ajustarsArray(impuesto, year, month) {
    if (impuesto && impuesto.ajustars !== undefined && impuesto.ajustars.hasOwnProperty(year) && impuesto.ajustars[year].hasOwnProperty(month)) {
        return impuesto.ajustars[year][month];
    } else {
        return [];
    }
}

/**
 * Delete an impuesto
 */
exports.delete = function(req, res) {
    var impuesto = req.impuesto;

    impuesto.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(impuesto);
        }
    });
};

/**
 * List of impuestos
 */
exports.list = function(req, res) {
    var centroDeCosto = req.query.centroDeCosto || null;
    var month;
    var year;
    var criteria;
    if(req.query.month && req.query.year)  {
        month = req.query.month.toString();
        year = req.query.year.toString();
        criteria = { centroDeCosto: centroDeCosto,year: year, month: month}
    } else {
        criteria = { centroDeCosto: centroDeCosto}
    }
         
    

    if (centroDeCosto !== null) {
        Impuesto.find(criteria)
        .sort('-created')
        .populate('user', 'displayName')
        .exec(function(err, impuestos) {
            if (err) {
              return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
              });
            } else {
              var objForm;
              var newArr = [];             
              var impLen = impuestos.length - 1;                 
              
              Pagos.find({month: month,year: year, type:'impuesto',deleted:false},function(err,pago){
                  if (err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else { 
                   
                    //var elemPos = impuestos.map(function(x){return x.name}).indexOf("IVA Compras")
                    if(req.query.month) {
                        for(var i = 0; i < impuestos.length; i++) {
                          if(impuestos[i].name == "IVA Compras" || impuestos[i].name == "IVA Ventas") {
                            getPago(impuestos[i]);                    
                          } else {
                            newArr.push(impuestos[i]);
                          }
                        }
                        res.json(newArr)
                     } else {
                       res.json(impuestos)
                     }
                    
                    function getPago(im) {
                      objForm = im.toObject();
                      for(var j = 0; j < pago.length; j++){                
                        if(pago[j].impuestos == im._id.toString()) {                                         
                          objForm.pagado = (objForm.pagado) ? (objForm.pagado + pago[j].montoE) : pago[j].montoE;  
                        }                     
                                            
                      }
                      newArr.push(objForm)
                    }
                                                                  
                  }

                });
               
              }
        });

    } else {
        Impuesto.find({month: month, year: year})
        .sort('-created')
        .populate('user', 'displayName')
        .exec(function(err, impuestos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(impuestos);
            }
        });
    }
};

/**
 * impuesto middleware
 */
exports.impuestoByID = function(req, res, next, id) {
    Impuesto.findById(id)
        .populate('user', 'displayName')
        .exec(function(err, impuesto) {
            if (err) return next(err);
            if (!impuesto) return next(new Error('Failed to load impuesto ' + id));
            req.impuesto = impuesto;
            next();
        });
};